import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  dispatch: React.Dispatch<AuthAction>;
  mockLoginAsAdmin: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const mockAdminUser: User = {
  id: 'admin-001',
  email: 'admin@hotelhub.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'SYSTEM_ADMIN',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const mockLoginAsAdmin = useCallback(() => {
    const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
    if (isMockMode) {
      login('mock-token', mockAdminUser);
    }
  }, [login]);

  // Auto-login as admin in mock mode
  useEffect(() => {
    const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
    if (isMockMode && !state.isAuthenticated) {
      login('mock-token', mockAdminUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, dispatch, mockLoginAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};