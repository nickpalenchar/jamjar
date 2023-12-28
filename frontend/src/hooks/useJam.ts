import { useEffect, useState } from 'react';

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
  error: Error | null;
}

export const useJamApi = ({ jamId }: UseJamApiProps): UseJamApiResult => {
  const [jamData, setJamData] = useState<JamData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/jam/${jamId}`);
        if (!response.ok) {
          throw new Error(`Error fetching data for ID ${jamId}`);
        }

        const data: JamData = await response.json();
        setJamData(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jamId]);

  return { jamData, isLoading, error };
};
