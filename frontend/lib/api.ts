/**
 * LifeOS API Client & JWT Manager
 * Connects Next.js Frontend directly to the Django REST API backend
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:8000' 
    : 'https://lifeos-backend-bmss.onrender.com');

// In-browser token storage keys
const ACCESS_TOKEN_KEY = 'lifeos_jwt_access';
const REFRESH_TOKEN_KEY = 'lifeos_jwt_refresh';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Core authenticated fetch function with automatic JWT bearer injection
 * and transparent 401 token refreshing.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401 && accessToken) {
    const refreshToken = getRefreshToken();
    if (refreshToken && !endpoint.includes('/token/')) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTokens(data.access);
          headers['Authorization'] = `Bearer ${data.access}`;

          // Retry original request with refreshed token
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('lifeos:auth:unauthorized'));
          }
        }
      } catch (err) {
        clearTokens();
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null) {
        errorMessage = errorData.error || errorData.detail || JSON.stringify(errorData);
      }
    } catch {
      // Use fallback error message
    }
    throw new Error(errorMessage);
  }

  // Return empty object for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==========================================
// Typed API Endpoints
// ==========================================

export const api = {
  // Auth
  auth: {
    login: (credentials: { username?: string; email?: string; password?: string }) => {
      const username = credentials.username || credentials.email || '';
      return apiFetch<{ access: string; refresh: string }>('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password: credentials.password || '' }),
      });
    },
    signup: (data: { name: string; email: string; password?: string; currency?: string }) => {
      return apiFetch<{ user: any; access: string; refresh: string }>('/api/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: data.email.trim().toLowerCase(),
          email: data.email.trim().toLowerCase(),
          password: data.password || 'LifeOS_User_2026!',
          name: data.name.trim(),
        }),
      });
    },
    me: () => apiFetch<any>('/api/me/'),
    updateMe: (data: any) => apiFetch<any>('/api/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  // Tasks
  tasks: {
    list: () => apiFetch<any[]>('/api/tasks/'),
    create: (task: {
      title: string;
      description?: string;
      priority?: string;
      due_date?: string | null;
      completed?: boolean;
      goal?: string | null;
    }) => apiFetch<any>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
    update: (id: string, updates: Partial<{
      title: string;
      description: string;
      priority: string;
      due_date: string | null;
      completed: boolean;
      goal: string | null;
    }>) => apiFetch<any>(`/api/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => apiFetch(`/api/tasks/${id}/`, {
      method: 'DELETE',
    }),
  },

  // Habits
  habits: {
    list: () => apiFetch<any[]>('/api/habits/'),
    create: (habit: {
      name: string;
      frequency?: string;
      active?: boolean;
      goal?: string | null;
    }) => apiFetch<any>('/api/habits/', {
      method: 'POST',
      body: JSON.stringify(habit),
    }),
    update: (id: string, updates: Partial<{
      name: string;
      frequency: string;
      active: boolean;
    }>) => apiFetch<any>(`/api/habits/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => apiFetch(`/api/habits/${id}/`, {
      method: 'DELETE',
    }),
    toggleCompletion: (completion: { habit: string; date: string; completed: boolean }) =>
      apiFetch<any>('/api/habit-completions/', {
        method: 'POST',
        body: JSON.stringify(completion),
      }),
  },

  // Goals
  goals: {
    list: () => apiFetch<any[]>('/api/goals/'),
    create: (goal: {
      title: string;
      description?: string;
      deadline?: string | null;
      status?: string;
      progress?: number;
    }) => apiFetch<any>('/api/goals/', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),
    update: (id: string, updates: Partial<{
      title: string;
      description: string;
      deadline: string | null;
      status: string;
      progress: number;
    }>) => apiFetch<any>(`/api/goals/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => apiFetch(`/api/goals/${id}/`, {
      method: 'DELETE',
    }),
  },

  // Expenses
  expenses: {
    list: () => apiFetch<any[]>('/api/expenses/'),
    create: (expense: {
      title: string;
      amount: number | string;
      category: string;
      date: string;
    }) => apiFetch<any>('/api/expenses/', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),
    update: (id: string, updates: Partial<{
      title: string;
      amount: number | string;
      category: string;
      date: string;
    }>) => apiFetch<any>(`/api/expenses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => apiFetch(`/api/expenses/${id}/`, {
      method: 'DELETE',
    }),
  },

  // Budget
  budget: {
    get: () => apiFetch<any[]>('/api/budget/'),
    update: (amount: number) => apiFetch<any>('/api/budget/', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  },

  // Analytics
  analytics: {
    get: () => apiFetch<{
      tasks_completed: number;
      tasks_total: number;
      spent_month: number;
      goal_progress: number;
      habits_active: number;
    }>('/api/analytics/'),
  },
};
