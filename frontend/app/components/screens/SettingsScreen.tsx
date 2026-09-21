'use client';

import React, { useState } from 'react';
import {
  User,
  LogOut,
  Check,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export function SettingsScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { healthProfile, workoutStreak, todaysMealsTotalCount } = useData();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyFocusTarget, setDailyFocusTarget] = useState(String(user?.dailyFocusTargetMinutes || 180));

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      dailyFocusTargetMinutes: parseInt(dailyFocusTarget) || 180,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Preferences</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal">Settings & Workspace Control<span className="text-[var(--accent)]">.</span></h1>
      </div>

      <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
        <h2 className="serif text-2xl font-normal pb-4 border-b border-[var(--line)] mb-6">
          Identity & Workspace Configuration
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Personal Bio / Mission
            </label>
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g., Designer, high-agency engineer, and lifelong learner"
              className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Daily Focus Target (Mins)
              </label>
              <input
                type="number"
                step="15"
                value={dailyFocusTarget}
                onChange={e => setDailyFocusTarget(e.target.value)}
                className="w-full max-w-sm px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            {saveSuccess ? (
              <span className="text-xs font-bold text-[var(--sage)] flex items-center gap-1">
                <Check size={14} /> Profile updated!
              </span>
            ) : <div />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Health & Strength Profile Summary Card */}
      <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--ink)]">Health & Physical Blueprint</h3>
              <p className="text-xs text-[var(--muted)]">Active nutritional targets and physical profile</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Current Weight</span>
            <span className="text-base font-bold text-[var(--ink)] mt-0.5 block">
              {healthProfile.current_weight > 0 ? `${healthProfile.current_weight} kg` : '--'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Goal Weight</span>
            <span className="text-base font-bold text-[var(--ink)] mt-0.5 block">
              {healthProfile.goal_weight > 0 ? `${healthProfile.goal_weight} kg` : '--'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Workout Streak</span>
            <span className="text-base font-bold text-[var(--ink)] mt-0.5 block">{workoutStreak} days</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Today's Meals</span>
            <span className="text-base font-bold text-[var(--ink)] mt-0.5 block">{todaysMealsTotalCount} logged</span>
          </div>
        </div>
      </div>

      {/* Account Control */}
      <div className="bg-[#f8f7f4] rounded-3xl p-7 border border-[var(--line)]">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--muted)] font-medium">Session Status: Logged in as <strong>{user?.email}</strong></span>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
