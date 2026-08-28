'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Zap, 
  Smile, 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  Check 
} from 'lucide-react';
import { useData, getTodayDateStr } from '../../context/DataContext';
import { EnergyLog } from '../../types';

export function JournalScreen() {
  const { energyLogs, addEnergyLog, todayEnergyLog } = useData();

  const todayStr = getTodayDateStr();

  // Form states initialized to today's log if present
  const [energyLevel, setEnergyLevel] = useState<number>(todayEnergyLog?.energyLevel || 4);
  const [focusMinutes, setFocusMinutes] = useState<number>(todayEnergyLog?.focusMinutes || 180);
  const [mood, setMood] = useState<'energized' | 'focused' | 'calm' | 'tired' | 'stressed' | 'inspired'>(todayEnergyLog?.mood || 'focused');
  const [highlight, setHighlight] = useState(todayEnergyLog?.highlight || '');
  const [gratitude, setGratitude] = useState(todayEnergyLog?.gratitude || '');
  const [notes, setNotes] = useState(todayEnergyLog?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addEnergyLog({
      date: todayStr,
      energyLevel,
      focusMinutes,
      mood,
      highlight: highlight.trim() || undefined,
      gratitude: gratitude.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const sortedLogs = [...energyLogs].sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Mind & Energy</p>
        <h1 className="serif text-4xl sm:text-5xl font-normal">Daily Reflection & Log<span className="text-[var(--accent)]">.</span></h1>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        {/* Left Column: Today's Reflection Form */}
        <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-6">
            <div>
              <h2 className="serif text-2xl font-normal">Today's Reflection Entry</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">{todayStr}</p>
            </div>
            {todayEnergyLog && (
              <span className="text-xs font-semibold px-3 py-1 bg-[var(--sage-light)] text-[var(--sage)] rounded-full flex items-center gap-1.5">
                <Check size={12} /> Logged
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Energy Rating & Focus Time */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Energy Level (1 - 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        energyLevel === lvl
                          ? 'bg-[var(--accent)] text-white shadow-sm scale-105'
                          : 'bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Deep Focus (Minutes)
                </label>
                <input
                  type="number"
                  step="15"
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                Primary State of Mind
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['energized', 'focused', 'calm', 'tired', 'stressed', 'inspired'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      mood === m
                        ? 'bg-[var(--ink)] text-white shadow-sm'
                        : 'bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlight */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Key Win / Daily Highlight
              </label>
              <input
                type="text"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                placeholder="What was the single most meaningful event or output today?"
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Gratitude */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Gratitude Note
              </label>
              <input
                type="text"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Name one person, moment, or circumstance you appreciate today..."
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Freeform Journal */}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Evening Reflection / Freeform Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write down any lessons learned, friction observed, or intentions for tomorrow..."
                className="w-full px-4 py-3 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs leading-relaxed focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs font-bold text-[var(--sage)] flex items-center gap-1">
                  <Check size={14} /> Reflection Saved Successfully!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Save Reflection
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Historical Logs */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <h3 className="font-semibold text-base pb-3 border-b border-[var(--line)] mb-4">
              Past Reflections
            </h3>

            {sortedLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                No past journal entries yet. Complete today's reflection to begin your timeline.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-[var(--ink)]">{log.date}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[var(--line)] font-semibold text-[var(--accent)] capitalize">
                        {log.mood}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--muted)] mb-2">
                      <span>⚡ Level {log.energyLevel}/5</span>
                      <span>·</span>
                      <span>🎯 {log.focusMinutes} mins focus</span>
                    </div>

                    {log.highlight && (
                      <p className="text-xs font-medium text-[var(--ink)] italic bg-white/70 p-2 rounded-lg border border-[var(--line)]">
                        "{log.highlight}"
                      </p>
                    )}

                    {log.gratitude && (
                      <p className="text-[11px] text-[var(--muted)] mt-2 flex items-center gap-1">
                        <Heart size={11} className="text-rose-500 shrink-0" />
                        <span>{log.gratitude}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
