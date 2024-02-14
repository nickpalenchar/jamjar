import { useEffect, useState } from 'react';
import { ERROR_INACTIVE_JAM } from './errors';

interface UseJamLookupProps {
  phrase?: string;
}

interface JamLookupResult {
  jamId: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useJamLookup = ({
  phrase,
}: UseJamLookupProps): JamLookupResult => {
  const [jamId, setJamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/jam/phrase/${phrase}`);
        if (!response.ok) {
          if (response.status === 410) {
            setError(ERROR_INACTIVE_JAM);
            setIsLoading(false);
            setJamId(null);
          }
        }
        const res = await response.json();
        console.log('fetch response', { code: response.status, res });
        setJamId(res.jamId);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [phrase]);
  return { jamId, isLoading, error };
};
