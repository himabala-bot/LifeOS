'use client';

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ScreenType } from './types';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { QuickAddModal } from './components/QuickAddModal';
import { TodayScreen } from './components/screens/TodayScreen';
import { TrajectoryScreen } from './components/screens/TrajectoryScreen';
import { TasksScreen } from './components/screens/TasksScreen';
import { HabitsScreen } from './components/screens/HabitsScreen';
import { GoalsScreen } from './components/screens/GoalsScreen';
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { JournalScreen } from './components/screens/JournalScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Menu, Plus, Sparkles } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('today');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'task' | 'habit' | 'goal' | 'expense' | 'journal'>('task');

  const openQuickAdd = (tab: 'task' | 'habit' | 'goal' | 'expense' | 'journal' = 'task') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--ink)] text-white flex items-center justify-center font-bold text-base animate-pulse">
            L
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Loading LifeOS...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: render high-craft Landing Page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Authenticated workspace
  return (
    <div className="min-h-screen flex bg-[#f8f7f4] text-[#181a18]">
      {/* Sidebar navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenQuickAdd={() => openQuickAdd('task')}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-[#f8f7f4]/90 backdrop-blur-md border-b border-[var(--line)] px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 rounded-xl border border-[var(--line)] bg-white flex items-center justify-center text-[var(--ink)] shadow-sm cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <span className="font-bold text-sm tracking-wider uppercase">{currentScreen}</span>
          </div>

          <button
            onClick={() => openQuickAdd('task')}
            className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 px-5 sm:px-8 md:px-12 py-8 max-w-7xl w-full mx-auto">
          {currentScreen === 'today' && (
            <TodayScreen
              onNavigate={setCurrentScreen}
              onOpenQuickAdd={openQuickAdd}
            />
          )}

          {currentScreen === 'trajectory' && <TrajectoryScreen />}

          {currentScreen === 'tasks' && <TasksScreen />}

          {currentScreen === 'habits' && <HabitsScreen />}

          {currentScreen === 'goals' && <GoalsScreen />}

          {currentScreen === 'expenses' && <ExpensesScreen />}

          {currentScreen === 'analytics' && <AnalyticsScreen />}

          {currentScreen === 'journal' && <JournalScreen />}

          {currentScreen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Universal Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
      />
    </div>
  );
}
