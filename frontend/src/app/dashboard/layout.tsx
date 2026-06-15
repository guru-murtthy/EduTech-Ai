'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, BrainCircuit, Play, MessageSquare, LogOut, User, Activity, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('email');
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
      } else {
        setEmail(storedEmail || 'student@edutech.ai');
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      router.push('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Study Tutor', path: '/dashboard/tutor', icon: MessageSquare },
    { name: 'Adaptive Quizzes', path: '/dashboard/quiz', icon: BrainCircuit },
    { name: 'Algorithmic Lab', path: '/dashboard/lab', icon: Play },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white cursor-pointer"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/80 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">EduTech AI</span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 border-l-2 border-indigo-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? 'text-indigo-400' : ''}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-full bg-slate-900 border border-white/10 text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h5 className="text-xs font-semibold text-white truncate">{email.split('@')[0]}</h5>
              <p className="text-xxs text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/5 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main page content area */}
      <div className="flex-1 min-h-screen overflow-y-auto p-6 lg:p-10">
        {children}
      </div>
    </div>
  );
}
