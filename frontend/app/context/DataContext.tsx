'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  Habit,
  Goal,
  Milestone,
  LifeScoreBreakdown,
  TaskPriority,
  TaskTag,
  HabitCategory,
  HabitFrequency,
  GoalCategory,
  GoalStatus,
  HealthProfile,
  Food,
  FoodLog,
  WeightCheckin,
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
  WorkoutLog,
  DailyHealthStatus,
  TodayMacros,
} from '../types';
import { api, getAccessToken } from '../../lib/api';
import { useAuth } from './AuthContext';

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseGoalDescription(rawDesc?: string): { cleanDescription: string; milestones: Milestone[] } {
  if (!rawDesc) return { cleanDescription: '', milestones: [] };
  const marker = '[MILESTONES]:';
  const idx = rawDesc.indexOf(marker);
  if (idx === -1) {
    return { cleanDescription: rawDesc.trim(), milestones: [] };
  }
  const cleanDescription = rawDesc.substring(0, idx).trim();
  const milestonesJson = rawDesc.substring(idx + marker.length).trim();
  try {
    const parsed = JSON.parse(milestonesJson);
    if (Array.isArray(parsed)) {
      return { cleanDescription, milestones: parsed };
    }
  } catch (e) {
    console.warn('Failed to parse milestones from description:', e);
  }
  return { cleanDescription, milestones: [] };
}

export function encodeGoalDescription(cleanDesc?: string, milestones?: Milestone[]): string {
  const desc = (cleanDesc || '').trim();
  if (!milestones || milestones.length === 0) {
    return desc;
  }
  const marker = '[MILESTONES]:' + JSON.stringify(milestones);
  return desc ? `${desc}\n\n${marker}` : marker;
}

const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  age: 0,
  biological_sex: 'male',
  height_cm: 0,
  current_weight: 0,
  goal_weight: 0,
  activity_level: 'moderate',
  training_focus: 'hypertrophy',
  training_frequency: 4,
  target_calories: 0,
  target_protein: 0,
  target_carbs: 0,
  target_fat: 0,
  target_water_ml: 2500,
  creatine_target_g: 5,
  is_onboarded: false,
};

const DEFAULT_FOODS: Food[] = [];

const DEFAULT_WEIGHT_CHECKINS: WeightCheckin[] = [];

const DEFAULT_EXERCISES = [
  { id: 'ex-1', name: 'Barbell Bench Press', muscle_group: 'Chest' },
  { id: 'ex-2', name: 'Incline Dumbbell Press', muscle_group: 'Chest' },
  { id: 'ex-3', name: 'Overhead Shoulder Press', muscle_group: 'Shoulders' },
  { id: 'ex-4', name: 'Lateral Raises', muscle_group: 'Shoulders' },
  { id: 'ex-5', name: 'Tricep Rope Pushdown', muscle_group: 'Arms' },
  { id: 'ex-6', name: 'Lat Pulldown', muscle_group: 'Back' },
  { id: 'ex-7', name: 'Seated Cable Row', muscle_group: 'Back' },
  { id: 'ex-8', name: 'Bicep Dumbbell Curl', muscle_group: 'Arms' },
  { id: 'ex-9', name: 'Barbell Back Squat', muscle_group: 'Legs' },
  { id: 'ex-10', name: 'Romanian Deadlift', muscle_group: 'Legs' },
  { id: 'ex-11', name: 'Leg Press', muscle_group: 'Legs' },
];

export function generateWorkoutPlan(freq: number): WorkoutPlan {
  const pushDay: WorkoutDay = {
    id: 'wd-push',
    day_name: 'Push (Chest, Shoulders, Triceps)',
    day_of_week: 0,
    is_rest_day: false,
    order: 0,
    exercises: [
      { id: 'we-1', exercise: 'ex-1', exercise_details: DEFAULT_EXERCISES[0], order: 0, target_sets: 3, target_reps: '6-8', target_weight: 0 },
      { id: 'we-2', exercise: 'ex-2', exercise_details: DEFAULT_EXERCISES[1], order: 1, target_sets: 3, target_reps: '8-10', target_weight: 0 },
      { id: 'we-3', exercise: 'ex-3', exercise_details: DEFAULT_EXERCISES[2], order: 2, target_sets: 3, target_reps: '8-10', target_weight: 0 },
      { id: 'we-4', exercise: 'ex-4', exercise_details: DEFAULT_EXERCISES[3], order: 3, target_sets: 4, target_reps: '12-15', target_weight: 0 },
    ]
  };
  const pullDay: WorkoutDay = {
    id: 'wd-pull',
    day_name: 'Pull (Back, Biceps)',
    day_of_week: 1,
    is_rest_day: false,
    order: 1,
    exercises: [
      { id: 'we-5', exercise: 'ex-6', exercise_details: DEFAULT_EXERCISES[5], order: 0, target_sets: 3, target_reps: '8-10', target_weight: 0 },
      { id: 'we-7', exercise: 'ex-7', exercise_details: DEFAULT_EXERCISES[6], order: 1, target_sets: 3, target_reps: '10-12', target_weight: 0 },
      { id: 'we-8', exercise: 'ex-8', exercise_details: DEFAULT_EXERCISES[7], order: 2, target_sets: 3, target_reps: '10-12', target_weight: 0 },
    ]
  };
  const legsDay: WorkoutDay = {
    id: 'wd-legs',
    day_name: 'Legs & Core',
    day_of_week: 2,
    is_rest_day: false,
    order: 2,
    exercises: [
      { id: 'we-9', exercise: 'ex-9', exercise_details: DEFAULT_EXERCISES[8], order: 0, target_sets: 4, target_reps: '6-8', target_weight: 0 },
      { id: 'we-10', exercise: 'ex-10', exercise_details: DEFAULT_EXERCISES[9], order: 1, target_sets: 3, target_reps: '8-10', target_weight: 0 },
      { id: 'we-11', exercise: 'ex-11', exercise_details: DEFAULT_EXERCISES[10], order: 2, target_sets: 3, target_reps: '12', target_weight: 0 },
    ]
  };
  const upperDay: WorkoutDay = {
    id: 'wd-upper',
    day_name: 'Upper Power',
    day_of_week: 3,
    is_rest_day: false,
    order: 3,
    exercises: [
      { id: 'we-12', exercise: 'ex-1', exercise_details: DEFAULT_EXERCISES[0], order: 0, target_sets: 3, target_reps: '5', target_weight: 0 },
      { id: 'we-13', exercise: 'ex-6', exercise_details: DEFAULT_EXERCISES[5], order: 1, target_sets: 3, target_reps: '8', target_weight: 0 },
    ]
  };

  const daysMap: Record<number, WorkoutDay[]> = {
    3: [pushDay, pullDay, legsDay],
    4: [pushDay, pullDay, legsDay, upperDay],
    5: [pushDay, pullDay, legsDay, upperDay, { ...legsDay, id: 'wd-legs-2', day_name: 'Lower Power', order: 4 }],
    6: [pushDay, pullDay, legsDay, { ...pushDay, id: 'wd-push-2', order: 3 }, { ...pullDay, id: 'wd-pull-2', order: 4 }, { ...legsDay, id: 'wd-legs-2', order: 5 }],
  };

  const days = daysMap[freq] || daysMap[4];
  return {
    id: `wp-${freq}d`,
    name: `${freq}-Day Hypertrophy Program`,
    frequency: freq,
    is_active: true,
    days,
  };
}

const DEFAULT_DEMO_TASKS: Task[] = [
  { id: 't-1', title: 'Complete client system architecture document', tag: 'Work', priority: 'urgent', dueDate: getTodayDateStr(), completed: true, completedAt: getTodayDateStr(), createdAt: getPastDateStr(1) },
  { id: 't-2', title: 'Review pull requests & merge deployment scripts', tag: 'Work', priority: 'high', dueDate: getTodayDateStr(), completed: false, createdAt: getTodayDateStr() },
  { id: 't-3', title: 'Read 20 pages of High Output Management', tag: 'Learning', priority: 'medium', dueDate: getTodayDateStr(), completed: false, createdAt: getTodayDateStr() },
  { id: 't-4', title: 'Meal prep high protein lunches for week', tag: 'Wellbeing', priority: 'medium', dueDate: getTodayDateStr(), completed: true, completedAt: getTodayDateStr(), createdAt: getPastDateStr(2) },
];

const DEFAULT_DEMO_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: 'Hydration (2.5L Water)',
    category: 'Health',
    frequency: 'daily',
    color: '#3b82f6',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-2',
    name: 'Hit 120g Daily Protein',
    category: 'Health',
    frequency: 'daily',
    color: '#e66b4b',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-3',
    name: 'Strength Training Session',
    category: 'Fitness',
    frequency: 'daily',
    color: '#5f805d',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: false, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-4',
    name: 'Creatine (5g Daily)',
    category: 'Health',
    frequency: 'daily',
    color: '#8b5cf6',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-5',
    name: 'Deep Work (3 Focus Blocks)',
    category: 'Productivity',
    frequency: 'weekdays',
    color: '#e66b4b',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
];

const DEFAULT_DEMO_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Reach 57 kg Lean Muscle Mass',
    description: 'Systematic lean surplus of +350 kcal/day, 120g+ protein, 4x weekly progressive strength training.',
    category: 'Health',
    targetDate: '2026-12-31',
    status: 'on_track',
    milestones: [
      { id: 'm-1', title: 'Break through 48.5 kg milestone', done: true, dueDate: '2026-08-30' },
      { id: 'm-2', title: 'Reach 50.0 kg solid bodyweight', done: false, dueDate: '2026-10-15' },
      { id: 'm-3', title: 'Bench press 50kg for 3x8 clean', done: false, dueDate: '2026-11-15' },
      { id: 'm-4', title: 'Final target 57.0 kg lean mass', done: false, dueDate: '2026-12-31' },
    ],
    notes: 'Prioritize whole eggs, soya chunks, paneer, and peanut butter shakes.',
    createdAt: getPastDateStr(45),
  },
  {
    id: 'g-2',
    title: 'Scale Software Engineering Consultancy',
    description: 'Deliver 3 high-impact client systems and build reusable open-source architecture.',
    category: 'Career',
    targetDate: '2026-11-30',
    status: 'on_track',
    milestones: [
      { id: 'm-5', title: 'Close Q3 enterprise contract', done: true, dueDate: '2026-09-15' },
      { id: 'm-6', title: 'Deploy core API infrastructure', done: true, dueDate: '2026-09-30' },
      { id: 'm-7', title: 'Publish technical case study', done: false, dueDate: '2026-10-31' },
    ],
    notes: 'Maintain 90+ min daily focus blocks.',
    createdAt: getPastDateStr(60),
  },
];

interface HabitStreakInfo {
  currentStreak: number;
  longestStreak: number;
  consistency7d: number;
}

interface DataContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'> & { completed?: boolean }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'history'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDay: (id: string, dateStr: string) => Promise<void>;
  getHabitStreak: (habit: Habit) => HabitStreakInfo;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  addMilestone: (goalId: string, title: string) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  getGoalProgress: (goal: Goal) => number;

  // Health Module State & Actions
  healthProfile: HealthProfile;
  onboardHealth: (data: Partial<HealthProfile>) => Promise<void>;
  updateHealthProfile: (updates: Partial<HealthProfile>) => Promise<void>;

  // Nutrition
  foods: Food[];
  foodLogs: FoodLog[];
  todayMacros: TodayMacros;
  addFood: (food: Omit<Food, 'id'>) => Promise<void>;
  updateFood: (id: string, updates: Partial<Food>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  logFood: (foodId: string, servings?: number, date?: string) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
  logStapleFast: (food: Food) => Promise<void>;

  // Hydration & Creatine
  dailyHealthStatus: DailyHealthStatus;
  logWater: (amountMl: number) => Promise<void>;
  toggleCreatine: () => Promise<void>;

  // Weight Check-ins
  weightCheckins: WeightCheckin[];
  logWeight: (weight: number, date?: string, notes?: string) => Promise<void>;
  deleteWeightCheckin: (id: string) => Promise<void>;

  // Workouts
  workoutPlan: WorkoutPlan | null;
  todayWorkoutDay: WorkoutDay | null;
  todayWorkoutLogs: WorkoutLog[];
  toggleWorkoutExercise: (workoutExerciseId: string, completed?: boolean, actualReps?: string, actualWeight?: number) => Promise<void>;
  setWorkoutFrequency: (freq: number) => Promise<void>;

  // LifeScore & System
  lifeScore: LifeScoreBreakdown;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(DEFAULT_DEMO_TASKS);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_DEMO_HABITS);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_DEMO_GOALS);

  const [healthProfile, setHealthProfile] = useState<HealthProfile>(DEFAULT_HEALTH_PROFILE);
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [weightCheckins, setWeightCheckins] = useState<WeightCheckin[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [todayWorkoutDay, setTodayWorkoutDay] = useState<WorkoutDay | null>(null);
  const [todayWorkoutLogs, setTodayWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [dailyHealthStatus, setDailyHealthStatus] = useState<DailyHealthStatus>({
    date: getTodayDateStr(),
    water_ml: 0,
    creatine_completed: false,
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Compute Today's Macros
  const todayMacros: TodayMacros = useMemo(() => {
    const todayStr = getTodayDateStr();
    const todays = foodLogs.filter(fl => fl.date === todayStr);

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    for (const log of todays) {
      const food = log.food_details || foods.find(f => f.id === log.food);
      if (food) {
        calories += food.calories * log.servings;
        protein += food.protein * log.servings;
        carbs += food.carbs * log.servings;
        fat += food.fat * log.servings;
      }
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      target_calories: healthProfile.target_calories || 2400,
      target_protein: healthProfile.target_protein || 120,
      target_carbs: healthProfile.target_carbs || 300,
      target_fat: healthProfile.target_fat || 75,
    };
  }, [foodLogs, foods, healthProfile]);

  // Unified 4-Pillar LifeScore
  const lifeScore: LifeScoreBreakdown = useMemo(() => {
    const todayStr = getTodayDateStr();

    // 1. Tasks Score (25%)
    const todayTasks = tasks.filter(t => !t.dueDate || t.dueDate === todayStr || t.completedAt === todayStr);
    const totalTodayTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const tasksScore = totalTodayTasks > 0 ? Math.round((completedTasks / totalTodayTasks) * 100) : 85;

    // 2. Habits Score (25%)
    const activeHabits = habits.filter(h => h.frequency === 'daily' || h.frequency === 'weekdays');
    const totalHabits = activeHabits.length;
    const completedHabits = activeHabits.filter(h => !!h.history[todayStr]).length;
    const habitsScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 80;

    // 3. Health Consistency Score (25%)
    const nutritionAdherence = Math.min(100, Math.round((todayMacros.calories / (healthProfile.target_calories || 2400)) * 100));
    const proteinAdherence = Math.min(100, Math.round((todayMacros.protein / (healthProfile.target_protein || 120)) * 100));
    const hydrationAdherence = Math.min(100, Math.round((dailyHealthStatus.water_ml / (healthProfile.target_water_ml || 2500)) * 100));
    const creatineScore = dailyHealthStatus.creatine_completed ? 100 : 0;

    const totalExercises = todayWorkoutDay?.exercises?.length || 0;
    const completedExercises = todayWorkoutLogs.filter(wl => wl.completed).length;
    const workoutScore = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 100;

    const healthScore = Math.round(
      (nutritionAdherence * 0.25) +
      (proteinAdherence * 0.25) +
      (workoutScore * 0.25) +
      (hydrationAdherence * 0.15) +
      (creatineScore * 0.10)
    );

    // 4. Goals Score (25%)
    const goalScores = goals.map(g => {
      if (g.milestones.length === 0) return 75;
      const done = g.milestones.filter(m => m.done).length;
      return Math.round((done / g.milestones.length) * 100);
    });
    const goalsScore = goalScores.length > 0 ? Math.round(goalScores.reduce((a, b) => a + b, 0) / goalScores.length) : 75;

    const overall = Math.round(
      (tasksScore * 0.25) +
      (habitsScore * 0.25) +
      (healthScore * 0.25) +
      (goalsScore * 0.25)
    );

    return {
      overall,
      tasksScore,
      habitsScore,
      healthScore,
      goalsScore,
      summary: overall >= 80 ? 'Exceptional momentum across all personal pillars.' : 'Consistent execution in progress.',
      changeVsLastWeek: +3.2,
    };
  }, [tasks, habits, goals, todayMacros, healthProfile, dailyHealthStatus, todayWorkoutDay, todayWorkoutLogs]);

  // Fetch Workspace from API or fallback
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      setIsLoadingData(true);
      const res = await api.bootstrap();
      if (res) {
        if (res.tasks) {
          setTasks(res.tasks.map(t => ({
            id: String(t.id),
            title: t.title,
            description: t.description,
            tag: 'Work',
            priority: (t.priority || 'medium') as TaskPriority,
            dueDate: t.due_date || undefined,
            completed: !!t.completed,
            createdAt: t.created_at || getTodayDateStr(),
          })));
        }
        if (res.habits) {
          setHabits(res.habits.map(h => {
            const hist: Record<string, boolean> = {};
            if (Array.isArray(h.completions)) {
              h.completions.forEach((c: any) => {
                if (c.date && c.completed) hist[c.date] = true;
              });
            }
            return {
              id: String(h.id),
              name: h.name,
              category: 'Health' as HabitCategory,
              frequency: (h.frequency || 'daily') as HabitFrequency,
              color: '#e66b4b',
              history: hist,
              createdAt: h.created_at || getTodayDateStr(),
            };
          }));
        }
        if (res.goals) {
          setGoals(res.goals.map(g => {
            const { cleanDescription, milestones } = parseGoalDescription(g.description);
            return {
              id: String(g.id),
              title: g.title,
              description: cleanDescription,
              category: 'Personal' as GoalCategory,
              targetDate: g.deadline || undefined,
              status: (g.status || 'active') as GoalStatus,
              milestones,
              notes: cleanDescription,
              createdAt: g.created_at || getTodayDateStr(),
            };
          }));
        }
        if (res.health_profile) {
          setHealthProfile(res.health_profile);
        }
        if (res.foods && res.foods.length > 0) {
          setFoods(res.foods);
        }
        if (res.food_logs_today) {
          setFoodLogs(res.food_logs_today);
        }
        if (res.weight_checkins && res.weight_checkins.length > 0) {
          setWeightCheckins(res.weight_checkins);
        }
        if (res.workout_plan) {
          setWorkoutPlan(res.workout_plan);
        }
        if (res.today_workout_day) {
          setTodayWorkoutDay(res.today_workout_day);
        }
        if (res.today_workout_logs) {
          setTodayWorkoutLogs(res.today_workout_logs);
        }
        if (res.daily_health_status) {
          setDailyHealthStatus(res.daily_health_status);
        }
      }
    } catch (err) {
      console.warn('Bootstrap fetch fallback:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Tasks actions
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'> & { completed?: boolean }) => {
    const newTask: Task = {
      ...taskData,
      id: 't-' + Date.now(),
      completed: taskData.completed || false,
      createdAt: getTodayDateStr(),
    };
    setTasks(prev => [newTask, ...prev]);
    if (getAccessToken()) {
      try {
        await api.tasks.create({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.dueDate || null,
        });
      } catch (err) {
        console.error('Failed to save task to backend:', err);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    if (getAccessToken()) {
      try {
        await api.tasks.update(id, {
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          due_date: updates.dueDate,
          completed: updates.completed,
        });
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (getAccessToken()) {
      try {
        await api.tasks.delete(id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    const completedAt = nextCompleted ? getTodayDateStr() : undefined;
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: nextCompleted, completedAt } : t)));
    if (getAccessToken()) {
      try {
        await api.tasks.update(id, { completed: nextCompleted });
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    }
  };

  // Habits actions
  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'history'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: 'h-' + Date.now(),
      history: {},
      createdAt: getTodayDateStr(),
    };
    setHabits(prev => [newHabit, ...prev]);
    if (getAccessToken()) {
      try {
        await api.habits.create({ name: habitData.name, frequency: habitData.frequency });
      } catch (err) {
        console.error('Failed to create habit:', err);
      }
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
    if (getAccessToken()) {
      try {
        await api.habits.update(id, { name: updates.name, frequency: updates.frequency, active: updates.category ? true : undefined });
      } catch (err) {
        console.error('Failed to update habit:', err);
      }
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    if (getAccessToken()) {
      try {
        await api.habits.delete(id);
      } catch (err) {
        console.error('Failed to delete habit:', err);
      }
    }
  };

  const toggleHabitDay = async (id: string, dateStr: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const current = !!habit.history[dateStr];
    const next = !current;

    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          const newHistory = { ...h.history };
          if (next) {
            newHistory[dateStr] = true;
          } else {
            delete newHistory[dateStr];
          }
          return { ...h, history: newHistory };
        }
        return h;
      })
    );

    if (getAccessToken()) {
      try {
        await api.habits.toggleCompletion({ habit: id, date: dateStr, completed: next });
      } catch (err) {
        console.error('Failed to toggle habit completion:', err);
      }
    }
  };

  const getHabitStreak = (habit: Habit): HabitStreakInfo => {
    let currentStreak = 0;
    let longestStreak = 0;
    const checkDate = new Date();

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (habit.history[dateStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (currentStreak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const y2 = checkDate.getFullYear();
          const m2 = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d2 = String(checkDate.getDate()).padStart(2, '0');
          if (habit.history[`${y2}-${m2}-${d2}`]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    longestStreak = Math.max(currentStreak, Object.keys(habit.history).length);

    let completed7d = 0;
    for (let i = 0; i < 7; i++) {
      if (habit.history[getPastDateStr(i)]) {
        completed7d++;
      }
    }
    const consistency7d = Math.round((completed7d / 7) * 100);

    return { currentStreak, longestStreak, consistency7d };
  };

  // Goals actions
  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: 'g-' + Date.now(),
      createdAt: getTodayDateStr(),
    };
    setGoals(prev => [newGoal, ...prev]);
    if (getAccessToken()) {
      try {
        const progress = getGoalProgress(newGoal);
        const encodedDesc = encodeGoalDescription(goalData.description, goalData.milestones);
        const created = await api.goals.create({
          title: goalData.title,
          description: encodedDesc,
          deadline: goalData.targetDate || null,
          status: goalData.status,
          progress,
        });
        if (created && created.id) {
          setGoals(prev => prev.map(g => (g.id === newGoal.id ? { ...g, id: String(created.id) } : g)));
        }
      } catch (err) {
        console.error('Failed to create goal:', err);
      }
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    let updatedGoal: Goal | null = null;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === id) {
          updatedGoal = { ...g, ...updates };
          return updatedGoal;
        }
        return g;
      })
    );
    if (getAccessToken() && updatedGoal) {
      try {
        const goal = updatedGoal as Goal;
        const progress = getGoalProgress(goal);
        await api.goals.update(id, {
          title: updates.title,
          description: encodeGoalDescription(goal.description, goal.milestones),
          deadline: updates.targetDate,
          status: updates.status,
          progress,
        });
      } catch (err) {
        console.error('Failed to update goal:', err);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (getAccessToken()) {
      try {
        await api.goals.delete(id);
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    let targetGoal: Goal | null = null;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map(m => (m.id === milestoneId ? { ...m, done: !m.done } : m));
          const updated = { ...g, milestones: updatedMilestones };
          targetGoal = updated;
          return updated;
        }
        return g;
      })
    );
    if (targetGoal && getAccessToken()) {
      try {
        const goal = targetGoal as Goal;
        const progress = getGoalProgress(goal);
        await api.goals.update(goalId, {
          description: encodeGoalDescription(goal.description, goal.milestones),
          progress,
          status: progress === 100 ? 'completed' : goal.status,
        });
      } catch (err) {
        console.error('Failed to sync milestone toggle:', err);
      }
    }
  };

  const addMilestone = async (goalId: string, title: string) => {
    const newMilestone: Milestone = {
      id: 'm_' + Date.now(),
      title,
      done: false,
    };
    let targetGoal: Goal | null = null;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updated = { ...g, milestones: [...g.milestones, newMilestone] };
          targetGoal = updated;
          return updated;
        }
        return g;
      })
    );
    if (targetGoal && getAccessToken()) {
      try {
        const goal = targetGoal as Goal;
        const progress = getGoalProgress(goal);
        await api.goals.update(goalId, {
          description: encodeGoalDescription(goal.description, goal.milestones),
          progress,
        });
      } catch (err) {
        console.error('Failed to sync added milestone:', err);
      }
    }
  };

  const deleteMilestone = async (goalId: string, milestoneId: string) => {
    let targetGoal: Goal | null = null;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updated = { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) };
          targetGoal = updated;
          return updated;
        }
        return g;
      })
    );
    if (targetGoal && getAccessToken()) {
      try {
        const goal = targetGoal as Goal;
        const progress = getGoalProgress(goal);
        await api.goals.update(goalId, {
          description: encodeGoalDescription(goal.description, goal.milestones),
          progress,
        });
      } catch (err) {
        console.error('Failed to sync deleted milestone:', err);
      }
    }
  };

  const getGoalProgress = (goal: Goal): number => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.done).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  // Health Profile & Onboarding
  const onboardHealth = async (data: Partial<HealthProfile>) => {
    const updated = { ...healthProfile, ...data, is_onboarded: true };
    setHealthProfile(updated as HealthProfile);
    if (getAccessToken()) {
      try {
        await api.health.onboard(data as any);
        await refreshData();
      } catch (err) {
        console.error('Failed to submit health onboarding:', err);
      }
    }
  };

  const updateHealthProfile = async (updates: Partial<HealthProfile>) => {
    const updated = { ...healthProfile, ...updates };
    setHealthProfile(updated as HealthProfile);
    if (getAccessToken() && healthProfile.id) {
      try {
        await api.health.updateProfile(healthProfile.id, updates);
      } catch (err) {
        console.error('Failed to update health profile:', err);
      }
    }
  };

  // Nutrition actions
  const addFood = async (foodData: Omit<Food, 'id'>) => {
    const newFood: Food = { ...foodData, id: 'f-' + Date.now() };
    setFoods(prev => [newFood, ...prev]);
    if (getAccessToken()) {
      try {
        await api.health.foods.create(foodData);
      } catch (err) {
        console.error('Failed to save food:', err);
      }
    }
  };

  const updateFood = async (id: string, updates: Partial<Food>) => {
    setFoods(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    if (getAccessToken()) {
      try {
        await api.health.foods.update(id, updates);
      } catch (err) {
        console.error('Failed to update food:', err);
      }
    }
  };

  const deleteFood = async (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
    if (getAccessToken()) {
      try {
        await api.health.foods.delete(id);
      } catch (err) {
        console.error('Failed to delete food:', err);
      }
    }
  };

  const logFood = async (foodId: string, servings = 1.0, date = getTodayDateStr()) => {
    const food = foods.find(f => f.id === foodId);
    const newLog: FoodLog = {
      id: 'fl-' + Date.now(),
      food: foodId,
      food_details: food,
      date,
      servings,
      logged_at: new Date().toISOString(),
    };
    setFoodLogs(prev => [newLog, ...prev]);
    if (getAccessToken()) {
      try {
        await api.health.foodLogs.create({ food: foodId, date, servings });
      } catch (err) {
        console.error('Failed to log food:', err);
      }
    }
  };

  const logStapleFast = async (food: Food) => {
    await logFood(food.id, 1.0, getTodayDateStr());
  };

  const deleteFoodLog = async (id: string) => {
    setFoodLogs(prev => prev.filter(fl => fl.id !== id));
    if (getAccessToken()) {
      try {
        await api.health.foodLogs.delete(id);
      } catch (err) {
        console.error('Failed to delete food log:', err);
      }
    }
  };

  // Hydration & Creatine
  const logWater = async (amountMl: number) => {
    const current = dailyHealthStatus.water_ml;
    const next = Math.max(0, current + amountMl);
    setDailyHealthStatus(prev => ({ ...prev, water_ml: next }));
    if (getAccessToken() && dailyHealthStatus.id) {
      try {
        await api.health.dailyStatus.update(dailyHealthStatus.id, { water_ml: next });
      } catch (err) {
        console.error('Failed to update water:', err);
      }
    }
  };

  const toggleCreatine = async () => {
    const next = !dailyHealthStatus.creatine_completed;
    setDailyHealthStatus(prev => ({ ...prev, creatine_completed: next }));
    if (getAccessToken() && dailyHealthStatus.id) {
      try {
        await api.health.dailyStatus.update(dailyHealthStatus.id, { creatine_completed: next });
      } catch (err) {
        console.error('Failed to toggle creatine:', err);
      }
    }
  };

  // Weight check-in actions
  const logWeight = async (weight: number, date = getTodayDateStr(), notes = '') => {
    const newCheckin: WeightCheckin = {
      id: 'w-' + Date.now(),
      date,
      weight,
      notes,
    };
    setWeightCheckins(prev => [newCheckin, ...prev.filter(w => w.date !== date)]);
    setHealthProfile(prev => ({ ...prev, current_weight: weight }));
    if (getAccessToken()) {
      try {
        await api.health.weight.create({ date, weight, notes });
      } catch (err) {
        console.error('Failed to log weight:', err);
      }
    }
  };

  const deleteWeightCheckin = async (id: string) => {
    setWeightCheckins(prev => prev.filter(w => w.id !== id));
    if (getAccessToken()) {
      try {
        await api.health.weight.delete(id);
      } catch (err) {
        console.error('Failed to delete weight checkin:', err);
      }
    }
  };

  // Workout actions
  const toggleWorkoutExercise = async (
    workoutExerciseId: string,
    completed = true,
    actualReps = '',
    actualWeight = 0
  ) => {
    const todayStr = getTodayDateStr();
    const existing = todayWorkoutLogs.find(wl => wl.workout_exercise === workoutExerciseId);

    if (existing) {
      const nextCompleted = completed !== undefined ? completed : !existing.completed;
      setTodayWorkoutLogs(prev =>
        prev.map(wl =>
          wl.workout_exercise === workoutExerciseId
            ? { ...wl, completed: nextCompleted, actual_reps: actualReps || wl.actual_reps, actual_weight: actualWeight || wl.actual_weight }
            : wl
        )
      );
    } else {
      const newLog: WorkoutLog = {
        id: 'wl-' + Date.now(),
        workout_exercise: workoutExerciseId,
        date: todayStr,
        completed: true,
        actual_reps: actualReps,
        actual_weight: actualWeight,
      };
      setTodayWorkoutLogs(prev => [newLog, ...prev]);
    }

    if (getAccessToken()) {
      try {
        await api.health.workouts.logWorkout({
          workout_exercise: workoutExerciseId,
          date: todayStr,
          completed: completed,
          actual_reps: actualReps,
          actual_weight: actualWeight,
        });
      } catch (err) {
        console.error('Failed to log workout exercise:', err);
      }
    }
  };

  const setWorkoutFrequency = async (freq: number) => {
    const plan = generateWorkoutPlan(freq);
    setWorkoutPlan(plan);
    setTodayWorkoutDay(plan.days[0] || null);
    await updateHealthProfile({ training_frequency: freq });
    if (getAccessToken()) {
      try {
        await api.health.onboard({ ...healthProfile, training_frequency: freq } as any);
        await refreshData();
      } catch (err) {
        console.error('Failed to change workout split:', err);
      }
    }
  };

  const resetAllData = () => {
    setTasks([]);
    setHabits([]);
    setGoals([]);
    setFoodLogs([]);
    setWeightCheckins([]);
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,

        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDay,
        getHabitStreak,

        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        addMilestone,
        deleteMilestone,
        getGoalProgress,

        healthProfile,
        onboardHealth,
        updateHealthProfile,

        foods,
        foodLogs,
        todayMacros,
        addFood,
        updateFood,
        deleteFood,
        logFood,
        deleteFoodLog,
        logStapleFast,

        dailyHealthStatus,
        logWater,
        toggleCreatine,

        weightCheckins,
        logWeight,
        deleteWeightCheckin,

        workoutPlan,
        todayWorkoutDay,
        todayWorkoutLogs,
        toggleWorkoutExercise,
        setWorkoutFrequency,

        lifeScore,
        isLoadingData,
        refreshData,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
