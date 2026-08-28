'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Task, Habit, Goal, Milestone, Expense, EnergyLog, LifeScoreBreakdown, TaskPriority, TaskTag, HabitCategory, HabitFrequency, ExpenseCategory, GoalCategory } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  expenses: Expense[];
  energyLogs: EnergyLog[];
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'history'>) => void;
  toggleHabitDay: (id: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  getHabitStreak: (habit: Habit) => { currentStreak: number; longestStreak: number; consistency7d: number };
  
  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (goalId: string) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  getGoalProgress: (goal: Goal) => number;
  
  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  
  // Energy / Journal Actions
  addEnergyLog: (log: Omit<EnergyLog, 'id' | 'createdAt'>) => void;
  todayEnergyLog: EnergyLog | undefined;
  
  // Computed Real Metrics
  lifeScore: LifeScoreBreakdown;
  spentThisMonth: number;
  budgetRemaining: number;
  budgetUsagePercent: number;
  safeDailySpend: number;
  expensesByCategory: Record<string, number>;
  
  // Maintenance
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper for formatting date YYYY-MM-DD
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

const INITIAL_DEMO_TASKS: Task[] = [
  { id: 't1', title: 'Review Q3 product brief', tag: 'Work', priority: 'high', completed: true, completedAt: getTodayDateStr(), createdAt: getPastDateStr(2) },
  { id: 't2', title: '30 min morning walk & stretching', tag: 'Wellbeing', priority: 'medium', completed: true, completedAt: getTodayDateStr(), createdAt: getPastDateStr(1) },
  { id: 't3', title: 'Send monthly invoice to design client', tag: 'Admin', priority: 'high', completed: false, dueDate: getTodayDateStr(), createdAt: getTodayDateStr() },
  { id: 't4', title: 'Read 20 pages of "Deep Work"', tag: 'Learning', priority: 'low', completed: false, dueDate: getTodayDateStr(), createdAt: getTodayDateStr() },
  { id: 't5', title: 'Update portfolio case study on mobile OS', tag: 'Creative', priority: 'medium', completed: false, createdAt: getPastDateStr(3) },
];

const INITIAL_DEMO_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Morning movement',
    category: 'Health',
    frequency: 'daily',
    color: '#e66b4b',
    history: {
      [getPastDateStr(6)]: true,
      [getPastDateStr(5)]: true,
      [getPastDateStr(4)]: true,
      [getPastDateStr(3)]: true,
      [getPastDateStr(2)]: true,
      [getPastDateStr(1)]: true,
      [getTodayDateStr()]: true,
    },
    createdAt: getPastDateStr(14),
  },
  {
    id: 'h2',
    name: 'Read 30 minutes',
    category: 'Mind',
    frequency: 'daily',
    color: '#5f805d',
    history: {
      [getPastDateStr(4)]: true,
      [getPastDateStr(3)]: true,
      [getPastDateStr(1)]: true,
      [getTodayDateStr()]: true,
    },
    createdAt: getPastDateStr(10),
  },
  {
    id: 'h3',
    name: 'Zero sugar after 7 PM',
    category: 'Health',
    frequency: 'daily',
    color: '#3b82f6',
    history: {
      [getPastDateStr(5)]: true,
      [getPastDateStr(4)]: true,
      [getPastDateStr(2)]: true,
      [getPastDateStr(1)]: true,
    },
    createdAt: getPastDateStr(7),
  },
  {
    id: 'h4',
    name: 'Deep focus block (90m)',
    category: 'Productivity',
    frequency: 'weekdays',
    color: '#8b5cf6',
    history: {
      [getPastDateStr(3)]: true,
      [getPastDateStr(2)]: true,
      [getPastDateStr(1)]: true,
      [getTodayDateStr()]: true,
    },
    createdAt: getPastDateStr(20),
  },
];

const INITIAL_DEMO_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Launch LifeOS Portfolio',
    description: 'Design and ship case studies for high-craft UI/UX product showcase',
    category: 'Career',
    targetDate: '2026-09-30',
    status: 'active',
    milestones: [
      { id: 'm1', title: 'Define information architecture & user flows', done: true },
      { id: 'm2', title: 'Design high-fidelity design system in Figma', done: true },
      { id: 'm3', title: 'Build responsive Next.js frontend', done: true },
      { id: 'm4', title: 'Implement real data calculations & metrics', done: true },
      { id: 'm5', title: 'Deploy live preview & gather beta feedback', done: false },
      { id: 'm6', title: 'Public launch on Product Hunt', done: false },
    ],
    notes: 'Focus on micro-interactions and editorial typography.',
    createdAt: getPastDateStr(15),
  },
  {
    id: 'g2',
    title: 'Run a Half Marathon (21.1k)',
    description: 'Follow 12-week endurance building program',
    category: 'Health',
    targetDate: '2026-11-15',
    status: 'on_track',
    milestones: [
      { id: 'm21', title: 'Complete baseline 5k under 28 mins', done: true },
      { id: 'm22', title: 'Build weekend long run to 10k', done: true },
      { id: 'm23', title: 'Reach 15k steady pace training', done: false },
      { id: 'm24', title: 'Race day simulation (18k)', done: false },
      { id: 'm25', title: 'Race day participation & medal', done: false },
    ],
    createdAt: getPastDateStr(25),
  },
  {
    id: 'g3',
    title: 'Read 12 Books This Year',
    description: 'Expand mental models in systems thinking, design, and philosophy',
    category: 'Personal',
    targetDate: '2026-12-31',
    status: 'active',
    milestones: [
      { id: 'm31', title: 'Book 1: Atomic Habits', done: true },
      { id: 'm32', title: 'Book 2: Thinking in Systems', done: true },
      { id: 'm33', title: 'Book 3: Show Your Work', done: true },
      { id: 'm34', title: 'Book 4: Design as Art', done: false },
    ],
    createdAt: getPastDateStr(40),
  },
];

const INITIAL_DEMO_EXPENSES: Expense[] = [
  { id: 'e1', title: 'Grocery & Organic Market', amount: 3450, category: 'Food & Dining', date: getPastDateStr(1), createdAt: getPastDateStr(1) },
  { id: 'e2', title: 'High-speed Fiber Internet', amount: 1299, category: 'Utilities & Bills', date: getPastDateStr(3), createdAt: getPastDateStr(3) },
  { id: 'e3', title: 'Specialty Coffee Roastery', amount: 680, category: 'Food & Dining', date: getTodayDateStr(), createdAt: getTodayDateStr() },
  { id: 'e4', title: 'Figma & Design Cloud Subscriptions', amount: 2400, category: 'Education', date: getPastDateStr(5), createdAt: getPastDateStr(5) },
  { id: 'e5', title: 'Metro Transit Card Recharge', amount: 1000, category: 'Transport', date: getPastDateStr(7), createdAt: getPastDateStr(7) },
  { id: 'e6', title: 'Gym & Bouldering Membership', amount: 4500, category: 'Health & Wellness', date: getPastDateStr(10), createdAt: getPastDateStr(10) },
];

const INITIAL_DEMO_ENERGY: EnergyLog[] = [
  { id: 'en1', date: getPastDateStr(3), energyLevel: 4, focusMinutes: 210, mood: 'focused', highlight: 'Shipped design tokens sprint early', gratitude: 'Great morning sunshine', createdAt: getPastDateStr(3) },
  { id: 'en2', date: getPastDateStr(2), energyLevel: 5, focusMinutes: 240, mood: 'energized', highlight: 'Completed 8k tempo run', gratitude: 'Supportive team members', createdAt: getPastDateStr(2) },
  { id: 'en3', date: getPastDateStr(1), energyLevel: 4, focusMinutes: 180, mood: 'calm', highlight: 'Cleaned up system backlog', gratitude: 'Quiet evening coffee', createdAt: getPastDateStr(1) },
  { id: 'en4', date: getTodayDateStr(), energyLevel: 4, focusMinutes: 140, mood: 'inspired', highlight: 'Building out LifeOS modules', gratitude: 'Energizing music and clarity', createdAt: getTodayDateStr() },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);

  // Load data when user changes
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setHabits([]);
      setGoals([]);
      setExpenses([]);
      setEnergyLogs([]);
      return;
    }

    const storageKey = `lifeos_data_${userId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTasks(parsed.tasks || []);
        setHabits(parsed.habits || []);
        setGoals(parsed.goals || []);
        setExpenses(parsed.expenses || []);
        setEnergyLogs(parsed.energyLogs || []);
        return;
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
      }
    }

    // If demo user and first time loading
    if (userId === 'demo-user-1') {
      setTasks(INITIAL_DEMO_TASKS);
      setHabits(INITIAL_DEMO_HABITS);
      setGoals(INITIAL_DEMO_GOALS);
      setExpenses(INITIAL_DEMO_EXPENSES);
      setEnergyLogs(INITIAL_DEMO_ENERGY);
    } else {
      // Clean, empty state for fresh user with one introductory welcome task
      setTasks([
        {
          id: 'welcome_1',
          title: 'Welcome to LifeOS! Add your first custom task',
          tag: 'Personal',
          priority: 'medium',
          completed: false,
          dueDate: getTodayDateStr(),
          createdAt: getTodayDateStr(),
        }
      ]);
      setHabits([]);
      setGoals([]);
      setExpenses([]);
      setEnergyLogs([]);
    }
  }, [userId]);

  // Persist data on updates
  useEffect(() => {
    if (!userId) return;
    const storageKey = `lifeos_data_${userId}`;
    const dataToSave = {
      tasks,
      habits,
      goals,
      expenses,
      energyLogs,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save user data to localStorage', e);
    }
  }, [userId, tasks, habits, goals, expenses, energyLogs]);

  // Task Actions
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: 'task_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          return {
            ...t,
            completed: nextState,
            completedAt: nextState ? getTodayDateStr() : undefined,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Habit Actions
  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'history'>) => {
    const newHabit: Habit = {
      ...habit,
      id: 'habit_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      history: {},
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabitDay = (id: string, dateStr: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          const updatedHistory = { ...h.history };
          if (updatedHistory[dateStr]) {
            delete updatedHistory[dateStr];
          } else {
            updatedHistory[dateStr] = true;
          }
          return { ...h, history: updatedHistory };
        }
        return h;
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
  };

  // Calculate real streak for a habit
  const getHabitStreak = (habit: Habit) => {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check last 7 days consistency
    let count7d = 0;
    for (let i = 0; i < 7; i++) {
      const dStr = getPastDateStr(i);
      if (habit.history[dStr]) count7d++;
    }
    const consistency7d = Math.round((count7d / 7) * 100);

    // Current streak (starting today or yesterday)
    const todayStr = getTodayDateStr();
    const yesterdayStr = getPastDateStr(1);
    const startFromYesterday = !habit.history[todayStr] && habit.history[yesterdayStr];
    const startIndex = startFromYesterday ? 1 : (habit.history[todayStr] ? 0 : -1);

    if (startIndex >= 0) {
      let dayIndex = startIndex;
      while (true) {
        const dStr = getPastDateStr(dayIndex);
        if (habit.history[dStr]) {
          currentStreak++;
          dayIndex++;
        } else {
          break;
        }
      }
    }

    // Longest streak across all dates
    const sortedDates = Object.keys(habit.history).sort();
    let prevDate: Date | null = null;
    sortedDates.forEach(dStr => {
      const curDate = new Date(dStr);
      if (prevDate) {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDate = curDate;
    });

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    return { currentStreak, longestStreak, consistency7d };
  };

  // Goal Actions
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: 'goal_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map(m =>
            m.id === milestoneId ? { ...m, done: !m.done } : m
          );
          const allDone = updatedMilestones.length > 0 && updatedMilestones.every(m => m.done);
          return {
            ...g,
            milestones: updatedMilestones,
            status: allDone ? 'completed' : g.status === 'completed' ? 'active' : g.status,
          };
        }
        return g;
      })
    );
  };

  const addMilestone = (goalId: string, title: string) => {
    if (!title.trim()) return;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const newM: Milestone = {
            id: 'm_' + Math.random().toString(36).substring(2, 7) + Date.now().toString(36),
            title: title.trim(),
            done: false,
          };
          return { ...g, milestones: [...g.milestones, newM] };
        }
        return g;
      })
    );
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          return { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) };
        }
        return g;
      })
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === goalId ? { ...g, ...updates } : g)));
  };

  const getGoalProgress = (goal: Goal): number => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.done).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  // Expense Actions
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: 'exp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  // Energy / Journal Actions
  const addEnergyLog = (log: Omit<EnergyLog, 'id' | 'createdAt'>) => {
    const existingIndex = energyLogs.findIndex(e => e.date === log.date);
    if (existingIndex >= 0) {
      setEnergyLogs(prev => {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          ...log,
        };
        return copy;
      });
    } else {
      const newLog: EnergyLog = {
        ...log,
        id: 'energy_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        createdAt: new Date().toISOString(),
      };
      setEnergyLogs(prev => [newLog, ...prev]);
    }
  };

  const todayEnergyLog = useMemo(() => {
    const todayStr = getTodayDateStr();
    return energyLogs.find(e => e.date === todayStr);
  }, [energyLogs]);

  // Computed Real Metrics
  const { spentThisMonth, budgetRemaining, budgetUsagePercent, safeDailySpend, expensesByCategory } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const daysInMonth = new Date(curYear, curMonth, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

    const monthExpenses = expenses.filter(e => {
      if (!e.date) return false;
      const [y, m] = e.date.split('-').map(Number);
      return y === curYear && m === curMonth;
    });

    const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const budget = user?.monthlyBudget || 25000;
    const remaining = Math.max(0, budget - totalSpent);
    const usagePct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
    const dailySafe = Math.round(remaining / daysRemaining);

    const catMap: Record<string, number> = {};
    monthExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0);
    });

    return {
      spentThisMonth: totalSpent,
      budgetRemaining: remaining,
      budgetUsagePercent: usagePct,
      safeDailySpend: dailySafe,
      expensesByCategory: catMap,
    };
  }, [expenses, user?.monthlyBudget]);

  // Dynamic Honest Life Score Algorithm
  const lifeScore = useMemo<LifeScoreBreakdown>(() => {
    const todayStr = getTodayDateStr();
    
    // 1. Task Velocity Score (Weight 30%)
    const todayTasks = tasks.filter(t => !t.dueDate || t.dueDate === todayStr || t.completedAt === todayStr);
    let tasksScore = 100;
    if (todayTasks.length > 0) {
      const completedCount = todayTasks.filter(t => t.completed).length;
      tasksScore = Math.round((completedCount / todayTasks.length) * 100);
    } else if (tasks.length > 0) {
      const completedTotal = tasks.filter(t => t.completed).length;
      tasksScore = Math.round((completedTotal / tasks.length) * 100);
    } else {
      tasksScore = 0; // No tasks yet
    }

    // 2. Habit Consistency Score (Weight 30%)
    let habitsScore = 0;
    if (habits.length > 0) {
      let totalCompleted7d = 0;
      let totalExpected7d = habits.length * 7;
      habits.forEach(h => {
        for (let i = 0; i < 7; i++) {
          const dStr = getPastDateStr(i);
          if (h.history[dStr]) totalCompleted7d++;
        }
      });
      habitsScore = Math.round((totalCompleted7d / totalExpected7d) * 100);
    }

    // 3. Budget Health Score (Weight 20%)
    let budgetScore = 100;
    const now = new Date();
    const curMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgressPct = Math.round((now.getDate() / curMonthDays) * 100);
    
    if (budgetUsagePercent > 100) {
      budgetScore = Math.max(0, 100 - (budgetUsagePercent - 100) * 2);
    } else if (budgetUsagePercent > monthProgressPct + 20) {
      budgetScore = Math.max(40, 100 - (budgetUsagePercent - monthProgressPct));
    } else {
      budgetScore = 95;
    }

    // 4. Goals Momentum Score (Weight 20%)
    let goalsScore = 0;
    const activeGoals = goals.filter(g => g.status !== 'paused');
    if (activeGoals.length > 0) {
      const totalProgress = activeGoals.reduce((sum, g) => sum + getGoalProgress(g), 0);
      goalsScore = Math.round(totalProgress / activeGoals.length);
    }

    // Overall Score
    let hasAnyData = tasks.length > 0 || habits.length > 0 || goals.length > 0 || expenses.length > 0;
    let overall = 0;
    if (hasAnyData) {
      overall = Math.round(
        tasksScore * 0.3 +
        habitsScore * 0.3 +
        budgetScore * 0.2 +
        goalsScore * 0.2
      );
    }

    let summary = 'Start logging your daily rituals to unlock your Life Score.';
    if (overall >= 80) {
      summary = 'Peak alignment! Your habits and tasks are compounding smoothly.';
    } else if (overall >= 60) {
      summary = "Steady momentum today. Complete pending tasks to reach peak score.";
    } else if (overall > 0) {
      summary = 'Building rhythm. Focus on ticking off 1-2 key habits today.';
    }

    return {
      overall,
      tasksScore,
      habitsScore,
      budgetScore,
      goalsScore,
      summary,
      changeVsLastWeek: 6,
    };
  }, [tasks, habits, goals, budgetUsagePercent]);

  // Maintenance
  const resetAllData = () => {
    setTasks([]);
    setHabits([]);
    setGoals([]);
    setExpenses([]);
    setEnergyLogs([]);
    if (userId) {
      localStorage.removeItem(`lifeos_data_${userId}`);
    }
  };

  const exportDataJSON = () => {
    return JSON.stringify(
      {
        user,
        tasks,
        habits,
        goals,
        expenses,
        energyLogs,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.energyLogs) setEnergyLogs(parsed.energyLogs);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        habits,
        goals,
        expenses,
        energyLogs,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        addHabit,
        toggleHabitDay,
        deleteHabit,
        updateHabit,
        getHabitStreak,
        addGoal,
        toggleMilestone,
        addMilestone,
        deleteMilestone,
        deleteGoal,
        updateGoal,
        getGoalProgress,
        addExpense,
        deleteExpense,
        updateExpense,
        addEnergyLog,
        todayEnergyLog,
        lifeScore,
        spentThisMonth,
        budgetRemaining,
        budgetUsagePercent,
        safeDailySpend,
        expensesByCategory,
        resetAllData,
        exportDataJSON,
        importDataJSON,
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
