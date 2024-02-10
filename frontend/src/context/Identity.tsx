import React, {
  FC,
  ReactNode,
  useState,
  useEffect,
  createContext,
} from 'react';

export interface User {
  id: string;
}
interface IdentityState {
  loading: boolean;
  error: string | null;
  user: User | null;
}

export const UserContext = createContext<IdentityState>({
  loading: true,
  error: null,
  user: null,
});

export const IdentityContext: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  const identity = { user, loading, error };
  console.log({ identity });
  return (
    <UserContext.Provider value={identity}>{children}</UserContext.Provider>
  );
};
