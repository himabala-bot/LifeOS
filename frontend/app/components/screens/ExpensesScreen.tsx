'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CircleDollarSign, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  PieChart as PieIcon, 
  Wallet, 
  ArrowDownRight, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData, getTodayDateStr } from '../../context/DataContext';
import { Expense, ExpenseCategory } from '../../types';

export function ExpensesScreen() {
  const { user, updateProfile } = useAuth();
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    updateExpense,
    spentThisMonth, 
    budgetRemaining, 
    budgetUsagePercent, 
    safeDailySpend, 
    expensesByCategory 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Add Expense form
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Food & Dining');
  const [newDate, setNewDate] = useState(getTodayDateStr());
  const [newNotes, setNewNotes] = useState('');

  // Budget settings modal / inline
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(String(user?.monthlyBudget || 25000));

  const currency = user?.currency || '₹';

  // Filtered expenses
  const filteredExpenses = expenses.filter(exp => {
    if (searchQuery && !exp.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'All' && exp.category !== selectedCategory) {
      return false;
    }
    return true;
  }).sort((a, b) => (b.date > a.date ? 1 : -1));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;
    addExpense({
      title: newTitle.trim(),
      amount: parseFloat(newAmount),
      category: newCategory,
      date: newDate,
      notes: newNotes.trim() || undefined,
    });
    setNewTitle('');
    setNewAmount('');
    setNewNotes('');
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val >= 0) {
      updateProfile({ monthlyBudget: val });
      setIsEditingBudget(false);
    }
  };

  // Top spending categories list
  const categoryList: [string, number][] = (
    Object.entries(expensesByCategory) as [string, number][]
  ).sort((a, b) => Number(b[1]) - Number(a[1]));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Financial Radar</p>
          <h1 className="serif text-4xl sm:text-5xl font-normal">Runway & Expense Ledger<span className="text-[var(--accent)]">.</span></h1>
        </div>

        <button
          onClick={() => setIsEditingBudget(true)}
          className="px-4 py-2 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[#ecebe4] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Wallet size={14} className="text-amber-600" />
          <span>Adjust Monthly Target</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Monthly Budget</p>
          <p className="text-3xl font-bold mt-1 text-[var(--ink)]">{currency}{(user?.monthlyBudget || 25000).toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Total limit for current month</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Total Spent</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{currency}{spentThisMonth.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)] mt-1">{budgetUsagePercent}% of limit consumed</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Runway Remaining</p>
          <p className={`text-3xl font-bold mt-1 ${budgetRemaining > 0 ? 'text-[var(--sage)]' : 'text-red-600'}`}>
            {currency}{Math.round(budgetRemaining).toLocaleString()}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">Available for remaining days</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Safe Daily Spend</p>
          <p className="text-3xl font-bold mt-1 text-[var(--accent)]">{currency}{safeDailySpend.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Pacing to maintain positive runway</p>
        </div>
      </div>

      {/* Main Grid: Add & Category Breakdown */}
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        {/* Left Column: Quick Expense Logger & Ledger */}
        <div className="space-y-6">
          {/* Add Expense Form */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <h3 className="font-semibold text-sm mb-4">Record New Transaction</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Title / Vendor</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g., Organic Grocery Market"
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm font-semibold focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                  >
                    {[
                      'Food & Dining',
                      'Housing & Rent',
                      'Transport',
                      'Utilities & Bills',
                      'Entertainment',
                      'Health & Wellness',
                      'Shopping',
                      'Education',
                      'Savings & Investment',
                      'Other'
                    ].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Log Expense</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)] mb-4">
              <h3 className="font-semibold text-base">Transaction Ledger</h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="pl-8 pr-3 py-1.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {[
                    'Food & Dining',
                    'Housing & Rent',
                    'Transport',
                    'Utilities & Bills',
                    'Entertainment',
                    'Health & Wellness',
                    'Shopping',
                    'Education',
                    'Savings & Investment',
                    'Other'
                  ].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-[var(--muted)]">
                <p className="text-sm">No expenses found.</p>
                <p className="text-xs mt-1">Log your first spending entry above.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {filteredExpenses.map((exp) => (
                  <div key={exp.id} className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#faf9f6] px-2 -mx-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {exp.category.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--ink)]">{exp.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--muted)]">
                          <span>{exp.category}</span>
                          <span>·</span>
                          <span>{exp.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[var(--ink)]">
                        -{currency}{exp.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 transition-all cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Category Distribution & Insights */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <h3 className="font-semibold text-base pb-3 border-b border-[var(--line)]">
              Category Distribution
            </h3>

            {categoryList.length === 0 ? (
              <div className="py-10 text-center text-xs text-[var(--muted)]">
                No expense categories logged this month.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {categoryList.map(([catName, amount]) => {
                  const numAmount = Number(amount);
                  const pct = spentThisMonth > 0 ? Math.round((numAmount / spentThisMonth) * 100) : 0;
                  return (
                    <div key={catName}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[var(--ink)]">{catName}</span>
                        <span className="font-semibold text-[var(--muted)]">
                          {currency}{numAmount.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f1f0ea] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Advice card */}
          <div className="bg-[#f8f7f4] rounded-3xl p-6 border border-[var(--line)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">
              <Sparkles size={14} />
              <span>Pacing Insight</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {budgetRemaining > 0 
                ? `You have ${currency}${Math.round(budgetRemaining).toLocaleString()} remaining in your runway. Spending under ${currency}${safeDailySpend} each day ensures you stay safely within your monthly target.`
                : `You have exceeded your monthly limit by ${currency}${Math.abs(Math.round(budgetRemaining)).toLocaleString()}. Adjust non-essential outlays or increase your budget target.`}
            </p>
          </div>
        </div>
      </div>

      {/* Adjust Budget Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-2xl max-w-sm w-full">
            <h3 className="serif text-2xl mb-2">Monthly Budget Target</h3>
            <p className="text-xs text-[var(--muted)] mb-4">Set your target monthly spending ceiling.</p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Target Amount ({currency})</label>
                <input
                  type="number"
                  value={tempBudget}
                  onChange={e => setTempBudget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-base font-bold focus:outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-black"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
