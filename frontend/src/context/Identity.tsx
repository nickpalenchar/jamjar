import React, {
  FC,
  ReactNode,
  useState,
  useEffect,
  createContext,
} from 'react';
import { Loading } from '../components/Loading';

export interface User {
  id: string;
  userInJam?: {
    jamId: string;
    vibes: number;
  };
}
interface IdentityState {
  loading: boolean;
  error: string | null;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<IdentityState>({
  loading: true,
  error: null,
  user: null,
  setUser: () => {},
});

export const IdentityContext: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      async function getUser() {
        const res = await fetch('/auth/login?type=anon', {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) {
          setError(`Error Fetching the user: ${res.status}`);
        } else {
          setUser(await res.json());
          setError(null);
        }
        setLoading(false);
      }
      console.log('calling get user??');
      getUser();
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  // const setUser = (user: User)
  const identity = { user, loading, error, setUser };

  return (
    <UserContext.Provider value={identity}>{children}</UserContext.Provider>
  );
};
