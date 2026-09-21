'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Dumbbell,
  Apple,
  TrendingUp,
  Plus,
  Trash2,
  Check,
  Flame,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Utensils,
  Scale,
  Sparkles,
  Edit2,
  CheckCircle2,
  Circle,
  X,
  Target,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useData, getTodayDateStr } from '../../context/DataContext';

// 7 Days ordered Monday to Sunday
const ORDERED_DAYS = [
  { dow: 1, name: 'Monday', short: 'Mon' },
  { dow: 2, name: 'Tuesday', short: 'Tue' },
  { dow: 3, name: 'Wednesday', short: 'Wed' },
  { dow: 4, name: 'Thursday', short: 'Thu' },
  { dow: 5, name: 'Friday', short: 'Fri' },
  { dow: 6, name: 'Saturday', short: 'Sat' },
  { dow: 0, name: 'Sunday', short: 'Sun' },
];

const PRESET_WORKOUT_TYPES = [
  'Push (Chest, Delts, Triceps)',
  'Pull (Back, Biceps)',
  'Legs & Calves',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Cardio & Mobility',
  'Rest & Recovery',
];

export function HealthScreen() {
  const {
    healthProfile,
    updateHealthProfile,
    weightCheckins,
    logWeight,
    deleteWeightCheckin,

    meals,
    addMeal,
    toggleMeal,
    deleteMeal,

    weeklySchedule,
    updateWorkoutDayPlan,
    addExerciseToDay,
    deleteExerciseFromDay,
    workoutRecords,
    toggleWorkoutDayCompleted,
    toggleExerciseCompleted,
    completedWorkoutDates,
    workoutStreak,
    todaysWorkoutDay,
    isTodayWorkoutCompleted,
  } = useData();

  // 1. Workouts first, then Meals, then Weight
  const [activeTab, setActiveTab] = useState<'workouts' | 'meals' | 'weight'>('workouts');

  const todayStr = getTodayDateStr();
  const currentDow = new Date().getDay();

  // ==========================================
  // WORKOUTS STATE
  // ==========================================
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [expandedDayDow, setExpandedDayDow] = useState<number | null>(currentDow);
  const [settingTypeDow, setSettingTypeDow] = useState<number | null>(null);
  const [customTypeInput, setCustomTypeInput] = useState('');

  // Add exercise state
  const [addingExerciseDow, setAddingExerciseDow] = useState<number | null>(null);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState('');

  const handleSetWorkoutType = (dow: number, typeName: string) => {
    const isRest = typeName.toLowerCase().includes('rest');
    updateWorkoutDayPlan(dow, {
      day_name: typeName,
      is_rest_day: isRest,
    });
    setSettingTypeDow(null);
    setCustomTypeInput('');
    setExpandedDayDow(dow);
  };

  const handleClearWorkoutType = (dow: number) => {
    updateWorkoutDayPlan(dow, {
      day_name: '',
      is_rest_day: false,
    });
  };

  const handleAddExerciseSubmit = (dow: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    addExerciseToDay(dow, {
      name: newExName.trim(),
      target_sets: parseInt(newExSets) || 3,
      target_reps: newExReps.trim() || '8-12',
      target_weight: parseFloat(newExWeight) || 0,
    });
    setNewExName('');
    setNewExSets('3');
    setNewExReps('10');
    setNewExWeight('');
    setAddingExerciseDow(null);
  };

  // Calendar calculations (Monday to Sunday headers)
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    // Convert 0=Sun to 6, 1=Mon to 0 for Monday-start calendar
    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const day = String(d).padStart(2, '0');
      days.push({ dateStr: `${y}-${m}-${day}`, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const m = String(month + 1).padStart(2, '0');
      const day = String(i).padStart(2, '0');
      days.push({ dateStr: `${year}-${m}-${day}`, dayNum: i, isCurrentMonth: true });
    }

    // Next month padding
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(i).padStart(2, '0');
      days.push({ dateStr: `${y}-${m}-${day}`, dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [calendarMonth]);

  // ==========================================
  // DAILY MEALS STATE
  // ==========================================
  const [selectedMealDate, setSelectedMealDate] = useState<string>(todayStr);
  const [newMealName, setNewMealName] = useState<string>('');
  const [newMealType, setNewMealType] = useState<string>('Meal');

  const selectedDateMeals = useMemo(() => {
    return meals.filter(m => m.date === selectedMealDate);
  }, [meals, selectedMealDate]);

  const selectedDateEatenCount = useMemo(() => {
    return selectedDateMeals.filter(m => m.completed).length;
  }, [selectedDateMeals]);

  const selectedDateMealsCount = useMemo(() => {
    return selectedDateMeals.length;
  }, [selectedDateMeals]);

  const handleAddMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    await addMeal({
      name: newMealName.trim(),
      date: selectedMealDate,
      meal_type: newMealType,
      completed: false,
    });
    setNewMealName('');
  };

  const handleDateShift = (deltaDays: number) => {
    const d = new Date(selectedMealDate + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedMealDate(`${year}-${month}-${day}`);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // ==========================================
  // WEIGHT JOURNEY STATE
  // ==========================================
  const [weightInput, setWeightInput] = useState<string>('');
  const [goalWeightInput, setGoalWeightInput] = useState<string>(
    healthProfile.goal_weight > 0 ? String(healthProfile.goal_weight) : ''
  );
  const [weightDateInput, setWeightDateInput] = useState<string>(todayStr);
  const [weightNotesInput, setWeightNotesInput] = useState<string>('');

  const weightChartData = useMemo(() => {
    const sorted = [...weightCheckins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weight,
      goal: healthProfile.goal_weight > 0 ? healthProfile.goal_weight : undefined,
    }));
  }, [weightCheckins, healthProfile.goal_weight]);

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    await logWeight(w, weightDateInput, weightNotesInput);
    setWeightInput('');
    setWeightNotesInput('');
  };

  const handleSetGoalWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const gw = parseFloat(goalWeightInput);
    if (isNaN(gw) || gw <= 0) return;
    await updateHealthProfile({ goal_weight: gw });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn text-[#181a18]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity size={13} />
            <span>Physical Architecture</span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl font-normal">Physical Architecture<span className="text-[var(--accent)]">.</span></h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-2xl">
            Program your weekly training schedule, log daily meals, and compound your physical vitality.
          </p>
        </div>

        {/* Tab Ordering: 1. Workouts, 2. Meals, 3. Weight */}
        <div className="bg-[#ecebe4] p-1.5 rounded-2xl flex items-center gap-1 shrink-0 text-xs font-bold shadow-inner overflow-x-auto max-w-full">
          {[
            { id: 'workouts', label: 'Workouts & Calendar', icon: Dumbbell },
            { id: 'meals', label: 'Daily Meals', icon: Utensils },
            { id: 'weight', label: 'Weight Journey', icon: Scale },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white text-[var(--ink)] shadow-sm font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon size={14} className={active ? 'text-[var(--accent)]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORKOUTS & CALENDAR (FIRST TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'workouts' && (
        <div className="space-y-8">
          {/* Top Row: Streak & Today's Workout Quick Status */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Workout Streak Card */}
            <div className="bg-white rounded-3xl p-7 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-1">
                  Consistency Vector
                </span>
                <h3 className="serif text-2xl font-normal">Workout Streak</h3>
                <p className="text-xs text-[var(--muted)] mt-1">Consecutive training days and historical completions.</p>
              </div>

              <div className="my-6 flex items-baseline gap-3">
                <span className="text-5xl font-bold text-[var(--ink)] flex items-center gap-2">
                  <Flame size={36} className="text-[#e66b4b]" />
                  {workoutStreak}
                </span>
                <span className="text-sm font-semibold text-[var(--muted)]">Day{workoutStreak !== 1 ? 's' : ''} active streak</span>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Total workouts completed:</span>
                <span className="font-bold text-[var(--ink)]">{completedWorkoutDates.length} sessions</span>
              </div>
            </div>

            {/* Today's Workout Checkoff Card */}
            <div className={`rounded-3xl p-7 border transition-all flex flex-col justify-between ${
              isTodayWorkoutCompleted
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-white border-[var(--line)] shadow-sm'
            }`}>
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                    Today's Training Focus
                  </span>
                  {todaysWorkoutDay.day_name ? (
                    todaysWorkoutDay.is_rest_day ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eae7e1] text-[var(--muted)]">
                        Rest Day
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-subtle)] text-[var(--accent)]">
                        Active Session
                      </span>
                    )
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eae7e1] text-[var(--muted)]">
                      Not Programmed
                    </span>
                  )}
                </div>

                <h3 className="serif text-2xl font-normal mt-1">
                  {todaysWorkoutDay.day_name || 'No Workout Assigned Yet'}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {todaysWorkoutDay.day_name
                    ? `${todaysWorkoutDay.exercises.length} planned exercise${todaysWorkoutDay.exercises.length !== 1 ? 's' : ''} for today.`
                    : 'Assign a workout type below for today to get started.'}
                </p>
              </div>

              <div className="my-6">
                <button
                  onClick={() => toggleWorkoutDayCompleted(todayStr)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer ${
                    isTodayWorkoutCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[var(--ink)] hover:bg-black text-white'
                  }`}
                >
                  <Check size={16} />
                  <span>{isTodayWorkoutCompleted ? "Workout Completed for Today ✓" : "Mark Today's Workout Complete"}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--line)]/60 text-xs text-[var(--muted)] flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-bold ${isTodayWorkoutCompleted ? 'text-emerald-700' : 'text-[var(--muted)]'}`}>
                  {isTodayWorkoutCompleted ? 'Completed ✓' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Workout Calendar with Dates When Worked Out Marked in Green */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[var(--line)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-0.5">
                  Visual Adherence Grid
                </span>
                <h3 className="serif text-2xl font-normal">Workout Calendar</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Dates when you worked out are marked in green. Remaining dates stay neutral with no color.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="p-2 rounded-xl border border-[var(--line)] hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[var(--ink)] px-3 py-1 bg-[#f8f7f4] rounded-xl border border-[var(--line)]">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="p-2 rounded-xl border border-[var(--line)] hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekday Headers: Mon to Sun */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cd, i) => {
                const isWorkedOut = !!workoutRecords[cd.dateStr]?.completed;
                const isToday = cd.dateStr === todayStr;

                return (
                  <div
                    key={i}
                    onClick={() => toggleWorkoutDayCompleted(cd.dateStr)}
                    className={`h-16 sm:h-20 rounded-2xl p-2 flex flex-col justify-between transition-all cursor-pointer border ${
                      isWorkedOut
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm hover:bg-emerald-700'
                        : isToday
                        ? 'bg-[#f8f7f4] border-[var(--ink)] text-[var(--ink)] hover:border-emerald-500'
                        : cd.isCurrentMonth
                        ? 'bg-transparent border-transparent hover:bg-[#f8f7f4] text-[var(--ink)] hover:border-[var(--line)]'
                        : 'bg-transparent border-transparent text-black/20'
                    }`}
                    title={isWorkedOut ? `Workout completed on ${cd.dateStr}` : `No workout on ${cd.dateStr}`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold ${isWorkedOut ? 'text-white' : ''}`}>
                        {cd.dayNum}
                      </span>
                      {isToday && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          isWorkedOut ? 'bg-white/20 text-white' : 'bg-[var(--ink)] text-white'
                        }`}>
                          Today
                        </span>
                      )}
                    </div>

                    {isWorkedOut ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white/90">
                        <Check size={12} />
                        <span className="hidden sm:inline">Done</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-transparent select-none">-</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Weekly Training Schedule: Listed Mon to Sun */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm space-y-6">
            <div className="pb-4 border-b border-[var(--line)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-0.5">
                Weekly Routine Builder
              </span>
              <h3 className="serif text-2xl font-normal">7-Day Training Schedule (Mon – Sun)</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Assign your workout type (e.g. Push, Pull, Legs) for each day, then click on any day to program its exercises.
              </p>
            </div>

            {/* List of All 7 Days: Mon to Sun */}
            <div className="space-y-4">
              {ORDERED_DAYS.map(dayInfo => {
                const dayPlan = weeklySchedule.find(d => d.day_of_week === dayInfo.dow) || {
                  id: `w-${dayInfo.dow}`,
                  day_of_week: dayInfo.dow,
                  day_name: '',
                  is_rest_day: false,
                  exercises: [],
                };

                const isToday = dayInfo.dow === currentDow;
                const isExpanded = expandedDayDow === dayInfo.dow;
                const hasWorkoutType = !!dayPlan.day_name.trim();
                const isSettingType = settingTypeDow === dayInfo.dow;
                const isAddingEx = addingExerciseDow === dayInfo.dow;

                const completedList = workoutRecords[todayStr]?.completed_exercises || [];

                return (
                  <div
                    key={dayInfo.dow}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isToday
                        ? 'border-[var(--ink)] bg-[#fdfdfc]'
                        : 'border-[var(--line)] bg-[#f8f7f4]/60'
                    }`}
                  >
                    {/* Day Card Header */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isToday
                            ? 'bg-[var(--ink)] text-white'
                            : 'bg-white border border-[var(--line)] text-[var(--ink)]'
                        }`}>
                          {dayInfo.short}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--ink)]">{dayInfo.name}</span>
                            {isToday && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-white">
                                Today
                              </span>
                            )}
                            {hasWorkoutType && dayPlan.is_rest_day && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eae7e1] text-[var(--muted)]">
                                Rest Day
                              </span>
                            )}
                          </div>

                          {hasWorkoutType ? (
                            <p className="text-xs font-semibold text-[var(--accent)] mt-0.5">
                              {dayPlan.day_name} · {dayPlan.exercises.length} exercise{dayPlan.exercises.length !== 1 ? 's' : ''}
                            </p>
                          ) : (
                            <p className="text-xs text-[var(--muted)] mt-0.5 italic">
                              No workout assigned yet
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!hasWorkoutType ? (
                          <button
                            onClick={() => setSettingTypeDow(isSettingType ? null : dayInfo.dow)}
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={13} />
                            <span>Add Workout Type</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setSettingTypeDow(isSettingType ? null : dayInfo.dow)}
                              className="px-2.5 py-1.5 rounded-xl bg-white border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                              title="Change Workout Type"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setExpandedDayDow(isExpanded ? null : dayInfo.dow)}
                              className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[#eae7e1] transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{isExpanded ? 'Hide Exercises' : `View Exercises (${dayPlan.exercises.length})`}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Workout Type Selector Form (Inline when clicking Add/Change Type) */}
                    {isSettingType && (
                      <div className="p-5 bg-white border-t border-[var(--line)] space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Choose Workout Type for {dayInfo.name}
                          </span>
                          <button
                            onClick={() => setSettingTypeDow(null)}
                            className="text-[var(--muted)] hover:text-[var(--ink)]"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {PRESET_WORKOUT_TYPES.map(pt => (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => handleSetWorkoutType(dayInfo.dow, pt)}
                              className="px-3 py-1.5 rounded-xl bg-[#f8f7f4] hover:bg-[#ecebe4] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] transition-colors cursor-pointer"
                            >
                              {pt}
                            </button>
                          ))}
                        </div>

                        {/* Custom Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={customTypeInput}
                            onChange={e => setCustomTypeInput(e.target.value)}
                            placeholder="Or type custom workout (e.g. Arms & Abs, Zone 2 Cardio)..."
                            className="flex-1 px-3.5 py-2 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            type="button"
                            disabled={!customTypeInput.trim()}
                            onClick={() => handleSetWorkoutType(dayInfo.dow, customTypeInput.trim())}
                            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Exercises Section */}
                    {hasWorkoutType && isExpanded && (
                      <div className="p-5 bg-white border-t border-[var(--line)] space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[var(--ink)]">
                              Exercises in {dayPlan.day_name}
                            </h4>
                            <p className="text-xs text-[var(--muted)]">
                              Add target exercises with sets, reps, and weights.
                            </p>
                          </div>

                          <button
                            onClick={() => setAddingExerciseDow(isAddingEx ? null : dayInfo.dow)}
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add Exercise</span>
                          </button>
                        </div>

                        {/* Add Exercise Inline Form */}
                        {isAddingEx && (
                          <form
                            onSubmit={e => handleAddExerciseSubmit(dayInfo.dow, e)}
                            className="p-4 rounded-2xl bg-[#f8f7f4] border-2 border-[var(--accent)]/30 space-y-3"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                                New Exercise for {dayInfo.name} ({dayPlan.day_name})
                              </span>
                              <button
                                type="button"
                                onClick={() => setAddingExerciseDow(null)}
                                className="text-[var(--muted)] hover:text-[var(--ink)]"
                              >
                                <X size={15} />
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
                                  Exercise Name
                                </label>
                                <input
                                  type="text"
                                  value={newExName}
                                  onChange={e => setNewExName(e.target.value)}
                                  placeholder="e.g. Barbell Bench Press, Incline DB Press"
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--line)] text-xs font-semibold focus:outline-none focus:border-[var(--accent)]"
                                  autoFocus
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
                                  Sets × Reps
                                </label>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={newExSets}
                                    onChange={e => setNewExSets(e.target.value)}
                                    placeholder="3"
                                    className="w-14 px-2 py-2 rounded-xl bg-white border border-[var(--line)] text-xs text-center font-semibold"
                                  />
                                  <span className="text-xs text-[var(--muted)]">×</span>
                                  <input
                                    type="text"
                                    value={newExReps}
                                    onChange={e => setNewExReps(e.target.value)}
                                    placeholder="10"
                                    className="w-16 px-2 py-2 rounded-xl bg-white border border-[var(--line)] text-xs text-center font-semibold"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
                                  Weight (kg)
                                </label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={newExWeight}
                                  onChange={e => setNewExWeight(e.target.value)}
                                  placeholder="Optional"
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--line)] text-xs font-semibold"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setAddingExerciseDow(null)}
                                className="px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
                              >
                                Add to Routine
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Exercises List or Empty State */}
                        {dayPlan.exercises.length === 0 ? (
                          <div className="py-8 px-4 text-center max-w-sm mx-auto">
                            <div className="w-10 h-10 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mx-auto mb-2">
                              <Dumbbell size={18} />
                            </div>
                            <p className="text-xs font-semibold text-[var(--ink)]">No exercises added yet</p>
                            <p className="text-[11px] text-[var(--muted)] mt-0.5 mb-3">
                              Add exercises to program your {dayPlan.day_name} workout session.
                            </p>
                            <button
                              onClick={() => setAddingExerciseDow(dayInfo.dow)}
                              className="px-3.5 py-1.5 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus size={12} />
                              <span>Add First Exercise</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {dayPlan.exercises.map(ex => {
                              const isDone = isToday && completedList.includes(ex.id);

                              return (
                                <div
                                  key={ex.id}
                                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                    isDone
                                      ? 'bg-emerald-50/60 border-emerald-200'
                                      : 'bg-[#f8f7f4] border-[var(--line)]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {isToday && (
                                      <button
                                        type="button"
                                        onClick={() => toggleExerciseCompleted(todayStr, ex.id)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                          isDone
                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                            : 'bg-white border-[var(--line)] text-transparent hover:border-[var(--accent)]'
                                        }`}
                                      >
                                        <Check size={11} className={isDone ? 'block' : 'hidden'} />
                                      </button>
                                    )}

                                    <div>
                                      <span className={`text-xs font-bold ${isDone ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'}`}>
                                        {ex.name}
                                      </span>
                                      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] mt-0.5">
                                        <span>{ex.target_sets || 3} sets × {ex.target_reps || '10'}</span>
                                        {ex.target_weight ? (
                                          <span>· {ex.target_weight} kg</span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isToday && (
                                      <button
                                        onClick={() => toggleExerciseCompleted(todayStr, ex.id)}
                                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                                          isDone
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                                        }`}
                                      >
                                        {isDone ? 'Done ✓' : 'Mark Done'}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteExerciseFromDay(dayInfo.dow, ex.id)}
                                      className="p-1 rounded-lg text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete exercise"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY MEALS (SECOND TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Date Navigator Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[var(--line)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateShift(-1)}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-4 py-1.5 bg-[#f8f7f4] rounded-full border border-[var(--line)] text-xs font-bold text-[var(--ink)]">
                {formatDisplayDate(selectedMealDate)} ({selectedMealDate})
              </div>
              <button
                onClick={() => handleDateShift(1)}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
              {selectedMealDate !== todayStr && (
                <button
                  onClick={() => setSelectedMealDate(todayStr)}
                  className="text-xs font-bold text-[var(--accent)] hover:underline ml-2 cursor-pointer"
                >
                  Jump to Today
                </button>
              )}
            </div>

            {/* Adherence Pill */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted)]">Daily Meal Adherence:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f1f0ea] text-[var(--ink)] border border-[var(--line)]">
                {selectedDateEatenCount} / {selectedDateMealsCount} eaten
                {selectedDateMealsCount > 0 ? ` (${Math.round((selectedDateEatenCount / selectedDateMealsCount) * 100)}%)` : ''}
              </span>
            </div>
          </div>

          {/* Quick Add Meal Bar */}
          <form onSubmit={handleAddMealSubmit} className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-3">
              Log What You Ate / Plan To Eat
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Meal Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Meal'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewMealType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      newMealType === type
                        ? 'bg-[var(--ink)] text-white font-bold'
                        : 'bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Input */}
              <input
                type="text"
                value={newMealName}
                onChange={e => setNewMealName(e.target.value)}
                placeholder="e.g. Oatmeal with blueberries, Grilled chicken bowl, Salmon & quinoa..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              />

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newMealName.trim()}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Add Meal</span>
              </button>
            </div>
          </form>

          {/* Meals List / Empty State */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
              <div>
                <h3 className="serif text-xl font-normal">Meals for {formatDisplayDate(selectedMealDate)}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Check off each item once you have eaten it.</p>
              </div>
              <span className="text-xs font-bold text-[var(--muted)]">
                {selectedDateMeals.length} item{selectedDateMeals.length !== 1 ? 's' : ''}
              </span>
            </div>

            {selectedDateMeals.length === 0 ? (
              /* Clean Empty State */
              <div className="py-14 px-6 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mx-auto mb-4">
                  <Utensils size={24} />
                </div>
                <h4 className="serif text-xl font-normal text-[var(--ink)] mb-1.5">No meals logged for {formatDisplayDate(selectedMealDate)}</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                  Plan what you want to eat or log what you've eaten to track your daily nutrition without friction.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['+ Breakfast', '+ Lunch', '+ Dinner', '+ Snack'].map(label => {
                    const type = label.replace('+ ', '');
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setNewMealType(type);
                          setNewMealName(`${type}: `);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#f8f7f4] hover:bg-[#eae7e1] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] transition-colors cursor-pointer"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Meals List */
              <div className="space-y-3">
                {selectedDateMeals.map(meal => (
                  <div
                    key={meal.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      meal.completed
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-[#f8f7f4] border-[var(--line)] hover:border-[var(--accent)]'
                    }`}
                  >
                    <div
                      onClick={() => toggleMeal(meal.id, selectedMealDate)}
                      className="flex items-center gap-3.5 flex-1 cursor-pointer"
                    >
                      <button
                        type="button"
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          meal.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-white border-[var(--line)] text-transparent hover:border-[var(--accent)]'
                        }`}
                      >
                        <Check size={13} className={meal.completed ? 'block' : 'hidden'} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            meal.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-[var(--muted)] border border-[var(--line)]'
                          }`}>
                            {meal.meal_type || 'Meal'}
                          </span>
                          <span className={`text-sm font-medium ${meal.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'}`}>
                            {meal.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMeal(meal.id, selectedMealDate)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          meal.completed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {meal.completed ? 'Eaten ✓' : 'Mark Eaten'}
                      </button>
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete meal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WEIGHT JOURNEY (THIRD TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'weight' && (
        <div className="space-y-8">
          {/* Header Stats Banner */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-1">
                Current Baseline
              </span>
              <span className="text-3xl font-bold text-[var(--ink)]">
                {healthProfile.current_weight > 0 ? `${healthProfile.current_weight} kg` : '--'}
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">Latest logged check-in</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-1">
                Target Goal Weight
              </span>
              <span className="text-3xl font-bold text-[var(--accent)]">
                {healthProfile.goal_weight > 0 ? `${healthProfile.goal_weight} kg` : '--'}
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">Physical bodyweight goal</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-1">
                Total Check-Ins
              </span>
              <span className="text-3xl font-bold text-[var(--ink)]">
                {weightCheckins.length}
              </span>
              <p className="text-xs text-[var(--muted)] mt-1">Recorded weigh-in milestones</p>
            </div>
          </div>

          {/* Form Row: Log Weight & Set Goal Weight */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Log Weight */}
            <form onSubmit={handleLogWeightSubmit} className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block">
                Record New Weigh-In
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    placeholder="e.g. 72.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Date</label>
                  <input
                    type="date"
                    value={weightDateInput}
                    onChange={e => setWeightDateInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={weightNotesInput}
                  onChange={e => setWeightNotesInput(e.target.value)}
                  placeholder="e.g. Fasted morning weigh-in, post-workout..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Log Weight Entry
              </button>
            </form>

            {/* Set Goal Weight */}
            <form onSubmit={handleSetGoalWeight} className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-1">
                  Target Physique Goal
                </span>
                <p className="text-xs text-[var(--muted)]">
                  Set your target body weight in kg. LifeOS will plot a reference target curve against your progress.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={goalWeightInput}
                  onChange={e => setGoalWeightInput(e.target.value)}
                  placeholder="e.g. 75.0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Update Target Goal
              </button>
            </form>
          </div>

          {/* Weight History Chart & Logs */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm">
            <div className="pb-6 mb-6 border-b border-[var(--line)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-0.5">
                Physical Compounding
              </span>
              <h3 className="serif text-2xl font-normal">Weight Progression Curve</h3>
            </div>

            {weightChartData.length === 0 ? (
              <div className="py-14 px-6 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mx-auto mb-3">
                  <Scale size={20} />
                </div>
                <h5 className="serif text-lg font-normal text-[var(--ink)] mb-1">
                  No weigh-in entries recorded yet
                </h5>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Log your baseline weight above to start tracking your physique progress and trajectory over time.
                </p>
              </div>
            ) : (
              <div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightChartData}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5f805d" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5f805d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#888" fontSize={11} tickLine={false} />
                      <Tooltip />
                      {healthProfile.goal_weight > 0 && (
                        <ReferenceLine
                          y={healthProfile.goal_weight}
                          stroke="#e66b4b"
                          strokeDasharray="3 3"
                          label={{ value: 'Target Goal', fill: '#e66b4b', fontSize: 10, position: 'insideTopRight' }}
                        />
                      )}
                      <Area type="monotone" dataKey="weight" stroke="#5f805d" strokeWidth={2.5} fillOpacity={1} fill="url(#weightGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Log history list */}
                <div className="mt-8 pt-6 border-t border-[var(--line)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-3">
                    Recent Weight Logs
                  </span>
                  <div className="space-y-2">
                    {weightCheckins.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f8f7f4] border border-[var(--line)]">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[var(--ink)]">{w.weight} kg</span>
                          <span className="text-xs text-[var(--muted)]">{w.date}</span>
                          {w.notes && <span className="text-xs text-[var(--muted)] italic">({w.notes})</span>}
                        </div>
                        <button
                          onClick={() => deleteWeightCheckin(w.id)}
                          className="p-1 text-[var(--muted)] hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
