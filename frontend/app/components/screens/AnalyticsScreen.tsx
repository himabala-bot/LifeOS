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
  ReferenceLine,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData, getPastDateStr } from '../../context/DataContext';

export function AnalyticsScreen() {
  const { user } = useAuth();
  const {
    tasks,
    habits,
    healthProfile,
    weightCheckins,
    foodLogs,
    foods,
    todayMacros,
    lifeScore,
  } = useData();

  // 7-day Nutrition history for chart
  const nutrition7dData = Array.from({ length: 7 }, (_, i) => {
    const dStr = getPastDateStr(6 - i);
    const dateObj = new Date(dStr);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayLogs = foodLogs.filter(fl => fl.date === dStr);

    let cals = 0;
    let prot = 0;
    dayLogs.forEach(log => {
      const f = log.food_details || foods.find(food => food.id === log.food);
      if (f) {
        cals += f.calories * log.servings;
        prot += f.protein * log.servings;
      }
    });

    return {
      day: dayLabel,
      date: dStr,
      calories: Math.round(cals),
      protein: Math.round(prot),
      targetCalories: healthProfile.target_calories || 2400,
      targetProtein: healthProfile.target_protein || 120,
    };
  });

  // Habit consistency by day of week (28-day window)
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

  // Weight Trend Data
  const sortedCheckins = [...weightCheckins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weightTrendData = sortedCheckins.map(w => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weight,
    goal: healthProfile.goal_weight || 57.0,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Deep Intelligence</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal">Analytics & Life Vectors<span className="text-[var(--accent)]">.</span></h1>
      </div>

      {/* Alignment Synthesis Banner */}
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

          <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Task Output</p>
              <p className="text-2xl font-bold mt-1 text-white">{lifeScore.tasksScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 35%</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Habit Loops</p>
              <p className="text-2xl font-bold mt-1 text-[#bdd0b5]">{lifeScore.habitsScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 35%</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Health & Strength</p>
              <p className="text-2xl font-bold mt-1 text-emerald-300">{lifeScore.healthScore}%</p>
              <p className="text-[10px] text-white/40 mt-0.5">Weight: 30%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Nutrition Macro Consistency & Habit Consistency */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Nutrition 7-Day Consistency */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Nutrition & Energy</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">7-Day Calorie & Protein Adherence</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              {todayMacros.calories} kcal today
            </span>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nutrition7dData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#797d77' }} />
                <Tooltip />
                <Bar dataKey="calories" name="Calories (kcal)" fill="#e66b4b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Consistency */}
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

      {/* Row 2: Weight Progression & Task Execution */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Weight Progression Trend */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Physical Architecture</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">Weight Progression Curve</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-full">
              Target: {healthProfile.goal_weight} kg
            </span>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightTrendData}>
                <defs>
                  <linearGradient id="analyticsWeightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 2']} stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip />
                <ReferenceLine y={healthProfile.goal_weight} stroke="#10b981" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="var(--accent)" strokeWidth={2.5} fill="url(#analyticsWeightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Execution Output & Velocity */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)]">Execution Velocity</p>
              <h3 className="font-semibold text-lg text-[var(--ink)]">Daily Task Completion Pipeline</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              {tasks.filter(t => t.completed).length} of {tasks.length} Completed
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {['urgent', 'high', 'medium', 'low'].map((p) => {
              const priorityTasks = tasks.filter(t => t.priority === p);
              const done = priorityTasks.filter(t => t.completed).length;
              const pct = priorityTasks.length > 0 ? Math.round((done / priorityTasks.length) * 100) : 0;
              return (
                <div key={p} className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[var(--ink)] capitalize">{p} Priority</span>
                    <span className="font-bold text-[var(--accent)]">{done}/{priorityTasks.length} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#e4e3dd] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
