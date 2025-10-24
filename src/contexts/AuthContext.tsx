import { createContext } from 'react';
import { User } from '@shared/types';
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);