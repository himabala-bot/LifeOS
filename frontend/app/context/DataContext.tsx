'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  Habit,
  LifeScoreBreakdown,
  TaskPriority,
  TaskTag,
  HabitCategory,
  HabitFrequency,
  HealthProfile,
  DailyMeal,
  MasterMealItem,
  WorkoutDayPlan,
  WorkoutExerciseItem,
  DailyWorkoutRecord,
  WeightCheckin,
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

const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  current_weight: 0,
  goal_weight: 0,
};

const DEFAULT_WEEKLY_SCHEDULE: WorkoutDayPlan[] = [
  { id: 'w-1', day_of_week: 1, day_name: '', is_rest_day: false, exercises: [] },
  { id: 'w-2', day_of_week: 2, day_name: '', is_rest_day: false, exercises: [] },
  { id: 'w-3', day_of_week: 3, day_name: '', is_rest_day: false, exercises: [] },
  { id: 'w-4', day_of_week: 4, day_name: '', is_rest_day: false, exercises: [] },
  { id: 'w-5', day_of_week: 5, day_name: '', is_rest_day: false, exercises: [] },
  { id: 'w-6', day_of_week: 6, day_name: '', is_rest_day: false, exercises: [] },
  { id: 'w-0', day_of_week: 0, day_name: '', is_rest_day: false, exercises: [] },
];

const DEFAULT_DEMO_TASKS: Task[] = [
  { id: 't-1', title: 'Complete client system architecture document', tag: 'Work', priority: 'urgent', dueDate: getTodayDateStr(), completed: true, completedAt: getTodayDateStr(), createdAt: getPastDateStr(1) },
  { id: 't-2', title: 'Review pull requests & merge deployment scripts', tag: 'Work', priority: 'high', dueDate: getTodayDateStr(), completed: false, createdAt: getTodayDateStr() },
  { id: 't-3', title: 'Read 20 pages of High Output Management', tag: 'Learning', priority: 'medium', dueDate: getTodayDateStr(), completed: false, createdAt: getTodayDateStr() },
  { id: 't-4', title: 'Prepare healthy meals for the week', tag: 'Wellbeing', priority: 'medium', dueDate: getTodayDateStr(), completed: true, completedAt: getTodayDateStr(), createdAt: getPastDateStr(2) },
];

const DEFAULT_DEMO_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: 'Morning Focus & Breathwork',
    category: 'Mind',
    frequency: 'daily',
    color: '#3b82f6',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-2',
    name: 'Read 20 Pages',
    category: 'Learning',
    frequency: 'daily',
    color: '#e66b4b',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-3',
    name: 'Daily Movement & Training',
    category: 'Fitness',
    frequency: 'daily',
    color: '#5f805d',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: false, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
  },
  {
    id: 'h-4',
    name: 'Deep Work (3 Focus Blocks)',
    category: 'Productivity',
    frequency: 'weekdays',
    color: '#8b5cf6',
    history: { [getPastDateStr(3)]: true, [getPastDateStr(2)]: true, [getPastDateStr(1)]: true, [getTodayDateStr()]: true },
    createdAt: getPastDateStr(30),
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

  // Health Profile & Weight
  healthProfile: HealthProfile;
  updateHealthProfile: (updates: Partial<HealthProfile>) => Promise<void>;
  weightCheckins: WeightCheckin[];
  logWeight: (weight: number, date?: string, notes?: string) => Promise<void>;
  deleteWeightCheckin: (id: string) => Promise<void>;

  // Daily Master Meals Plan & Adherence
  masterMeals: MasterMealItem[];
  addMasterMealItem: (item: { name: string; meal_type?: string }) => void;
  deleteMasterMealItem: (id: string) => void;
  updateMasterMealItem: (id: string, updates: Partial<MasterMealItem>) => void;
  eatenMealsByDate: Record<string, string[]>;
  toggleDailyMealEaten: (date: string, mealId: string) => void;

  // Daily Meals (Legacy/Direct)
  meals: DailyMeal[];
  addMeal: (meal: Omit<DailyMeal, 'id'>) => Promise<DailyMeal>;
  toggleMeal: (id: string, date?: string) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  updateMeal: (id: string, updates: Partial<DailyMeal>) => Promise<void>;
  todaysMeals: DailyMeal[];
  todaysMealsEatenCount: number;
  todaysMealsTotalCount: number;

  // Creatine Tracking
  creatineLogs: Record<string, boolean>;
  toggleCreatine: (date?: string, taken?: boolean) => void;
  isCreatineTakenToday: boolean;
  creatineStreak: number;

  // Weekly Workouts & Calendar
  weeklySchedule: WorkoutDayPlan[];
  updateWorkoutDayPlan: (dayOfWeek: number, updates: Partial<WorkoutDayPlan>) => void;
  addExerciseToDay: (dayOfWeek: number, exercise: Omit<WorkoutExerciseItem, 'id'>) => void;
  deleteExerciseFromDay: (dayOfWeek: number, exerciseId: string) => void;
  updateExerciseInDay: (dayOfWeek: number, exerciseId: string, updates: Partial<WorkoutExerciseItem>) => void;
  workoutRecords: Record<string, DailyWorkoutRecord>;
  toggleWorkoutDayCompleted: (date: string, completed?: boolean) => Promise<void>;
  toggleExerciseCompleted: (date: string, exerciseId: string) => Promise<void>;
  completedWorkoutDates: string[];
  workoutStreak: number;
  todaysWorkoutDay: WorkoutDayPlan;
  isTodayWorkoutCompleted: boolean;
  resetWorkoutStreak: () => void;
  resetMealStreak: () => void;

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

  const [healthProfile, setHealthProfile] = useState<HealthProfile>(DEFAULT_HEALTH_PROFILE);
  const [weightCheckins, setWeightCheckins] = useState<WeightCheckin[]>([]);
  const [meals, setMeals] = useState<DailyMeal[]>([]);

  // Fixed master meal list (user's daily diet blueprint)
  const [masterMeals, setMasterMeals] = useState<MasterMealItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifeos_master_meal_plan');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Daily eaten tracking for master meal items: dateStr -> string[] (array of masterMeal IDs)
  const [eatenMealsByDate, setEatenMealsByDate] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifeos_eaten_meals_by_date');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Daily creatine logs: dateStr -> boolean
  const [creatineLogs, setCreatineLogs] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifeos_creatine_logs');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // 7-day Sunday-to-Saturday schedule
  const [weeklySchedule, setWeeklySchedule] = useState<WorkoutDayPlan[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifeos_weekly_workout_schedule');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_WEEKLY_SCHEDULE;
  });

  // Daily workout records: date -> DailyWorkoutRecord
  const [workoutRecords, setWorkoutRecords] = useState<Record<string, DailyWorkoutRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lifeos_workout_records');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Sync master meals
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifeos_master_meal_plan', JSON.stringify(masterMeals));
      } catch {}
    }
  }, [masterMeals]);

  // Sync eaten meals
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifeos_eaten_meals_by_date', JSON.stringify(eatenMealsByDate));
      } catch {}
    }
  }, [eatenMealsByDate]);

  // Sync creatine logs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifeos_creatine_logs', JSON.stringify(creatineLogs));
      } catch {}
    }
  }, [creatineLogs]);

  // Sync workout schedule to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifeos_weekly_workout_schedule', JSON.stringify(weeklySchedule));
      } catch {}
    }
  }, [weeklySchedule]);

  // Sync workout records to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifeos_workout_records', JSON.stringify(workoutRecords));
      } catch {}
    }
  }, [workoutRecords]);

  // Today's Date String
  const todayStr = getTodayDateStr();

  // Today's Meals
  const todaysMeals = useMemo(() => {
    return meals.filter(m => m.date === todayStr);
  }, [meals, todayStr]);

  const todaysMealsEatenCount = useMemo(() => {
    return todaysMeals.filter(m => m.completed).length;
  }, [todaysMeals]);

  const todaysMealsTotalCount = useMemo(() => {
    return todaysMeals.length;
  }, [todaysMeals]);

  // Today's Workout Day from 7-day schedule (0 = Sunday, 6 = Saturday)
  const currentDayOfWeek = useMemo(() => {
    return new Date().getDay();
  }, []);

  const todaysWorkoutDay = useMemo(() => {
    return weeklySchedule.find(w => w.day_of_week === currentDayOfWeek) || weeklySchedule[0] || DEFAULT_WEEKLY_SCHEDULE[0];
  }, [weeklySchedule, currentDayOfWeek]);

  const isTodayWorkoutCompleted = useMemo(() => {
    return !!workoutRecords[todayStr]?.completed;
  }, [workoutRecords, todayStr]);

  // Array of completed workout date strings (for calendar green highlighting)
  const completedWorkoutDates = useMemo(() => {
    return Object.keys(workoutRecords).filter(d => workoutRecords[d]?.completed);
  }, [workoutRecords]);

  // Workout Streak calculation
  const workoutStreak = useMemo(() => {
    let streak = 0;
    const checkDate = new Date();

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (workoutRecords[dateStr]?.completed) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const y2 = checkDate.getFullYear();
          const m2 = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d2 = String(checkDate.getDate()).padStart(2, '0');
          if (workoutRecords[`${y2}-${m2}-${d2}`]?.completed) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  }, [workoutRecords]);

  // 3-Pillar LifeScore: Tasks 35%, Habits 35%, Health 30%
  const lifeScore: LifeScoreBreakdown = useMemo(() => {
    // 1. Tasks Score (35%)
    const todayTasks = tasks.filter(t => !t.dueDate || t.dueDate === todayStr || t.completedAt === todayStr);
    const totalTodayTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const tasksScore = totalTodayTasks > 0 ? Math.round((completedTasks / totalTodayTasks) * 100) : 85;

    // 2. Habits Score (35%)
    const activeHabits = habits.filter(h => h.frequency === 'daily' || h.frequency === 'weekdays');
    const totalHabits = activeHabits.length;
    const completedHabits = activeHabits.filter(h => !!h.history[todayStr]).length;
    const habitsScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 80;

    // 3. Health Consistency Score (30%)
    // Meal adherence: ratio of eaten meals
    const mealScore = todaysMealsTotalCount > 0 ? Math.round((todaysMealsEatenCount / todaysMealsTotalCount) * 100) : 90;
    // Workout adherence
    const workoutScore = isTodayWorkoutCompleted ? 100 : (todaysWorkoutDay.is_rest_day ? 100 : 60);

    const healthScore = Math.round((mealScore * 0.5) + (workoutScore * 0.5));

    const overall = Math.round(
      (tasksScore * 0.35) +
      (habitsScore * 0.35) +
      (healthScore * 0.30)
    );

    return {
      overall,
      tasksScore,
      habitsScore,
      healthScore,
      summary: overall >= 80 ? 'Exceptional momentum across all personal pillars.' : 'Consistent execution in progress.',
      changeVsLastWeek: +2.5,
    };
  }, [tasks, habits, todayStr, todaysMealsTotalCount, todaysMealsEatenCount, isTodayWorkoutCompleted, todaysWorkoutDay]);

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
              color: '#5f805d',
              history: hist,
              createdAt: h.created_at || getTodayDateStr(),
            };
          }));
        }
        if (res.health_profile) {
          setHealthProfile(res.health_profile);
        }
        if (res.weight_checkins && res.weight_checkins.length > 0) {
          setWeightCheckins(res.weight_checkins);
        }
        if (res.daily_meals_today && res.daily_meals_today.length > 0) {
          setMeals(prev => {
            const others = prev.filter(m => m.date !== todayStr);
            return [...res.daily_meals_today, ...others];
          });
        }
        if (res.daily_workout_logs && res.daily_workout_logs.length > 0) {
          const recs: Record<string, DailyWorkoutRecord> = {};
          res.daily_workout_logs.forEach((wl: any) => {
            if (wl.date) {
              recs[wl.date] = {
                id: wl.id,
                date: wl.date,
                completed: !!wl.completed,
                notes: wl.notes,
              };
            }
          });
          setWorkoutRecords(prev => ({ ...prev, ...recs }));
        }
      }
    } catch (err) {
      console.warn('Bootstrap fetch fallback:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, todayStr]);

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
          completed: taskData.completed,
        });
      } catch (err) {
        console.error('Failed to create task on backend:', err);
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
    const completed = !task.completed;
    const completedAt = completed ? getTodayDateStr() : undefined;
    await updateTask(id, { completed, completedAt });
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
        await api.habits.create({
          name: habitData.name,
          frequency: habitData.frequency,
          active: true,
        });
      } catch (err) {
        console.error('Failed to create habit on backend:', err);
      }
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
    if (getAccessToken()) {
      try {
        await api.habits.update(id, {
          name: updates.name,
          frequency: updates.frequency,
        });
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

  // Health Profile & Weight
  const updateHealthProfile = async (updates: Partial<HealthProfile>) => {
    const updated = { ...healthProfile, ...updates };
    setHealthProfile(updated);
    if (getAccessToken() && healthProfile.id) {
      try {
        await api.health.updateProfile(healthProfile.id, updates);
      } catch (err) {
        console.error('Failed to update health profile:', err);
      }
    }
  };

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

  // Master Meal Plan Actions (Fixed Daily Blueprint)
  const addMasterMealItem = (item: { name: string; meal_type?: string }) => {
    const newItem: MasterMealItem = {
      id: 'm-' + Date.now(),
      name: item.name,
      meal_type: item.meal_type || 'Meal',
      created_at: new Date().toISOString(),
    };
    setMasterMeals(prev => [...prev, newItem]);
  };

  const deleteMasterMealItem = (id: string) => {
    setMasterMeals(prev => prev.filter(m => m.id !== id));
  };

  const updateMasterMealItem = (id: string, updates: Partial<MasterMealItem>) => {
    setMasterMeals(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const toggleDailyMealEaten = (date: string, mealId: string) => {
    setEatenMealsByDate(prev => {
      const currentList = prev[date] || [];
      const isEaten = currentList.includes(mealId);
      const updatedList = isEaten
        ? currentList.filter(id => id !== mealId)
        : [...currentList, mealId];
      return {
        ...prev,
        [date]: updatedList,
      };
    });
  };

  // Creatine Actions
  const toggleCreatine = (date = getTodayDateStr(), taken?: boolean) => {
    setCreatineLogs(prev => {
      const current = !!prev[date];
      const next = taken !== undefined ? taken : !current;
      return {
        ...prev,
        [date]: next,
      };
    });
  };

  const isCreatineTakenToday = useMemo(() => {
    return !!creatineLogs[todayStr];
  }, [creatineLogs, todayStr]);

  const creatineStreak = useMemo(() => {
    let streak = 0;
    const checkDate = new Date();

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (creatineLogs[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const y2 = checkDate.getFullYear();
          const m2 = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d2 = String(checkDate.getDate()).padStart(2, '0');
          if (creatineLogs[`${y2}-${m2}-${d2}`]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  }, [creatineLogs]);

  // Daily Meals Actions (Legacy/Direct)
  const addMeal = async (mealData: Omit<DailyMeal, 'id'>): Promise<DailyMeal> => {
    const newMeal: DailyMeal = {
      ...mealData,
      id: 'meal-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setMeals(prev => [newMeal, ...prev]);

    if (getAccessToken()) {
      try {
        const saved = await api.health.meals.create(mealData);
        if (saved && saved.id) {
          setMeals(prev => prev.map(m => m.id === newMeal.id ? { ...m, id: String(saved.id) } : m));
        }
      } catch (err) {
        console.error('Failed to save meal:', err);
      }
    }
    return newMeal;
  };

  const toggleMeal = async (id: string, date = getTodayDateStr()) => {
    const meal = meals.find(m => m.id === id);
    if (!meal) return;
    const nextCompleted = !meal.completed;

    setMeals(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: nextCompleted } : m))
    );

    if (getAccessToken()) {
      try {
        await api.health.meals.update(id, { completed: nextCompleted });
      } catch (err) {
        console.error('Failed to toggle meal:', err);
      }
    }
  };

  const deleteMeal = async (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    if (getAccessToken()) {
      try {
        await api.health.meals.delete(id);
      } catch (err) {
        console.error('Failed to delete meal:', err);
      }
    }
  };

  const updateMeal = async (id: string, updates: Partial<DailyMeal>) => {
    setMeals(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    if (getAccessToken()) {
      try {
        await api.health.meals.update(id, updates);
      } catch (err) {
        console.error('Failed to update meal:', err);
      }
    }
  };

  // Weekly Workout Schedule Actions (Sunday to Saturday)
  const updateWorkoutDayPlan = (dayOfWeek: number, updates: Partial<WorkoutDayPlan>) => {
    setWeeklySchedule(prev =>
      prev.map(d => (d.day_of_week === dayOfWeek ? { ...d, ...updates } : d))
    );
  };

  const addExerciseToDay = (dayOfWeek: number, exercise: Omit<WorkoutExerciseItem, 'id'>) => {
    const newEx: WorkoutExerciseItem = {
      ...exercise,
      id: 'ex-' + Date.now(),
    };
    setWeeklySchedule(prev =>
      prev.map(d => {
        if (d.day_of_week === dayOfWeek) {
          return { ...d, exercises: [...d.exercises, newEx] };
        }
        return d;
      })
    );
  };

  const deleteExerciseFromDay = (dayOfWeek: number, exerciseId: string) => {
    setWeeklySchedule(prev =>
      prev.map(d => {
        if (d.day_of_week === dayOfWeek) {
          return { ...d, exercises: d.exercises.filter(ex => ex.id !== exerciseId) };
        }
        return d;
      })
    );
  };

  const updateExerciseInDay = (
    dayOfWeek: number,
    exerciseId: string,
    updates: Partial<WorkoutExerciseItem>
  ) => {
    setWeeklySchedule(prev =>
      prev.map(d => {
        if (d.day_of_week === dayOfWeek) {
          return {
            ...d,
            exercises: d.exercises.map(ex => (ex.id === exerciseId ? { ...ex, ...updates } : ex)),
          };
        }
        return d;
      })
    );
  };

  // Workout Log & Completion Actions (Calendar & Streaks)
  const toggleWorkoutDayCompleted = async (date = getTodayDateStr(), completed?: boolean) => {
    const current = !!workoutRecords[date]?.completed;
    const nextCompleted = completed !== undefined ? completed : !current;

    setWorkoutRecords(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        date,
        completed: nextCompleted,
      },
    }));

    if (getAccessToken()) {
      try {
        await api.health.dailyWorkoutLogs.create({ date, completed: nextCompleted });
      } catch (err) {
        console.error('Failed to toggle workout day log:', err);
      }
    }
  };

  const toggleExerciseCompleted = async (date = getTodayDateStr(), exerciseId: string) => {
    const currentRec = workoutRecords[date] || { date, completed: false, completed_exercises: [] };
    const completedList = currentRec.completed_exercises || [];
    const isCompleted = completedList.includes(exerciseId);
    const updatedList = isCompleted
      ? completedList.filter(id => id !== exerciseId)
      : [...completedList, exerciseId];

    // Find scheduled exercises for this day of week
    const targetDow = new Date(date + 'T00:00:00').getDay();
    const dayPlan = weeklySchedule.find(w => w.day_of_week === targetDow);
    const totalExercises = dayPlan?.exercises?.length || 0;
    const shouldMarkDayComplete = totalExercises > 0 && updatedList.length >= totalExercises;

    setWorkoutRecords(prev => ({
      ...prev,
      [date]: {
        ...currentRec,
        completed: shouldMarkDayComplete || currentRec.completed,
        completed_exercises: updatedList,
      },
    }));
  };

  const resetAllData = () => {
    setTasks([]);
    setHabits([]);
    setMeals([]);
    setMasterMeals([]);
    setEatenMealsByDate({});
    setCreatineLogs({});
    setWeightCheckins([]);
    setWorkoutRecords({});
  };

  const resetWorkoutStreak = () => {
    setWorkoutRecords({});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lifeos_workout_records');
      } catch {}
    }
  };

  const resetMealStreak = () => {
    setEatenMealsByDate({});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lifeos_eaten_meals_by_date');
      } catch {}
    }
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

        healthProfile,
        updateHealthProfile,
        weightCheckins,
        logWeight,
        deleteWeightCheckin,

        masterMeals,
        addMasterMealItem,
        deleteMasterMealItem,
        updateMasterMealItem,
        eatenMealsByDate,
        toggleDailyMealEaten,

        meals,
        addMeal,
        toggleMeal,
        deleteMeal,
        updateMeal,
        todaysMeals,
        todaysMealsEatenCount,
        todaysMealsTotalCount,

        creatineLogs,
        toggleCreatine,
        isCreatineTakenToday,
        creatineStreak,

        weeklySchedule,
        updateWorkoutDayPlan,
        addExerciseToDay,
        deleteExerciseFromDay,
        updateExerciseInDay,
        workoutRecords,
        toggleWorkoutDayCompleted,
        toggleExerciseCompleted,
        completedWorkoutDates,
        workoutStreak,
        todaysWorkoutDay,
        isTodayWorkoutCompleted,
        resetWorkoutStreak,
        resetMealStreak,

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
