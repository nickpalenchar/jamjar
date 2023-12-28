import { FC, ReactNode, createContext, useState } from 'react';

const CurrentUserContext = createContext(null);

export const IdentityContext: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <CurrentUserContext.Provider value={currentUser}>
      {children}
    </CurrentUserContext.Provider>
  );
};
