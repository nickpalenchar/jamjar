import { useEffect, useState } from 'react';
import { ERROR_INACTIVE_JAM } from './errors';

interface JamData {
  id: number;
  title: string;
  description: string;
}

interface UseJamApiProps {
  jamId?: string;
}

interface UseJamApiResult {
  jamData: JamData | null;
  isLoading: boolean;
  error: string | null;
}

export const useJamApi = ({ jamId }: UseJamApiProps): UseJamApiResult => {
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
        setJamData(data);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jamId]);
  return { jamData, isLoading, error };
};
