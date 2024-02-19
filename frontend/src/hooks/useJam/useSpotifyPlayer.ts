import { useEffect, useState } from 'react';
import { QueueItem } from './useJam';

export interface SpotifyPlayerData {
  authed: boolean;
  queue: Array<any>;
  currentlyPlaying: QueueItem | null;
  startPlayer: () => null;
  pausePlayer: () => null;
}

interface SpotifyPlayerLoading {
  state: 'loading';
}
interface SpotifyPlayerResolved {
  state: 'resolved';
  data: SpotifyPlayerData;
}
interface SpotifyPlayerError {
  state: 'error';
  error: string;
}
type SpotifyPlayerReturn =
  | SpotifyPlayerLoading
  | SpotifyPlayerData
  | SpotifyPlayerResolved;

export const useSpotifyPlayer = async (): Promise<SpotifyPlayerReturn> => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/spotify/proxy-api/v1/me/player').then(
      async (res): Promise<void> => {
        if (res.ok) {
          console.log('got the res!', await res.json());
        }
        console.log('respones done');
      },
    );
  }, []);

  return {
    state: 'loading',
  };
};
