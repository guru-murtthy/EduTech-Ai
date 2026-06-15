'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, Brain, ShieldAlert, Users, LineChart, Milestone, ArrowRight, Activity, Code, Cpu } from 'lucide-react';
import { auth } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await auth.login({ email, password });
      } else {
        res = await auth.register({ email, password, role });
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      localStorage.setItem('email', res.email);

      if (res.role === 'ADMIN' || res.role === 'TEACHER') {
        router.push('/admin');
      } else {
        // Direct to profile onboarding check
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    // Demo account bypass
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('role', 'STUDENT');
    localStorage.setItem('email', 'student@edutech.ai');
    router.push('/onboarding');
  };

  const handleQuickAdminDemo = () => {
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('email', 'admin@edutech.ai');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      {/* Left Pitch panel (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-8 lg:p-16 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
        {/* Glow overlay */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            EduTech AI
          </span>
        </div>

        {/* Core Narrative / Showcase */}
        <div className="my-auto py-12 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 font-medium mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Empowering Global Literacy - SDG 4 Target
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white tracking-tight mb-6">
            Your Personal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
              AI Learning Mentor
            </span>
          </h1>

          <p className="text-gray-400 leading-relaxed text-base mb-8">
            An adaptive learning platform designed to act as a digital mentor. 
            By combining Random Forest predictive analytics, smart resource recommendation, 
            and automated quiz generators, EduTech AI ensures high-quality personalized education is accessible for everyone.
          </p>

          {/* Grid Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="text-indigo-400 p-1 bg-indigo-500/5 rounded-lg border border-indigo-500/10 h-fit">
                <Milestone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dynamic Roadmaps</h4>
                <p className="text-xs text-gray-500 mt-1">4-week custom learning plans tailored to weaknesses.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="text-purple-400 p-1 bg-purple-500/5 rounded-lg border border-purple-500/10 h-fit">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Adaptive Quizzes</h4>
                <p className="text-xs text-gray-500 mt-1">Self-adjusting MCQ difficulty based on your answers.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-blue-400 p-1 bg-blue-500/5 rounded-lg border border-blue-500/10 h-fit">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">RF Grade Predictions</h4>
                <p className="text-xs text-gray-500 mt-1">Random Forest predictions identifying academic risk level.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-emerald-400 p-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10 h-fit">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Algorithmic Lab</h4>
                <p className="text-xs text-gray-500 mt-1">Interactive O(log N) Decrease-and-Conquer visualizer.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-6 relative z-10">
          <span>© 2026 EduTech AI. Quality Education for All (SDG 4).</span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            FastAPI + Spring Boot + Next.js
          </span>
        </div>
      </div>

      {/* Right Auth panel (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-center p-8 lg:p-12 bg-slate-950 border-l border-white/5 relative">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {isLogin ? 'Sign in to access your digital tutor mentor.' : 'Sign up to start your personalized learning journey.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Role Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-2 px-3 text-xs border rounded-lg font-medium transition ${role === 'STUDENT' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-white/10 text-gray-400'}`}
                    onClick={() => setRole('STUDENT')}
                  >
                    Student Account
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 text-xs border rounded-lg font-medium transition ${role === 'ADMIN' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-white/10 text-gray-400'}`}
                    onClick={() => setRole('ADMIN')}
                  >
                    Admin / Educator
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-semibold text-white shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-gray-500">Or Toggle Form</span></div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleQuickDemo}
                className="w-full py-2 border border-dashed border-indigo-500/30 rounded-lg hover:bg-indigo-500/5 text-xs text-indigo-300 font-semibold transition cursor-pointer"
              >
                Fast-Track Student Demo (No Account Required)
              </button>
              <button
                onClick={handleQuickAdminDemo}
                className="w-full py-2 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/5 text-xs text-purple-300 font-semibold transition cursor-pointer"
              >
                Fast-Track Admin Demo (Manage & Analytics)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
