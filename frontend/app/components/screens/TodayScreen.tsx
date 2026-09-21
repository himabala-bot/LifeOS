'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Plus,
  ChevronRight,
  Flame,
  Sparkles,
  Activity,
  Utensils,
  Dumbbell,
  Scale,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData, getTodayDateStr, getPastDateStr } from '../../context/DataContext';
import { ScreenType, TaskPriority, TaskTag } from '../../types';

interface TodayScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenQuickAdd: (tab?: 'task' | 'habit' | 'food' | 'meal' | 'weight' | 'workout') => void;
}

export function TodayScreen({ onNavigate, onOpenQuickAdd }: TodayScreenProps) {
  const { user } = useAuth();
  const {
    tasks,
    toggleTask,
    addTask,
    habits,
    toggleHabitDay,
    getHabitStreak,
    lifeScore,
    healthProfile,
    todaysMeals,
    todaysMealsEatenCount,
    todaysMealsTotalCount,
    todaysWorkoutDay,
    isTodayWorkoutCompleted,
    toggleWorkoutDayCompleted,
    workoutStreak,
  } = useData();

  const [newTaskInput, setNewTaskInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<TaskTag>('Work');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const todayStr = getTodayDateStr();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const todayTasks = tasks.filter(t => !t.dueDate || t.dueDate === todayStr || t.completedAt === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask({
      title: newTaskInput.trim(),
      tag: selectedTag,
      priority: selectedPriority,
      dueDate: todayStr,
    });
    setNewTaskInput('');
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const last7DateStrs = Array.from({ length: 7 }, (_, i) => getPastDateStr(6 - i));

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 pb-16 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] sm:text-xs">{formattedDate}</span>
          </div>
          <h1 className="serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
            {greeting}, {firstName}<span className="text-[var(--accent)]">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[var(--line)] hover:bg-[#ecebe4] text-xs font-semibold flex items-center justify-center gap-1.5 text-[var(--ink)] transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} className="text-[var(--accent)]" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => onNavigate('health')}
            className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl bg-white border border-[var(--line)] hover:bg-[#ecebe4] text-xs font-semibold flex items-center justify-center gap-1.5 text-[var(--ink)] transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} className="text-[#e66b4b]" />
            <span>Add Meal</span>
          </button>
        </div>
      </header>

      {/* Top Grid: LifeScore Alignment & Health Snapshot */}
      <section className="grid lg:grid-cols-2 gap-5 sm:gap-8">
        {/* Alignment Center / LifeScore */}
        <div className="bg-[var(--ink)] text-white rounded-3xl p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#bdd0b5]">Holistic Balance</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <h2 className="serif text-2xl sm:text-3xl font-normal mt-1 text-white">Daily LifeScore</h2>
            </div>
            <div className="text-right">
              <span className="serif text-3xl sm:text-5xl font-normal text-white">
                {lifeScore.overall}%
              </span>
              <p className="text-[9px] sm:text-[10px] text-white/60 uppercase tracking-widest mt-0.5">Unified Index</p>
            </div>
          </div>

          {/* 3 Pillars Breakdown */}
          <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 my-5 sm:my-6 pt-4 sm:pt-5 border-t border-white/10 text-center">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-semibold block">Tasks (35%)</span>
              <p className="text-sm sm:text-base font-semibold mt-1">{lifeScore.tasksScore}%</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-semibold block">Habits (35%)</span>
              <p className="text-sm sm:text-base font-semibold mt-1">{lifeScore.habitsScore}%</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-semibold block">Health (30%)</span>
              <p className="text-sm sm:text-base font-semibold mt-1">{lifeScore.healthScore}%</p>
            </div>
          </div>

          <div className="relative z-10 mt-2 text-xs text-white/70">
            {lifeScore.summary}
          </div>
        </div>

        {/* Health & Strength Snapshot Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[var(--line)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[var(--muted)] font-semibold">Physical Architecture</p>
                </div>
                <div className="flex items-baseline gap-2 sm:gap-3 mt-2 sm:mt-3">
                  <span className="text-2xl sm:text-4xl font-bold text-[var(--ink)]">
                    {todaysMealsEatenCount} / {todaysMealsTotalCount}
                  </span>
                  <span className="text-xs font-semibold text-[var(--muted)]">meals eaten today</span>
                </div>
              </div>

              <div className="text-right">
                {healthProfile.current_weight > 0 ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {healthProfile.current_weight} kg
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f8f7f4] text-[var(--muted)] border border-[var(--line)]">
                    No weight logged
                  </span>
                )}
                {healthProfile.goal_weight > 0 && (
                  <p className="text-[10px] text-[var(--muted)] mt-1">Goal: {healthProfile.goal_weight} kg</p>
                )}
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--muted)] font-medium text-[11px]">Training</span>
                  <span className="font-bold text-[var(--ink)] flex items-center gap-1 text-[11px]">
                    <Flame size={12} className="text-[#e66b4b]" /> {workoutStreak}d streak
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--ink)] truncate mt-1">
                  {todaysWorkoutDay?.day_name || 'Rest / Recovery'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--muted)] font-medium text-[11px]">Workout Status</span>
                  <span className={`font-bold text-[11px] ${isTodayWorkoutCompleted ? 'text-emerald-700' : 'text-[var(--muted)]'}`}>
                    {isTodayWorkoutCompleted ? 'Completed ✓' : 'Pending'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleWorkoutDayCompleted(todayStr)}
                  className={`mt-1 text-[11px] font-semibold w-full text-left cursor-pointer hover:underline ${
                    isTodayWorkoutCompleted ? 'text-emerald-700' : 'text-[var(--accent)]'
                  }`}
                >
                  {isTodayWorkoutCompleted ? 'Mark Pending' : 'Tap to Mark Done'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[var(--line)] flex items-center justify-between">
            <div className="text-xs text-[var(--muted)] truncate pr-2">
              <span className="font-semibold text-[var(--ink)]">{todaysWorkoutDay?.day_name.split(' ')[0] || 'Training'}:</span>{' '}
              {todaysWorkoutDay?.is_rest_day ? 'Rest & Recovery' : `${todaysWorkoutDay?.exercises?.length || 0} planned exercises`}
            </div>
            <button
              onClick={() => onNavigate('health')}
              className="hover:text-[var(--accent)] text-xs font-bold text-[var(--ink)] flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            >
              <span>Open Health</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Future Simulator Banner */}
      <section
        onClick={() => onNavigate('trajectory')}
        className="p-6 rounded-3xl bg-gradient-to-r from-[#181a18] to-[#2a2e2a] text-white shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bdd0b5]">Digital Twin Simulator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
            </div>
            <h3 className="serif text-xl font-normal mt-0.5 text-white">
              Where will today's habits take you in 3 years?
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Simulate your compounding mastery, physical capacity, and daily focus vs. the drift path.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white backdrop-blur-sm border border-white/10 shrink-0">
          <span>Launch Simulator</span>
          <ChevronRight size={14} />
        </div>
      </section>

      {/* Main Grid: Tasks & Habits */}
      <section className="grid lg:grid-cols-[1.25fr_0.95fr] gap-8">
        {/* Left Column: Today's Tasks */}
        <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)]">Focus Today</p>
              <h2 className="serif text-2xl font-normal mt-1">Daily Task Checklist</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-[#f4f3ef] rounded-full text-[var(--muted)]">
              {completedTodayTasks} of {todayTasks.length} done
            </span>
          </div>

          <div className="mt-4 divide-y divide-[var(--line)] min-h-[160px]">
            {todayTasks.length === 0 ? (
              <div className="py-10 text-center text-[var(--muted)]">
                <p className="text-sm">No tasks scheduled for today.</p>
                <p className="text-xs mt-1">Add your high-priority items below to get into flow.</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  className="py-3.5 flex items-center gap-3.5 group hover:bg-[#faf9f6] px-2 -mx-2 rounded-xl transition-colors"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
                        : 'border-[var(--line)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {task.completed && <Check size={13} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug transition-all ${task.completed ? 'line-through text-[var(--muted)]' : 'font-medium text-[var(--ink)]'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f1f0ea] text-[var(--muted)] font-medium">
                        {task.tag}
                      </span>
                      {task.priority === 'urgent' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase">
                          Urgent
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold uppercase">
                          High
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <form onSubmit={handleQuickAdd} className="mt-4 pt-4 border-t border-[var(--line)]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Type a task and press Enter..."
                className="flex-1 px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[var(--muted)]">
              <span>Press Enter to save</span>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="hover:text-[var(--ink)] font-medium cursor-pointer"
              >
                Open Full Task Manager →
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Habits & Physical Routine */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)]">Atomic Habits</p>
                <h2 className="serif text-2xl font-normal mt-1">Daily Rituals</h2>
              </div>
              <button
                onClick={() => onOpenQuickAdd('habit')}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f8f7f4] transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            {habits.length === 0 ? (
              <div className="py-8 text-center text-[var(--muted)]">
                <p className="text-sm">No active habits tracked yet.</p>
                <button
                  onClick={() => onOpenQuickAdd('habit')}
                  className="mt-3 px-4 py-2 rounded-xl bg-[var(--sage-light)] text-[var(--sage)] text-xs font-semibold hover:bg-[var(--sage)] hover:text-white transition-colors cursor-pointer"
                >
                  + Add Your First Habit
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {habits.slice(0, 4).map((habit) => {
                  const { currentStreak } = getHabitStreak(habit);
                  return (
                    <div key={habit.id} className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm text-[var(--ink)]">{habit.name}</p>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5">
                            {currentStreak} day streak
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--accent)] font-semibold text-xs">
                          <Flame size={15} />
                          <span>{currentStreak}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[var(--line)]">
                        {last7DateStrs.map((dStr, idx) => {
                          const done = !!habit.history[dStr];
                          const isToday = dStr === todayStr;
                          return (
                            <button
                              key={dStr}
                              onClick={() => toggleHabitDay(habit.id, dStr)}
                              className="flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                            >
                              <span className={`text-[9px] font-bold ${isToday ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                                {daysOfWeek[idx]}
                              </span>
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                                  done
                                    ? 'bg-[var(--accent)] text-white shadow-sm font-bold'
                                    : 'border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]'
                                }`}
                              >
                                {done ? '✓' : ''}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-2 text-right">
              <button
                onClick={() => onNavigate('habits')}
                className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1 ml-auto cursor-pointer"
              >
                <span>View habits engine</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
