export type ScreenType = 
  | 'today' 
  | 'trajectory'
  | 'tasks' 
  | 'habits' 
  | 'goals' 
  | 'expenses' 
  | 'analytics' 
  | 'journal' 
  | 'settings';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskTag = 'Work' | 'Wellbeing' | 'Admin' | 'Learning' | 'Personal' | 'Finance' | 'Creative';

export interface Task {
  id: string;
  title: string;
  description?: string;
  tag: TaskTag;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
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
  history: Record<string, boolean>; // dateStr 'YYYY-MM-DD' -> true
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
}

export type GoalCategory = 'Career' | 'Wealth' | 'Health' | 'Personal' | 'Travel' | 'Creative';
export type GoalStatus = 'active' | 'on_track' | 'behind' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate?: string;
  status: GoalStatus;
  milestones: Milestone[];
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Food & Dining' 
  | 'Housing & Rent' 
  | 'Transport' 
  | 'Utilities & Bills' 
  | 'Entertainment' 
  | 'Health & Wellness' 
  | 'Shopping' 
  | 'Education' 
  | 'Savings & Investment' 
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface EnergyLog {
  id: string;
  date: string; // YYYY-MM-DD
  energyLevel: number; // 1 to 5
  focusMinutes: number;
  mood: 'energized' | 'focused' | 'calm' | 'tired' | 'stressed' | 'inspired';
  highlight?: string;
  gratitude?: string;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  currency: string; // '₹', '$', '€', '£', etc.
  monthlyBudget: number;
  dailyFocusTargetMinutes: number;
  theme: 'warm-paper' | 'dark-slate' | 'minimal-light';
  createdAt: string;
}

export interface LifeScoreBreakdown {
  overall: number;
  tasksScore: number;
  habitsScore: number;
  budgetScore: number;
  goalsScore: number;
  summary: string;
  changeVsLastWeek: number;
}
