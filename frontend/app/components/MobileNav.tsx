'use client';

import React from 'react';
import {
  Compass,
  ListTodo,
  Flame,
  Activity,
  Menu,
  Plus,
} from 'lucide-react';
import { ScreenType } from '../types';
import { useData } from '../context/DataContext';

interface MobileNavProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  onOpenMobileMenu: () => void;
  onOpenQuickAdd: () => void;
}

export function MobileNav({
  currentScreen,
  onSelectScreen,
  onOpenMobileMenu,
  onOpenQuickAdd,
}: MobileNavProps) {
  const { tasks, habits } = useData();

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const navItems = [
    { id: 'today' as ScreenType, label: 'Today', icon: Compass },
    { id: 'tasks' as ScreenType, label: 'Tasks', icon: ListTodo, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'habits' as ScreenType, label: 'Habits', icon: Flame },
    { id: 'health' as ScreenType, label: 'Health', icon: Activity },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f8f7f4]/95 backdrop-blur-xl border-t border-[var(--line)] px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[var(--ink)] font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--ink)] font-medium'
              }`}
            >
              <div className="relative">
                <div className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : ''
                }`}>
                  <Icon size={20} className={isActive ? 'text-[var(--accent)] stroke-[2.5]' : 'stroke-[1.75]'} />
                </div>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-[var(--ink)] font-bold' : 'text-[var(--muted)]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Quick Add Button in Mobile Bar */}
        <button
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer text-[var(--ink)]"
          title="Quick Create"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--ink)] hover:bg-black text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Plus size={16} />
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-[var(--ink)]">
            Create
          </span>
        </button>

        {/* More/Menu Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer text-[var(--muted)] hover:text-[var(--ink)] font-medium"
        >
          <div className="p-1 rounded-xl">
            <Menu size={20} className="stroke-[1.75]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight text-[var(--muted)]">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
