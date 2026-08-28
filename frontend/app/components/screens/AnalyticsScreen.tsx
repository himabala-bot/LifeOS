'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Flame, 
  Target, 
  CircleDollarSign, 
  Activity, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData, getPastDateStr } from '../../context/DataContext';

export function AnalyticsScreen() {
  const { user } = useAuth();
  const { 
    tasks, 
    habits, 
    goals, 
    expenses, 
    energyLogs, 
    lifeScore, 
    spentThisMonth, 
    budgetRemaining,
    expensesByCategory,
    getGoalProgress
  } = useData();

  const currency = user?.currency || '₹';

  // 1. Focus & Energy Trend over the last 7 days (Strictly Real Data)
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const dStr = getPastDateStr(6 - i);
    const dateObj = new Date(dStr);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const log = energyLogs.find(e => e.date === dStr);
    return {
      day: dayLabel,
      date: dStr,
      focusMinutes: log ? log.focusMinutes : 0,
      energy: log ? log.energyLevel : 0,
    };
  });

  // 2. Habit Consistency by Day of Week (Real logs)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const habitDayCount: Record<string, { total: number; completed: number }> = {
    Sun: { total: 0, completed: 0 },
    Mon: { total: 0, completed: 0 },
    Tue: { total: 0, completed: 0 },
    Wed: { total: 0, completed: 0 },
    Thu: { total: 0, completed: 0 },
    Fri: { total: 0, completed: 0 },
    Sat: { total: 0, completed: 0 },
  };

  // Check last 28 days
  for (let i = 0; i < 28; i++) {
    const dStr = getPastDateStr(i);
    const dayIdx = new Date(dStr).getDay();
    const dName = dayNames[dayIdx];
    habits.forEach(h => {
      habitDayCount[dName].total++;
      if (h.history[dStr]) {
        habitDayCount[dName].completed++;
      }
    });
  }

  const habitChartData = dayNames.map(d => ({
    day: d,
    rate: habitDayCount[d].total > 0 
      ? Math.round((habitDayCount[d].completed / habitDayCount[d].total) * 100) 
      : 0,
  }));

  // 3. Category Expenses Bar Data
  const expenseCategoriesData = Object.entries(expensesByCategory).map(([cat, amt]) => ({
    category: cat.split(' ')[0], // Short name
    fullName: cat,
    amount: amt,
  }));

  const COLORS = ['#e05d38', '#8aa682', '#d97706', '#2563eb', '#7c3aed', '#ec4899'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Deep Intelligence</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal">Analytics & Life Vectors<span className="text-[var(--accent)]">.</span></h1>
      </div>

      {/* Life Score Holistic Breakdown */}
      <div className="bg-[var(--ink)] text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#bdd0b5] font-semibold">Alignment Synthesis</span>
            <div className="text-5xl sm:text-6xl serif mt-2 font-normal">
              {lifeScore.overall}<span className="text-2xl text-white/40"> / 100</span>
            </div>
            <p className="text-xs text-white/70 max-w-md mt-2">
              {lifeScore.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Task Output</p>
              <p className="text-2xl font-bold mt-1 text-white">{lifeScore.tasksScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 30%</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Habit Loops</p>
              <p className="text-2xl font-bold mt-1 text-[#bdd0b5]">{lifeScore.habitsScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 30%</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Budget Runway</p>
              <p className="text-2xl font-bold mt-1 text-amber-300">{lifeScore.budgetScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 20%</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Goal Horizon</p>
              <p className="text-2xl font-bold mt-1 text-blue-300">{lifeScore.goalsScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 1: Focus Minutes & Energy Chart */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Focus Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Focus Time (Minutes)</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">Daily Deep Work Trend</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-full">
              Last 7 Days
            </span>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e05d38" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#e05d38" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} />
                <Tooltip />
                <Area type="monotone" dataKey="focusMinutes" name="Focus Mins" stroke="#e05d38" strokeWidth={2.5} fill="url(#focusGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Day Consistency */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Habit Consistency</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">Success Rate by Day of Week</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--sage-light)] text-[var(--sage)] rounded-full">
              28-Day Window
            </span>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitChartData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                <Bar dataKey="rate" fill="#75926e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Expenses & Goals Distribution */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Spending Chart */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Expenditure</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">Spending by Category</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
              Current Month
            </span>
          </div>

          {expenseCategoriesData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-[var(--muted)]">
              No expenses recorded yet to generate distribution chart.
            </div>
          ) : (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategoriesData} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#797d77' }} />
                  <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} width={75} />
                  <Tooltip formatter={(val) => [`${currency}${val}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#d97706" radius={[0, 6, 6, 0]}>
                    {expenseCategoriesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Goal Execution Status */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Ambition Trajectory</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">Milestone Completion Velocity</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
              {goals.length} Active Goals
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-[var(--muted)]">
              No strategic goals set yet.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {goals.slice(0, 4).map((g) => {
                const prog = getGoalProgress(g);
                return (
                  <div key={g.id} className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[var(--ink)] truncate max-w-[200px]">{g.title}</span>
                      <span className="font-bold text-[var(--accent)]">{prog}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#e4e3dd] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${prog}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
