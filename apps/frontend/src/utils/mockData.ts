import { Download, QueueItem, Stats } from '@/types/download';

export const generateMockDownloads = (): Download[] => {
  return [
    {
      id: '1',
      url: 'https://doodstream.com/d/abc123xyz456',
      filename: 'Movie_2024_1080p.mp4',
      progress: 45,
      speed: 5.2,
      eta: 240,
      status: 'downloading',
      containerId: 'docker-abc123',
      metadata: {
        category: 'Movies',
        tags: 'action, thriller',
        quality: '1080p',
        year: '2024',
      },
      startedAt: new Date(Date.now() - 180000),
      size: 2048,
    },
    {
      id: '2',
      url: 'https://doodstream.com/d/def789ghi012',
      filename: 'Documentary_Series_S01E03.mkv',
      progress: 78,
      speed: 8.5,
      eta: 120,
      status: 'downloading',
      containerId: 'docker-def789',
      metadata: {
        category: 'Documentaries',
        tags: 'nature, wildlife',
        season: '1',
        episode: '3',
      },
      startedAt: new Date(Date.now() - 360000),
      size: 1536,
    },
    {
      id: '3',
      url: 'https://doodstream.com/d/jkl345mno678',
      filename: 'Tutorial_React_Advanced.mp4',
      progress: 15,
      speed: 3.1,
      eta: 480,
      status: 'downloading',
      containerId: 'docker-jkl345',
      metadata: {
        category: 'Education',
        tags: 'programming, react',
        instructor: 'John Doe',
      },
      startedAt: new Date(Date.now() - 60000),
      size: 896,
    },
    {
      id: '4',
      url: 'https://doodstream.com/d/pqr901stu234',
      filename: 'Podcast_Episode_42.mp3',
      progress: 92,
      speed: 12.0,
      eta: 30,
      status: 'processing',
      containerId: 'docker-pqr901',
      metadata: {
        category: 'Podcasts',
        tags: 'tech, interview',
        episode: '42',
      },
      startedAt: new Date(Date.now() - 540000),
      size: 128,
    },
  ];
};

export const generateMockQueue = (): QueueItem[] => {
  return [
    {
      id: 'q1',
      url: 'https://doodstream.com/d/vwx567yza890',
      filename: 'Concert_Live_2024.mp4',
      priority: 'high',
      position: 1,
      metadata: {
        category: 'Music',
        tags: 'concert, live',
      },
    },
    {
      id: 'q2',
      url: 'https://doodstream.com/d/bcd123efg456',
      filename: 'Anime_Series_S02E12.mkv',
      priority: 'normal',
      position: 2,
      metadata: {
        category: 'Anime',
        tags: 'action, fantasy',
        season: '2',
        episode: '12',
      },
    },
    {
      id: 'q3',
      url: 'https://doodstream.com/d/hij789klm012',
      filename: 'Workout_Routine_Beginner.mp4',
      priority: 'low',
      position: 3,
      metadata: {
        category: 'Fitness',
        tags: 'workout, beginner',
      },
    },
  ];
};

export const generateMockCompleted = (): Download[] => {
  return [
    {
      id: 'c1',
      url: 'https://doodstream.com/d/nop345qrs678',
      filename: 'Movie_Classic_1980.mp4',
      progress: 100,
      speed: 0,
      eta: 0,
      status: 'completed',
      containerId: 'docker-nop345',
      metadata: {
        category: 'Movies',
        tags: 'classic, drama',
        year: '1980',
      },
      startedAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 3600000),
      size: 1856,
    },
    {
      id: 'c2',
      url: 'https://doodstream.com/d/tuv901wxy234',
      filename: 'Game_Highlights_2024.mp4',
      progress: 100,
      speed: 0,
      eta: 0,
      status: 'completed',
      containerId: 'docker-tuv901',
      metadata: {
        category: 'Sports',
        tags: 'basketball, highlights',
      },
      startedAt: new Date(Date.now() - 10800000),
      completedAt: new Date(Date.now() - 7200000),
      size: 724,
    },
    {
      id: 'c3',
      url: 'https://doodstream.com/d/zab567cde890',
      filename: 'Recipe_Tutorial_Italian.mp4',
      progress: 100,
      speed: 0,
      eta: 0,
      status: 'completed',
      containerId: 'docker-zab567',
      metadata: {
        category: 'Cooking',
        tags: 'recipe, italian',
      },
      startedAt: new Date(Date.now() - 14400000),
      completedAt: new Date(Date.now() - 10800000),
      size: 512,
    },
  ];
};

export const calculateStats = (
  downloads: Download[],
  queue: QueueItem[],
  completed: Download[]
): Stats => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedToday = completed.filter(
    (d) => d.completedAt && d.completedAt >= todayStart
  ).length;

  const totalSize = completed.reduce((sum, d) => sum + (d.size || 0), 0) / 1024;

  const activeDownloading = downloads.filter(d => d.status === 'downloading');
  const averageSpeed = activeDownloading.length > 0
    ? activeDownloading.reduce((sum, d) => sum + d.speed, 0) / activeDownloading.length
    : 0;

  const totalAttempts = completed.length + downloads.filter(d => d.status === 'failed').length;
  const successRate = totalAttempts > 0
    ? (completed.length / totalAttempts) * 100
    : 100;

  return {
    activeDownloads: downloads.length,
    queuedDownloads: queue.length,
    completedToday,
    totalSize,
    averageSpeed,
    successRate,
  };
};
