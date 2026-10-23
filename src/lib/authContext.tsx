'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Profile } from '@/types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; redirectUrl?: string; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load session from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pathpilot_session_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Route protection: If unauthenticated and trying to access dashboards, redirect to /login
  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/login', '/'];
    const isPublic = publicPaths.includes(pathname);

    if (!user && !isPublic) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string = 'password123') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      setUser(data.user);
      localStorage.setItem('pathpilot_session_user', JSON.stringify(data.user));

      // Role-based destination
      let redirectUrl = '/student';
      if (data.user.role === 'faculty') {
        redirectUrl = '/college';
      } else if (data.user.role === 'recruiter') {
        redirectUrl = '/recruiter';
      } else if (data.user.role === 'placement' || data.user.role === 'admin') {
        redirectUrl = '/placement';
      }

      router.push(redirectUrl);
      return { success: true, redirectUrl };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pathpilot_session_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
