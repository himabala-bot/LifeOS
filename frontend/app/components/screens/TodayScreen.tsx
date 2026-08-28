'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Plus, 
  ChevronRight, 
  Flame, 
  CircleDollarSign, 
  Target, 
  Sparkles, 
  ArrowUpRight, 
  Zap, 
  Clock, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Smile
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData, getTodayDateStr, getPastDateStr } from '../../context/DataContext';
import { ScreenType, TaskPriority, TaskTag } from '../../types';

interface TodayScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenQuickAdd: (tab?: 'task' | 'habit' | 'goal' | 'expense' | 'journal') => void;
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
    goals, 
    getGoalProgress,
    lifeScore, 
    spentThisMonth, 
    budgetRemaining, 
    budgetUsagePercent,
    safeDailySpend,
    todayEnergyLog,
    addEnergyLog
  } = useData();

  const [newTaskInput, setNewTaskInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<TaskTag>('Work');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');

  // Greeting based on hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const todayStr = getTodayDateStr();
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  // Filter tasks for Today
  const todayTasks = tasks.filter(t => !t.dueDate || t.dueDate === todayStr || t.completedAt === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;

  // Active goals
  const activeGoals = goals.filter(g => g.status !== 'completed').slice(0, 3);

  // Quick Inline Add Task
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask({
      title: newTaskInput.trim(),
      tag: selectedTag,
      priority: selectedPriority,
      dueDate: todayStr,
      completed: false,
    });
    setNewTaskInput('');
  };

  // Quick 7 days labels
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const last7DateStrs = Array.from({ length: 7 }, (_, i) => getPastDateStr(6 - i));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
            {greeting}, {firstName}<span className="text-[var(--accent)]">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="px-4 py-2 rounded-xl bg-white border border-[var(--line)] hover:bg-[#ecebe4] text-xs font-semibold flex items-center gap-2 text-[var(--ink)] transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} className="text-[var(--accent)]" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-4 py-2 rounded-xl bg-white border border-[var(--line)] hover:bg-[#ecebe4] text-xs font-semibold flex items-center gap-2 text-[var(--ink)] transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} className="text-amber-600" />
            <span>Log Expense</span>
          </button>
        </div>
      </header>

      {/* Top Metrics Row: Holistic Life Score & Financial Runway */}
      <section className="grid lg:grid-cols-[1.15fr_1fr] gap-6">
        {/* Life Score Card */}
        <div className="bg-[var(--ink)] text-white rounded-3xl p-7 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#bdd0b5] animate-pulse" />
                <p className="text-xs uppercase tracking-[0.25em] text-white/60 font-semibold">Life Score</p>
              </div>
              <div className="text-6xl sm:text-7xl serif font-normal mt-3">
                {lifeScore.overall}
                <span className="text-3xl text-white/35 font-light"> / 100</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-[#bdd0b5] backdrop-blur-sm">
                <TrendingUp size={13} />
                <span>{lifeScore.overall >= 70 ? 'Optimal' : lifeScore.overall >= 40 ? 'Moderate' : 'Building'}</span>
              </div>
              <p className="text-[11px] text-white/50 mt-2">Dynamic real-time balance</p>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Tasks</p>
              <p className="text-base font-semibold mt-1">{lifeScore.tasksScore}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Habits</p>
              <p className="text-base font-semibold mt-1">{lifeScore.habitsScore}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Budget</p>
              <p className="text-base font-semibold mt-1">{lifeScore.budgetScore}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Goals</p>
              <p className="text-base font-semibold mt-1">{lifeScore.goalsScore}%</p>
            </div>
          </div>

          <div className="relative z-10 mt-4 text-xs text-white/70">
            {lifeScore.summary}
          </div>
        </div>

        {/* Financial Runway Card */}
        <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)] font-semibold">Monthly Runway</p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold mt-3 text-[var(--ink)]">
                {user?.currency || '₹'}{spentThisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Spent of {user?.currency || '₹'}{(user?.monthlyBudget || 25000).toLocaleString()} limit
              </p>
            </div>

            <div className="text-right">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${budgetRemaining > 0 ? 'bg-[var(--sage-light)] text-[var(--sage)]' : 'bg-red-50 text-red-600'}`}>
                {user?.currency || '₹'}{Math.round(budgetRemaining).toLocaleString()} remaining
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--line)]">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold text-[var(--ink)]">Safe Daily Spend Rate</span>
              <span className="font-bold text-[var(--accent)]">{user?.currency || '₹'}{safeDailySpend.toLocaleString()} / day</span>
            </div>
            <div className="w-full h-2.5 bg-[#f1f0ea] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${budgetUsagePercent > 90 ? 'bg-red-500' : 'bg-[var(--sage)]'}`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[var(--muted)] mt-2">
              <span>{budgetUsagePercent}% budget used</span>
              <button 
                onClick={() => onNavigate('expenses')} 
                className="hover:text-[var(--ink)] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View ledger</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Future You Trajectory Pulse Card */}
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
              Simulate your compounding mastery, wealth trajectory, and body stamina vs. the drift path.
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

          {/* Task List */}
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
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${task.completed ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm' : 'border-[var(--line)] hover:border-[var(--accent)]'}`}
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

          {/* Inline Add Task Form */}
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
                className="hover:text-[var(--ink)] font-medium"
              >
                Open Full Task Manager →
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Daily Habits & Energy Log */}
        <div className="space-y-6">
          {/* Habits Card */}
          <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)]">Atomic Habits</p>
                <h2 className="serif text-2xl font-normal mt-1">Daily Rituals</h2>
              </div>
              <button
                onClick={() => onOpenQuickAdd('habit')}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f8f7f4] transition-colors"
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
                  const { currentStreak, consistency7d } = getHabitStreak(habit);
                  const isDoneToday = !!habit.history[todayStr];
                  return (
                    <div key={habit.id} className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm text-[var(--ink)]">{habit.name}</p>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5">
                            {currentStreak} day streak · {consistency7d}% 7-day consistency
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--accent)] font-semibold text-xs">
                          <Flame size={15} />
                          <span>{currentStreak}</span>
                        </div>
                      </div>

                      {/* 7-Day Matrix */}
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

          {/* Daily Energy & Focus Logger */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Today's Focus & Energy</span>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {todayEnergyLog ? `${todayEnergyLog.focusMinutes}m logged` : 'Not logged yet'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 bg-[#f8f7f4] rounded-2xl border border-[var(--line)]">
              <div className="text-xs">
                <p className="font-semibold text-[var(--ink)]">
                  {todayEnergyLog ? `Mood: ${todayEnergyLog.mood}` : 'Record today\'s reflection'}
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  {todayEnergyLog?.highlight ? `"${todayEnergyLog.highlight}"` : 'Track energy score (1-5) and focus hours'}
                </p>
              </div>

              <button
                onClick={() => onOpenQuickAdd('journal')}
                className="px-3 py-1.5 rounded-xl bg-[var(--ink)] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer shrink-0"
              >
                {todayEnergyLog ? 'Edit' : 'Log Daily'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Goals Horizon Strip */}
      <section className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)]">Milestone Ambition</p>
            <h2 className="serif text-2xl font-normal mt-1">Strategic Life Goals</h2>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer"
          >
            <span>All Goals</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)]">
            <p className="text-sm">No strategic goals created yet.</p>
            <button
              onClick={() => onOpenQuickAdd('goal')}
              className="mt-3 px-4 py-2 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              + Create Life Goal
            </button>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeGoals.map((goal) => {
              const progress = getGoalProgress(goal);
              const doneCount = goal.milestones.filter(m => m.done).length;
              return (
                <div
                  key={goal.id}
                  onClick={() => onNavigate('goals')}
                  className="p-5 rounded-2xl border border-[var(--line)] bg-[#f8f7f4] hover:bg-white hover:border-[var(--accent)] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded bg-white border border-[var(--line)] text-[var(--muted)] font-medium">
                        {goal.category}
                      </span>
                      <span className="font-bold text-[var(--accent)]">{progress}%</span>
                    </div>
                    <h3 className="font-semibold text-sm text-[var(--ink)] line-clamp-1">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{goal.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--line)]">
                    <div className="w-full h-1.5 bg-[#e4e3dd] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--muted)] mt-2">
                      {doneCount} of {goal.milestones.length} milestones reached
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
