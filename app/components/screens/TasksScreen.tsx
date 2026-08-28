'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag as TagIcon, 
  Clock, 
  List, 
  Kanban, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useData, getTodayDateStr } from '../../context/DataContext';
import { Task, TaskPriority, TaskTag } from '../../types';

export function TasksScreen() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useData();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Inline create
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState<TaskTag>('Work');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState(getTodayDateStr());

  // Edit task modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = getTodayDateStr();

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTag !== 'All' && task.tag !== selectedTag) {
      return false;
    }
    if (selectedPriority !== 'All' && task.priority !== selectedPriority) {
      return false;
    }
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      tag: newTag,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      completed: false,
    });
    setNewTitle('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, editingTask);
    setEditingTask(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--muted)] mb-1">Execution Engine</p>
          <h1 className="serif text-4xl sm:text-5xl font-normal">Tasks & Action Flow<span className="text-[var(--accent)]">.</span></h1>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#ecebe4] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}
            >
              <List size={14} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--muted)]'}`}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Total Tasks</p>
          <p className="text-3xl font-bold mt-1 text-[var(--ink)]">{totalCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Pending Action</p>
          <p className="text-3xl font-bold mt-1 text-[var(--accent)]">{pendingCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Completed</p>
          <p className="text-3xl font-bold mt-1 text-[var(--sage)]">{completedCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-sm">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Overdue</p>
          <p className={`text-3xl font-bold mt-1 ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
            {overdueCount}
          </p>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleCreate} className="p-4 bg-white rounded-2xl border border-[var(--line)] shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new high-leverage task..."
          className="w-full md:flex-1 px-4 py-2.5 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
        />

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={newTag}
            onChange={e => setNewTag(e.target.value as TaskTag)}
            className="px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
          >
            {['Work', 'Wellbeing', 'Admin', 'Learning', 'Personal', 'Finance', 'Creative'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value as TaskPriority)}
            className="px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] focus:outline-none capitalize"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            className="px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--ink)] focus:outline-none"
          />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--ink)] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto md:ml-0"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'pending', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition-all cursor-pointer ${statusFilter === s ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'}`}
            >
              {s}
            </button>
          ))}

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] focus:outline-none shrink-0"
          >
            <option value="All">All Tags</option>
            {['Work', 'Wellbeing', 'Admin', 'Learning', 'Personal', 'Finance', 'Creative'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* View: LIST MODE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-sm">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-[var(--muted)]">
              <p className="text-sm">No tasks matching your filters.</p>
              <p className="text-xs mt-1">Clear your search query or add a new task above.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {filteredTasks.map((task) => {
                const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
                return (
                  <motion.div
                    layout
                    key={task.id}
                    className="py-4 flex items-center justify-between gap-4 group hover:bg-[#faf9f6] px-3 -mx-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${task.completed ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm' : 'border-[var(--line)] hover:border-[var(--accent)]'}`}
                      >
                        {task.completed && <Check size={13} />}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-sm leading-snug transition-all ${task.completed ? 'line-through text-[var(--muted)]' : 'font-medium text-[var(--ink)]'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-[var(--muted)] mt-0.5">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f1f0ea] text-[var(--muted)] font-medium">
                            {task.tag}
                          </span>
                          {task.priority === 'urgent' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase">
                              Urgent
                            </span>
                          )}
                          {task.priority === 'high' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold uppercase">
                              High
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={`text-[10px] flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600 font-bold' : 'text-[var(--muted)]'}`}>
                              <Calendar size={11} />
                              <span>{task.dueDate} {isOverdue && '(Overdue)'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[#ecebe4] transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View: KANBAN MODE */}
      {viewMode === 'kanban' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Column 1: Backlog / To Do */}
          <div className="bg-white rounded-3xl p-5 border border-[var(--line)] shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-xs uppercase tracking-wider">To Do</span>
              </div>
              <span className="text-xs text-[var(--muted)] font-bold">
                {tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > todayStr)).length}
              </span>
            </div>

            <div className="space-y-3 flex-1 min-h-[200px]">
              {tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > todayStr)).map(task => (
                <div key={task.id} className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[var(--line)] hover:border-[var(--accent)] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[var(--muted)] font-medium">
                      {task.tag}
                    </span>
                    <button onClick={() => toggleTask(task.id)} className="w-4 h-4 rounded-full border border-[var(--line)] hover:border-[var(--accent)]" />
                  </div>
                  <p className="font-medium text-xs text-[var(--ink)] mt-2">{task.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Today Focus */}
          <div className="bg-white rounded-3xl p-5 border border-[var(--line)] shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                <span className="font-semibold text-xs uppercase tracking-wider">Today's Focus</span>
              </div>
              <span className="text-xs text-[var(--muted)] font-bold">
                {tasks.filter(t => !t.completed && (t.dueDate === todayStr || (t.dueDate && t.dueDate < todayStr))).length}
              </span>
            </div>

            <div className="space-y-3 flex-1 min-h-[200px]">
              {tasks.filter(t => !t.completed && (t.dueDate === todayStr || (t.dueDate && t.dueDate < todayStr))).map(task => (
                <div key={task.id} className="p-3.5 rounded-xl bg-[#f8f7f4] border border-[var(--accent)]/40 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">
                      {task.tag}
                    </span>
                    <button onClick={() => toggleTask(task.id)} className="w-4 h-4 rounded-full border border-[var(--line)] hover:border-[var(--accent)]" />
                  </div>
                  <p className="font-medium text-xs text-[var(--ink)] mt-2">{task.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-white rounded-3xl p-5 border border-[var(--line)] shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--sage)]" />
                <span className="font-semibold text-xs uppercase tracking-wider">Completed</span>
              </div>
              <span className="text-xs text-[var(--muted)] font-bold">
                {tasks.filter(t => t.completed).length}
              </span>
            </div>

            <div className="space-y-3 flex-1 min-h-[200px]">
              {tasks.filter(t => t.completed).map(task => (
                <div key={task.id} className="p-3.5 rounded-xl bg-[#faf9f6] border border-[var(--line)] opacity-70">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[var(--muted)] font-medium">
                      {task.tag}
                    </span>
                    <button onClick={() => toggleTask(task.id)} className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </button>
                  </div>
                  <p className="font-medium text-xs line-through text-[var(--muted)] mt-2">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 border border-[var(--line)] shadow-2xl max-w-md w-full">
            <h3 className="serif text-2xl mb-4">Edit Task</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Tag</label>
                  <select
                    value={editingTask.tag}
                    onChange={e => setEditingTask({ ...editingTask, tag: e.target.value as TaskTag })}
                    className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium"
                  >
                    {['Work', 'Wellbeing', 'Admin', 'Learning', 'Personal', 'Finance', 'Creative'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium capitalize"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8f7f4] rounded-xl border border-[var(--line)] text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:bg-[#f8f7f4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
