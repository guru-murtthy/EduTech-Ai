'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { admin, support } from '@/lib/api';
import { 
  Users, Award, Library, PieChart, ShieldAlert, LogOut, 
  GraduationCap, TrendingUp, Search, RefreshCw, BarChart2,
  Send, X, Headphones
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeChatEmail, setActiveChatEmail] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChatEmail) return;

    async function loadChatMessages() {
      try {
        const res = await support.getHistory(activeChatEmail!);
        setChatMessages(res);
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
    loadChatMessages();

    const interval = setInterval(loadChatMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChatEmail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatEmail) return;

    const val = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      const newMsg = await support.sendMessage({ receiverEmail: activeChatEmail, message: val });
      setChatMessages(prev => [...prev, newMsg]);
    } catch (e) {
      console.error('Failed to send support reply', e);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    async function loadAdminData() {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token || (role !== 'ADMIN' && role !== 'TEACHER')) {
          router.push('/admin/login');
          return;
        }

        if (token === 'demo-token') {
          // Setup mock admin stats
          setData({
            totalStudents: 3,
            totalQuizAttempts: 14,
            averageScore: 74.2,
            totalResources: 12,
            resourceFormatDistribution: {
              'YouTube': 4,
              'Article': 3,
              'PDF': 2,
              'Practice': 3
            },
            students: [
              { name: 'Alice Smith', email: 'alice@edutech.ai', age: 20, educationLevel: 'Undergraduate', careerInterest: 'Software Engineer', learningStyle: 'Visual', quizzesTaken: 4, avgScore: 82.5, predictedGrade: 'A', riskLevel: 'Low' },
              { name: 'Bob Johnson', email: 'bob@edutech.ai', age: 19, educationLevel: 'Undergraduate', careerInterest: 'ML Engineer', learningStyle: 'Kinesthetic', quizzesTaken: 6, avgScore: 54.0, predictedGrade: 'C', riskLevel: 'Medium' },
              { name: 'Charlie Davis', email: 'charlie@edutech.ai', age: 22, educationLevel: 'Postgraduate', careerInterest: 'Data Architect', learningStyle: 'Reading', quizzesTaken: 4, avgScore: 38.5, predictedGrade: 'D', riskLevel: 'High' }
            ]
          });
        } else {
          const res = await admin.getAnalytics();
          setData(res);
        }
      } catch (e) {
        console.error('Failed to load admin stats', e);
        // Clear tokens and redirect on authentication/network failures
        localStorage.clear();
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-400 font-medium">Assembling administrator panel analytics...</p>
        </div>
      </div>
    );
  }

  const filteredStudents = data?.students?.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.careerInterest.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#0b0f19] p-6 lg:p-10 space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">EduTech AI Admin Dashboard</h1>
            <p className="text-xxs text-gray-500 mt-0.5">Global SDG 4 target metrics monitoring portal.</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/5 hover:text-red-300 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Aggregate Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-black text-white mt-1 block">{data?.totalStudents}</span>
          </div>
        </div>

        {/* Total Quiz Attempts */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Quiz Submissions</span>
            <span className="text-2xl font-black text-white mt-1 block">{data?.totalQuizAttempts}</span>
          </div>
        </div>

        {/* Global Average Score */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Average Quiz Score</span>
            <span className="text-2xl font-black text-white mt-1 block">{data?.averageScore?.toFixed(1)}%</span>
          </div>
        </div>

        {/* Total Resources */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Library Catalog</span>
            <span className="text-2xl font-black text-white mt-1 block">{data?.totalResources} items</span>
          </div>
        </div>

      </div>

      {/* Grid Roster list & Resource distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Student list (7 or 8 cols) */}
        <div className={activeChatEmail ? "xl:col-span-7 glass rounded-2xl p-6 border border-white/10 space-y-6" : "xl:col-span-8 glass rounded-2xl p-6 border border-white/10 space-y-6"}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Student Roster</h3>
              <p className="text-xxs text-gray-400">Classroom metrics with active Random Forest predictive tags.</p>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xxs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Search by name or career..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Roster table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xxs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="pb-3 pr-2">Student</th>
                  <th className="pb-3 px-2">Career Interest</th>
                  <th className="pb-3 px-2 text-center">Style</th>
                  <th className="pb-3 px-2 text-center">Quizzes</th>
                  <th className="pb-3 px-2 text-center">Avg Score</th>
                  <th className="pb-3 px-2 text-center">RF Predicted Grade</th>
                  <th className="pb-3 pl-2 text-right">Academic Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                 {filteredStudents.map((studentItem: any, idx: number) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-white/[0.05] transition cursor-pointer select-none"
                    onClick={() => { 
                      setActiveChatEmail(studentItem.email || 'student@edutech.ai'); 
                      setActiveChatName(studentItem.name); 
                    }}
                  >
                    <td className="py-3.5 pr-2 font-semibold text-white">
                      <div>{studentItem.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{studentItem.educationLevel}, {studentItem.age}y</div>
                    </td>
                    <td className="py-3.5 px-2">{studentItem.careerInterest}</td>
                    <td className="py-3.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-slate-900 rounded border border-white/5 text-[10px]">{studentItem.learningStyle}</span></td>
                    <td className="py-3.5 px-2 text-center font-bold">{studentItem.quizzesTaken}</td>
                    <td className="py-3.5 px-2 text-center font-bold text-indigo-400">{studentItem.avgScore.toFixed(1)}%</td>
                    <td className="py-3.5 px-2 text-center"><span className="text-xs font-black text-purple-400">{studentItem.predictedGrade}</span></td>
                    <td className="py-3.5 pl-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        studentItem.riskLevel.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400' :
                        studentItem.riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {studentItem.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500 italic">No matching students found in roster roster list.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resources breakdown / Support chat (4 or 5 cols) */}
        {activeChatEmail ? (
          <div className="xl:col-span-5 glass rounded-2xl p-6 border border-white/10 flex flex-col h-[500px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <h4 className="text-xs font-bold text-white">Chat: {activeChatName}</h4>
                  <p className="text-[9px] text-gray-500 truncate">{activeChatEmail}</p>
                </div>
              </div>
              <button
                onClick={() => { setActiveChatEmail(null); setActiveChatName(null); }}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 text-[10px] py-12 italic">
                  No previous support requests. Send a message to start.
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.senderEmail === localStorage.getItem('email');
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${
                        isMe ? 'bg-purple-600/10 border-purple-500/20 text-white' : 'bg-slate-900 border-white/5 text-gray-300'
                      }`}>
                        <p>{msg.message}</p>
                      </div>
                      <span className="text-[8px] text-gray-600 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-white/5">
              <input
                type="text"
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Type reply to student..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Resources breakdown (default view if no chat is open) */
          <div className="xl:col-span-4 glass rounded-2xl p-6 border border-white/10 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-purple-400" />
                Content Library Insights
              </h3>
              <p className="text-xxs text-gray-400 mt-0.5">Distribution of catalog formats matching style rules.</p>
            </div>

            <div className="space-y-4 pt-2 border-t border-white/5 text-xxs">
              {data?.resourceFormatDistribution && Object.entries(data.resourceFormatDistribution).map(([format, count]: any) => (
                <div key={format} className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-300">{format}</span>
                    <span className="text-white">{count} items</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full" 
                      style={{ width: `${(count / data.totalResources) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl text-xxs leading-relaxed text-gray-400 mt-6">
                <ShieldAlert className="w-4.5 h-4.5 text-purple-400 shrink-0 mb-1" />
                <span>Click on any student in the roster to start a real-time support conversation.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
