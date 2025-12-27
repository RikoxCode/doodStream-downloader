# Doodozer Frontend - Download Manager Dashboard

A modern, minimal React frontend for managing DoodStream video downloads through Docker containers.

## Features

- **Start Downloads**: Add DoodStream URLs with optional filename and custom metadata
- **Active Downloads View**: Real-time progress tracking with animated progress bars
- **Mini Stats**: Quick overview of active, queued, and completed downloads
- **Light/Dark Mode**: Theme toggle with localStorage persistence
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Fetch API for backend communication

## Getting Started

### Development (with Mock API)

The app uses mock data by default for development:

```bash
npm install
npm run dev
```

The mock API simulates:
- Download progress updates every 2 seconds
- Backend API responses
- Realistic download behavior

### Production (with Real Backend)

To connect to your Express backend:

1. Update `src/App.tsx`:
```typescript
const USE_MOCK_API = false; // Change to false
```

2. Ensure your backend is running at `http://localhost:3000`

3. Start the frontend:
```bash
npm run dev
```

## Backend API Endpoints

The frontend expects these endpoints:

```
POST   /api/downloads/start
Body: { url: string, filename?: string, metadata?: Record<string, string> }
Response: { id, url, filename, progress, speed, eta, status, containerId, metadata }

GET    /api/downloads/active
Response: Array of active downloads

DELETE /api/downloads/:id
Stops a download

GET    /api/stats
Response: { activeDownloads, queuedDownloads, completedToday }
```

## Project Structure

```
src/
├── components/
│   ├── DownloadCard.tsx        # Individual download display
│   ├── ProgressBar.tsx         # Animated progress bar
│   ├── StartDownloadForm.tsx   # Form to add new downloads
│   ├── StatusBadge.tsx         # Status indicator
│   └── ui/                     # shadcn/ui components
├── services/
│   ├── api.ts                  # Real backend API service
│   └── mockApi.ts              # Mock API for development
├── utils/
│   └── formatters.ts           # Utility functions
├── App.tsx                     # Main application
└── main.tsx                    # Entry point
```

## Key Features Explained

### Progress Tracking
- Downloads are polled every 2 seconds
- Progress bars have smooth animations and color gradients
- Status badges show current state (downloading, processing, completed, failed)

### Mock API
- Simulates realistic download progress
- Useful for frontend development without backend
- Toggle between mock and real API with a single constant

### Theme Toggle
- Supports light and dark modes
- Preference saved in localStorage
- Smooth transitions between themes

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Environment Variables

No environment variables needed! The API base URL is configured in `src/services/api.ts`.

To change the backend URL, update:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

## Contributing

This is an MVP frontend. Keep it simple and focused on core functionality:
- Start downloads
- View active downloads
- Track progress
- Stop downloads

Avoid adding features like:
- Complex queue management
- Download history
- Settings panels
- Authentication (unless required)

## License

MIT
