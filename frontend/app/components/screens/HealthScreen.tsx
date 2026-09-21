'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Flame,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Scale,
  Edit2,
  X,
  Target,
  Sparkles,
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
  'Push',
  'Pull',
  'Legs',
  'Rest',
];

export function HealthScreen() {
  const {
    healthProfile,
    updateHealthProfile,
    weightCheckins,
    logWeight,
    deleteWeightCheckin,

    masterMeals,
    addMasterMealItem,
    deleteMasterMealItem,
    eatenMealsByDate,
    toggleDailyMealEaten,

    creatineLogs,
    toggleCreatine,
    isCreatineTakenToday,
    creatineStreak,

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
  // WORKOUTS POP-UP / MODAL STATE
  // ==========================================
  const [selectedModalDow, setSelectedModalDow] = useState<number | null>(null);
  const [settingTypeDow, setSettingTypeDow] = useState<number | null>(null);
  const [customTypeInput, setCustomTypeInput] = useState('');

  // Add exercise form state inside modal
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState('');
  const [isAddingExerciseInModal, setIsAddingExerciseInModal] = useState(false);

  // Compact Calendar Month State
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  const handleSetWorkoutType = (dow: number, typeName: string) => {
    const isRest = typeName.toLowerCase().includes('rest');
    updateWorkoutDayPlan(dow, {
      day_name: typeName,
      is_rest_day: isRest,
    });
    setSettingTypeDow(null);
    setCustomTypeInput('');
    // Open exercises modal for this day
    setSelectedModalDow(dow);
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
    setIsAddingExerciseInModal(false);
  };

  // Compact Calendar calculations (Monday to Sunday)
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

  // Active day plan for the pop-up modal
  const modalDayPlan = useMemo(() => {
    if (selectedModalDow === null) return null;
    return (
      weeklySchedule.find(d => d.day_of_week === selectedModalDow) || {
        id: `w-${selectedModalDow}`,
        day_of_week: selectedModalDow,
        day_name: '',
        is_rest_day: false,
        exercises: [],
      }
    );
  }, [weeklySchedule, selectedModalDow]);

  const modalDayInfo = useMemo(() => {
    if (selectedModalDow === null) return null;
    return ORDERED_DAYS.find(d => d.dow === selectedModalDow) || ORDERED_DAYS[0];
  }, [selectedModalDow]);

  // ==========================================
  // DAILY MEALS STATE (MASTER FIXED LIST + DAILY EATEN CHECKLIST)
  // ==========================================
  const [selectedMealDate, setSelectedMealDate] = useState<string>(todayStr);
  const [newMealName, setNewMealName] = useState<string>('');
  const [newMealType, setNewMealType] = useState<string>('Meal');

  const selectedDateEatenIds = useMemo(() => {
    return eatenMealsByDate[selectedMealDate] || [];
  }, [eatenMealsByDate, selectedMealDate]);

  const selectedDateEatenCount = useMemo(() => {
    return masterMeals.filter(m => selectedDateEatenIds.includes(m.id)).length;
  }, [masterMeals, selectedDateEatenIds]);

  const handleAddMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    addMasterMealItem({
      name: newMealName.trim(),
      meal_type: newMealType,
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
      {/* Top Header with Tab Selector & Small Streak Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              <Activity size={13} />
              <span>Physical Architecture</span>
            </div>

            {/* Small Recognizable Streak Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shadow-xs">
              <Flame size={13} className="text-[#e66b4b]" />
              <span>{workoutStreak}d streak</span>
            </div>
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
          {/* Top Row: Compact Calendar (Left) & Today's Workout Focus + Creatine Intake (Right) */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Small Compact Calendar */}
            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--line)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block">
                    Activity History
                  </span>
                  <h3 className="serif text-xl font-normal text-[var(--ink)]">
                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Weekday Headers: Mon to Sun */}
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Compact Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cd, i) => {
                  const isWorkedOut = !!workoutRecords[cd.dateStr]?.completed;
                  const isToday = cd.dateStr === todayStr;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleWorkoutDayCompleted(cd.dateStr)}
                      className={`h-7 sm:h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                        isWorkedOut
                          ? 'bg-emerald-600 text-white shadow-xs font-bold hover:bg-emerald-700'
                          : isToday
                          ? 'bg-[#f1f0ea] text-[var(--ink)] border border-[var(--ink)] font-bold'
                          : cd.isCurrentMonth
                          ? 'bg-transparent text-[var(--ink)] hover:bg-[#f8f7f4]'
                          : 'bg-transparent text-black/15'
                      }`}
                      title={isWorkedOut ? `Completed on ${cd.dateStr}` : `No workout on ${cd.dateStr}`}
                    >
                      {cd.dayNum}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--muted)]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Worked out (Green)</span>
                </div>
                <span>{completedWorkoutDates.length} logged sessions</span>
              </div>
            </div>

            {/* Right Column: Today's Training Focus & Creatine Intake (Halved & Stacked) */}
            <div className="flex flex-col gap-4 justify-between">
              {/* Card 1: Today's Training Focus (Top Half) */}
              <div className={`rounded-3xl p-5 border transition-all flex flex-col justify-between flex-1 ${
                isTodayWorkoutCompleted
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-white border-[var(--line)] shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
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

                <div className="my-2">
                  <h4 className="serif text-xl font-normal text-[var(--ink)]">
                    {todaysWorkoutDay.day_name || 'No Workout Assigned'}
                  </h4>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    {todaysWorkoutDay.day_name
                      ? `${todaysWorkoutDay.exercises.length} planned exercise${todaysWorkoutDay.exercises.length !== 1 ? 's' : ''}`
                      : 'Set workout type below to schedule today.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWorkoutDayCompleted(todayStr)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    isTodayWorkoutCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[var(--ink)] hover:bg-black text-white'
                  }`}
                >
                  <Check size={14} />
                  <span>{isTodayWorkoutCompleted ? "Workout Completed Today ✓" : "Mark Workout Complete"}</span>
                </button>
              </div>

              {/* Card 2: Creatine Intake Card (Bottom Half) */}
              <div className={`rounded-3xl p-5 border transition-all flex flex-col justify-between flex-1 ${
                isCreatineTakenToday
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-white border-[var(--line)] shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                      Daily Supplement
                    </span>
                    {creatineStreak > 0 && (
                      <span className="text-[10px] font-bold text-[#e66b4b] flex items-center gap-0.5">
                        <Flame size={11} />
                        {creatineStreak}d
                      </span>
                    )}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isCreatineTakenToday
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#eae7e1] text-[var(--muted)]'
                  }`}>
                    {isCreatineTakenToday ? 'Taken Today ✓' : 'Pending'}
                  </span>
                </div>

                <div className="my-2">
                  <h4 className="serif text-xl font-normal text-[var(--ink)] flex items-center gap-2">
                    <span>Creatine Intake</span>
                    <Sparkles size={16} className="text-[var(--accent)]" />
                  </h4>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Daily 5g monohydrate for physical & cognitive energy
                  </p>
                </div>

                {/* Yes / No Toggle buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCreatine(todayStr, true)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCreatineTakenToday
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-[#f8f7f4] hover:bg-[#ecebe4] border border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    <Check size={13} />
                    <span>Yes, Taken</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCreatine(todayStr, false)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      !isCreatineTakenToday
                        ? 'bg-[var(--ink)] text-white shadow-xs'
                        : 'bg-[#f8f7f4] hover:bg-[#ecebe4] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <X size={13} />
                    <span>No / Pending</span>
                  </button>
                </div>
              </div>
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
                Click on any day to program its workout type and exercises in the interactive pop-up.
              </p>
            </div>

            {/* List of All 7 Days: Mon to Sun */}
            <div className="space-y-3">
              {ORDERED_DAYS.map(dayInfo => {
                const dayPlan = weeklySchedule.find(d => d.day_of_week === dayInfo.dow) || {
                  id: `w-${dayInfo.dow}`,
                  day_of_week: dayInfo.dow,
                  day_name: '',
                  is_rest_day: false,
                  exercises: [],
                };

                const isToday = dayInfo.dow === currentDow;
                const hasWorkoutType = !!dayPlan.day_name.trim();
                const isSettingType = settingTypeDow === dayInfo.dow;

                return (
                  <div key={dayInfo.dow}>
                    <div
                      onClick={() => {
                        if (!hasWorkoutType) {
                          setSettingTypeDow(isSettingType ? null : dayInfo.dow);
                        } else {
                          setSelectedModalDow(dayInfo.dow);
                        }
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isToday
                          ? 'border-[var(--ink)] bg-[#fdfdfc] shadow-xs'
                          : 'border-[var(--line)] bg-[#f8f7f4]/60 hover:bg-[#f8f7f4] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
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
                              No workout assigned yet (Tap to set)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!hasWorkoutType ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomTypeInput('');
                              setSettingTypeDow(isSettingType ? null : dayInfo.dow);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus size={13} />
                            <span>Set Workout Type</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalDow(dayInfo.dow);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[#eae7e1] transition-colors cursor-pointer"
                            >
                              Open Exercises ({dayPlan.exercises.length})
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomTypeInput(dayPlan.day_name || '');
                                setSettingTypeDow(isSettingType ? null : dayInfo.dow);
                              }}
                              className="p-2 rounded-xl bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#eae7e1] transition-colors cursor-pointer"
                              title={`Edit ${dayInfo.name} workout type`}
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Type Selector when setting type for an unprogrammed day */}
                    {isSettingType && (
                      <div className="mt-2 p-5 bg-white rounded-2xl border border-[var(--line)] shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            {hasWorkoutType ? `Edit Workout Type for ${dayInfo.name}` : `Choose Workout Type for ${dayInfo.name}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSettingTypeDow(null)}
                            className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Presets */}
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
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={customTypeInput}
                            onChange={e => setCustomTypeInput(e.target.value)}
                            placeholder="Or type custom workout name (e.g. Chest & Triceps)..."
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BEAUTIFUL DAY EXERCISES POP-UP / MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedModalDow !== null && modalDayPlan && modalDayInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedModalDow(null);
                setIsAddingExerciseInModal(false);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Pop-up Header */}
              <div className="p-6 border-b border-[var(--line)] bg-[#f8f7f4] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                      {modalDayInfo.name} Routine
                    </span>
                    {modalDayPlan.day_of_week === currentDow && (
                      <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-[var(--accent)] text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <h3 className="serif text-2xl font-normal text-[var(--ink)] mt-0.5">
                    {modalDayPlan.day_name || 'Unassigned Workout'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSettingTypeDow(modalDayPlan.day_of_week);
                      setSelectedModalDow(null);
                    }}
                    className="p-2 rounded-xl bg-white border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                    title="Change Workout Type"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModalDow(null);
                      setIsAddingExerciseInModal(false);
                    }}
                    className="p-2 rounded-xl bg-white border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Pop-up Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Exercises Top Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Target Exercises ({modalDayPlan.exercises.length})
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsAddingExerciseInModal(!isAddingExerciseInModal)}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Exercise</span>
                  </button>
                </div>

                {/* Add Exercise Form inside modal */}
                {isAddingExerciseInModal && (
                  <form
                    onSubmit={e => handleAddExerciseSubmit(modalDayPlan.day_of_week, e)}
                    className="p-4 rounded-2xl bg-[#f8f7f4] border-2 border-[var(--accent)]/30 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                        Add Exercise to {modalDayPlan.day_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingExerciseInModal(false)}
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
                          placeholder="e.g. Incline Dumbbell Press"
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
                        onClick={() => setIsAddingExerciseInModal(false)}
                        className="px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
                      >
                        Add Exercise
                      </button>
                    </div>
                  </form>
                )}

                {/* Exercises List or Clean Empty State */}
                {modalDayPlan.exercises.length === 0 ? (
                  <div className="py-12 px-6 text-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mx-auto mb-3">
                      <Dumbbell size={22} />
                    </div>
                    <h5 className="serif text-lg font-normal text-[var(--ink)] mb-1">
                      No exercises programmed yet
                    </h5>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                      Add target exercises with your sets and reps to complete this session blueprint.
                    </p>
                    <button
                      onClick={() => setIsAddingExerciseInModal(true)}
                      className="px-4 py-2 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>+ Add First Exercise</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {modalDayPlan.exercises.map(ex => {
                      const isToday = modalDayPlan.day_of_week === currentDow;
                      const completedList = workoutRecords[todayStr]?.completed_exercises || [];
                      const isDone = isToday && completedList.includes(ex.id);

                      return (
                        <div
                          key={ex.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            isDone
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-[#f8f7f4] border-[var(--line)]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
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
                              <span className={`text-sm font-bold ${isDone ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'}`}>
                                {ex.name}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                                <span>{ex.target_sets || 3} sets × {ex.target_reps || '10'} reps</span>
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
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                              >
                                {isDone ? 'Done ✓' : 'Mark Done'}
                              </button>
                            )}
                            <button
                              onClick={() => deleteExerciseFromDay(modalDayPlan.day_of_week, ex.id)}
                              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete exercise"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pop-up Footer */}
              <div className="p-4 border-t border-[var(--line)] bg-[#f8f7f4] flex items-center justify-between">
                <span className="text-xs text-[var(--muted)] font-medium">
                  {modalDayPlan.exercises.length} exercise{modalDayPlan.exercises.length !== 1 ? 's' : ''} programmed
                </span>

                <div className="flex items-center gap-2">
                  {modalDayPlan.day_of_week === currentDow && (
                    <button
                      type="button"
                      onClick={() => toggleWorkoutDayCompleted(todayStr)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isTodayWorkoutCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[var(--ink)] hover:bg-black text-white'
                      }`}
                    >
                      {isTodayWorkoutCompleted ? 'Mark Pending' : 'Mark Session Complete ✓'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModalDow(null);
                      setIsAddingExerciseInModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-[#eae7e1] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* TAB 2: DAILY MEALS (SECOND TAB) */}
      {/* ========================================================================= */}
      {activeTab === 'meals' && (
        <div className="space-y-6">
          {/* Date Navigator Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[var(--line)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
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
                type="button"
                onClick={() => handleDateShift(1)}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
              {selectedMealDate !== todayStr && (
                <button
                  type="button"
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
                {selectedDateEatenCount} / {masterMeals.length} eaten
                {masterMeals.length > 0 ? ` (${Math.round((selectedDateEatenCount / masterMeals.length) * 100)}%)` : ''}
              </span>
            </div>
          </div>

          {/* Add Item to Fixed Daily Meal Plan Bar */}
          <form onSubmit={handleAddMealSubmit} className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] block mb-3">
              Add To Daily Meal Blueprint (Fixed Master List)
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
                placeholder="e.g. 4 Eggs + Sourdough, Chicken & Jasmine Rice, Whey Shake..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              />

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newMealName.trim()}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Add To Daily Plan</span>
              </button>
            </div>
          </form>

          {/* Master Meals List / Empty State */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
              <div>
                <h3 className="serif text-xl font-normal">Daily Meals Checklist · {formatDisplayDate(selectedMealDate)}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Your fixed daily meal routine. Mark each item eaten for {formatDisplayDate(selectedMealDate)}.</p>
              </div>
              <span className="text-xs font-bold text-[var(--muted)]">
                {masterMeals.length} item{masterMeals.length !== 1 ? 's' : ''} in blueprint
              </span>
            </div>

            {masterMeals.length === 0 ? (
              /* Clean Empty State */
              <div className="py-14 px-6 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] text-[var(--muted)] flex items-center justify-center mx-auto mb-4">
                  <Utensils size={24} />
                </div>
                <h4 className="serif text-xl font-normal text-[var(--ink)] mb-1.5">No meals in your daily blueprint yet</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                  Add the meals you eat daily above. They will stay fixed on your daily checklist every single day so you can mark them off with 1 tap.
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
                {masterMeals.map(meal => {
                  const isEaten = selectedDateEatenIds.includes(meal.id);

                  return (
                    <div
                      key={meal.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isEaten
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-[#f8f7f4] border-[var(--line)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div
                        onClick={() => toggleDailyMealEaten(selectedMealDate, meal.id)}
                        className="flex items-center gap-3.5 flex-1 cursor-pointer"
                      >
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isEaten
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-[var(--line)] text-transparent hover:border-[var(--accent)]'
                          }`}
                        >
                          <Check size={13} className={isEaten ? 'block' : 'hidden'} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                              isEaten ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-[var(--muted)] border border-[var(--line)]'
                            }`}>
                              {meal.meal_type || 'Meal'}
                            </span>
                            <span className={`text-sm font-medium ${isEaten ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'}`}>
                              {meal.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleDailyMealEaten(selectedMealDate, meal.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isEaten
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {isEaten ? 'Eaten ✓' : 'Mark Eaten'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMasterMealItem(meal.id)}
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from daily meal plan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
