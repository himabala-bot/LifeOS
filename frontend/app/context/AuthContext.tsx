'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { api, getAccessToken, setTokens, clearTokens } from '../../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUserToProfile(backendUser: any): UserProfile {
  const avatarColors = ['#e66b4b', '#5f805d', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
  const charCode = (backendUser.username || backendUser.email || 'A').charCodeAt(0);
  const avatar = avatarColors[charCode % avatarColors.length];

  return {
    id: String(backendUser.id),
    name: backendUser.first_name || backendUser.username || 'LifeOS Builder',
    email: backendUser.email || backendUser.username || '',
    avatar: avatar,
    bio: 'Focused builder & high-agency individual',
    dailyFocusTargetMinutes: 180,
    theme: 'warm-paper',
    createdAt: backendUser.date_joined || new Date().toISOString(),
    health_profile: backendUser.health_profile || undefined,
  };
}

const CACHED_USER_KEY = 'lifeos_cached_user';

function getCachedUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(profile: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch {
    // Ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setCachedUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const backendUser = await api.auth.me();
      if (backendUser && backendUser.id) {
        const profile = mapBackendUserToProfile(backendUser);
        setUser(profile);
        setCachedUser(profile);
      } else {
        clearTokens();
        setCachedUser(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Session verification check:', err);
      if (err instanceof Error && err.message.includes('401')) {
        clearTokens();
        setCachedUser(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const cached = getCachedUser();
    if (token && cached) {
      setUser(cached);
      setIsLoading(false);
    } else if (!token) {
      setIsLoading(false);
    }

    api.warmup();
    fetchCurrentUser();

    const handleUnauthorized = () => {
      clearTokens();
      setCachedUser(null);
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('lifeos:auth:unauthorized', handleUnauthorized);
      return () => {
        window.removeEventListener('lifeos:auth:unauthorized', handleUnauthorized);
      };
    }
  }, [fetchCurrentUser]);

  const login = async (emailOrUsername: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.auth.login({
        username: emailOrUsername.trim(),
        password: password || 'LifeOS_User_2026!',
      });

      if (res.access) {
        setTokens(res.access, res.refresh);

        if (res.user) {
          const profile = mapBackendUserToProfile(res.user);
          setUser(profile);
          setCachedUser(profile);
        } else {
          const me = await api.auth.me();
          const profile = mapBackendUserToProfile(me);
          setUser(profile);
          setCachedUser(profile);
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server.' };
    } catch (e: any) {
      const msg = e.message || 'Invalid username or password.';
      return { success: false, error: msg.includes('401') ? 'Invalid email/username or password.' : msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password = ''
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.auth.signup({
        name,
        email,
        password: password || 'LifeOS_User_2026!',
      });

      if (res.access) {
        setTokens(res.access, res.refresh);
        const profile = mapBackendUserToProfile(res.user || { first_name: name, email });
        setUser(profile);
        setCachedUser(profile);
        return { success: true };
      }
      return { success: false, error: 'Failed to create account.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    try {
      setIsLoading(true);
      const demoEmail = 'aisha@lifeos.me';
      const demoPassword = 'DemoPassword123!';

      const loginRes = await login(demoEmail, demoPassword);
      if (!loginRes.success) {
        const signupRes = await signup('Aisha Sharma', demoEmail, demoPassword);
        if (!signupRes.success) {
          await login(demoEmail, demoPassword);
        }
      }
    } catch (err) {
      console.error('Failed demo login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setCachedUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lifeos_cached_workspace');
    }
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile = { ...user, ...updates };
    setUser(newProfile);
    setCachedUser(newProfile);

    try {
      const backendUpdates: any = {};
      if (updates.name) backendUpdates.name = updates.name;
      if (updates.email) backendUpdates.email = updates.email;

      await api.auth.updateMe(backendUpdates);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
