'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Dumbbell,
  Apple,
  TrendingUp,
  Droplets,
  Plus,
  Trash2,
  Check,
  Flame,
  Target,
  Sparkles,
  ChevronRight,
  Sliders,
  Scale,
  Calendar,
  AlertCircle,
  Zap,
  Info,
  Clock,
  Edit2,
  X,
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
import { useAuth } from '../../context/AuthContext';
import { useData, getTodayDateStr } from '../../context/DataContext';
import {
  Food,
  BiologicalSex,
  ActivityLevel,
  TrainingFocus,
} from '../../types';

export function HealthScreen() {
  const { user } = useAuth();
  const {
    healthProfile,
    onboardHealth,
    updateHealthProfile,
    foods,
    foodLogs,
    todayMacros,
    addFood,
    deleteFood,
    logFood,
    deleteFoodLog,
    logStapleFast,
    dailyHealthStatus,
    logWater,
    toggleCreatine,
    weightCheckins,
    logWeight,
    deleteWeightCheckin,
    workoutPlan,
    todayWorkoutDay,
    todayWorkoutLogs,
    toggleWorkoutExercise,
    setWorkoutFrequency,
  } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'workout' | 'progress' | 'settings'>('overview');

  // Nutrition state
  const [selectedFoodId, setSelectedFoodId] = useState<string>(foods[0]?.id || '');
  const [servingsInput, setServingsInput] = useState<string>('1');
  const [isFoodLibraryOpen, setIsFoodLibraryOpen] = useState(false);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodServing, setNewFoodServing] = useState('1 serving');
  const [newFoodCals, setNewFoodCals] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');
  const [newFoodIsStaple, setNewFoodIsStaple] = useState(false);

  // Weight check-in state
  const [weightInput, setWeightInput] = useState<string>('');
  const [weightDateInput, setWeightDateInput] = useState<string>(getTodayDateStr());
  const [weightNotesInput, setWeightNotesInput] = useState<string>('');

  // Workout state
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Health Setup / Settings form state
  const [setupWeight, setSetupWeight] = useState<string>(String(healthProfile.current_weight || 49.2));
  const [setupGoalWeight, setSetupGoalWeight] = useState<string>(String(healthProfile.goal_weight || 57.0));
  const [setupHeight, setSetupHeight] = useState<string>(String(healthProfile.height_cm || 176));
  const [setupAge, setSetupAge] = useState<string>(String(healthProfile.age || 24));
  const [setupSex, setSetupSex] = useState<BiologicalSex>(healthProfile.biological_sex || 'male');
  const [setupActivity, setSetupActivity] = useState<ActivityLevel>(healthProfile.activity_level || 'moderate');
  const [setupFocus, setSetupFocus] = useState<TrainingFocus>(healthProfile.training_focus || 'hypertrophy');
  const [setupFrequency, setSetupFrequency] = useState<number>(healthProfile.training_frequency || 4);
  const [setupCalories, setSetupCalories] = useState<string>(String(healthProfile.target_calories || 2400));
  const [setupProtein, setSetupProtein] = useState<string>(String(healthProfile.target_protein || 120));
  const [setupWater, setSetupWater] = useState<string>(String(healthProfile.target_water_ml || 2500));

  // Weight Journey Metrics
  const startingWeight = useMemo(() => {
    if (weightCheckins.length === 0) return healthProfile.current_weight;
    const sorted = [...weightCheckins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted[0].weight;
  }, [weightCheckins, healthProfile.current_weight]);

  const currentWeight = healthProfile.current_weight;
  const goalWeight = healthProfile.goal_weight;
  const totalWeightChange = Math.round((currentWeight - startingWeight) * 10) / 10;
  const remainingWeight = Math.round(Math.max(0, goalWeight - currentWeight) * 10) / 10;
  const weightJourneyProgress = useMemo(() => {
    const totalDiff = goalWeight - startingWeight;
    if (totalDiff <= 0) return 100;
    const gained = currentWeight - startingWeight;
    return Math.min(100, Math.max(0, Math.round((gained / totalDiff) * 100)));
  }, [startingWeight, currentWeight, goalWeight]);

  // Today's food logs
  const todayStr = getTodayDateStr();
  const todaysFoodLogs = useMemo(() => {
    return foodLogs.filter(fl => fl.date === todayStr);
  }, [foodLogs, todayStr]);

  // Staple foods list
  const stapleFoods = useMemo(() => {
    return foods.filter(f => f.is_staple);
  }, [foods]);

  // Active workout day selection
  const currentWorkoutDay = useMemo(() => {
    if (!workoutPlan?.days || workoutPlan.days.length === 0) return null;
    return workoutPlan.days[selectedDayIndex] || workoutPlan.days[0];
  }, [workoutPlan, selectedDayIndex]);

  // Weight chart data
  const weightChartData = useMemo(() => {
    const sorted = [...weightCheckins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weight,
      goal: goalWeight,
    }));
  }, [weightCheckins, goalWeight]);

  // Handlers
  const handleAddCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;
    await addFood({
      name: newFoodName.trim(),
      serving_description: newFoodServing.trim() || '1 serving',
      calories: parseFloat(newFoodCals) || 0,
      protein: parseFloat(newFoodProtein) || 0,
      carbs: parseFloat(newFoodCarbs) || 0,
      fat: parseFloat(newFoodFat) || 0,
      is_staple: newFoodIsStaple,
    });
    setNewFoodName('');
    setNewFoodCals('');
    setNewFoodProtein('');
    setNewFoodCarbs('');
    setNewFoodFat('');
    setIsAddFoodOpen(false);
  };

  const handleLogFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoodId) return;
    const s = parseFloat(servingsInput) || 1.0;
    await logFood(selectedFoodId, s, todayStr);
    setServingsInput('1');
  };

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    await logWeight(w, weightDateInput, weightNotesInput);
    setWeightInput('');
    setWeightNotesInput('');
  };

  const handleSaveHealthSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onboardHealth({
      current_weight: parseFloat(setupWeight) || 49.2,
      goal_weight: parseFloat(setupGoalWeight) || 57.0,
      height_cm: parseFloat(setupHeight) || 176,
      age: parseInt(setupAge) || 24,
      biological_sex: setupSex,
      activity_level: setupActivity,
      training_focus: setupFocus,
      training_frequency: setupFrequency,
      target_calories: parseInt(setupCalories) || 2400,
      target_protein: parseInt(setupProtein) || 120,
      target_water_ml: parseInt(setupWater) || 2500,
    });
    setActiveTab('overview');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn text-[#181a18]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity size={13} />
            <span>Health & Strength Engine · Steady Architecture</span>
          </div>
          <h1 className="serif text-4xl sm:text-5xl font-normal">Physical Architecture<span className="text-[var(--accent)]">.</span></h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-2xl">
            Systematic nutrition, progressive hypertrophy, and compounded physical progress.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="bg-[#ecebe4] p-1.5 rounded-2xl flex items-center gap-1 shrink-0 text-xs font-bold shadow-inner overflow-x-auto max-w-full">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'nutrition', label: 'Nutrition', icon: Apple },
            { id: 'workout', label: 'Workout', icon: Dumbbell },
            { id: 'progress', label: 'Progress', icon: Scale },
            { id: 'settings', label: 'Settings', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--ink)] text-white shadow-md'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Row: Weight Journey & Today Nutrition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weight Journey Banner (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-1.5">
                    <Scale size={14} className="text-[var(--accent)]" /> Weight Journey
                  </span>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Log check-in <ChevronRight size={13} />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Starting</span>
                    <span className="serif text-xl sm:text-2xl font-normal text-[var(--ink)] mt-1 block">{startingWeight} kg</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20">
                    <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block">Current</span>
                    <span className="serif text-2xl sm:text-3xl font-normal text-[var(--ink)] mt-0.5 block">{currentWeight} kg</span>
                    <span className="text-[10px] font-bold text-[var(--sage)] mt-0.5 block">+{totalWeightChange} kg gained</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">Goal</span>
                    <span className="serif text-xl sm:text-2xl font-normal text-[var(--ink)] mt-1 block">{goalWeight} kg</span>
                    <span className="text-[10px] font-semibold text-[var(--muted)] mt-0.5 block">{remainingWeight} kg to go</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-[var(--muted)]">Progress toward target</span>
                    <span className="text-[var(--accent)] font-bold">{weightJourneyProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#ecebe4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                      style={{ width: `${weightJourneyProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Phase: Lean Hypertrophy Surplus (+350 kcal/day)</span>
                <span className="font-semibold text-[var(--ink)]">4x Weekly Strength</span>
              </div>
            </div>

            {/* Today's Nutrition Snapshot (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-1.5">
                    <Apple size={14} className="text-[var(--accent)]" /> Today's Nutrition
                  </span>
                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Open log <ChevronRight size={13} />
                  </button>
                </div>

                {/* Calories Big Gauge */}
                <div className="mt-4 flex items-baseline justify-between border-b border-[var(--line)] pb-3">
                  <div>
                    <span className="serif text-3xl font-normal text-[var(--ink)]">{todayMacros.calories}</span>
                    <span className="text-xs font-semibold text-[var(--muted)] ml-1">/ {todayMacros.target_calories} kcal</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    todayMacros.calories >= todayMacros.target_calories * 0.85
                      ? 'bg-[var(--sage-light)] text-[var(--sage)] border border-[var(--sage)]/20'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {Math.round((todayMacros.calories / todayMacros.target_calories) * 100)}% target
                  </span>
                </div>

                {/* Macro Bars */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[var(--ink)]">Protein</span>
                      <span className="text-[var(--muted)]">{todayMacros.protein}g / {todayMacros.target_protein}g</span>
                    </div>
                    <div className="w-full h-2 bg-[#ecebe4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full"
                        style={{ width: `${Math.min(100, (todayMacros.protein / todayMacros.target_protein) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[var(--ink)]">Carbohydrates</span>
                      <span className="text-[var(--muted)]">{todayMacros.carbs}g / {todayMacros.target_carbs}g</span>
                    </div>
                    <div className="w-full h-2 bg-[#ecebe4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--sage)] rounded-full"
                        style={{ width: `${Math.min(100, (todayMacros.carbs / todayMacros.target_carbs) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[var(--ink)]">Fats</span>
                      <span className="text-[var(--muted)]">{todayMacros.fat}g / {todayMacros.target_fat}g</span>
                    </div>
                    <div className="w-full h-2 bg-[#ecebe4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#d97706] rounded-full"
                        style={{ width: `${Math.min(100, (todayMacros.fat / todayMacros.target_fat) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Tap Quick Staples in Overview */}
              <div className="mt-5 pt-4 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">1-Tap Staple Log</span>
                <div className="flex flex-wrap gap-1.5">
                  {stapleFoods.slice(0, 4).map(food => (
                    <button
                      key={food.id}
                      onClick={() => logStapleFast(food)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#f8f7f4] hover:bg-[#f1f0ea] border border-[var(--line)] text-[var(--ink)] transition-colors cursor-pointer"
                    >
                      + {food.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Hydration, Creatine, Today's Workout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hydration Card */}
            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-1.5">
                    <Droplets size={14} className="text-blue-500" /> Hydration
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {(dailyHealthStatus.water_ml / 1000).toFixed(2)} L / {(healthProfile.target_water_ml / 1000).toFixed(1)} L
                  </span>
                </div>

                <div className="mt-4">
                  <div className="w-full h-2.5 bg-[#ecebe4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (dailyHealthStatus.water_ml / healthProfile.target_water_ml) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center gap-2">
                <button
                  onClick={() => logWater(250)}
                  className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors border border-blue-200 cursor-pointer"
                >
                  +250 ml
                </button>
                <button
                  onClick={() => logWater(500)}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  +500 ml
                </button>
              </div>
            </div>

            {/* Creatine Card */}
            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-1.5">
                    <Zap size={14} className="text-purple-500" /> Creatine Daily
                  </span>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    5g target
                  </span>
                </div>

                <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
                  5 grams daily for phosphocreatine muscle saturation and power capacity.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <button
                  onClick={toggleCreatine}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    dailyHealthStatus.creatine_completed
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-[#f8f7f4] text-[var(--ink)] border border-[var(--line)] hover:bg-[#f1f0ea]'
                  }`}
                >
                  <Check size={14} className={dailyHealthStatus.creatine_completed ? 'text-white' : 'text-[var(--muted)]'} />
                  <span>{dailyHealthStatus.creatine_completed ? 'Completed Today (5g)' : 'Mark 5g Completed'}</span>
                </button>
              </div>
            </div>

            {/* Today's Workout Card */}
            <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-1.5">
                    <Dumbbell size={14} className="text-[var(--accent)]" /> Today's Split
                  </span>
                  <span className="text-xs font-bold text-[var(--ink)]">
                    {todayWorkoutDay?.day_name.split(' ')[0] || 'Push'}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-semibold text-[var(--muted)] block">
                    {todayWorkoutLogs.filter(wl => wl.completed).length} / {todayWorkoutDay?.exercises?.length || 5} exercises completed
                  </span>
                  <div className="w-full h-2 bg-[#ecebe4] rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all"
                      style={{
                        width: `${
                          (todayWorkoutLogs.filter(wl => wl.completed).length / Math.max(1, todayWorkoutDay?.exercises?.length || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <button
                  onClick={() => setActiveTab('workout')}
                  className="w-full py-2.5 rounded-xl bg-[var(--ink)] text-white hover:bg-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>Open Workout</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NUTRITION TAB */}
      {/* ========================================================================= */}
      {activeTab === 'nutrition' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 1-Tap Staple Bar */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="serif text-2xl font-normal text-[var(--ink)]">1-Tap Staple Foods</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Log routine meals and snacks with a single touch</p>
              </div>
              <button
                onClick={() => setIsFoodLibraryOpen(true)}
                className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Food Library ({foods.length}) <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {stapleFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => logStapleFast(food)}
                  className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#f8f7f4] hover:bg-[var(--accent-subtle)] border border-[var(--line)] hover:border-[var(--accent)]/30 transition-all cursor-pointer text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                    +
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--ink)] block">{food.name}</span>
                    <span className="text-[10px] text-[var(--muted)] font-medium">
                      {food.calories} kcal · {food.protein}g protein
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nutrition Grid: Logger & Today's Meals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Custom Log Meal Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
              <h3 className="serif text-2xl font-normal text-[var(--ink)] mb-4">Log Food or Meal</h3>
              <form onSubmit={handleLogFoodSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Select Food Item
                  </label>
                  <select
                    value={selectedFoodId}
                    onChange={e => setSelectedFoodId(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                  >
                    {foods.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal, {f.protein}g P)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Servings (e.g. 1, 2, 1.5)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="20"
                    value={servingsInput}
                    onChange={e => setServingsInput(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Add to Daily Log
                </button>
              </form>
            </div>

            {/* Today's Meals List (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="serif text-2xl font-normal text-[var(--ink)]">Today's Logged Items</h3>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  {todaysFoodLogs.length} items logged
                </span>
              </div>

              {todaysFoodLogs.length === 0 ? (
                <div className="p-8 text-center bg-[#f8f7f4] rounded-2xl border border-dashed border-[var(--line)]">
                  <p className="text-xs text-[var(--muted)]">No foods logged today yet. Tap a staple above or log a meal!</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {todaysFoodLogs.map(log => {
                    const food = log.food_details || foods.find(f => f.id === log.food);
                    if (!food) return null;
                    const cals = Math.round(food.calories * log.servings);
                    const prot = Math.round(food.protein * log.servings * 10) / 10;
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] hover:border-[var(--accent)]/30 transition-all"
                      >
                        <div>
                          <span className="text-xs font-bold text-[var(--ink)] block">
                            {log.servings > 1 ? `${log.servings} × ` : ''}{food.name}
                          </span>
                          <span className="text-[11px] text-[var(--muted)] font-medium">
                            {food.serving_description} · {cals} kcal · {prot}g protein
                          </span>
                        </div>
                        <button
                          onClick={() => deleteFoodLog(log.id)}
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WORKOUT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'workout' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Split Selector & Routine Settings */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="serif text-2xl font-normal text-[var(--ink)]">Workout Routine & Split</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Current split: {healthProfile.training_frequency}-Day Hypertrophy Program</p>
              </div>

              {/* Frequency Selector */}
              <div className="flex items-center gap-1 bg-[#ecebe4] p-1 rounded-xl shadow-inner self-start sm:self-auto">
                {[3, 4, 5, 6].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setWorkoutFrequency(freq)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      healthProfile.training_frequency === freq
                        ? 'bg-[var(--ink)] text-white shadow-sm'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {freq}-Day
                  </button>
                ))}
              </div>
            </div>

            {/* Days Horizontal Tabs */}
            {workoutPlan?.days && workoutPlan.days.length > 0 && (
              <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
                {workoutPlan.days.map((day, idx) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      selectedDayIndex === idx
                        ? 'bg-[var(--ink)] text-white shadow-sm'
                        : 'bg-[#f8f7f4] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                    }`}
                  >
                    {day.day_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Workout Day View */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Day Focus
                </span>
                <h2 className="serif text-3xl font-normal text-[var(--ink)] mt-0.5">
                  {currentWorkoutDay?.day_name || 'Workout Day'}
                </h2>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {currentWorkoutDay?.exercises?.length || 0} Exercises
              </span>
            </div>

            {/* Exercises List */}
            <div className="space-y-3">
              {currentWorkoutDay?.exercises?.map((we, index) => {
                const exName = typeof we.exercise === 'string' ? (we.exercise_details?.name || 'Exercise') : we.exercise.name;
                const muscle = we.exercise_details?.muscle_group || 'Compound';
                const log = todayWorkoutLogs.find(l => l.workout_exercise === we.id);
                const isDone = !!log?.completed;

                return (
                  <div
                    key={we.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-[var(--sage-light)]/40 border-[var(--sage)]/30'
                        : 'bg-[#f8f7f4] border border-[var(--line)] hover:border-[var(--accent)]/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-white border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--ink)] shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[var(--ink)]">{exName}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#ecebe4] text-[var(--muted)] uppercase">
                              {muscle}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--muted)] font-medium mt-1 block">
                            Target: {we.target_sets} sets × {we.target_reps} reps · {we.target_weight} kg
                          </span>
                        </div>
                      </div>

                      {/* Right Action: Checkmark Complete */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={() => toggleWorkoutExercise(we.id, !isDone)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isDone
                              ? 'bg-[var(--sage)] text-white shadow-sm'
                              : 'bg-white text-[var(--ink)] border border-[var(--line)] hover:bg-[#f1f0ea]'
                          }`}
                        >
                          <Check size={14} />
                          <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PROGRESS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Log Weight Card & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weight Checkin Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
              <h3 className="serif text-2xl font-normal text-[var(--ink)] mb-4">Log Weight Check-in</h3>
              <form onSubmit={handleLogWeightSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    placeholder="e.g. 49.5"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={weightDateInput}
                    onChange={e => setWeightDateInput(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning weigh-in after hydration"
                    value={weightNotesInput}
                    onChange={e => setWeightNotesInput(e.target.value)}
                    className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Save Check-in
                </button>
              </form>
            </div>

            {/* Weight Journey Stats (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="serif text-2xl font-normal text-[var(--ink)] mb-4">Progression Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Start</span>
                    <span className="serif text-xl font-normal text-[var(--ink)] mt-0.5 block">{startingWeight} kg</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/20">
                    <span className="text-[10px] font-bold text-[var(--accent)] uppercase block">Current</span>
                    <span className="serif text-xl font-normal text-[var(--ink)] mt-0.5 block">{currentWeight} kg</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Gained</span>
                    <span className="serif text-xl font-normal text-[var(--sage)] mt-0.5 block">+{totalWeightChange} kg</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]">
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase block">Target</span>
                    <span className="serif text-xl font-normal text-[var(--ink)] mt-0.5 block">{goalWeight} kg</span>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-3">
                  Historical Weight Trend (kg)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightChartData}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#797d77" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 2']} stroke="#797d77" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#181a18',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <ReferenceLine y={goalWeight} stroke="#75926e" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#75926e', fontSize: 10 }} />
                      <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2.5} fill="url(#weightGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Log Entries */}
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
            <h3 className="serif text-2xl font-normal text-[var(--ink)] mb-4">Recent Check-in Logs</h3>
            <div className="space-y-2">
              {weightCheckins.map(w => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] hover:border-[var(--accent)]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="serif text-lg font-normal text-[var(--ink)]">{w.weight} kg</span>
                    <span className="text-xs text-[var(--muted)]">{w.date}</span>
                    {w.notes && <span className="text-xs text-[var(--muted)] italic">· {w.notes}</span>}
                  </div>
                  <button
                    onClick={() => deleteWeightCheckin(w.id)}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--line)] shadow-sm max-w-3xl mx-auto animate-fadeIn">
          <div className="border-b border-[var(--line)] pb-4 mb-6">
            <h2 className="serif text-3xl font-normal text-[var(--ink)]">Health Profile & Macro Targets</h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Configure your biological stats, training frequency, and daily nutritional targets.
            </p>
          </div>

          <form onSubmit={handleSaveHealthSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={setupWeight}
                  onChange={e => setSetupWeight(e.target.value)}
                  className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={setupGoalWeight}
                  onChange={e => setSetupGoalWeight(e.target.value)}
                  className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={setupHeight}
                  onChange={e => setSetupHeight(e.target.value)}
                  className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={setupAge}
                  onChange={e => setSetupAge(e.target.value)}
                  className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  value={setupCalories}
                  onChange={e => setSetupCalories(e.target.value)}
                  className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Daily Protein Target (grams)
                </label>
                <input
                  type="number"
                  value={setupProtein}
                  onChange={e => setSetupProtein(e.target.value)}
                  className="w-full bg-[#f8f7f4] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] font-semibold focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--line)] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                Save Health Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FOOD LIBRARY MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFoodLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[var(--line)] shadow-2xl max-w-2xl w-full p-6 sm:p-7 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-4">
                <div>
                  <h3 className="serif text-2xl font-normal text-[var(--ink)]">Food Library</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Manage your staples and custom nutritional foods</p>
                </div>
                <button
                  onClick={() => setIsFoodLibraryOpen(false)}
                  className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#f8f7f4] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-[var(--muted)] uppercase">{foods.length} items registered</span>
                <button
                  onClick={() => setIsAddFoodOpen(!isAddFoodOpen)}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> {isAddFoodOpen ? 'Close Form' : 'Add Custom Food'}
                </button>
              </div>

              {/* Add Custom Food inline form */}
              {isAddFoodOpen && (
                <form onSubmit={handleAddCustomFood} className="p-4 rounded-2xl bg-[#f8f7f4] border border-[var(--line)] mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--muted)] uppercase block mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Greek Yogurt (200g)"
                        value={newFoodName}
                        onChange={e => setNewFoodName(e.target.value)}
                        className="w-full bg-white border border-[var(--line)] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--muted)] uppercase block mb-1">Serving Desc</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 bowl (200g)"
                        value={newFoodServing}
                        onChange={e => setNewFoodServing(e.target.value)}
                        className="w-full bg-white border border-[var(--line)] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--muted)] uppercase block mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        placeholder="e.g. 130"
                        value={newFoodCals}
                        onChange={e => setNewFoodCals(e.target.value)}
                        className="w-full bg-white border border-[var(--line)] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--muted)] uppercase block mb-1">Protein (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        value={newFoodProtein}
                        onChange={e => setNewFoodProtein(e.target.value)}
                        className="w-full bg-white border border-[var(--line)] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFoodIsStaple}
                        onChange={e => setNewFoodIsStaple(e.target.checked)}
                        className="rounded text-[var(--accent)]"
                      />
                      <span>Mark as 1-Tap Staple</span>
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Food
                    </button>
                  </div>
                </form>
              )}

              {/* Foods List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {foods.map(f => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#f8f7f4] border border-[var(--line)]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--ink)]">{f.name}</span>
                        {f.is_staple && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] uppercase">
                            Staple
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">
                        {f.serving_description} · {f.calories} kcal · {f.protein}g P · {f.carbs}g C · {f.fat}g F
                      </span>
                    </div>
                    <button
                      onClick={() => deleteFood(f.id)}
                      className="p-1 rounded text-[var(--muted)] hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
