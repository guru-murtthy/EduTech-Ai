'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { student, roadmap, recommendations, career } from '@/lib/api';
import { 
  User, Award, TrendingUp, Sparkles, BookOpen, Clock, 
  CheckCircle, ChevronRight, ArrowRight, Play, FileText, Link as LinkIcon, Compass, AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [careersList, setCareersList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem('token');
        if (token === 'demo-token') {
          // Setup mock data for quick bypass demo
          setProfile({
            name: 'Demo Student',
            age: 20,
            educationLevel: 'Undergraduate',
            learningStyle: 'Visual',
            careerInterest: 'Software Engineer',
            preferredSubjects: 'Data Structures,Algorithms',
            dailyStudyTime: 4.5,
            strengthAreas: 'Problem Solving,Coding Syntax',
            weakAreas: 'Algorithmic Complexity,JWT Tokens & Security'
          });
          setRoadmapData({
            weeks: [
              {
                week_number: 1,
                title: 'Introduction to Algorithms & Asymptotic Notation',
                learning_goals: 'Analyze basic algorithm runtimes and solve search tasks.',
                topics: ['O(N) vs O(log N) runtime bounds', 'Linear Search steps', 'Binary Search partitioning'],
                resources: [
                  { title: 'Linear vs. Binary Search Complexity Analysis', type: 'Article', link: '#' },
                  { title: 'Introduction to Binary Search Algorithms', type: 'Video', link: '#' }
                ],
                practice_tasks: ['Complete O(log N) mathematical proofs', 'Simulate Binary Search step bounds in Algorithmic Lab']
              },
              {
                week_number: 2,
                title: 'Data Structure Foundations & Arrays',
                learning_goals: 'Implement linked lists and basic array sorting structures.',
                topics: ['Array memory allocations', 'Linked list element linking', 'Insertion Sort partitioning'],
                resources: [
                  { title: 'Array memory pointers tutorial', type: 'Video', link: '#' }
                ],
                practice_tasks: ['Write linked list deletion script', 'Implement custom insertion sort in Python']
              },
              {
                week_number: 3,
                title: 'Advanced Recursion & Divide-and-Conquer',
                learning_goals: 'Resolve complex tree partition limits and recurse boundaries.',
                topics: ['Call stacks & activation records', 'Base cases and recurrence relations', 'Merge Sort partitioning'],
                resources: [
                  { title: 'Recursion visualization workbook', type: 'PDF', link: '#' }
                ],
                practice_tasks: ['Solve Tower of Hanoi in 15 moves', 'Implement merge sort recursion tree']
              },
              {
                week_number: 4,
                title: 'Capstone Sandbox & Security Patterns',
                learning_goals: 'Complete API token hashing configurations.',
                topics: ['JWT payloads and headers', 'Salt encryption algorithms', 'API route interceptors'],
                resources: [
                  { title: 'JWT Authentication introduction', type: 'Article', link: '#' }
                ],
                practice_tasks: ['Create basic Spring Security filter class', 'Submit Capstone code repository for evaluation']
              }
            ]
          });
          setRecs([
            { title: 'Introduction to Binary Search Algorithms', format: 'YouTube', score: 95, reason: 'Matches your weak area in Algorithmic Complexity and visual preference.', topic: 'Algorithms', url: '#' },
            { title: 'Linear vs. Binary Search Complexity Analysis', format: 'Article', score: 90, reason: 'Matches your weak area in Algorithmic Complexity.', topic: 'Algorithms', url: '#' },
            { title: 'Spring Boot REST API Security Tutorial', format: 'YouTube', score: 85, reason: 'Highly aligned with weak area in JWT Tokens & Security.', topic: 'Web Development', url: '#' },
            { title: 'Binary Search Indexing Challenge', format: 'Practice', score: 80, reason: 'Reinforces arrays and search partitioning concepts.', topic: 'Algorithms', url: '#' }
          ]);
          setCareersList([
            { career_name: 'Software Engineer', description: 'Designs and builds backend architectures.', required_skills: ['Java', 'Algorithms', 'Databases'], learning_path: ['Study algorithms', 'Learn Spring Boot'], growth_potential: 'High' },
            { career_name: 'ML Engineer', description: 'Trains and tunes predictive classifiers.', required_skills: ['Python', 'scikit-learn', 'Statistics'], learning_path: ['Learn Python', 'Master Random Forest'], growth_potential: 'Exponential' },
            { career_name: 'AI PM', description: 'Secures business alignment for AI.', required_skills: ['UI/UX', 'Product Planning'], learning_path: ['Study ML basics', 'Conduct user tests'], growth_potential: 'Very High' }
          ]);
          setAnalytics({
            quizAttempts: [
              { topic: 'Algorithms', difficulty: 'Medium', score: 65, completedAt: '2026-06-14' }
            ],
            knowledgeGaps: [
              { weakTopic: 'Algorithms', weakSkill: 'Complexity Bounds & Search Partitioning', improvementPlan: 'Complete the Binary Search visualizer run step trace inside the Algorithmic Lab.' }
            ],
            latestPrediction: {
              predictedGrade: 'B',
              successProbability: 78.5,
              riskLevel: 'Low'
            },
            totalQuizzesTaken: 1,
            averageScore: 65.0
          });
        } else {
          // Call Spring Boot REST endpoints
          const profRes = await student.getProfile();
          setProfile(profRes.profile);
          
          const rmRes = await roadmap.getRoadmap();
          if (rmRes.hasRoadmap) {
            setRoadmapData(typeof rmRes.roadmap === 'string' ? JSON.parse(rmRes.roadmap) : rmRes.roadmap);
          }
          
          const recRes = await recommendations.get();
          setRecs(recRes);
          
          const carRes = await career.get();
          setCareersList(typeof carRes.careers === 'string' ? JSON.parse(carRes.careers) : carRes.careers);

          const analRes = await student.getAnalytics();
          setAnalytics(analRes);
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-400 font-medium">Assembling your custom dashboard...</p>
        </div>
      </div>
    );
  }

  const currentWeekInfo = roadmapData?.weeks?.find((w: any) => w.week_number === activeWeek);

  return (
    <div className="space-y-8">
      {/* Dashboard Top Banner */}
      <div className="glass rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-xxs text-indigo-300 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Active Student Profile
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Hello, {profile?.name || 'Scholar'}!</h1>
          <p className="text-sm text-gray-400 max-w-md">Your digital mentor is active. Ready to pursue your career goal of <span className="text-indigo-400 font-bold">{profile?.careerInterest}</span>.</p>
        </div>

        {/* Quick specs pill */}
        <div className="flex gap-4 shrink-0 relative z-10">
          <div className="px-4 py-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
            <span className="text-xxs text-gray-500 font-semibold uppercase tracking-wider block">Learning Style</span>
            <span className="text-sm font-bold text-white mt-1 block">{profile?.learningStyle}</span>
          </div>
          <div className="px-4 py-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
            <span className="text-xxs text-gray-500 font-semibold uppercase tracking-wider block">Weekly Goal</span>
            <span className="text-sm font-bold text-white mt-1 block">{(profile?.dailyStudyTime * 7).toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Roadmap & Recommendations), Right Column (ML Predictions, Knowledge Gaps, Career) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left side (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Timeline Roadmap */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Learning Roadmap</h3>
                <p className="text-xxs text-gray-400 mt-0.5">Your 4-week AI generated plan.</p>
              </div>
              <div className="flex bg-slate-900 border border-white/5 rounded-lg p-0.5">
                {[1, 2, 3, 4].map((wk) => (
                  <button
                    key={wk}
                    onClick={() => setActiveWeek(wk)}
                    className={`px-3 py-1.5 rounded-md text-xxs font-semibold transition cursor-pointer ${activeWeek === wk ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Wk {wk}
                  </button>
                ))}
              </div>
            </div>

            {currentWeekInfo ? (
              <div className="space-y-6 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-indigo-300">
                    {currentWeekInfo.title}
                  </h4>
                  <p className="text-xs text-gray-400 italic">
                    Goal: {currentWeekInfo.learning_goals}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Topics & Tasks */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h5 className="text-xxs font-bold uppercase tracking-wider text-gray-500">Core Topics</h5>
                      <ul className="space-y-1.5">
                        {currentWeekInfo.topics?.map((topic: string, i: number) => (
                          <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xxs font-bold uppercase tracking-wider text-gray-500">Practice Assignments</h5>
                      <ul className="space-y-1.5">
                        {currentWeekInfo.practice_tasks?.map((task: string, i: number) => (
                          <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Curated Resources */}
                  <div className="space-y-3 bg-slate-900/40 border border-white/5 rounded-xl p-4">
                    <h5 className="text-xxs font-bold uppercase tracking-wider text-gray-500 mb-2">Weekly study resources</h5>
                    <div className="space-y-3">
                      {currentWeekInfo.resources?.map((res: any, i: number) => (
                        <a
                          key={i}
                          href={res.link}
                          className="flex justify-between items-center p-2.5 rounded-lg border border-white/5 bg-slate-950/50 hover:bg-slate-950 transition group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {res.type === 'Video' ? <Play className="w-4 h-4 text-red-400 shrink-0" /> : <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                            <span className="text-xs text-gray-300 font-medium truncate group-hover:text-white">{res.title}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">No active roadmap. Re-create your profile to trigger.</div>
            )}
          </div>

          {/* Smart Resource Recommender */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Smart Resource Recommendations</h3>
              <p className="text-xxs text-gray-400 mt-0.5">Ranked using topic relevance, difficulty match, and learning style.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recs.map((rec: any, i: number) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col justify-between hover:border-indigo-500/30 transition group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xxs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {rec.topic}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400 shrink-0">
                        {rec.score}% Match
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                      {rec.title}
                    </h4>

                    <p className="text-xxs text-gray-400 line-clamp-2 leading-relaxed">
                      {rec.reason || 'General relevance recommendation.'}
                    </p>
                  </div>

                  <a 
                    href={rec.url || '#'}
                    className="mt-4 flex items-center gap-1 text-xxs font-semibold text-gray-400 hover:text-white transition group/btn"
                  >
                    Launch Resource
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Performance Prediction - Random Forest */}
          <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden bg-gradient-to-br from-indigo-950/20 to-purple-950/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full pointer-events-none"></div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Performance Prediction
                </h3>
                <p className="text-xxs text-gray-400">Trained via Random Forest model based on quiz metrics.</p>
              </div>

              {analytics?.latestPrediction ? (
                <div className="space-y-4 pt-2">
                  {/* Gauge style score */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                      <span className="text-xxs text-gray-500 font-semibold uppercase tracking-wider block">Predicted Grade</span>
                      <span className="text-2xl font-black text-indigo-400 mt-1 block">
                        {analytics.latestPrediction.predictedGrade}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                      <span className="text-xxs text-gray-500 font-semibold uppercase tracking-wider block">Risk Level</span>
                      <span className={`text-sm font-bold mt-2 block ${analytics.latestPrediction.riskLevel.toLowerCase() === 'high' ? 'text-red-400' : (analytics.latestPrediction.riskLevel.toLowerCase() === 'medium' ? 'text-amber-400' : 'text-emerald-400')}`}>
                        {analytics.latestPrediction.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Progress slide */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xxs font-semibold">
                      <span className="text-gray-400">Success Probability</span>
                      <span className="text-white font-bold">{analytics.latestPrediction.successProbability}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${analytics.latestPrediction.successProbability}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-gray-500 leading-relaxed pt-1 flex gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                    <span>Calculations account for {analytics.totalQuizzesTaken} quiz history records and your daily {(profile?.dailyStudyTime || 2)} hour study budget.</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-dashed border-white/5 text-center py-8">
                  <p className="text-xs text-gray-500">No prediction available.</p>
                  <button 
                    onClick={() => router.push('/dashboard/quiz')}
                    className="mt-3 text-xxs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5"
                  >
                    Take a quiz to run model
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Knowledge Gaps */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Detected Gaps</h3>
              <p className="text-xxs text-gray-400 mt-0.5">Identified automatically from quiz attempts scoring below 70%.</p>
            </div>

            {analytics?.knowledgeGaps && analytics.knowledgeGaps.length > 0 ? (
              <div className="space-y-3">
                {analytics.knowledgeGaps.map((gap: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl border border-red-500/10 bg-red-500/[0.02] space-y-2">
                    <h5 className="text-xs font-bold text-red-400">{gap.weakTopic}</h5>
                    <p className="text-xxs text-gray-400 leading-relaxed">{gap.improvementPlan}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 text-center text-xs text-emerald-400/80 font-medium py-6">
                ✨ No critical knowledge gaps detected! Keep it up.
              </div>
            )}
          </div>

          {/* Career Recommendations */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Career Suggestions
              </h3>
              <p className="text-xxs text-gray-400 mt-0.5">Matched paths based on skills and preferences.</p>
            </div>

            <div className="space-y-3">
              {careersList.map((careerItem: any, i: number) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/40 transition"
                >
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold text-white">{careerItem.career_name}</h5>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      {careerItem.growth_potential} Growth
                    </span>
                  </div>
                  <p className="text-xxs text-gray-400 leading-relaxed mt-1">{careerItem.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
