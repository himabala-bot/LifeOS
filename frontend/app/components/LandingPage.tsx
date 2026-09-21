'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Target,
  Activity,
  Zap,
  Dumbbell,
  Apple,
  Check,
  Kanban,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { loginAsDemo } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const [demoHabits, setDemoHabits] = useState([true, true, true, false, true, true, false]);
  const [demoTasks, setDemoTasks] = useState([
    { title: 'Complete client system architecture document', done: true, tag: 'Work' },
    { title: 'Strength training: Push (Chest, Delts, Triceps)', done: true, tag: 'Health' },
    { title: 'Hit 120g protein surplus target', done: false, tag: 'Health' },
  ]);

  const demoStreak = useMemo(() => {
    let streak = 0;
    for (let i = demoHabits.length - 1; i >= 0; i--) {
      if (demoHabits[i]) {
        streak++;
      } else {
        break;
      }
    }
    if (streak === 0 && demoHabits[demoHabits.length - 2]) {
      for (let i = demoHabits.length - 2; i >= 0; i--) {
        if (demoHabits[i]) streak++;
        else break;
      }
    }
    return streak;
  }, [demoHabits]);

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
            <a href="#health" className="hover:text-[var(--ink)] transition-colors">Health & Strength</a>
            <a href="#score" className="hover:text-[var(--ink)] transition-colors">Life Score</a>
            <a href="#habits" className="hover:text-[var(--ink)] transition-colors">Habits Engine</a>
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
              className="px-5 py-2.5 rounded-full bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-8 border border-[var(--accent)]/15">
          <Sparkles size={13} />
          <span>The Unified Personal Operating System</span>
        </div>

        <h1 className="serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[var(--ink)] max-w-5xl mx-auto leading-[1.08]">
          One OS for your mind, goals & physical strength<span className="text-[var(--accent)]">.</span>
        </h1>

        <p className="mt-8 text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto font-normal leading-relaxed">
          LifeOS brings together daily execution, habit formation, strategic milestones, nutrition macros, and progressive strength training into one editorial dashboard.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => openAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Your LifeOS</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={loginAsDemo}
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-white/80 border border-[var(--line)] text-[var(--ink)] text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow"
          >
            Explore Aisha's Demo Workspace
          </button>
        </div>

        {/* Live Interactive Widget */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-xl text-left">
          <div className="flex items-center justify-between pb-6 border-b border-[var(--line)]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Interactive Preview</span>
              <h3 className="serif text-2xl font-normal text-[var(--ink)] mt-0.5">Today's Alignment Center</h3>
            </div>
            <div className="flex items-center gap-2 bg-[var(--ink)] text-white px-3.5 py-1.5 rounded-full text-xs font-bold">
              <span>LifeScore: {demoScore}%</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-3">Daily Tasks</span>
              <div className="space-y-2">
                {demoTasks.map((t, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const copy = [...demoTasks];
                      copy[i].done = !copy[i].done;
                      setDemoTasks(copy);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f7f4] border border-[var(--line)] cursor-pointer hover:border-[var(--accent)] transition-all"
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${t.done ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--line)]'}`}>
                      {t.done && <Check size={12} />}
                    </div>
                    <span className={`text-xs font-medium flex-1 ${t.done ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'}`}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-3">Habits & Physical Check</span>
              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[var(--ink)]">Hydration & Nutrition (2.5L / 120g P)</span>
                  <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1">
                    <Flame size={13} /> {demoStreak}d streak
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  {demoHabits.map((done, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const copy = [...demoHabits];
                        copy[i] = !copy[i];
                        setDemoHabits(copy);
                      }}
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        done ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-white border border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Features */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-[var(--line)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-2">Integrated Modular Architecture</p>
          <h2 className="serif text-3xl sm:text-5xl font-normal">Everything you need to thrive. Nothing you don't.</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Health & Strength */}
          <div id="health" className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
                <Activity size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Health & Physical Architecture</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Track lean muscle progression, 1-tap food staple logging, daily macro targets (Calories, Protein, Carbs, Fat), hydration, and creatine.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Nutrition, Workouts & Weight</span>
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

          {/* Card 3: Workout Splits */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center mb-6">
                <Dumbbell size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Progressive Hypertrophy Routine</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Configurable 3, 4, 5, or 6-day strength splits with target weights, reps, and exercise completion checkoffs.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Custom routine builder</span>
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
                A single honest number synthesizing your habit adherence, task output, physical health consistency, and goal trajectory in real time.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>4-Pillar dynamic calculation</span>
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

          {/* Card 6: Trajectory Engine */}
          <div className="bg-white rounded-3xl p-8 border border-[var(--line)] card-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="serif text-2xl font-normal mb-3">Future Simulator</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                See how small daily choices diverge over 1, 3, 5, and 10 years between intentional compounding vs status-quo drift.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <span>Interactive simulation dials</span>
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
          <h2 className="serif text-4xl sm:text-5xl font-normal">Ready to master your life and health?</h2>
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
