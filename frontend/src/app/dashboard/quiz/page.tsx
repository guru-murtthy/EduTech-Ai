'use client';

import { useState } from 'react';
import { quiz } from '@/lib/api';
import { BrainCircuit, Check, X, AlertCircle, ArrowRight, Award, HelpCircle } from 'lucide-react';

export default function QuizDashboard() {
  const [topic, setTopic] = useState('Algorithms');
  const [quizState, setQuizState] = useState<'IDLE' | 'LOADING' | 'ACTIVE' | 'SUBMITTING' | 'RESULT'>('IDLE');
  
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const topics = ['Algorithms', 'Databases', 'Web Development', 'Machine Learning'];

  const startQuiz = async () => {
    setError('');
    setQuizState('LOADING');
    try {
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        // Mock API quiz questions
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        let mockQuestions = [];
        if (topic === 'Algorithms') {
          mockQuestions = [
            {
              question: "What is the average time complexity of a Binary Search algorithm?",
              options: ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
              correct_answer: "O(log N)",
              explanation: "Binary search repeatedly cuts the search space in half (Decrease-and-Conquer). Thus, the number of steps grows logarithmically with the size of the array."
            },
            {
              question: "Which condition must be met before performing a Binary Search?",
              options: ["The array must be unsorted", "The array must be sorted", "The array must contain only integers", "The array size must be a power of 2"],
              correct_answer: "The array must be sorted",
              explanation: "Binary search relies on ordering to discard half the search space. Without a sorted array, we cannot guarantee which half the target lies in."
            },
            {
              question: "In a binary search over 1,024 sorted items, what is the maximum number of comparisons needed?",
              options: ["10", "50", "500", "1,024"],
              correct_answer: "10",
              explanation: "Since 2^10 = 1024, binary search will take at most 10 steps to narrow down 1,024 items."
            },
            {
              question: "Binary search is an example of which algorithmic paradigm?",
              options: ["Brute Force", "Greedy Algorithm", "Decrease-and-Conquer", "Dynamic Programming"],
              correct_answer: "Decrease-and-Conquer",
              explanation: "Decrease-and-Conquer reduces the problem size by a constant factor (usually 1/2) in each step, solving a single subproblem."
            }
          ];
        } else {
          mockQuestions = [
            {
              question: "Which of the following is a primary key constraint in SQL?",
              options: ["Allows nulls", "Must contain unique values", "Can have duplicates", "Index is disabled"],
              correct_answer: "Must contain unique values",
              explanation: "Primary keys uniquely identify rows and cannot contain nulls or duplicates."
            },
            {
              question: "What does HTML stand for?",
              options: ["Hyper Text Markup Language", "Hyperlink Text Makeup Language", "Home Tool Markup Language", "Hyper Tech Modern Language"],
              correct_answer: "Hyper Text Markup Language",
              explanation: "HTML is the standard markup language for creating Web pages."
            }
          ];
        }

        setQuestions(mockQuestions);
        setDifficulty('Medium'); // Default
        setAnswers(new Array(mockQuestions.length).fill(''));
        setCurrentIdx(0);
        setQuizState('ACTIVE');
      } else {
        const res = await quiz.generate(topic);
        setQuestions(res.questions);
        setDifficulty(res.difficulty);
        setAnswers(new Array(res.questions.length).fill(''));
        setCurrentIdx(0);
        setQuizState('ACTIVE');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz questions.');
      setQuizState('IDLE');
    }
  };

  const handleSelectOption = (opt: string) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIdx] = opt;
    setAnswers(nextAnswers);
  };

  const submitQuizAnswers = async () => {
    setQuizState('SUBMITTING');
    
    // Evaluate score
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) {
        correctCount++;
      }
    });

    const scorePercent = (correctCount / questions.length) * 100;
    const payload = {
      topic,
      difficulty,
      score: scorePercent,
      totalQuestions: questions.length
    };

    try {
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setResult({
          score: scorePercent,
          feedback: scorePercent >= 80 ? "Superb work! You understand binary search deeply." : "Good attempt. Some topics could use revision.",
          improvementSuggestions: scorePercent >= 80 ? "Upgrade difficulty to Hard next time, or check the admin metrics." : "Review the O(log N) partitioning visualization inside the Algorithmic Lab."
        });
      } else {
        const res = await quiz.submit(payload);
        setResult(res);
      }
      setQuizState('RESULT');
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz score.');
      setQuizState('ACTIVE');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          Adaptive Quizzes
        </h1>
        <p className="text-xxs text-gray-500 mt-0.5">MCQs adjust difficulty automatically based on your scores (score &gt; 80% increases difficulty; &lt; 50% decreases it).</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Idle Selection */}
      {quizState === 'IDLE' && (
        <div className="glass rounded-2xl p-8 border border-white/10 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-base font-bold text-white">Select a topic to test</h3>
            <p className="text-xs text-gray-400">Your digital tutor compiles active questions mapped to your learning style.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${topic === t ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-white/5 text-gray-400 hover:border-white/20'}`}
              >
                <span className="text-xs font-bold">{t}</span>
              </button>
            ))}
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-semibold text-white shadow-md transition cursor-pointer"
          >
            Start Quiz
          </button>
        </div>
      )}

      {/* 2. Loading state */}
      {quizState === 'LOADING' && (
        <div className="glass rounded-2xl p-12 text-center border border-white/10 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-400">Generating questions with adaptive difficulty...</p>
        </div>
      )}

      {/* 3. Active Quiz Question */}
      {quizState === 'ACTIVE' && (
        <div className="glass rounded-2xl p-8 border border-white/10 space-y-6">
          <div className="flex justify-between items-center text-xxs font-semibold uppercase tracking-wider text-gray-500 border-b border-white/5 pb-4">
            <span>Topic: <span className="text-white">{topic}</span></span>
            <span>Difficulty: <span className="text-indigo-400">{difficulty}</span></span>
            <span>Question {currentIdx + 1} of {questions.length}</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white leading-relaxed">
              {questions[currentIdx]?.question}
            </h3>

            <div className="space-y-2.5 pt-2">
              {questions[currentIdx]?.options.map((opt: string, i: number) => {
                const selected = answers[currentIdx] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-3.5 text-left text-xs rounded-xl border transition flex justify-between items-center cursor-pointer ${selected ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900/60 border-white/5 text-gray-400 hover:bg-slate-900'}`}
                  >
                    <span>{opt}</span>
                    {selected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/5">
            <button
              disabled={currentIdx === 0}
              className="py-1.5 px-3 border border-white/10 rounded-lg text-xxs font-semibold text-gray-400 hover:text-white transition disabled:opacity-30 cursor-pointer"
              onClick={() => setCurrentIdx(currentIdx - 1)}
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                disabled={!answers[currentIdx]}
                className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xxs font-semibold text-white shadow transition disabled:opacity-50 cursor-pointer"
                onClick={() => setCurrentIdx(currentIdx + 1)}
              >
                Next
              </button>
            ) : (
              <button
                disabled={answers.some(a => !a)}
                className="py-1.5 px-5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xxs font-bold text-white shadow transition disabled:opacity-50 cursor-pointer"
                onClick={submitQuizAnswers}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Submitting state */}
      {quizState === 'SUBMITTING' && (
        <div className="glass rounded-2xl p-12 text-center border border-white/10 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-400 font-medium">Analyzing results and checking for knowledge gaps...</p>
        </div>
      )}

      {/* 5. Results page */}
      {quizState === 'RESULT' && (
        <div className="glass rounded-2xl p-8 border border-white/10 space-y-6">
          <div className="text-center space-y-3">
            <Award className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Quiz Completed!</h3>
            
            <div className="inline-block px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mt-2">
              <span className="text-xxs text-gray-500 font-semibold uppercase tracking-wider block">Your Score</span>
              <span className="text-3xl font-black text-indigo-400 mt-0.5 block">{result?.score}%</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-3 text-xs leading-relaxed">
            <div>
              <span className="font-bold text-white">Feedback: </span>
              <span className="text-gray-400">{result?.feedback}</span>
            </div>
            {result?.improvementSuggestions && (
              <div>
                <span className="font-bold text-indigo-300">Suggestions: </span>
                <span className="text-gray-400">{result.improvementSuggestions}</span>
              </div>
            )}
          </div>

          {/* Detailed Question review */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-gray-400">Review Answers</h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.correct_answer;
                return (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 text-xxs">
                    <div className="flex gap-2 items-start font-semibold text-white">
                      <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                      <span>{q.question}</span>
                    </div>

                    <div className="pl-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Your answer:</span>
                        <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{answers[idx]}</span>
                        {isCorrect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Correct answer:</span>
                          <span className="text-emerald-400 font-bold">{q.correct_answer}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-[10px] text-gray-500 leading-normal pt-1 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setQuizState('IDLE')}
            className="w-full py-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs font-semibold text-indigo-300 transition cursor-pointer"
          >
            Start Another Quiz
          </button>
        </div>
      )}

    </div>
  );
}
