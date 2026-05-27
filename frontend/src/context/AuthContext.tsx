import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateUserLocal: (updatedUser: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser.user || parsedUser);
          
          // Verify session validity with backend
          const freshProfile = await authApi.getProfile();
          setUser(freshProfile);
          localStorage.setItem('user', JSON.stringify(freshProfile));
        } catch (error) {
          console.error('[Session Initialization Failed]:', error);
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      // Backend returns structure: { token, _id, name, email, role, avatar, bio, ... } or { token, user: { ... } }
      const tokenVal = data.token;
      const userVal = data.user || data;

      localStorage.setItem('token', tokenVal);
      localStorage.setItem('user', JSON.stringify(userVal));
      
      setToken(tokenVal);
      setUser(userVal);
      return userVal;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const data = await authApi.register(userData);
      const tokenVal = data.token;
      const userVal = data.user || data;

      localStorage.setItem('token', tokenVal);
      localStorage.setItem('user', JSON.stringify(userVal));

      setToken(tokenVal);
      setUser(userVal);
      return userVal;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUserLocal = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
