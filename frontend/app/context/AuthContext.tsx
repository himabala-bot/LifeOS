'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string, currency?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'demo-user-1',
  name: 'Aisha Sharma',
  email: 'aisha@lifeos.me',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Product Designer & Lifelong Explorer',
  currency: '₹',
  monthlyBudget: 25000,
  dailyFocusTargetMinutes: 180,
  theme: 'warm-paper',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('lifeos_current_user_id');
      const storedUsersRaw = localStorage.getItem('lifeos_users');
      if (storedUserId && storedUsersRaw) {
        const users: Record<string, UserProfile> = JSON.parse(storedUsersRaw);
        if (users[storedUserId]) {
          setUser(users[storedUserId]);
        }
      }
    } catch (e) {
      console.error('Error loading auth from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserRecord = (newUser: UserProfile) => {
    try {
      const storedUsersRaw = localStorage.getItem('lifeos_users');
      const users: Record<string, UserProfile> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      users[newUser.id] = newUser;
      localStorage.setItem('lifeos_users', JSON.stringify(users));
      localStorage.setItem('lifeos_current_user_id', newUser.id);
      setUser(newUser);
    } catch (e) {
      console.error('Error saving user', e);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedUsersRaw = localStorage.getItem('lifeos_users');
      const users: Record<string, UserProfile> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      const foundUser = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        localStorage.setItem('lifeos_current_user_id', foundUser.id);
        setUser(foundUser);
        return { success: true };
      }
      
      // If user logging in with demo email
      if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
        saveUserRecord(DEMO_USER);
        return { success: true };
      }

      return { success: false, error: 'No account found with this email. Please Sign Up to get started!' };
    } catch (e) {
      return { success: false, error: 'Failed to sign in. Please try again.' };
    }
  };

  const signup = async (name: string, email: string, _password?: string, currency = '₹'): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedUsersRaw = localStorage.getItem('lifeos_users');
      const users: Record<string, UserProfile> = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      
      const existing = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const avatarColors = ['#e66b4b', '#5f805d', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const newUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: randomColor,
        currency,
        monthlyBudget: currency === '₹' ? 25000 : 3000,
        dailyFocusTargetMinutes: 180,
        theme: 'warm-paper',
        createdAt: new Date().toISOString(),
      };

      saveUserRecord(newUser);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const loginAsDemo = () => {
    saveUserRecord(DEMO_USER);
  };

  const logout = () => {
    localStorage.removeItem('lifeos_current_user_id');
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUserRecord(updated);
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
