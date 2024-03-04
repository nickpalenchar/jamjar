import { useEffect, useState } from 'react';
import { ERROR_INACTIVE_JAM } from './errors';

export interface JamData {
  id: string;
  phrase: string;
  queue: Array<QueueItem>;
  nowPlaying: QueueItem | null;
  userId: string; // owner
}
export interface QueueItem {
  artist: string;
  id: string;
  imageUrl: string;
  name: string;
  rank: number;
  uri: string;
  albumImageUrl: string;
  nowPlaying: boolean;
}

export type SetSongQueueParams = QueueItem[];

interface UseJamApiProps {
  jamId?: string;
}

interface UseJamApiResult {
  jamData: JamData | null;
  isLoading: boolean;
  error: string | null;
}

export const useJamApi = ({
  jamId,
}: UseJamApiProps): [UseJamApiResult, (queueItems: QueueItem[]) => void] => {
  const [jamData, setJamData] = useState<JamData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/jam/${jamId}`);
        if (!response.ok) {
          if (response.status === 410) {
            setError(ERROR_INACTIVE_JAM);
            setIsLoading(false);
            setJamData(null);
          }
          // setIsLoading(false);
          // setError(response.)
          // throw new Error(`Error fetching data for ID ${jamId}`);
        }
        const data: JamData = await response.json();
        for (const queueSong of data.queue) {
          if (queueSong.nowPlaying) {
            data.nowPlaying = queueSong;
            break;
          }
        }
        setJamData(data);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jamId]);

  const setQueueSongs = (queueSongs: QueueItem[]) =>
    jamData && setJamData({ ...jamData, queue: queueSongs });

  return [{ jamData, isLoading, error }, setQueueSongs];
};
