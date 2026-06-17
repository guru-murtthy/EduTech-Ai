'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await auth.login({ email, password });
      
      if (res.role === 'ADMIN' || res.role === 'TEACHER') {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('email', res.email);
        router.push('/admin');
      } else {
        setError('Access Denied: You must be an administrator to access this panel.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminDemo = () => {
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('email', 'admin@edutech.ai');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black p-4">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full glass rounded-2xl p-8 border border-white/10 relative z-10 space-y-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Portal
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-indigo-500/10 mx-auto">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Access Portal</h1>
          <p className="text-xs text-gray-400">Secure entry for EduTech AI administrators and classroom educators.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Administrator Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="admin@edutech.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold text-white shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#0b0f19] px-2 text-gray-500">Evaluation Mode</span></div>
        </div>

        <button
          onClick={handleQuickAdminDemo}
          className="w-full py-2 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/5 text-xs text-purple-300 font-semibold transition cursor-pointer"
        >
          Fast-Track Admin Demo (Bypass Auth)
        </button>
      </div>
    </div>
  );
}
