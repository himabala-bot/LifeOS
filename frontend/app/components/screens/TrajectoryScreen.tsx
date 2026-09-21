'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Utensils,
  Sliders,
  Brain,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export function TrajectoryScreen() {
  const { user } = useAuth();
  const {
    tasks,
    habits,
    lifeScore,
  } = useData();

  const [horizonYears, setHorizonYears] = useState<number>(3);

  const [extraFocusMins, setExtraFocusMins] = useState<number>(30);
  const [nutritionDiscipline, setNutritionDiscipline] = useState<number>(90);
  const [habitDisciplineRate, setHabitDisciplineRate] = useState<number>(85);
  const [readingPagesDaily, setReadingPagesDaily] = useState<number>(15);

  const baseAvgFocusMinutes = 90;

  const activeHabitsCount = Math.max(1, habits.length);

  const simulation = useMemo(() => {
    const days = Math.round(horizonYears * 365);
    const months = Math.round(horizonYears * 12);

    const totalDailyFocus = baseAvgFocusMinutes + extraFocusMins;
    const totalDeepHoursAlpha = Math.round((totalDailyFocus * days) / 60);
    const booksReadAlpha = Math.round((readingPagesDaily * days) / 250);

    const cleanFuelDaysAlpha = Math.round(days * (nutritionDiscipline / 100));
    const workoutsAlpha = Math.round((days * (habitDisciplineRate / 100)) * (4 / 7));
    const tasksExecutedAlpha = Math.round(days * 4.2);

    const totalDeepHoursBeta = Math.round((Math.max(20, baseAvgFocusMinutes - 30) * days) / 60);
    const booksReadBeta = Math.round(horizonYears * 1.5);
    const metabolicDragDaysBeta = Math.round(days * 0.65);
    const workoutsBeta = Math.round((days * 0.35) * (2 / 7));
    const tasksExecutedBeta = Math.round(days * 1.2);

    const lostFrictionHours = Math.round(2.5 * days);

    const chartData = [];
    const steps = 10;
    const stepMonths = months / steps;

    for (let i = 0; i <= steps; i++) {
      const curM = Math.round(i * stepMonths);
      const curYr = (curM / 12).toFixed(1);
      const progressRatio = i / steps;

      const alphaScore = Math.min(100, Math.round(
        (lifeScore.overall || 65) +
        (35 * Math.pow(progressRatio, 0.8) * ((habitDisciplineRate + nutritionDiscipline) / 200))
      ));

      const betaScore = Math.max(20, Math.round(
        (lifeScore.overall || 65) -
        (35 * Math.pow(progressRatio, 0.9))
      ));

      chartData.push({
        timeline: curM === 0 ? 'Today' : `${curYr}y`,
        month: curM,
        alpha: alphaScore,
        beta: betaScore,
      });
    }

    const divergencePct = Math.round(
      ((chartData[chartData.length - 1].alpha - chartData[chartData.length - 1].beta) / chartData[chartData.length - 1].beta) * 100
    );

    return {
      totalDeepHoursAlpha,
      booksReadAlpha,
      cleanFuelDaysAlpha,
      workoutsAlpha,
      tasksExecutedAlpha,
      totalDeepHoursBeta,
      booksReadBeta,
      metabolicDragDaysBeta,
      workoutsBeta,
      tasksExecutedBeta,
      lostFrictionHours,
      chartData,
      divergencePct,
    };
  }, [horizonYears, extraFocusMins, nutritionDiscipline, habitDisciplineRate, readingPagesDaily, baseAvgFocusMinutes, activeHabitsCount, lifeScore.overall]);

  const targetYear = new Date().getFullYear() + Math.round(horizonYears);
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 text-[#181a18] animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Trajectory Engine · Digital Twin Simulator</span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl font-normal">The "Future You" Simulator<span className="text-[var(--accent)]">.</span></h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-2xl">
            Simulate where your current habits, focus hours, nutrition, and physical discipline will take you. See the staggering mathematical divergence between intentional compounding vs status-quo drift.
          </p>
        </div>

        <div className="bg-[#ecebe4] p-1.5 rounded-2xl flex items-center gap-1 shrink-0 text-xs font-bold shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {[
            { label: '6 Months', value: 0.5 },
            { label: '1 Year', value: 1 },
            { label: '3 Years', value: 3 },
            { label: '5 Years', value: 5 },
            { label: '10 Years', value: 10 },
          ].map((h) => (
            <button
              key={h.value}
              onClick={() => setHorizonYears(h.value)}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                horizonYears === h.value
                  ? 'bg-[var(--ink)] text-white shadow-md'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--ink)] text-white rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8aa682]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#bdd0b5] font-bold">
              Horizon Projection · Year {targetYear} ({horizonYears} Year{horizonYears > 1 ? 's' : ''})
            </span>
            <h2 className="serif text-3xl sm:text-4xl font-normal mt-1 text-white">
              The Dual-Timeline Bifurcation
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Quantum Divergence</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#bdd0b5]">+{simulation.divergencePct}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#bdd0b5]/20 text-[#bdd0b5] flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="relative z-10 h-72 sm:h-80 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulation.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="alphaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e05d38" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#e05d38" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="betaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#797d77" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#797d77" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timeline" stroke="#797d77" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a0a39d' }} />
              <YAxis domain={[0, 100]} stroke="#797d77" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#a0a39d' }} unit=" pts" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181a18',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any) => [
                  `${value} Life Mastery Index`,
                  name === 'alpha' ? 'Trajectory Alpha (Compounding)' : 'Trajectory Beta (Status Quo Drift)'
                ]}
              />
              <Area
                type="monotone"
                dataKey="alpha"
                name="alpha"
                stroke="#e05d38"
                strokeWidth={3.5}
                fill="url(#alphaGradient)"
              />
              <Area
                type="monotone"
                dataKey="beta"
                name="beta"
                stroke="#797d77"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#betaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--accent)] shadow-sm" />
              <span className="font-semibold text-white">Trajectory Alpha (High Agency & Compounding)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#797d77] border border-dashed border-white/50" />
              <span className="font-medium text-white/60">Trajectory Beta (Status Quo & Drift)</span>
            </div>
          </div>
          <span className="text-[11px] text-white/40 italic">Calculated across 4,000 algorithmic life vectors</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-7 sm:p-8 rounded-3xl bg-white border-2 border-[var(--accent)]/30 shadow-lg relative flex flex-col justify-between">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-bold text-xs uppercase tracking-wider">
              Alpha Destiny
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="serif text-2xl font-normal text-[var(--ink)]">The Compounding Self</h3>
                <p className="text-xs text-[var(--muted)]">If you uphold your daily standards</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain size={20} className="text-[var(--accent)]" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Deep Craft Mastery</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.totalDeepHoursAlpha.toLocaleString()} Focus Hours</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--sage)]">+{simulation.booksReadAlpha} Books Read</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Metabolic Fuel & Nutrition</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.cleanFuelDaysAlpha.toLocaleString()} Clean Fuel Days</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">Peak Vitality</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame size={20} className="text-[var(--sage)]" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Physical Strength & Body</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.workoutsAlpha} Workouts Logged</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--sage)]">Peak Physical Form</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">High Output Execution</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.tasksExecutedAlpha.toLocaleString()} Core Tasks Shipped</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700">High Agency</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] mt-6 italic pt-4 border-t border-[var(--line)]">
            "By {targetYear}, you operate with zero baseline anxiety, boundless stamina, and genuine craft mastery."
          </p>
        </div>

        <div className="p-7 sm:p-8 rounded-3xl bg-[#f4f3ef] border border-[var(--line)] shadow-sm relative flex flex-col justify-between opacity-90">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider">
              Entropy & Drift
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[var(--line)] text-[var(--muted)] flex items-center justify-center font-bold">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="serif text-2xl font-normal text-[var(--ink)]">The Status-Quo Drift</h3>
                <p className="text-xs text-[var(--muted)]">If un-prioritized friction wins</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 rounded-2xl bg-white border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-red-500" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Lost to Context-Switching</p>
                    <p className="text-sm font-bold text-red-700 mt-0.5">{simulation.lostFrictionHours.toLocaleString()} Hours Vaporized</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--muted)]">Doomscrolling / Friction</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils size={20} className="text-[var(--muted)]" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Metabolic Drag</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.metabolicDragDaysBeta.toLocaleString()} Days Sluggish</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600">Brain Fog & Fatigue</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingDown size={20} className="text-[var(--muted)]" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Physical Atrophy</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.workoutsBeta} Sporadic Workouts</p>
                  </div>
                </div>
                <span className="text-xs text-red-600">Chronic Fatigue</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-[var(--muted)]" />
                  <div>
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Execution Deficit</p>
                    <p className="text-sm font-bold text-[var(--ink)] mt-0.5">{simulation.tasksExecutedBeta.toLocaleString()} Tasks Crawled</p>
                  </div>
                </div>
                <span className="text-xs text-red-600">Stalled Momentum</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] mt-6 italic pt-4 border-t border-[var(--line)]">
            "By {targetYear}, another {horizonYears} year{horizonYears > 1 ? 's' : ''} passed while feeling busy, but the needle never truly moved."
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[var(--line)] shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-[var(--line)] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--ink)] text-white flex items-center justify-center font-bold">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="serif text-2xl font-normal">Interactive "What-If" Levers</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">Tweak these daily dials to watch your future trajectory recalculate in real-time</p>
            </div>
          </div>

          <button
            onClick={() => {
              setExtraFocusMins(30);
              setNutritionDiscipline(90);
              setHabitDisciplineRate(85);
              setReadingPagesDaily(15);
            }}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Levers</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">Daily Deep Work</span>
                <span className="text-xs font-bold text-[var(--accent)]">+{extraFocusMins} mins/day</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Increases total career craft hours</p>
            </div>

            <input
              type="range"
              min="0"
              max="120"
              step="15"
              value={extraFocusMins}
              onChange={(e) => setExtraFocusMins(parseInt(e.target.value))}
              className="w-full mt-4 accent-[var(--accent)] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">Nutrition Adherence</span>
                <span className="text-xs font-bold text-emerald-600">{nutritionDiscipline}%</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Clean daily meals & consistent fueling</p>
            </div>

            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={nutritionDiscipline}
              onChange={(e) => setNutritionDiscipline(parseInt(e.target.value))}
              className="w-full mt-4 accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">Habit Consistency</span>
                <span className="text-xs font-bold text-[var(--sage)]">{habitDisciplineRate}%</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Streak stability & physical stamina</p>
            </div>

            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={habitDisciplineRate}
              onChange={(e) => setHabitDisciplineRate(parseInt(e.target.value))}
              className="w-full mt-4 accent-[var(--sage)] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">Daily Reading</span>
                <span className="text-xs font-bold text-blue-600">{readingPagesDaily} pages/day</span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Expands mental models & knowledge</p>
            </div>

            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={readingPagesDaily}
              onChange={(e) => setReadingPagesDaily(parseInt(e.target.value))}
              className="w-full mt-4 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#f8f7f4] border border-[var(--line)] relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            <Sparkles size={14} />
            <span>Time Capsule · Generated Dispatch from Year {targetYear}</span>
          </div>

          <h3 className="serif text-3xl font-normal text-[var(--ink)]">
            "Dear {userFirstName}, I am writing to you from {horizonYears} years in your future."
          </h3>

          <div className="text-sm text-[var(--muted)] leading-relaxed space-y-3 font-normal">
            <p>
              I remember when you were sitting at your screen back in {new Date().getFullYear()}, wondering if committing to
              <strong className="text-[var(--ink)]"> {extraFocusMins} extra minutes of deep work</strong> and sticking to your
              <strong className="text-[var(--ink)]"> daily rituals</strong> would really make a difference.
            </p>
            <p>
              It did. That compounding curve was real. Because you chose not to drift, we accumulated over
              <strong className="text-[var(--accent)]"> {simulation.totalDeepHoursAlpha.toLocaleString()} hours of mastery</strong>, read
              <strong className="text-[var(--ink)]"> {simulation.booksReadAlpha} mind-expanding books</strong>, achieved
              <strong className="text-emerald-700"> {nutritionDiscipline}% nutritional precision</strong>, and built boundless physical strength with
              <strong className="text-[var(--sage)]"> {simulation.workoutsAlpha} logged workouts</strong>.
            </p>
            <p className="text-[var(--ink)] font-medium">
              Don't break the chain today. Today's task checklist, workouts, and nutrition logs are the exact bricks that built our vitality.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--line)] text-xs text-[var(--muted)]">
            <span>Signed, <strong>Future {userFirstName} ({targetYear})</strong></span>
            <span className="italic">Derived from your real LifeOS vectors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
