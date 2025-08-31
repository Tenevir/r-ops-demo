import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthToken, LoginCredentials, ApiResponse, AuthUser } from '../types';

interface AuthContextType {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        try {
          const parsedToken = JSON.parse(savedToken);
          const parsedUser = JSON.parse(savedUser);

          // Check if token is still valid (simple expiration check)
          const tokenAge = Date.now() - (parsedToken.issuedAt || 0);
          if (tokenAge < parsedToken.expiresIn * 1000) {
            setToken(parsedToken);
            setUser(parsedUser);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: ApiResponse<AuthUser> = await response.json();

      if (result.success && result.data) {
        const { user: authenticatedUser, token: authToken } = result.data;
        
        // Add issued timestamp for expiration checking
        const tokenWithTimestamp = {
          ...authToken,
          issuedAt: Date.now(),
        };

        setUser(authenticatedUser);
        setToken(tokenWithTimestamp);

        // Persist authentication
        localStorage.setItem('auth_token', JSON.stringify(tokenWithTimestamp));
        localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));

        return true;
      } else {
        console.error('Login failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token.accessToken}` : '',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and storage regardless of API call result
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Higher-order component for route protection
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'operator' | 'viewer';
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback = <div>Access denied</div>
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  // Check role permissions
  if (requiredRole && user) {
    const roleHierarchy = { viewer: 1, operator: 2, admin: 3 };
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return fallback;
    }
  }

  return <>{children}</>;
};

// API utility with automatic auth headers
export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const savedToken = localStorage.getItem('auth_token');
  let authHeader = {};

  if (savedToken) {
    try {
      const token = JSON.parse(savedToken);
      authHeader = {
        Authorization: `Bearer ${token.accessToken}`,
      };
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }

  return fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  });
};