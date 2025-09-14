import { useState, useCallback } from 'react';
import { login as apiLogin, signup as apiSignup } from '../api/client';
import { User } from '../types';

const USER_SESSION_KEY = 'w3-user-data';

interface UserWithPassword extends User {
  password?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const item = sessionStorage.getItem(USER_SESSION_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Failed to parse user data from session storage", error);
      return null;
    }
  });

  const isAuthenticated = !!user;
  const isUserAdmin = user?.isAdmin === true;

// Fix: Use the user object returned from the API response to set the user state. This ensures the session state is authoritative and secure.
// Fix: Update return type to include optional user property for consistency.
  const signup = useCallback(async (userData: Required<UserWithPassword>): Promise<{ success: boolean; message?: string; user?: User }> => {
    const result = await apiSignup(userData);
    if (result.success && result.user) {
       setUser(result.user);
    }
    return result;
  }, []);

  // Fix: Update return type to include optional user property to fix downstream type errors.
  const login = useCallback(async (email: string, password_provided: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    const result = await apiLogin(email, password_provided);
    if (result.success && result.user) {
        setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback((callback?: () => void) => {
    sessionStorage.removeItem(USER_SESSION_KEY);
    setUser(null);
    if (callback) callback();
  }, []);
  
  const getUser = useCallback((): User | null => {
    return user;
  }, [user]);

  return { isAuthenticated, login, logout, getUser, signup, isUserAdmin };
};