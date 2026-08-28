'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Target,
  CircleDollarSign,
  BarChart3,
  ShieldCheck,
  Zap,
  Compass,
  Layers,
  HeartHandshake,
  TrendingUp,
  Clock,
  Check,
  Kanban
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { loginAsDemo } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Interactive demo habit state on the landing page hero preview
  const [demoHabits, setDemoHabits] = useState([true, true, true, false, true, true, false]);
  const [demoTasks, setDemoTasks] = useState([
    { title: 'Finalize Q3 design sprint proposal', done: true, tag: 'Work' },
    { title: '30 min zone 2 running', done: true, tag: 'Health' },
    { title: 'Review monthly cloud spending', done: false, tag: 'Finance' },
  ]);

  // Dynamic Reactive Streak Calculation for preview card
  const demoStreak = useMemo(() => {
    let streak = 0;
    // Check consecutive true days ending at today (index 6 backwards)
    for (let i = demoHabits.length - 1; i >= 0; i--) {
      if (demoHabits[i]) {
        streak++;
      } else {
        break;
      }
    }
    // If today is unchecked, check if previous day had a streak
    if (streak === 0 && demoHabits[demoHabits.length - 2]) {
      for (let i = demoHabits.length - 2; i >= 0; i--) {
        if (demoHabits[i]) streak++;
        else break;
      }
    }
    return streak;
  }, [demoHabits]);

  // Dynamic Reactive Alignment Score for preview card
  const demoScore = useMemo(() => {
    const tasksDone = demoTasks.filter(t => t.done).length;
    const tasksTotal = demoTasks.length || 1;
    const habitsDone = demoHabits.filter(Boolean).length;
    const habitsTotal = demoHabits.length || 7;

    const taskScore = (tasksDone / tasksTotal) * 50;
    const habitScore = (habitsDone / habitsTotal) * 50;
    return Math.round(taskScore + habitScore);
  }, [demoTasks, demoHabits]);

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#181a18] selection:bg-[#e05d38]/20 selection:text-[#e05d38]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#f8f7f4]/85 backdrop-blur-md border-b border-[var(--line)] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--ink)] text-white flex items-center justify-center font-bold text-sm tracking-wider">
              L
            </div>
            <span className="text-xl font-bold tracking-[0.2em]">LIFEOS<span className="text-[var(--accent)]">.</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
            <a href="#features" className="hover:text-[var(--ink)] transition-colors">Architecture</a>
            <a href="#score" className="hover:text-[var(--ink)] transition-colors">Life Score</a>
            <a href="#habits" className="hover:text-[var(--ink)] transition-colors">Habits Engine</a>
            <a href="#budget" className="hover:text-[var(--ink)] transition-colors">Financial Runway</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('signin')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="px-5 py-2.5 rounded-full bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="serif text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.08] tracking-tight text-[var(--ink)]"
            >
              Master your time, habits, and ambition in one <span className="italic">unified space</span><span className="text-[var(--accent)]">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl md:text-2xl text-[var(--muted)] leading-relaxed font-normal max-w-4xl mx-auto"
            >
              Stop juggling disjointed apps. LifeOS connects your daily focus tasks, atomic habit loops, financial runway, and milestone goals with zero noise.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => openAuth('signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold tracking-wide shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Create Your LifeOS Workspace</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={loginAsDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-[#f1f0ea] border border-[var(--line)] text-[var(--ink)] text-sm font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--sage)]" />
                <span>Launch Interactive Demo</span>
              </button>
            </motion.div>

            {/* Trust badge */}
            <p className="mt-5 text-xs text-[var(--muted)] flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-[var(--sage)]" />
              <span>Private & Local First · No credit card required · Instant setup</span>
            </p>
          </div>

          {/* Interactive Live Hero Widget Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-5xl mx-auto rounded-3xl border border-[var(--line)] bg-white/70 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-[var(--line)] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs font-mono text-[var(--muted)]">preview.lifeos.internal</span>
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-[var(--sage-light)] text-[var(--sage)] rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] animate-pulse" />
                <span>Try interacting below!</span>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
              {/* Left Column: Life Score & Today Checklist */}
              <div className="md:col-span-7 space-y-6">
                {/* Score Banner */}
                <div className="bg-[var(--ink)] text-white rounded-2xl p-6 relative overflow-hidden shadow-inner">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold">Today's Alignment Score</p>
                      <div className="text-5xl sm:text-6xl serif mt-2 font-normal transition-all">
                        {demoScore}<span className="text-2xl text-white/40"> / 100</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-[#bdd0b5] bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all">
                      {demoScore >= 80 ? '↗ High Momentum' : demoScore >= 50 ? '↗ Steady Rhythm' : '→ Building Rhythm'}
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-white/70 max-w-md">
                    Habits and daily focus priorities are compounding smoothly this week.
                  </p>
                </div>

                {/* Tasks preview */}
                <div className="bg-[#f8f7f4] rounded-2xl p-5 border border-[var(--line)]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Focus Tasks</span>
                    <span className="text-xs text-[var(--muted)]">{demoTasks.filter(t => t.done).length}/{demoTasks.length} Completed</span>
                  </div>

                  <div className="space-y-2">
                    {demoTasks.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const updated = [...demoTasks];
                          updated[idx].done = !updated[idx].done;
                          setDemoTasks(updated);
                        }}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[var(--line)] cursor-pointer hover:border-[var(--accent)] transition-all select-none"
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${t.done ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--line)]'}`}>
                          {t.done && <Check size={12} />}
                        </div>
                        <span className={`text-xs flex-1 ${t.done ? 'line-through text-[var(--muted)]' : 'font-medium text-[var(--ink)]'}`}>
                          {t.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f1f0ea] text-[var(--muted)] font-medium">
                          {t.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Habits & Financial Gauge */}
              <div className="md:col-span-5 space-y-6">
                {/* Habits Strip */}
                <div className="bg-[#f8f7f4] rounded-2xl p-5 border border-[var(--line)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flame size={16} className="text-[var(--accent)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Morning Movement</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--accent)] transition-all">{demoStreak} Day Streak</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const updated = [...demoHabits];
                          updated[i] = !updated[i];
                          setDemoHabits(updated);
                        }}
                        className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <span className="text-[10px] text-[var(--muted)] font-medium">{day}</span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${demoHabits[i] ? 'bg-[var(--accent)] text-white shadow-sm scale-105' : 'border border-[var(--line)] bg-white text-[var(--muted)]'}`}>
                          {demoHabits[i] ? '✓' : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safe Daily Spend */}
                <div className="bg-white rounded-2xl p-5 border border-[var(--line)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Safe Daily Spend</span>
                    <CircleDollarSign size={16} className="text-[var(--sage)]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">₹1,420</span>
                    <span className="text-xs text-[var(--muted)]">/ day safe burn rate</span>
                  </div>
                  <div className="w-full h-2 bg-[#f1f0ea] rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-[var(--sage)] rounded-full" style={{ width: '42%' }} />
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-2">58% monthly runway remaining</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid: The 6 Pillars */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[var(--accent)] mb-2">Architectural Pillars</p>
          <h2 className="serif text-4xl sm:text-5xl font-normal">Everything you need. Nothing you don't.</h2>
          <p className="text-sm text-[var(--muted)] mt-3">Designed for thinkers, builders, and high-agency individuals who value clarity over clutter.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Flagship Card: Future You Trajectory Simulator */}
          <div className="md:col-span-3 bg-gradient-to-br from-[#181a18] to-[#252825] text-white rounded-3xl p-8 sm:p-10 border border-white/15 card-hover shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-bold tracking-wide mb-4">
                <Sparkles size={13} />
                <span>Digital Twin Simulator - (Trajectory Alpha) versus status-quo drift (Trajectory Beta)</span>
              </div>
              <h3 className="serif text-3xl sm:text-4xl font-normal leading-snug">
                The "Future You" Trajectory Engine
              </h3>
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                See how small daily choices can lead to very different futures over 1, 3, 5, and 10 years.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#bdd0b5]">
                <span className="flex items-center gap-1.5">✓ 4,000 algorithmic life vectors</span>
                <span className="flex items-center gap-1.5">✓ Interactive "What-If" dials</span>
                <span className="flex items-center gap-1.5">✓ Time-capsule future letters</span>
              </div>
            </div>

            <div className="w-full lg:w-80 p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase tracking-wider">3-Year Divergence</span>
                <span className="font-bold text-[#bdd0b5]">+84% Alpha Delta</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/10 flex justify-between">
                  <span className="text-white/80">Deep Work:</span>
                  <span className="font-bold text-[var(--accent)]">3,285 Focus Hours</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 flex justify-between">
                  <span className="text-white/80">Compound Wealth:</span>
                  <span className="font-bold text-amber-300">₹6.4L Invested Pool</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 flex justify-between">
                  <span className="text-white/80">Drift Cost:</span>
                  <span className="font-bold text-red-400">2,190 Lost Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 1: Kanban Task Architecture */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-6">
                <Kanban size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Fluid Kanban Boards</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Seamlessly visualize task flow. Switch between focused checklists and Kanban boards with To-Do, Today's Focus, and Done pipeline columns.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Interactive Kanban & List Modes</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 2: Atomic Habits */}
          <div id="habits" className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--sage-light)] text-[var(--sage)] flex items-center justify-center mb-6">
                <Flame size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Atomic Habit Engine</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Track consistency over 7-day windows. Automatically computes active streaks and historical completion rates without vanity stats.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Streaks & weekly heatmaps</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 3: Financial Radar */}
          <div id="budget" className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6">
                <CircleDollarSign size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Financial Runway Pacing</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Know exactly how much you can spend per day without breaking your monthly target. Category breakdown and instant transaction logger.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Multi-currency & safe burn rate</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 4: Life Score */}
          <div id="score" className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Holistic Life Score</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                A single honest number synthesizing your habit adherence, task output, budget discipline, and goal trajectory in real time.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Weighted dynamic calculation</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 5: Goal Milestones */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Milestone Goal Engine</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Bridge abstract long-term dreams with actionable milestones. Progress bars calculate automatically as you tick off milestones.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Horizons & milestone trees</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 6: Daily Journal & Energy */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Daily Energy & Journal</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Log deep focus minutes, mood trends, and evening gratitude. Gain deep insights into what fuels your creative energy.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Mood correlation & focus logs</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Callout */}
      <section className="py-20 bg-[var(--ink)] text-white border-y border-[var(--line)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bdd0b5] font-semibold mb-4">The LifeOS Philosophy</p>
          <h2 className="serif text-3xl sm:text-5xl font-normal leading-tight">
            "You do not rise to the level of your goals. You fall to the level of your systems."
          </h2>
          <p className="mt-6 text-sm text-white/60 uppercase tracking-widest">— James Clear, Atomic Habits</p>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="bg-[#f1f0ea] rounded-3xl border border-[var(--line)] p-10 sm:p-16">
          <h2 className="serif text-4xl sm:text-5xl font-normal">Ready to take control of your life?</h2>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl mx-auto mt-4">
            Sign up in 10 seconds or test drive the full system as Aisha. Completely private, customizable, and distraction-free.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started for Free</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={loginAsDemo}
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-white/80 border border-[var(--line)] text-[var(--ink)] text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              Try Instant Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-12 text-center text-xs text-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-[0.2em] text-[var(--ink)]">LIFEOS.</span>
            <span>— The Personal Operating System</span>
          </div>
          <div className="text-[var(--muted)]">
            <span>© {new Date().getFullYear()} LifeOS. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
