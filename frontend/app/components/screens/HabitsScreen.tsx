'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Plus, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData, getTodayDateStr, getPastDateStr } from '../../context/DataContext';
import { Habit, HabitCategory, HabitFrequency } from '../../types';

export function HabitsScreen() {
  const { habits, addHabit, toggleHabitDay, deleteHabit, updateHabit, getHabitStreak } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCat, setNewHabitCat] = useState<HabitCategory>('Health');
  const [newHabitFreq, setNewHabitFreq] = useState<HabitFrequency>('daily');

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayStr = getTodayDateStr();

  // 14 days grid for habit matrix
  const days14 = Array.from({ length: 14 }, (_, i) => getPastDateStr(13 - i));

  // Filtered habits
  const filteredHabits = habits.filter(h => {
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    return true;
  });

  // Calculate global habit statistics
  let totalLogs = 0;
  let maxStreak = 0;
  let overallConsistency = 0;

  if (habits.length > 0) {
    let sumConsistency = 0;
    habits.forEach(h => {
      const { currentStreak, longestStreak, consistency7d } = getHabitStreak(h);
      if (longestStreak > maxStreak) maxStreak = longestStreak;
      sumConsistency += consistency7d;
      totalLogs += Object.keys(h.history).length;
    });
    overallConsistency = Math.round(sumConsistency / habits.length);
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit({
      name: newHabitName.trim(),
      category: newHabitCat,
      frequency: newHabitFreq,
    });
    setNewHabitName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;
    updateHabit(editingHabit.id, editingHabit);
    setEditingHabit(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Consistency Engine</p>
          <h1 className="serif text-4xl sm:text-5xl font-normal">Atomic Habits Matrix<span className="text-[var(--accent)]">.</span></h1>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Health', 'Mind', 'Productivity', 'Fitness', 'Learning', 'Lifestyle'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[var(--ink)] text-white shadow-sm' : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Active Habits</p>
          <p className="text-3xl font-bold mt-1 text-[var(--ink)]">{habits.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">7-Day Consistency</p>
          <p className="text-3xl font-bold mt-1 text-[var(--sage)]">{overallConsistency}%</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Longest Streak</p>
          <p className="text-3xl font-bold mt-1 text-[var(--accent)]">{maxStreak} days</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Total Check-ins</p>
          <p className="text-3xl font-bold mt-1 text-[var(--ink)]">{totalLogs}</p>
        </div>
      </div>

      {/* Add Habit Bar */}
      <form onSubmit={handleCreate} className="p-4 bg-white rounded-2xl border border-[var(--line)] shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <input
          type="text"
          value={newHabitName}
          onChange={e => setNewHabitName(e.target.value)}
          placeholder="New atomic habit (e.g. 10 pages reading, 20m stretch)..."
          className="w-full md:flex-1 px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
        />

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={newHabitCat}
            onChange={e => setNewHabitCat(e.target.value as HabitCategory)}
            className="px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
          >
            {['Health', 'Mind', 'Productivity', 'Fitness', 'Learning', 'Lifestyle'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={newHabitFreq}
            onChange={e => setNewHabitFreq(e.target.value as HabitFrequency)}
            className="px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="3x_week">3x/Week</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--sage)] hover:bg-[#668560] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto md:ml-0"
          >
            <Plus size={16} />
            <span>Create</span>
          </button>
        </div>
      </form>

      {/* Habit Matrix Table */}
      <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
          <div>
            <h3 className="font-semibold text-base">Habit Matrix & Activity Heatmap</h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">Click any circle to toggle daily completion</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[var(--accent)] inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-[var(--line)] inline-block" /> Missed / Rest
            </span>
          </div>
        </div>

        {filteredHabits.length === 0 ? (
          <div className="py-16 text-center text-[var(--muted)]">
            <p className="text-sm">No habits registered in this view.</p>
            <p className="text-xs mt-1">Start small with a 2-minute daily ritual.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHabits.map((habit) => {
              const { currentStreak, longestStreak, consistency7d } = getHabitStreak(habit);
              return (
                <div key={habit.id} className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] hover:border-[var(--accent)]/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Habit Info */}
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[var(--line)] font-semibold text-[var(--muted)]">
                          {habit.category}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] font-medium capitalize">
                          {habit.frequency}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--ink)] mt-1">{habit.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--muted)]">
                        <span className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                          <Flame size={14} />
                          <span>{currentStreak}d streak</span>
                        </span>
                        <span>·</span>
                        <span>{consistency7d}% weekly</span>
                        <span>·</span>
                        <span>Best: {longestStreak}d</span>
                      </div>
                    </div>

                    {/* 14-Day Checkpoints */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {days14.map((dStr) => {
                        const done = !!habit.history[dStr];
                        const isToday = dStr === todayStr;
                        const dateObj = new Date(dStr);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                        const dayNum = dateObj.getDate();

                        return (
                          <button
                            key={dStr}
                            onClick={() => toggleHabitDay(habit.id, dStr)}
                            className="flex flex-col items-center gap-1 cursor-pointer group focus:outline-none shrink-0"
                            title={`${dStr}: ${done ? 'Completed' : 'Incomplete'}`}
                          >
                            <span className={`text-[9px] font-bold ${isToday ? 'text-[var(--accent)] font-extrabold' : 'text-[var(--muted)]'}`}>
                              {dayName}{dayNum}
                            </span>
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                                done
                                  ? 'bg-[var(--accent)] text-white shadow-sm font-bold scale-105'
                                  : 'border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]'
                              }`}
                            >
                              {done ? '✓' : ''}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 justify-end">
                      <button
                        onClick={() => setEditingHabit(habit)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white transition-colors"
                        title="Edit Habit"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-2xl max-w-md w-full">
            <h3 className="serif text-2xl mb-4">Edit Habit</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Habit Name</label>
                <input
                  type="text"
                  value={editingHabit.name}
                  onChange={e => setEditingHabit({ ...editingHabit, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Category</label>
                  <select
                    value={editingHabit.category}
                    onChange={e => setEditingHabit({ ...editingHabit, category: e.target.value as HabitCategory })}
                    className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium"
                  >
                    {['Health', 'Mind', 'Productivity', 'Fitness', 'Learning', 'Lifestyle'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Frequency</label>
                  <select
                    value={editingHabit.frequency}
                    onChange={e => setEditingHabit({ ...editingHabit, frequency: e.target.value as HabitFrequency })}
                    className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="3x_week">3x/Week</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:bg-[#f8f7f4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
