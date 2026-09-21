export type ScreenType =
  | 'today'
  | 'trajectory'
  | 'tasks'
  | 'habits'
  | 'health'
  | 'analytics'
  | 'settings';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskTag = 'Work' | 'Wellbeing' | 'Admin' | 'Learning' | 'Personal' | 'Creative';

export interface Task {
  id: string;
  title: string;
  description?: string;
  tag: TaskTag;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | '3x_week';
export type HabitCategory = 'Health' | 'Mind' | 'Productivity' | 'Fitness' | 'Learning' | 'Lifestyle';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  color?: string;
  icon?: string;
  history: Record<string, boolean>;
  createdAt: string;
}

// ==========================================
// ==========================================
// HEALTH & PHYSICAL ARCHITECTURE TYPES
// ==========================================

export interface HealthProfile {
  id?: string;
  current_weight: number;
  goal_weight: number;
}

export interface DailyMeal {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  meal_type?: string; // 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Meal'
  completed: boolean; // marked complete if eaten
  created_at?: string;
}

export interface WorkoutExerciseItem {
  id: string;
  name: string;
  target_sets?: number;
  target_reps?: string;
  target_weight?: number;
}

export interface WorkoutDayPlan {
  id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  day_name: string; // e.g. "Chest & Triceps", "Rest & Recovery"
  is_rest_day: boolean;
  exercises: WorkoutExerciseItem[];
}

export interface DailyWorkoutRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completed_exercises?: string[]; // IDs of exercises completed
  notes?: string;
}

export interface WeightCheckin {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  dailyFocusTargetMinutes: number;
  theme: 'warm-paper' | 'dark-slate' | 'minimal-light';
  createdAt: string;
  health_profile?: HealthProfile;
}

export interface LifeScoreBreakdown {
  overall: number;
  tasksScore: number;
  habitsScore: number;
  healthScore: number;
  summary: string;
  changeVsLastWeek: number;
}
