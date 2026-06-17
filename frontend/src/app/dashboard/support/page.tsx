'use client';

import { useState, useEffect, useRef } from 'react';
import { support } from '@/lib/api';
import { Send, Headphones, Trash2 } from 'lucide-react';

export default function StudentSupport() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await support.getHistory();
        setMessages(res);
      } catch (e) {
        console.error('Failed to load support history', e);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();

    // Setup polling for support replies every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await support.getHistory();
        setMessages(res);
      } catch (e) {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val || loading) return;

    setInput('');
    setLoading(true);

    try {
      const newMsg = await support.sendMessage({ message: val });
      setMessages(prev => [...prev, newMsg]);
    } catch (err: any) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col justify-between">
      {/* Top chat controls */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-400" />
            Live Admin Support
          </h1>
          <p className="text-xxs text-gray-500 mt-0.5">Direct 1-on-1 real-time support room with classroom educators.</p>
        </div>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {historyLoading ? (
          <div className="text-center text-xs text-gray-500 py-12">Loading support history...</div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderEmail === localStorage.getItem('email');
            return (
              <div
                key={i}
                className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Profile icon */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border ${isMe ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-purple-500/10 border-purple-500 text-purple-300'}`}>
                  {isMe ? 'S' : 'AD'}
                </div>

                {/* Message bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 border ${isMe ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-950/60 border-white/5 text-gray-300'}`}>
                  <p className="text-xs">{msg.message}</p>
                  <span className="text-[8px] text-gray-600 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        {messages.length === 0 && !historyLoading && (
          <div className="text-center text-xs text-gray-500 py-24 italic">
            No support requests yet. Send a message above to start a session with the administrator.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel */}
      <div className="pt-4 border-t border-white/5 bg-[#0b0f19]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            placeholder="Type your question for the administrator here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
