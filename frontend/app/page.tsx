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
import { HealthScreen } from './components/screens/HealthScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Menu, Plus } from 'lucide-react';

import { MobileNav } from './components/MobileNav';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('today');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'task' | 'habit' | 'food' | 'meal' | 'weight' | 'workout'>('task');

  const openQuickAdd = (tab: 'task' | 'habit' | 'food' | 'meal' | 'weight' | 'workout' = 'task') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

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

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8f7f4] text-[#181a18]">
      {/* Sidebar Navigation (Desktop Drawer & Mobile Full Drawer) */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenQuickAdd={() => openQuickAdd('task')}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-[#f8f7f4]/90 backdrop-blur-md border-b border-[var(--line)] px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-8 h-8 rounded-xl border border-[var(--line)] bg-white flex items-center justify-center text-[var(--ink)] shadow-xs cursor-pointer active:scale-95 transition-transform"
              title="Open Navigation Drawer"
            >
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="font-bold text-xs tracking-wider uppercase text-[var(--ink)]">{currentScreen}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openQuickAdd('task')}
              className="px-3 py-1.5 rounded-full bg-[var(--ink)] hover:bg-black text-white flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <Plus size={13} />
              <span>Create</span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 sm:px-8 md:px-12 py-5 sm:py-8 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
          {currentScreen === 'today' && (
            <TodayScreen
              onNavigate={setCurrentScreen}
              onOpenQuickAdd={openQuickAdd}
            />
          )}

          {currentScreen === 'trajectory' && <TrajectoryScreen />}

          {currentScreen === 'tasks' && <TasksScreen />}

          {currentScreen === 'habits' && <HabitsScreen />}

          {currentScreen === 'health' && <HealthScreen />}

          {currentScreen === 'analytics' && <AnalyticsScreen />}

          {currentScreen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* Modern Fixed Mobile Bottom Navigation Bar */}
      <MobileNav
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenQuickAdd={() => openQuickAdd('task')}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
      />
    </div>
  );
}
