'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ListTodo,
  Flame,
  Target,
  Apple,
  Scale,
  Droplets,
  Dumbbell,
  Plus,
} from 'lucide-react';
import { useData, getTodayDateStr } from '../context/DataContext';
import { TaskPriority, TaskTag, HabitCategory, HabitFrequency, GoalCategory } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'habit' | 'goal' | 'food' | 'weight' | 'water' | 'workout';
}

export function QuickAddModal({ isOpen, onClose, defaultTab = 'task' }: QuickAddModalProps) {
  const {
    addTask,
    addHabit,
    addGoal,
    foods,
    logFood,
    logWeight,
    logWater,
    workoutPlan,
    todayWorkoutDay,
    toggleWorkoutExercise,
  } = useData();

  const [tab, setTab] = useState<'task' | 'habit' | 'goal' | 'food' | 'weight' | 'water' | 'workout'>(defaultTab);

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTag, setTaskTag] = useState<TaskTag>('Work');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateStr());

  // Habit form
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('Health');
  const [habitFreq, setHabitFreq] = useState<HabitFrequency>('daily');

  // Goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('Career');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalMilestone1, setGoalMilestone1] = useState('');

  // Food form
  const [selectedFoodId, setSelectedFoodId] = useState<string>(foods[0]?.id || '');
  const [servings, setServings] = useState('1');

  // Weight form
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(getTodayDateStr());
  const [weightNotes, setWeightNotes] = useState('');

  // Water form
  const [waterAmount, setWaterAmount] = useState('250');

  // Workout form
  const [selectedWorkoutExerciseId, setSelectedWorkoutExerciseId] = useState<string>(
    todayWorkoutDay?.exercises?.[0]?.id || ''
  );

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

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const milestones = goalMilestone1.trim()
      ? [{ id: 'm_' + Date.now(), title: goalMilestone1.trim(), done: false }]
      : [];
    addGoal({
      title: goalTitle.trim(),
      category: goalCategory,
      targetDate: goalTargetDate || undefined,
      status: 'active',
      milestones,
    });
    setGoalTitle('');
    setGoalMilestone1('');
    onClose();
  };

  const handleLogFood = (e: React.FormEvent) => {
    e.preventDefault();
    const foodId = selectedFoodId || foods[0]?.id;
    if (!foodId) return;
    const s = parseFloat(servings) || 1.0;
    logFood(foodId, s, getTodayDateStr());
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

  const handleLogWater = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(waterAmount) || 250;
    logWater(ml);
    onClose();
  };

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const weId = selectedWorkoutExerciseId || todayWorkoutDay?.exercises?.[0]?.id;
    if (!weId) return;
    toggleWorkoutExercise(weId, true);
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
              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto">
            {[
              { id: 'task', label: 'Task', icon: ListTodo },
              { id: 'habit', label: 'Habit', icon: Flame },
              { id: 'goal', label: 'Goal', icon: Target },
              { id: 'food', label: 'Food', icon: Apple },
              { id: 'weight', label: 'Weight', icon: Scale },
              { id: 'water', label: 'Water', icon: Droplets },
              { id: 'workout', label: 'Workout', icon: Dumbbell },
            ].map(item => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer
                    ${isActive
                      ? 'bg-[var(--ink)] text-white shadow-sm'
                      : 'bg-white text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]'}
                  `}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
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
                    placeholder="e.g., Deliver wireframes to client"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Tag
                    </label>
                    <select
                      value={taskTag}
                      onChange={e => setTaskTag(e.target.value as TaskTag)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    >
                      {['Work', 'Wellbeing', 'Admin', 'Learning', 'Personal', 'Creative'].map(t => (
                        <option key={t} value={t}>{t}</option>
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
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none capitalize"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className="w-full px-2 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    />
                  </div>
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

            {/* GOAL FORM */}
            {tab === 'goal' && (
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Goal Objective
                  </label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    placeholder="e.g., Reach 57kg lean bodyweight"
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
                      value={goalCategory}
                      onChange={e => setGoalCategory(e.target.value as GoalCategory)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    >
                      {['Career', 'Health', 'Personal', 'Travel', 'Creative'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={goalTargetDate}
                      onChange={e => setGoalTargetDate(e.target.value)}
                      className="w-full px-2 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    First Key Milestone
                  </label>
                  <input
                    type="text"
                    value={goalMilestone1}
                    onChange={e => setGoalMilestone1(e.target.value)}
                    placeholder="e.g., Hit 50kg solid baseline"
                    className="w-full px-4 py-2 bg-white rounded-xl border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Set Goal</span>
                </button>
              </form>
            )}

            {/* FOOD LOG FORM */}
            {tab === 'food' && (
              <form onSubmit={handleLogFood} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Select Food
                  </label>
                  <select
                    value={selectedFoodId}
                    onChange={e => setSelectedFoodId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold"
                  >
                    {foods.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal, {f.protein}g P)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Servings
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="10"
                    value={servings}
                    onChange={e => setServings(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#e66b4b] hover:bg-[#d05c3d] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Log Food</span>
                </button>
              </form>
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
                    placeholder="e.g., 49.5"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm font-bold"
                    autoFocus
                    required
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

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Save Check-in</span>
                </button>
              </form>
            )}

            {/* WATER FORM */}
            {tab === 'water' && (
              <form onSubmit={handleLogWater} className="space-y-4">
                <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                  Quick Log Water
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['250', '500', '750'].map(ml => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => setWaterAmount(ml)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        waterAmount === ml
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-[var(--ink)] border-[var(--line)] hover:bg-blue-50'
                      }`}
                    >
                      +{ml} ml
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Log {waterAmount} ml Water</span>
                </button>
              </form>
            )}

            {/* WORKOUT FORM */}
            {tab === 'workout' && (
              <form onSubmit={handleLogWorkout} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Today's Exercise ({todayWorkoutDay?.day_name || 'Workout'})
                  </label>
                  <select
                    value={selectedWorkoutExerciseId}
                    onChange={e => setSelectedWorkoutExerciseId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold"
                  >
                    {todayWorkoutDay?.exercises?.map(we => (
                      <option key={we.id} value={we.id}>
                        {typeof we.exercise === 'string' ? we.exercise_details?.name : we.exercise.name} ({we.target_sets}x{we.target_reps} @ {we.target_weight}kg)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Mark Exercise Completed</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
