'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ListTodo, Flame, Target, CircleDollarSign, BookOpen, Plus, Calendar, Tag, AlertCircle } from 'lucide-react';
import { useData, getTodayDateStr } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TaskPriority, TaskTag, HabitCategory, HabitFrequency, ExpenseCategory, GoalCategory } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'habit' | 'goal' | 'expense' | 'journal';
}

export function QuickAddModal({ isOpen, onClose, defaultTab = 'task' }: QuickAddModalProps) {
  const { addTask, addHabit, addGoal, addExpense, addEnergyLog } = useData();
  const { user } = useAuth();
  const [tab, setTab] = useState<'task' | 'habit' | 'goal' | 'expense' | 'journal'>(defaultTab);

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

  // Expense form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Food & Dining');
  const [expenseDate, setExpenseDate] = useState(getTodayDateStr());

  // Journal form
  const [journalEnergy, setJournalEnergy] = useState<number>(4);
  const [journalFocus, setJournalFocus] = useState<number>(120);
  const [journalMood, setJournalMood] = useState<'energized' | 'focused' | 'calm' | 'tired' | 'stressed' | 'inspired'>('focused');
  const [journalHighlight, setJournalHighlight] = useState('');
  const [journalGratitude, setJournalGratitude] = useState('');

  if (!isOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      tag: taskTag,
      priority: taskPriority,
      dueDate: taskDueDate,
      completed: false,
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

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;
    addExpense({
      title: expenseTitle.trim(),
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: expenseDate,
    });
    setExpenseTitle('');
    setExpenseAmount('');
    onClose();
  };

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    addEnergyLog({
      date: getTodayDateStr(),
      energyLevel: journalEnergy,
      focusMinutes: journalFocus,
      mood: journalMood,
      highlight: journalHighlight.trim() || undefined,
      gratitude: journalGratitude.trim() || undefined,
    });
    setJournalHighlight('');
    setJournalGratitude('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#f8f7f4] rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <h3 className="font-semibold text-base">Quick Create</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Module Selector Tabs */}
          <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto">
            {[
              { id: 'task', label: 'Task', icon: ListTodo },
              { id: 'habit', label: 'Habit', icon: Flame },
              { id: 'goal', label: 'Goal', icon: Target },
              { id: 'expense', label: 'Expense', icon: CircleDollarSign },
              { id: 'journal', label: 'Journal', icon: BookOpen },
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

          {/* Tab Content */}
          <div className="p-6">
            {/* 1. TASK TAB */}
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
                      {['Work', 'Wellbeing', 'Admin', 'Learning', 'Personal', 'Finance', 'Creative'].map(t => (
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

            {/* 2. HABIT TAB */}
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

            {/* 3. GOAL TAB */}
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
                    placeholder="e.g., Publish Design Systems Book"
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
                      {['Career', 'Wealth', 'Health', 'Personal', 'Travel', 'Creative'].map(c => (
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
                    placeholder="e.g., Draft table of contents and chapter 1"
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

            {/* 4. EXPENSE TAB */}
            {tab === 'expense' && (
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Expense Title
                  </label>
                  <input
                    type="text"
                    value={expenseTitle}
                    onChange={e => setExpenseTitle(e.target.value)}
                    placeholder="e.g., Weekly groceries at Whole Foods"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Amount ({user?.currency || '₹'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none focus:border-[var(--accent)]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={e => setExpenseDate(e.target.value)}
                      className="w-full px-2 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                  >
                    {[
                      'Food & Dining',
                      'Housing & Rent',
                      'Transport',
                      'Utilities & Bills',
                      'Entertainment',
                      'Health & Wellness',
                      'Shopping',
                      'Education',
                      'Savings & Investment',
                      'Other'
                    ].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Log Expense</span>
                </button>
              </form>
            )}

            {/* 5. JOURNAL TAB */}
            {tab === 'journal' && (
              <form onSubmit={handleCreateJournal} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Energy (1 - 5)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setJournalEnergy(lvl)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${journalEnergy === lvl ? 'bg-[var(--accent)] text-white' : 'bg-white border border-[var(--line)] text-[var(--muted)]'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Focus Minutes
                    </label>
                    <input
                      type="number"
                      value={journalFocus}
                      onChange={e => setJournalFocus(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Mood
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['energized', 'focused', 'calm', 'tired', 'stressed', 'inspired'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setJournalMood(m)}
                        className={`py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${journalMood === m ? 'bg-[var(--ink)] text-white' : 'bg-white border border-[var(--line)] text-[var(--muted)]'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Today's Key Highlight
                  </label>
                  <input
                    type="text"
                    value={journalHighlight}
                    onChange={e => setJournalHighlight(e.target.value)}
                    placeholder="What made today meaningful?"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-[var(--line)] text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Save Entry</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
