'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, Wallet, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { login, signup, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [currency, setCurrency] = useState('₹');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await login(signInEmail, signInPassword);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail) {
      setError('Please fill in your name and email');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await signup(signUpName, signUpEmail, signUpPassword, currency);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#f8f7f4] rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden z-10"
        >
          {/* Header decoration */}
          <div className="p-7 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                <span className="font-semibold text-xs tracking-[0.2em] uppercase text-[var(--muted)]">LIFEOS ACCOUNT</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-white transition-colors text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="serif text-3xl font-normal mt-4">
              {mode === 'signin' ? 'Welcome back' : 'Claim your LifeOS'}
              <span className="text-[var(--accent)]">.</span>
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              {mode === 'signin'
                ? 'Sign in to access your personal dashboard & private data'
                : 'Zero fake numbers. Real habits, real budgets, your ambition.'}
            </p>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#ecebe4] rounded-xl mt-6 text-sm font-medium">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`py-2 rounded-lg transition-all ${mode === 'signin' ? 'bg-white shadow-sm text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`py-2 rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-7 pt-2">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
              >
                {error}
              </motion.div>
            )}

            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-xs text-[var(--muted)]">Optional for demo</span>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[var(--ink)] hover:bg-black text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="alex@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                      <input
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none font-medium"
                      >
                        <option value="₹">₹ INR (Rupee)</option>
                        <option value="$">$ USD (Dollar)</option>
                        <option value="€">€ EUR (Euro)</option>
                        <option value="£">£ GBP (Pound)</option>
                        <option value="¥">¥ JPY/CNY</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Setting up workspace...' : 'Start Fresh with LifeOS'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Quick Demo Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--line)]" />
              </div>
              <span className="relative bg-[#f8f7f4] px-3 text-xs uppercase tracking-widest text-[var(--muted)] font-medium">
                Or explore instantly
              </span>
            </div>

            {/* Instant Demo Button */}
            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-2.5 px-4 rounded-xl border border-[var(--line)] bg-white hover:bg-[#f1f0ea] text-[var(--ink)] font-medium text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--sage-light)] text-[var(--sage)] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="text-left">
                  <p className="font-semibold text-xs text-[var(--ink)]">Explore Aisha's Interactive Demo</p>
                  <p className="text-[10px] text-[var(--muted)]">Pre-populated with real habits, goals & budget</p>
                </div>
              </div>
              <Sparkles size={14} className="text-[var(--accent)]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
