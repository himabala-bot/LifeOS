'use client';

import React from 'react';
import { 
  ListTodo, 
  Flame, 
  Target, 
  CircleDollarSign, 
  BarChart3, 
  BookOpen, 
  Settings, 
  Plus, 
  LogOut, 
  X, 
  Compass,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ScreenType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface SidebarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenQuickAdd: () => void;
}

export function Sidebar({
  currentScreen,
  onSelectScreen,
  isOpenMobile,
  onCloseMobile,
  onOpenQuickAdd,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { tasks, habits, goals, budgetRemaining, lifeScore } = useData();

  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const activeHabitsCount = habits.length;
  const activeGoalsCount = goals.filter(g => g.status !== 'completed' && g.status !== 'paused').length;

  const navItems: { id: ScreenType; label: string; icon: any; badge?: string | number; badgeColor?: string }[] = [
    { id: 'today', label: 'Today', icon: Compass, badge: lifeScore.overall > 0 ? `${lifeScore.overall}%` : undefined, badgeColor: 'bg-[var(--accent-subtle)] text-[var(--accent)]' },
    { id: 'trajectory', label: 'Future Simulator', icon: Sparkles },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'habits', label: 'Habits', icon: Flame, badge: activeHabitsCount > 0 ? activeHabitsCount : undefined, badgeColor: 'bg-[var(--sage-light)] text-[var(--sage)]' },
    { id: 'goals', label: 'Goals', icon: Target, badge: activeGoalsCount > 0 ? activeGoalsCount : undefined },
    { id: 'expenses', label: 'Expenses & Budget', icon: CircleDollarSign, badge: user?.currency ? `${user.currency}${Math.round(budgetRemaining).toLocaleString()}` : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'journal', label: 'Daily Journal', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-[#f4f3ef] border-r border-[var(--line)] p-6 flex flex-col justify-between transition-transform duration-200 ease-in-out
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top brand & close */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div 
              onClick={() => { onSelectScreen('today'); onCloseMobile(); }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--ink)] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                L
              </div>
              <div className="text-lg tracking-[0.2em] font-bold text-[var(--ink)]">
                LIFEOS<span className="text-[var(--accent)]">.</span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => { onOpenQuickAdd(); onCloseMobile(); }}
            className="w-full py-2.5 px-4 mb-6 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Quick Create</span>
          </button>

          {/* Nav List */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--muted)] px-3 mb-2">
              Workspace
            </p>

            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelectScreen(item.id); onCloseMobile(); }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer
                    ${isActive 
                      ? 'bg-white text-[var(--ink)] shadow-sm font-semibold' 
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-[#ecebe4] text-[var(--muted)]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--muted)] px-3 mb-2 mt-6">
              Insights & Reflect
            </p>

            {navItems.slice(6).map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelectScreen(item.id); onCloseMobile(); }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer
                    ${isActive 
                      ? 'bg-white text-[var(--ink)] shadow-sm font-semibold' 
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-[var(--line)]">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/70 border border-[var(--line)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm"
                style={{ backgroundColor: user?.avatar?.startsWith('#') ? user.avatar : 'var(--accent)' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--ink)] truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-[var(--muted)] truncate">{user?.email || 'Logged in'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
