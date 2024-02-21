import { QueueItem } from '../hooks/useJam';

interface SpotifyResponse<T> {
  error: boolean;
  data?: T;
  errorMessage?: string;
}

class SpotifyClient {
  async getPlayerQueue(): Promise<
    SpotifyResponse<{ currentlyPlaying: QueueItem | null; queue: QueueItem[] }>
  > {
    const res = await fetch('/api/spotify/proxy-api/v1/me/player/queue');
    if (res.status !== 200) {
      if (res.status === 401) {
        return { error: true, errorMessage: 'Unauthorized' };
      }
      return { error: true };
    }
    const body = await res.json();
    return {
      error: false,
      data: {
        currentlyPlaying: body.currently_playing,
        queue: body.queue,
      },
    };
  }
}

export const Spotify = new SpotifyClient();
