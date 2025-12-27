// server.js
const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const downloads = new Map();
const completedToday = new Set();

// Configuration
const DOODOZER_IMAGE = process.env.DOODOZER_IMAGE || 'ghcr.io/YOUR_USERNAME/doodozer:latest';
const DOWNLOADS_PATH = process.env.DOWNLOADS_PATH || './downloads';

// Helper: Parse container logs for progress
function parseProgress(logs) {
  // Parse progress from logs (format: "filename.mp4":   2%|▏         | 59.8M/2.49G [00:48<2:16:09, 323kB/s")
  // Note: Progress bars use \r to overwrite lines, so search through all content
  const progressMatch = logs.match(/(\d+)%\|/);
  const speedMatch = logs.match(/,?\s*(\d+\.?\d*)\s*(kB|MB|GB)\/s/i);
  const etaMatch = logs.match(/<(\d+):(\d+):(\d+)/);
  
  const progress = progressMatch ? parseInt(progressMatch[1]) : 0;
  
  // Convert speed to MB/s
  let speed = 0;
  if (speedMatch) {
    const value = parseFloat(speedMatch[1]);
    const unit = speedMatch[2].toUpperCase();
    if (unit === 'KB') {
      speed = value / 1024; // Convert KB to MB
    } else if (unit === 'MB') {
      speed = value;
    } else if (unit === 'GB') {
      speed = value * 1024;
    }
  }
  
  // Calculate ETA in seconds
  let eta = 0;
  if (etaMatch) {
    const hours = parseInt(etaMatch[1]);
    const minutes = parseInt(etaMatch[2]);
    const seconds = parseInt(etaMatch[3]);
    eta = hours * 3600 + minutes * 60 + seconds;
  }
  
  return { progress, speed, eta };
}

// Helper: Get container status
async function getContainerInfo(containerId, filename) {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    let progress = 0;
    let speed = 0;
    let eta = 0;
    
    // Try to get file size for progress calculation
    if (info.State.Running && filename) {
      try {
        // Ensure filename has .mp4 extension for stat command
        const fullFilename = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
        
        const exec = await container.exec({
          Cmd: ['stat', '-c', '%s', `/downloads/${fullFilename}`],
          AttachStdout: true,
          AttachStderr: true
        });
        
        const stream = await exec.start({ Detach: false });
        let output = '';
        
        await new Promise((resolve) => {
          stream.on('data', (chunk) => {
            output += chunk.toString('utf-8');
          });
          stream.on('end', resolve);
        });
        
        // Parse file size from output (strip docker stream headers)
        const sizeMatch = output.match(/(\d+)/);
        if (sizeMatch) {
          const currentSize = parseInt(sizeMatch[1]);
          const totalSize = 2.49 * 1024 * 1024 * 1024; // 2.49GB in bytes
          progress = Math.min(Math.round((currentSize / totalSize) * 100), 100);
          
          // Estimate speed and ETA (rough calculation)
          if (currentSize > 0) {
            speed = 0.35; // Rough estimate in MB/s
            const remainingBytes = totalSize - currentSize;
            eta = Math.round(remainingBytes / (speed * 1024 * 1024));
          }
        }
      } catch (err) {
        // File doesn't exist yet or other error - keep default values
      }
    }
    
    // Fallback: Try to parse logs for progress
    if (progress === 0 && info.State.Running) {
      try {
        const logsStream = await container.logs({
          stdout: true,
          stderr: true,
          tail: 100,
          timestamps: false
        });
        
        // Docker logs include 8-byte headers, need to strip them
        let logsStr = '';
        const buffer = Buffer.from(logsStream);
        let offset = 0;
        
        while (offset < buffer.length) {
          if (offset + 8 > buffer.length) break;
          const header = buffer.slice(offset, offset + 8);
          const size = header.readUInt32BE(4);
          if (offset + 8 + size > buffer.length) break;
          const data = buffer.slice(offset + 8, offset + 8 + size);
          logsStr += data.toString('utf-8');
          offset += 8 + size;
        }
        
        const parsed = parseProgress(logsStr);
        if (parsed.progress > 0) {
          progress = parsed.progress;
          speed = parsed.speed;
          eta = parsed.eta;
        }
      } catch (err) {
        // Ignore log parsing errors
      }
    }
    
    // Determine status
    let status = 'downloading';
    if (info.State.Status === 'exited') {
      status = info.State.ExitCode === 0 ? 'completed' : 'failed';
    } else if (info.State.Running) {
      status = progress > 0 ? 'downloading' : 'processing';
    }
    
    return {
      running: info.State.Running,
      status,
      progress,
      speed,
      eta,
      exitCode: info.State.ExitCode
    };
  } catch (error) {
    console.error('Error getting container info:', error);
    return null;
  }
}

// Helper: Create and start download container
async function startDownloadContainer(url, filename, metadata, downloadId) {
  const instanceId = Date.now();
  const containerName = `doodozer-${instanceId}`;

  if (!filename.includes('.mp4')) filename += '.mp4';
  
  // Build command - pass full output path as single argument
  const cmd = [url, '-o', `/downloads/${filename}`];
  
  try {
    // Pull image if needed (wrap in promise)
    console.log('Ensuring image exists:', DOODOZER_IMAGE);
    await new Promise((resolve, reject) => {
      docker.pull(DOODOZER_IMAGE, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err, output) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    }).catch(err => {
      console.log('Pull warning:', err.message);
      // Continue anyway - image might already exist
    });
    
    // Create container
    const container = await docker.createContainer({
      Image: DOODOZER_IMAGE,
      name: containerName,
      Cmd: cmd,
      HostConfig: {
        Binds: [`${process.cwd()}/${DOWNLOADS_PATH}:/downloads`],
        AutoRemove: false,
        RestartPolicy: { Name: 'no' }
      },
      Env: [
        `INSTANCE_ID=${instanceId}`,
        `DOWNLOAD_ID=${downloadId}`,
        `OUTPUT_PATH=/downloads`
      ],
      Labels: {
        'doodozer.download.id': downloadId,
        'doodozer.url': url,
        'doodozer.metadata': JSON.stringify(metadata || {})
      }
    });
    
    // Start container
    await container.start();
    
    console.log(`Started container: ${containerName} (${container.id})`);
    
    return {
      containerId: container.id,
      containerName
    };
  } catch (error) {
    console.error('Error starting container:', error);
    throw error;
  }
}

// Monitor downloads in background
setInterval(async () => {
  for (const [id, download] of downloads.entries()) {
    if (download.status === 'completed' || download.status === 'failed') {
      continue;
    }
    
    const info = await getContainerInfo(download.containerId, download.filename);
    if (info) {
      download.progress = info.progress;
      download.speed = info.speed;
      download.eta = info.eta;
      download.status = info.status;
      
      // Track completed downloads
      if (info.status === 'completed' && !completedToday.has(id)) {
        completedToday.add(id);
      }
    }
  }
}, 2000); // Update every 2 seconds

// API Routes

// POST /api/downloads/start
app.post('/api/downloads/start', async (req, res) => {
  console.log('Start download requested:', req.body.url);
  try {
    const { url, filename, metadata } = req.body;
    
    // Validate URL
    if (!url || !url.includes('https://')) {
      return res.status(400).json({ error: 'Invalid DoodStream URL' });
    }
    
    const downloadId = uuidv4();
    const defaultFilename = filename || `video-${Date.now()}.mp4`;
    
    // Start container
    const { containerId, containerName } = await startDownloadContainer(
      url,
      defaultFilename,
      metadata,
      downloadId
    );
    
    // Create download record
    const download = {
      id: downloadId,
      url,
      filename: defaultFilename,
      progress: 0,
      speed: 0,
      eta: 300,
      status: 'downloading',
      containerId,
      containerName,
      metadata: metadata || {},
      startedAt: new Date()
    };
    
    downloads.set(downloadId, download);
    
    res.json(download);
  } catch (error) {
    console.error('Error starting download:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/downloads/active
app.get('/api/downloads/active', async (req, res) => {
  try {
    const activeDownloads = [];
    
    for (const [id, download] of downloads.entries()) {
      // Skip completed/failed downloads older than 5 minutes
      if ((download.status === 'completed' || download.status === 'failed') &&
          Date.now() - download.startedAt > 5 * 60 * 1000) {
        continue;
      }
      
      activeDownloads.push({
        id: download.id,
        url: download.url,
        filename: download.filename,
        progress: download.progress,
        speed: download.speed,
        eta: download.eta,
        status: download.status,
        containerId: download.containerId,
        metadata: download.metadata
      });
    }
    
    res.json(activeDownloads);
  } catch (error) {
    console.error('Error getting active downloads:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/downloads/:id
app.delete('/api/downloads/:id', async (req, res) => {
  console.log('Stop download requested:', req.params.id);
  try {
    const { id } = req.params;
    const download = downloads.get(id);
    
    if (!download) {
      return res.status(404).json({ error: 'Download not found' });
    }
    
    // Stop container
    try {
      const container = docker.getContainer(download.containerId);
      await container.stop();
      await container.remove();
      console.log(`Stopped container: ${download.containerName}`);
    } catch (error) {
      console.error('Error stopping container:', error);
      // Continue even if container doesn't exist
    }
    
    // Update status
    download.status = 'failed';
    download.progress = 0;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error stopping download:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  try {
    let activeCount = 0;
    let queuedCount = 0;
    
    for (const download of downloads.values()) {
      if (download.status === 'downloading' || download.status === 'processing') {
        activeCount++;
      }
      // For now, we don't have a queue, but you can add this later
    }
    
    res.json({
      activeDownloads: activeCount,
      queuedDownloads: queuedCount,
      completedToday: completedToday.size
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', timestamp: new Date() });
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  // Stop all running containers
  for (const download of downloads.values()) {
    if (download.status === 'downloading' || download.status === 'processing') {
      try {
        const container = docker.getContainer(download.containerId);
        await container.stop();
        console.log(`Stopped container: ${download.containerName}`);
      } catch (error) {
        console.error('Error stopping container:', error);
      }
    }
  }
  
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Doodozer API running on http://localhost:${PORT}`);
  console.log(`📦 Using Docker image: ${DOODOZER_IMAGE}`);
  console.log(`💾 Downloads path: ${DOWNLOADS_PATH}`);
});