'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, ArrowLeft, BookOpen, Star, HelpCircle, Check, Sparkles } from 'lucide-react';
import { student } from '@/lib/api';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(18);
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [learningStyle, setLearningStyle] = useState('Visual'); // Visual, Auditory, Reading, Kinesthetic
  const [careerInterest, setCareerInterest] = useState('Software Engineer');
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [dailyStudyTime, setDailyStudyTime] = useState(3); // Hours
  const [strengthAreas, setStrengthAreas] = useState<string[]>([]);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);

  // Presets
  const subjectPresets = ['Data Structures', 'Algorithms', 'Web Development', 'Machine Learning', 'Databases', 'Computer Networks', 'Software Engineering', 'Math for CS'];
  const strengthPresets = ['Problem Solving', 'Coding Syntax', 'Logical Reasoning', 'System Design', 'Project Planning', 'Mathematical Concepts'];
  const weaknessPresets = ['Algorithmic Complexity', 'Database Queries', 'JWT Tokens & Security', 'Ensemble Models (RF)', 'CSS Layouts', 'Handling Recursion'];

  // Check if profile exists; if yes, bypass onboarding to dashboard
  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await student.getProfile();
        if (res.hasProfile) {
          router.push('/dashboard');
        }
      } catch (e) {
        // Safe to ignore if mock or unregistered
      }
    }
    checkProfile();
  }, [router]);

  const handleToggle = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleOnboardSubmit = async () => {
    setError('');
    setLoading(true);

    const payload = {
      name,
      age,
      educationLevel,
      learningStyle,
      careerInterest,
      preferredSubjects: preferredSubjects.length > 0 ? preferredSubjects : ['Algorithms', 'Data Structures'],
      dailyStudyTime,
      strengthAreas: strengthAreas.length > 0 ? strengthAreas : ['Problem Solving'],
      weakAreas: weakAreas.length > 0 ? weakAreas : ['Algorithmic Complexity'],
    };

    try {
      // If token is bypass demo, create mock local delay
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        localStorage.setItem('hasProfile', 'true');
        router.push('/dashboard');
      } else {
        await student.saveProfile(payload);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit onboarding survey.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black flex flex-col justify-between p-6">
      
      {/* Navbar Header */}
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">EduTech AI Onboarding</span>
        </div>
        <span className="text-xs text-gray-500">Step {step} of 4</span>
      </div>

      {/* Main card */}
      <div className="my-auto max-w-xl w-full mx-auto py-8">
        <div className="glass rounded-2xl p-8 shadow-xl shadow-indigo-950/20 border border-white/10 space-y-6 relative overflow-hidden">
          
          {/* Progress bar */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden absolute top-0 left-0 right-0">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Tell us about yourself</h2>
                <p className="text-xs text-gray-400 mt-1">We will construct a customized learning path based on this.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Alice Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Education Level</label>
                    <select
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    >
                      <option>High School</option>
                      <option>Undergraduate</option>
                      <option>Postgraduate</option>
                      <option>Self-learner</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Desired Career Goal</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Machine Learning Engineer"
                    value={careerInterest}
                    onChange={(e) => setCareerInterest(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Learning Habits */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Your study habits</h2>
                <p className="text-xs text-gray-400 mt-1">This defines resource structures and time thresholds.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preferred Learning Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Visual', desc: 'Videos, charts, and diagrams' },
                      { name: 'Auditory', desc: 'Lectures, speech, and discussions' },
                      { name: 'Reading', desc: 'Articles, books, and workbooks' },
                      { name: 'Kinesthetic', desc: 'Practice exercises and sandboxes' }
                    ].map((style) => (
                      <button
                        key={style.name}
                        type="button"
                        className={`p-3 text-left border rounded-xl transition ${learningStyle === style.name ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900/50 border-white/10 text-gray-400 hover:bg-slate-900'}`}
                        onClick={() => setLearningStyle(style.name)}
                      >
                        <h4 className="text-sm font-semibold">{style.name}</h4>
                        <p className="text-xxs text-gray-500 mt-0.5">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Daily Dedicated Study (Hours)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      value={dailyStudyTime}
                      onChange={(e) => setDailyStudyTime(parseInt(e.target.value))}
                    />
                    <span className="text-sm font-bold text-indigo-400 shrink-0 w-12 text-right">{dailyStudyTime} hrs/day</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferred Subjects & Strengths */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Interests & Core Strengths</h2>
                <p className="text-xs text-gray-400 mt-1">Select topics you wish to study and skills you feel confident in.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Preferred Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {subjectPresets.map((sub) => {
                      const selected = preferredSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selected ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-white/10 text-gray-400 hover:border-white/20'}`}
                          onClick={() => handleToggle(sub, preferredSubjects, setPreferredSubjects)}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Strength Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {strengthPresets.map((str) => {
                      const selected = strengthAreas.includes(str);
                      return (
                        <button
                          key={str}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selected ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-white/10 text-gray-400 hover:border-white/20'}`}
                          onClick={() => handleToggle(str, strengthAreas, setStrengthAreas)}
                        >
                          {str}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Weak Areas & Finalize */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Identify Weaknesses</h2>
                <p className="text-xs text-gray-400 mt-1">These will become the direct core focuses of your Week 1 roadmap.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Areas Requiring Improvement</label>
                  <div className="flex flex-wrap gap-2">
                    {weaknessPresets.map((weak) => {
                      const selected = weakAreas.includes(weak);
                      return (
                        <button
                          key={weak}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selected ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-white/10 text-gray-400 hover:border-white/20'}`}
                          onClick={() => handleToggle(weak, weakAreas, setWeakAreas)}
                        >
                          {weak}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex gap-3 text-xs text-indigo-300">
                  <Sparkles className="w-5 h-5 shrink-0 text-indigo-400 animate-pulse" />
                  <div>
                    <h5 className="font-semibold text-white">AI Roadmap Core Triggered</h5>
                    <p className="text-gray-400 mt-0.5">Click submit. Our backend AI agent will assemble a 4-week roadmap using scikit-learn recommendation metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between border-t border-white/5 pt-6 mt-4">
            <button
              type="button"
              className={`flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition cursor-pointer"
                onClick={() => {
                  if (step === 1 && !name) {
                    setError('Please specify your name.');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                className="flex items-center gap-1.5 py-2 px-5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                onClick={handleOnboardSubmit}
              >
                {loading ? 'Assembling Profile...' : 'Finalize & Submit'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Footer support notice */}
      <div className="text-center text-xxs text-gray-600 pb-4">
        Platform supports WCAG accessibility compliance standards. SDG 4: Quality Education.
      </div>
    </div>
  );
}
