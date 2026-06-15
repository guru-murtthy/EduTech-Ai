'use client';

import { useState, useEffect, useRef } from 'react';
import { chat } from '@/lib/api';
import { Send, GraduationCap, Sparkles, MessageSquare, Trash2, ArrowRight } from 'lucide-react';

export default function TutorChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: "Explain Binary Search complexity", val: "Explain the time complexity of Binary Search and why it represents the decrease-and-conquer strategy." },
    { text: "Simplify recursion concepts", val: "Can you simplify the concept of recursion with a real-life analogy?" },
    { text: "What is JWT validation?", val: "Explain how JSON Web Tokens work and why we need filters in Spring Boot." }
  ];

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = localStorage.getItem('token');
        if (token === 'demo-token') {
          // Setup mock history
          setMessages([
            { role: 'assistant', content: 'Hello! I am your AI Study Mentor. I am ready to help you master topics like Binary Search, databases, or Spring Security. What concept can we explain today?' }
          ]);
        } else {
          const res = await chat.getHistory();
          if (res.length > 0) {
            setMessages(res);
          } else {
            setMessages([
              { role: 'assistant', content: 'Hello! I am your AI Study Mentor. I am ready to help you master topics like Binary Search, databases, or Spring Security. What concept can we explain today?' }
            ]);
          }
        }
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const val = (textToSend || input).trim();
    if (!val || loading) return;

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: val }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        // Mock Response delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        let responseText = "I would be happy to explain that! ";
        const p_lower = val.lowerCase ? val.toLowerCase() : val.toLowerCase();
        
        if (p_lower.includes("binary search") || p_lower.includes("decrease")) {
          responseText = `### 📚 Study Guide: Binary Search (Decrease-and-Conquer)

Binary Search is a classic example of the **Decrease-and-Conquer** algorithmic technique. In this approach, we reduce the search space by a constant fraction (specifically half) at each step.

#### 1. Time Complexity
* **Worst-Case**: $O(\\log N)$. Since we divide the list size by 2 at each step, the search depth is logarithmic.
* **Best-Case**: $O(1)$ if the middle element matches immediately.
* **Comparisons**: Searching an array of 1,024 elements takes a maximum of 10 comparison steps ($2^{10} = 1024$).

#### 2. Visual Performance Comparison
* For a dataset of size $N = 1,000,000$:
  - **Linear Search**: Checks up to **1,000,000** items.
  - **Binary Search**: Checks at most **20** items.

#### 3. Why It Is Critical for SDG 4
To recommend learning resources dynamically to millions of students, indexing systems sort resources and use Decrease-and-Conquer algorithms to retrieve matching difficulty levels instantly.`;
        } else if (p_lower.includes("recursion")) {
          responseText = `### 🔄 Understanding Recursion

Recursion is simply a function calling itself to break a large problem into smaller subproblems. 

**The Analogy**: 
Imagine you are sitting in a dark movie theater and want to know what row you are in. You don't want to count all the way to the front:
1. You ask the person in front of you: *"What row are you?"*
2. That person asks the person in front of them, and so on (this builds the **call stack**).
3. The person in row 1 knows their row immediately (this is the **Base Case**).
4. They tell the person behind them: *"I am row 1"*.
5. That person adds 1 and passes it back (this is the **Unwinding Phase**).
6. Finally, you get your answer.

Without a **Base Case**, the question would go on forever (resulting in a **Stack Overflow**!).`;
        } else {
          responseText = `Here is an overview explanation of your question:

1. **Focus Area**: Understanding the foundations of this concept is essential for practical application.
2. **Implementation**:
   - Write clean, modular functions.
   - Guard against invalid boundary indices.
3. **Summary**: Let me know if you would like me to generate a quick practice quiz or study notes on this!`;
        }
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      } else {
        const res = await chat.sendMessage(val);
        setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I am facing connection difficulties: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear chat logs?')) {
      try {
        const token = localStorage.getItem('token');
        if (token !== 'demo-token') {
          await chat.clearHistory();
        }
        setMessages([
          { role: 'assistant', content: 'Hello! I am your AI Study Mentor. I am ready to help you master topics like Binary Search, databases, or Spring Security. What concept can we explain today?' }
        ]);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col justify-between">
      {/* Top chat controls */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            AI Study Mentor
          </h1>
          <p className="text-xxs text-gray-500 mt-0.5">Interact with your digital tutor. Explanations are styled in markdown.</p>
        </div>
        
        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-slate-900 border border-white/10 text-red-400 hover:bg-red-500/5 transition cursor-pointer"
          title="Clear Conversation History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {historyLoading ? (
          <div className="text-center text-xs text-gray-500 py-12">Loading conversation...</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Profile icon */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border ${msg.role === 'user' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-purple-500/10 border-purple-500 text-purple-300'}`}>
                {msg.role === 'user' ? 'S' : 'AI'}
              </div>

              {/* Message bubble */}
              <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 border ${msg.role === 'user' ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-950/60 border-white/5 text-gray-300'}`}>
                {/* Visual rendering support for mock markdown headers and lists */}
                {msg.content.split('\n').map((line: string, idx: number) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-sm font-bold text-white mt-3 mb-1">{line.replace('### ', '')}</h3>;
                  } else if (line.startsWith('#### ')) {
                    return <h4 key={idx} className="text-xs font-bold text-indigo-300 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                  } else if (line.startsWith('* **')) {
                    return <p key={idx} className="text-xs text-gray-300 pl-2 mt-1">{line.replace('* ', '')}</p>;
                  } else if (line.startsWith('* ') || line.startsWith('- ')) {
                    return <li key={idx} className="text-xs text-gray-300 pl-4 list-disc mt-0.5">{line.substring(2)}</li>;
                  } else if (line.startsWith('```')) {
                    if (line === '```' || line.startsWith('```python') || line.startsWith('```javascript')) return null;
                    return <pre key={idx} className="bg-black/60 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-gray-300 my-2 overflow-x-auto">{line.replace('```', '')}</pre>;
                  }
                  return <p key={idx} className="text-xs">{line}</p>;
                })}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border bg-purple-500/10 border-purple-500 text-purple-300">AI</div>
            <div className="p-4 rounded-2xl text-xs bg-slate-950/60 border border-white/5 text-gray-400 italic">
              Mentor is analyzing concept...
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input panel & Quick prompts */}
      <div className="space-y-4 pt-4 border-t border-white/5 bg-[#0b0f19]">
        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((btn, i) => (
            <button
              key={i}
              onClick={() => handleSend(btn.val)}
              className="px-3 py-1.5 rounded-full border border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/30 text-xxs text-gray-400 hover:text-white transition cursor-pointer"
            >
              {btn.text}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="Type your study question here (e.g. How does Binary Search work?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
