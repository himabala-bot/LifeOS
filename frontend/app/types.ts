export type ScreenType =
  | 'today'
  | 'trajectory'
  | 'tasks'
  | 'habits'
  | 'goals'
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

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
}

export type GoalCategory = 'Career' | 'Health' | 'Personal' | 'Travel' | 'Creative';
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

// ==========================================
// HEALTH & STRENGTH MODULE TYPES
// ==========================================

export type BiologicalSex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TrainingFocus = 'hypertrophy' | 'strength' | 'endurance' | 'general_fitness';

export interface HealthProfile {
  id?: string;
  age: number;
  biological_sex: BiologicalSex;
  height_cm: number;
  current_weight: number;
  goal_weight: number;
  activity_level: ActivityLevel;
  training_focus: TrainingFocus;
  training_frequency: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  target_water_ml: number;
  creatine_target_g: number;
  is_onboarded: boolean;
}

export interface Food {
  id: string;
  name: string;
  serving_description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_staple: boolean;
}

export interface FoodLog {
  id: string;
  food: string;
  food_details?: Food;
  date: string;
  servings: number;
  logged_at?: string;
}

export interface WeightCheckin {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

export interface WorkoutExercise {
  id: string;
  workout_day?: string;
  exercise: string | Exercise;
  exercise_details?: Exercise;
  order: number;
  target_sets: number;
  target_reps: string;
  target_weight: number;
}

export interface WorkoutDay {
  id: string;
  day_name: string;
  day_of_week: number;
  is_rest_day: boolean;
  order: number;
  exercises?: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  frequency: number;
  is_active: boolean;
  days?: WorkoutDay[];
}

export interface WorkoutLog {
  id: string;
  workout_exercise: string;
  date: string;
  completed: boolean;
  actual_sets?: number;
  actual_reps?: string;
  actual_weight?: number;
}

export interface DailyHealthStatus {
  id?: string;
  date: string;
  water_ml: number;
  creatine_completed: boolean;
}

export interface TodayMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
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
  goalsScore: number;
  summary: string;
  changeVsLastWeek: number;
}
