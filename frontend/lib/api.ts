export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' &&
   (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.'))
    ? `http://${window.location.hostname}:8000`
    : 'https://lifeos-backend-bmss.onrender.com');

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
      // Keep default error
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  warmup: () => {
    if (typeof window === 'undefined') return;
    try {
      fetch(`${API_BASE_URL}/health/`, { method: 'GET', keepalive: true }).catch(() => {});
    } catch {
      // Silently catch
    }
  },

  auth: {
    login: (credentials: { username?: string; email?: string; password?: string }) => {
      const username = credentials.username || credentials.email || '';
      return apiFetch<{ access: string; refresh: string; user?: any }>('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password: credentials.password || '' }),
      });
    },
    signup: (data: { name: string; email: string; password?: string }) => {
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

  bootstrap: () => apiFetch<{
    user: any;
    tasks: any[];
    habits: any[];
    goals: any[];
    health_profile: any;
    foods: any[];
    food_logs_today: any[];
    weight_checkins: any[];
    workout_plan: any;
    today_workout_day: any;
    today_workout_logs: any[];
    daily_health_status: any;
    today_macros: any;
    lifescore: any;
    analytics: any;
  }>('/api/bootstrap/'),

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

  // ==========================================
  // HEALTH MODULE API
  // ==========================================
  health: {
    getProfile: () => apiFetch<any>('/api/health/profile/'),
    updateProfile: (id: string, data: any) => apiFetch<any>(`/api/health/profile/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    onboard: (data: {
      current_weight: number;
      goal_weight: number;
      height_cm: number;
      age: number;
      biological_sex: string;
      activity_level: string;
      training_focus: string;
      training_frequency: number;
      target_calories?: number;
      target_protein?: number;
      target_carbs?: number;
      target_fat?: number;
      target_water_ml?: number;
    }) => apiFetch<any>('/api/health/onboard/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    foods: {
      list: () => apiFetch<any[]>('/api/health/foods/'),
      create: (food: {
        name: string;
        serving_description: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        is_staple?: boolean;
      }) => apiFetch<any>('/api/health/foods/', {
        method: 'POST',
        body: JSON.stringify(food),
      }),
      update: (id: string, updates: any) => apiFetch<any>(`/api/health/foods/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
      delete: (id: string) => apiFetch(`/api/health/foods/${id}/`, {
        method: 'DELETE',
      }),
    },

    foodLogs: {
      list: (date?: string) => apiFetch<any[]>(`/api/health/food-logs/${date ? `?date=${date}` : ''}`),
      create: (log: { food: string; date: string; servings: number }) =>
        apiFetch<any>('/api/health/food-logs/', {
          method: 'POST',
          body: JSON.stringify(log),
        }),
      delete: (id: string) => apiFetch(`/api/health/food-logs/${id}/`, {
        method: 'DELETE',
      }),
    },

    weight: {
      list: () => apiFetch<any[]>('/api/health/weight/'),
      create: (checkin: { date: string; weight: number; notes?: string }) =>
        apiFetch<any>('/api/health/weight/', {
          method: 'POST',
          body: JSON.stringify(checkin),
        }),
      delete: (id: string) => apiFetch(`/api/health/weight/${id}/`, {
        method: 'DELETE',
      }),
    },

    workouts: {
      getPlans: () => apiFetch<any[]>('/api/health/workout-plans/'),
      createPlan: (plan: any) => apiFetch<any>('/api/health/workout-plans/', {
        method: 'POST',
        body: JSON.stringify(plan),
      }),
      updateExercise: (id: string, updates: any) => apiFetch<any>(`/api/health/workout-exercises/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
      logWorkout: (log: {
        workout_exercise: string;
        date: string;
        completed: boolean;
        actual_sets?: number;
        actual_reps?: string;
        actual_weight?: number;
      }) => apiFetch<any>('/api/health/workout-logs/', {
        method: 'POST',
        body: JSON.stringify(log),
      }),
    },

    dailyStatus: {
      get: () => apiFetch<any[]>('/api/health/daily-status/'),
      update: (id: string, updates: { water_ml?: number; creatine_completed?: boolean }) =>
        apiFetch<any>(`/api/health/daily-status/${id}/`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }),
    }
  },

  analytics: {
    get: () => apiFetch<any>('/api/analytics/'),
  },
};
