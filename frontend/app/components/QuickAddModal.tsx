'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ListTodo,
  Flame,
  Utensils,
  Scale,
  Dumbbell,
  Plus,
  Check,
} from 'lucide-react';
import { useData, getTodayDateStr } from '../context/DataContext';
import { TaskPriority, TaskTag, HabitCategory, HabitFrequency } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'habit' | 'food' | 'meal' | 'weight' | 'workout';
}

export function QuickAddModal({ isOpen, onClose, defaultTab = 'task' }: QuickAddModalProps) {
  const {
    addTask,
    addHabit,
    addMeal,
    logWeight,
    todaysWorkoutDay,
    toggleWorkoutDayCompleted,
    isTodayWorkoutCompleted,
  } = useData();

  const initialTab = defaultTab === 'food' ? 'meal' : (defaultTab as 'task' | 'habit' | 'meal' | 'weight' | 'workout');
  const [tab, setTab] = useState<'task' | 'habit' | 'meal' | 'weight' | 'workout'>(initialTab);

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTag, setTaskTag] = useState<TaskTag>('Work');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateStr());

  // Habit form
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('Health');
  const [habitFreq, setHabitFreq] = useState<HabitFrequency>('daily');

  // Meal form
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('Meal');
  const [mealDate, setMealDate] = useState(getTodayDateStr());

  // Weight form
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(getTodayDateStr());
  const [weightNotes, setWeightNotes] = useState('');

  if (!isOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      tag: taskTag,
      priority: taskPriority,
      dueDate: taskDueDate,
    });
    setTaskTitle('');
    onClose();
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    addHabit({
      name: habitName.trim(),
      category: habitCategory,
      frequency: habitFreq,
    });
    setHabitName('');
    onClose();
  };

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    addMeal({
      name: mealName.trim(),
      date: mealDate,
      meal_type: mealType,
      completed: false,
    });
    setMealName('');
    onClose();
  };

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    logWeight(w, weightDate, weightNotes);
    setWeight('');
    onClose();
  };

  const handleToggleWorkout = () => {
    toggleWorkoutDayCompleted(getTodayDateStr());
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#f8f7f4] rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden z-10"
        >
          <div className="p-6 border-b border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <h3 className="font-semibold text-base">Quick Create</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[var(--line)] bg-[#f1f0ea] p-1 gap-1">
            {[
              { id: 'task', label: 'Task', icon: ListTodo },
              { id: 'habit', label: 'Habit', icon: Flame },
              { id: 'meal', label: 'Meal', icon: Utensils },
              { id: 'workout', label: 'Workout', icon: Dumbbell },
              { id: 'weight', label: 'Weight', icon: Scale },
            ].map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-[var(--ink)] shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[var(--accent)]' : ''} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* TASK FORM */}
            {tab === 'task' && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    placeholder="What needs to be executed?"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Tag
                    </label>
                    <select
                      value={taskTag}
                      onChange={e => setTaskTag(e.target.value as TaskTag)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    >
                      {['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Wellbeing'].map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Task</span>
                </button>
              </form>
            )}

            {/* HABIT FORM */}
            {tab === 'habit' && (
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={e => setHabitName(e.target.value)}
                    placeholder="e.g., 20 mins morning sunlight"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={habitCategory}
                      onChange={e => setHabitCategory(e.target.value as HabitCategory)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    >
                      {['Health', 'Mind', 'Productivity', 'Fitness', 'Learning', 'Lifestyle'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Frequency
                    </label>
                    <select
                      value={habitFreq}
                      onChange={e => setHabitFreq(e.target.value as HabitFrequency)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays (Mon-Fri)</option>
                      <option value="weekends">Weekends (Sat-Sun)</option>
                      <option value="3x_week">3x per Week</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--sage)] hover:bg-[#688562] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Track Habit</span>
                </button>
              </form>
            )}

            {/* MEAL FORM */}
            {tab === 'meal' && (
              <form onSubmit={handleCreateMeal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    What are you eating?
                  </label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={e => setMealName(e.target.value)}
                    placeholder="e.g., Oatmeal with blueberries, Grilled chicken bowl"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Meal Type
                    </label>
                    <select
                      value={mealType}
                      onChange={e => setMealType(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold"
                    >
                      {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Meal'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={mealDate}
                      onChange={e => setMealDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#e66b4b] hover:bg-[#d05c3d] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Meal to Log</span>
                </button>
              </form>
            )}

            {/* WORKOUT FORM */}
            {tab === 'workout' && (
              <div className="space-y-5 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] text-[var(--ink)] flex items-center justify-center mx-auto">
                  <Dumbbell size={22} />
                </div>
                <div>
                  <h4 className="serif text-xl font-normal text-[var(--ink)]">
                    {todaysWorkoutDay?.day_name || 'Today\'s Training Session'}
                  </h4>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {todaysWorkoutDay?.is_rest_day ? 'Rest & Recovery Day' : `${todaysWorkoutDay?.exercises?.length || 0} planned exercises for today`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleWorkout}
                  className={`w-full py-3.5 rounded-xl text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isTodayWorkoutCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[var(--ink)] hover:bg-black'
                  }`}
                >
                  <Check size={16} />
                  <span>{isTodayWorkoutCompleted ? 'Workout Marked Completed ✓' : 'Mark Today\'s Workout Completed'}</span>
                </button>
              </div>
            )}

            {/* WEIGHT FORM */}
            {tab === 'weight' && (
              <form onSubmit={handleLogWeight} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    placeholder="e.g., 72.5"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm font-bold"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={weightDate}
                      onChange={e => setWeightDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Morning weigh-in"
                      value={weightNotes}
                      onChange={e => setWeightNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Save Check-in</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
