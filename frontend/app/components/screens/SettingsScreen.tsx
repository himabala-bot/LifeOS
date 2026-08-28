'use client';

import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export function SettingsScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { resetAllData } = useData();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [monthlyBudget, setMonthlyBudget] = useState(String(user?.monthlyBudget || 25000));
  const [dailyFocusTarget, setDailyFocusTarget] = useState(String(user?.dailyFocusTargetMinutes || 180));

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      currency,
      monthlyBudget: parseFloat(monthlyBudget) || 25000,
      dailyFocusTargetMinutes: parseInt(dailyFocusTarget) || 180,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Preferences</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal">Settings & Workspace Control<span className="text-[var(--accent)]">.</span></h1>
      </div>

      {/* Profile & Identity */}
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
              placeholder="e.g., Designer, marathon runner, and lifelong learner"
              className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Monthly Target Budget ({currency})
              </label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Daily Focus Target (Mins)
              </label>
              <input
                type="number"
                step="15"
                value={dailyFocusTarget}
                onChange={e => setDailyFocusTarget(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none focus:border-[var(--accent)]"
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

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-3xl p-7 border border-red-200">
        <h2 className="serif text-2xl font-normal text-red-900 pb-2">Danger Zone</h2>
        <p className="text-xs text-red-700 mb-6">Irreversible actions regarding your local workspace.</p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-red-200">
          <div>
            <h4 className="font-semibold text-sm text-[var(--ink)]">Clear All Workspace Data</h4>
            <p className="text-xs text-[var(--muted)]">Removes all tasks, habits, expenses, and goals from this account.</p>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetAllData(); setShowResetConfirm(false); }}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Reset
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Workspace Data
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-red-200/60 flex justify-between items-center">
          <span className="text-xs text-red-700 font-medium">Session Status: Logged in as {user?.email}</span>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
