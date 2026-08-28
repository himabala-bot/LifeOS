'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  Compass, 
  TrendingUp, 
  Flag,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Goal, GoalCategory, GoalStatus } from '../../types';

export function GoalsScreen() {
  const { 
    goals, 
    addGoal, 
    deleteGoal, 
    updateGoal, 
    toggleMilestone, 
    addMilestone, 
    deleteMilestone, 
    getGoalProgress 
  } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Goal creation form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('Career');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newMilestonesText, setNewMilestonesText] = useState('');

  // Expanded cards state
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // New milestone inline input per goal
  const [inlineMilestoneInput, setInlineMilestoneInput] = useState<{ [goalId: string]: string }>({});

  // Filtered goals
  const filteredGoals = goals.filter(g => {
    if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
    if (statusFilter !== 'All' && g.status !== statusFilter) return false;
    return true;
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'on_track').length;
  
  const avgProgress = totalGoals > 0 
    ? Math.round(goals.reduce((acc, g) => acc + getGoalProgress(g), 0) / totalGoals) 
    : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const milestones = newMilestonesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, idx) => ({
        id: `m_${Date.now()}_${idx}`,
        title: line,
        done: false,
      }));

    addGoal({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      category: newCategory,
      targetDate: newTargetDate || undefined,
      status: 'active',
      milestones,
    });

    setNewTitle('');
    setNewDesc('');
    setNewMilestonesText('');
    setNewTargetDate('');
  };

  const handleAddInlineMilestone = (goalId: string) => {
    const text = inlineMilestoneInput[goalId];
    if (!text || !text.trim()) return;
    addMilestone(goalId, text.trim());
    setInlineMilestoneInput({ ...inlineMilestoneInput, [goalId]: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Strategic Alignment</p>
          <h1 className="serif text-4xl sm:text-5xl font-normal">Life Goals & Milestones<span className="text-[var(--accent)]">.</span></h1>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Career', 'Wealth', 'Health', 'Personal', 'Travel', 'Creative'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[var(--ink)] text-white shadow-sm' : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Total Goals</p>
          <p className="text-3xl font-bold mt-1 text-[var(--ink)]">{totalGoals}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Active Horizons</p>
          <p className="text-3xl font-bold mt-1 text-[var(--accent)]">{activeGoals}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Accomplished</p>
          <p className="text-3xl font-bold mt-1 text-[var(--sage)]">{completedGoals}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Average Progress</p>
          <p className="text-3xl font-bold mt-1 text-[var(--ink)]">{avgProgress}%</p>
        </div>
      </div>

      {/* Add New Goal Accordion / Form */}
      <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[var(--line)]">
          <Sparkles size={16} className="text-[var(--accent)]" />
          <h3 className="font-semibold text-sm">Define a New Life Objective</h3>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Goal Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g., Run a full marathon under 4 hours"
                className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
              >
                {['Career', 'Wealth', 'Health', 'Personal', 'Travel', 'Creative'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Target Completion Date</label>
              <input
                type="date"
                value={newTargetDate}
                onChange={e => setNewTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Description / Core Motivation</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Why does this goal matter to your life?"
                className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
              Milestone Checkpoints (One per line)
            </label>
            <textarea
              rows={3}
              value={newMilestonesText}
              onChange={e => setNewMilestonesText(e.target.value)}
              placeholder="Milestone 1: Complete training plan&#10;Milestone 2: 15km practice run&#10;Milestone 3: Finish official race"
              className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              <span>Launch Goal</span>
            </button>
          </div>
        </form>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="md:col-span-2 py-16 text-center text-[var(--muted)] bg-white rounded-3xl border border-[var(--line)]">
            <p className="text-sm">No goals in this category.</p>
            <p className="text-xs mt-1">Set a meaningful milestone goal using the form above.</p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            const isCompleted = goal.status === 'completed' || progress === 100;
            const isExpanded = expandedGoalId === goal.id;
            const doneMilestones = goal.milestones.filter(m => m.done).length;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#f1f0ea] font-semibold text-[var(--ink)]">
                      {goal.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${isCompleted ? 'bg-[var(--sage-light)] text-[var(--sage)]' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'}`}>
                        {goal.status.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 rounded text-[var(--muted)] hover:text-red-600 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="serif text-2xl font-normal text-[var(--ink)] leading-snug">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">{goal.description}</p>
                  )}

                  {goal.targetDate && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-3">
                      <Calendar size={13} />
                      <span>Target: {goal.targetDate}</span>
                    </div>
                  )}

                  {/* Dynamic Progress Bar */}
                  <div className="mt-5">
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-semibold text-[var(--ink)]">Progress</span>
                      <span className="font-bold text-sm text-[var(--accent)]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#ecebe4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--muted)] mt-1.5">
                      {doneMilestones} of {goal.milestones.length} milestones accomplished
                    </p>
                  </div>

                  {/* Milestone Checklist */}
                  <div className="mt-6 pt-4 border-t border-[var(--line)]">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] mb-3">
                      Milestone Roadmap
                    </p>

                    <div className="space-y-2">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#f8f7f4] hover:bg-[#f1f0ea] transition-colors"
                        >
                          <div
                            onClick={() => toggleMilestone(goal.id, m.id)}
                            className="flex items-center gap-2.5 flex-1 cursor-pointer select-none min-w-0"
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] transition-all ${m.done ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--line)] bg-white'}`}>
                              {m.done && '✓'}
                            </div>
                            <span className={`text-xs truncate ${m.done ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)] font-medium'}`}>
                              {m.title}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteMilestone(goal.id, m.id)}
                            className="text-[var(--muted)] hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Inline Milestone */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={inlineMilestoneInput[goal.id] || ''}
                        onChange={e => setInlineMilestoneInput({ ...inlineMilestoneInput, [goal.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddInlineMilestone(goal.id);
                        }}
                        placeholder="Add milestone step..."
                        className="flex-1 px-3 py-1.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                      <button
                        onClick={() => handleAddInlineMilestone(goal.id)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--ink)] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
