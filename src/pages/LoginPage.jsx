import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, loginUser, logoutUser } from '../utils/storage';
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
  LogOut,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const quickDemoAccounts = [
    { name: 'Aman Sharma', email: 'aman@manit.ac.in', campus: 'MANIT Bhopal' },
    { name: 'Priya Verma', email: 'priya@rgpv.ac.in', campus: 'RGPV College' },
    { name: 'Rohan Patel', email: 'rohan@bhopal.in', campus: 'City Commuter' },
  ];

  const handleQuickLogin = (demo) => {
    setError('');
    try {
      const user = loginUser({ name: demo.name, email: demo.email });
      setCurrentUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const user = loginUser({ name: cleanName, email: cleanEmail });
      setCurrentUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setName('');
    setEmail('');
  };

  return (
    <div className="flex-1 bg-slate-50 py-12 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        
        {/* If user is already logged in */}
        {currentUser ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
                Logged In Session
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                Welcome, {currentUser.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Signed in as <strong className="text-slate-700">{currentUser.email}</strong>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/rides"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition cursor-pointer"
              >
                <span>Find Shared Cabs</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs transition cursor-pointer mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Demo Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login / Signup Form */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isSignUp ? 'Create Demo Account' : 'Demo Student Sign In'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                Lightweight local authentication for the SAWARI hackathon MVP.
              </p>
            </div>

            {/* Tab Toggle: Login / Sign Up */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  !isSignUp
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  isSignUp
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aman Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. aman@manit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </button>
            </form>

            {/* Quick 1-Click Demo Profiles */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-Click Quick Demo Sign In:</span>
              </div>
              <div className="space-y-1.5">
                {quickDemoAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(account)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-left transition group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 block">
                        {account.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {account.email} • {account.campus}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Security Note */}
            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Frontend MVP session saved in localStorage</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
