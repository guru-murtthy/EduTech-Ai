'use client';

import { useState, useEffect, useRef } from 'react';
import { chat } from '@/lib/api';
import { Send, MessageSquare, Trash2, Mic, MicOff, Volume2, VolumeX, Paperclip, X } from 'lucide-react';

function parseMessageContent(content: string) {
  if (content && content.startsWith('[File: ')) {
    const closingIndex = content.indexOf(']');
    if (closingIndex !== -1) {
      const filePart = content.substring(7, closingIndex);
      const messageText = content.substring(closingIndex + 1).trim();
      const separatorIndex = filePart.indexOf('|');
      if (separatorIndex !== -1) {
        const fileName = filePart.substring(0, separatorIndex);
        const fileUrl = filePart.substring(separatorIndex + 1);
        return { fileName, fileUrl, text: messageText };
      }
    }
  }
  return { fileName: null, fileUrl: null, text: content };
}

export default function TutorChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File States
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const quickPrompts = [
    { text: "Explain Binary Search complexity", val: "Explain the time complexity of Binary Search and why it represents the decrease-and-conquer strategy." },
    { text: "Simplify recursion concepts", val: "Can you simplify the concept of recursion with a real-life analogy?" },
    { text: "What is JWT validation?", val: "Explain how JSON Web Tokens work and why we need filters in Spring Boot." }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + (prev ? ' ' : '') + transcript);
          setIsRecording(false);
        };

        rec.onerror = () => {
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = localStorage.getItem('token');
        if (token === 'demo-token') {
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

  // Handle auto voice output
  useEffect(() => {
    if (messages.length > 0 && autoRead) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        const { text } = parseMessageContent(lastMsg.content);
        speakText(text);
      }
    }
  }, [messages, autoRead]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (textToSpeak: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    
    const cleanText = textToSpeak.replace(/[*#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textToSend?: string) => {
    let rawPrompt = (textToSend || input).trim();
    if (!rawPrompt && !fileUrl) return;
    if (loading) return;

    let fullPayload = rawPrompt;
    if (fileUrl) {
      fullPayload = `[File: ${fileName}|${fileUrl}] ${rawPrompt}`;
    }

    if (!textToSend) setInput('');
    setFileUrl(null);
    setFileName('');

    setMessages(prev => [...prev, { role: 'user', content: fullPayload }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        // Mock response
        await new Promise((resolve) => setTimeout(resolve, 1500));
        let responseText = "I would be happy to explain that! ";
        const p_lower = rawPrompt.toLowerCase();
        
        if (p_lower.includes("binary search") || p_lower.includes("decrease")) {
          responseText = `### 📚 Study Guide: Binary Search (Decrease-and-Conquer)

Binary Search is a classic example of the **Decrease-and-Conquer** algorithmic technique. In this approach, we reduce the search space by a constant fraction (specifically half) at each step.

#### 1. Time Complexity
* **Worst-Case**: $O(\\log N)$.
* **Best-Case**: $O(1)$.`;
        } else {
          responseText = `Hello! I received your prompt. Let's analyze this topic step-by-step:
1. **First Principles**: Let's review the fundamental definitions.
2. **Context**: How this relates to your curriculum.

Please let me know if you would like me to generate a practice quiz!`;
        }
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      } else {
        const res = await chat.sendMessage(fullPayload);
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`p-2 rounded-lg border border-white/10 transition cursor-pointer ${autoRead ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-gray-400 hover:text-white'}`}
            title="Toggle Auto Read Aloud"
          >
            {autoRead ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-red-400 hover:bg-red-500/5 transition cursor-pointer"
            title="Clear Conversation History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {historyLoading ? (
          <div className="text-center text-xs text-gray-500 py-12">Loading conversation...</div>
        ) : (
          messages.map((msg, i) => {
            const { fileName, fileUrl: msgFileUrl, text } = parseMessageContent(msg.content);
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Profile icon */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border ${isUser ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-purple-500/10 border-purple-500 text-purple-300'}`}>
                  {isUser ? 'S' : 'AI'}
                </div>

                {/* Message bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 border ${isUser ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-950/60 border-white/5 text-gray-300'} relative`}>
                  {msgFileUrl && (
                    <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex items-center gap-3 mb-2">
                      <span className="text-lg">📁</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate text-[11px]">{fileName}</p>
                        {msgFileUrl.startsWith('data:image/') ? (
                          <img src={msgFileUrl} alt={fileName} className="max-w-xs max-h-48 rounded mt-1.5 border border-white/10" />
                        ) : (
                          <a href={msgFileUrl} download={fileName} className="text-[10px] text-indigo-400 hover:text-indigo-300 block mt-1 font-semibold">Download file</a>
                        )}
                      </div>
                    </div>
                  )}

                  {text && text.split('\n').map((line: string, idx: number) => {
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

                  {!isUser && text && (
                    <button
                      onClick={() => speakText(text)}
                      className="p-1 rounded bg-slate-900/50 hover:bg-slate-900 text-gray-500 hover:text-white transition text-[10px] absolute -bottom-2 -left-2 border border-white/5"
                      title="Read Aloud"
                    >
                      🗣️ Speak
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border bg-purple-500/10 border-purple-500 text-purple-300">AI</div>
            <div className="p-4 rounded-2xl text-xs bg-slate-950/60 border border-white/5 text-gray-400 italic">
              Mentor is analyzing concept...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel & Quick prompts */}
      <div className="space-y-4 pt-4 border-t border-white/5 bg-[#0b0f19]">
        {fileUrl && (
          <div className="p-2.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">📁</span>
              <span className="text-xxs text-gray-300 truncate font-medium">{fileName}</span>
            </div>
            <button 
              onClick={() => { setFileUrl(null); setFileName(''); }} 
              className="p-1 text-gray-500 hover:text-red-400 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
          <label className="p-3 rounded-xl bg-slate-900 border border-white/10 text-gray-400 hover:text-white transition cursor-pointer flex items-center justify-center shrink-0">
            <Paperclip className="w-4.5 h-4.5" />
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          <input
            type="text"
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder={isRecording ? 'Listening...' : 'Type your study question here...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            disabled={isRecording}
          />

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-xl border transition cursor-pointer shrink-0 flex items-center justify-center ${isRecording ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-900 border-white/10 text-gray-400 hover:text-white'}`}
            title="Toggle Voice Input"
          >
            {isRecording ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !fileUrl)}
            className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
