import { createContext } from 'react';

// Shared context object (kept separate so AuthContext.jsx can export only components).
export const AuthContext = createContext({
  user: null,
  login: async () => false,
  logout: () => {},
  loading: true
});

