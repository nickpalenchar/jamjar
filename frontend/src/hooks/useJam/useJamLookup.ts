import { useEffect, useState } from 'react';
import { ERROR_INACTIVE_JAM } from './errors';

interface UseJamLookupProps {
  phrase?: string;
}

interface UseJamApiResult {
  jamId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useJamLookup = ({
  phrase,
}: UseJamLookupProps): UseJamApiResult => {
  const [jamId, setJamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('USE JAM LOO');
        const response = await fetch(`/api/jam/phrase/${phrase}`);
        if (!response.ok) {
          if (response.status === 410) {
            setError(ERROR_INACTIVE_JAM);
            setIsLoading(false);
            setJamId(null);
          }
          // setIsLoading(false);
          // setError(response.)
          // throw new Error(`Error fetching data for ID ${jamId}`);
        }
        const res = await response.json();
        setJamId(res.jamId);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jamId, phrase]);
  return { jamId, isLoading, error };
};
