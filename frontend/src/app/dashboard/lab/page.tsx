'use client';

import { useState } from 'react';
import { Play, RotateCcw, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, Activity, Sparkles, BookOpen } from 'lucide-react';

export default function AlgorithmicLab() {
  // Simulator State
  const [arraySize, setArraySize] = useState(16);
  const [targetVal, setTargetVal] = useState(42);
  const [activeSearch, setActiveSearch] = useState<'NONE' | 'LINEAR' | 'BINARY'>('NONE');
  
  // Running state pointers
  const [linearIdx, setLinearIdx] = useState(-1);
  const [binaryLow, setBinaryLow] = useState(-1);
  const [binaryHigh, setBinaryHigh] = useState(-1);
  const [binaryMid, setBinaryMid] = useState(-1);
  
  const [comparisons, setComparisons] = useState(0);
  const [stepsLog, setStepsLog] = useState<string[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState(600); // ms

  // Task Worksheet Answers
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [task3, setTask3] = useState('');
  
  const [taskFeedback, setTaskFeedback] = useState<string>('');
  const [verifying, setVerifying] = useState(false);

  // Generate sorted array
  // We'll generate a simple arithmetic sequence (e.g. 10, 15, 22, 28...)
  const sortedArray = [10, 15, 18, 22, 25, 30, 35, 42, 49, 55, 60, 68, 75, 82, 88, 95];

  const resetSimulation = () => {
    setActiveSearch('NONE');
    setLinearIdx(-1);
    setBinaryLow(-1);
    setBinaryHigh(-1);
    setBinaryMid(-1);
    setComparisons(0);
    setStepsLog([]);
  };

  // Run Linear Search Step-by-Step
  const runLinearSearch = async () => {
    resetSimulation();
    setActiveSearch('LINEAR');
    
    let tempComparisons = 0;
    const logs: string[] = [];
    
    for (let i = 0; i < sortedArray.length; i++) {
      setLinearIdx(i);
      tempComparisons++;
      setComparisons(tempComparisons);
      
      const currentVal = sortedArray[i];
      logs.push(`Step ${tempComparisons}: Check index ${i} (Value: ${currentVal})`);
      setStepsLog([...logs]);

      if (currentVal === targetVal) {
        logs.push(`SUCCESS: Found target ${targetVal} at index ${i} in ${tempComparisons} comparisons.`);
        setStepsLog([...logs]);
        return;
      }
      
      await new Promise((resolve) => setTimeout(resolve, simulationSpeed));
    }
    
    logs.push(`FAILED: Target ${targetVal} not found. Checked all ${sortedArray.length} items.`);
    setStepsLog([...logs]);
  };

  // Run Binary Search Step-by-Step (Decrease-and-Conquer)
  const runBinarySearch = async () => {
    resetSimulation();
    setActiveSearch('BINARY');

    let low = 0;
    let high = sortedArray.length - 1;
    let tempComparisons = 0;
    const logs: string[] = [];

    setBinaryLow(low);
    setBinaryHigh(high);

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      setBinaryMid(mid);
      tempComparisons++;
      setComparisons(tempComparisons);

      const currentVal = sortedArray[mid];
      logs.push(`Step ${tempComparisons}: Low index = ${low}, High index = ${high}. Midpoint index = ${mid} (Value: ${currentVal})`);
      setStepsLog([...logs]);

      await new Promise((resolve) => setTimeout(resolve, simulationSpeed));

      if (currentVal === targetVal) {
        logs.push(`SUCCESS: Found target ${targetVal} at index ${mid} in ${tempComparisons} comparisons.`);
        setStepsLog([...logs]);
        return;
      } else if (currentVal < targetVal) {
        logs.push(`  -> ${currentVal} is less than target ${targetVal}. Discarding left half (indices ${low} to ${mid}).`);
        setStepsLog([...logs]);
        low = mid + 1;
      } else {
        logs.push(`  -> ${currentVal} is greater than target ${targetVal}. Discarding right half (indices ${mid} to ${high}).`);
        setStepsLog([...logs]);
        high = mid - 1;
      }

      setBinaryLow(low);
      setBinaryHigh(high);
      await new Promise((resolve) => setTimeout(resolve, simulationSpeed));
    }

    logs.push(`FAILED: Target not found.`);
    setStepsLog([...logs]);
  };

  const handleVerifyTasks = async () => {
    if (!task1 || !task2 || !task3) {
      alert("Please fill in all 3 student tasks to submit for verification.");
      return;
    }
    setVerifying(true);
    // Simulate AI verification evaluation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTaskFeedback(`### 🎓 Mentor Evaluation Report

1. **Task 1: Complexity Analysis (Grade: A)**
   * Your analysis of Binary Search's $O(\\log N)$ time complexity is correct. By partitioning the search space in half (Decrease-and-Conquer), the depth of comparisons matches the logarithm base 2 of the list size.

2. **Task 2: Performance Comparison (Grade: A-)**
   * Excellent description. You correctly noted that for 1 million items, Linear Search takes $O(N)$ (up to 1,000,000 checks) whereas Binary Search takes only 20 steps. This is a $50,000\\times$ performance increase!

3. **Task 3: Personalized Learning Discussion (Grade: A)**
   * Correct connection to SDG 4. Using decrease-and-conquer structures inside LMS databases allows platforms to locate suitable difficulty materials dynamically without loading servers, ensuring quality personalized learning fits thin-bandwidth classrooms.

**Overall Status**: Completed and Verified successfully. Grade: 95/100.`);
    setVerifying(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          SDG 4 Algorithmic Lab
        </h1>
        <p className="text-xxs text-gray-500 mt-0.5">Explore **Decrease-and-Conquer** search algorithms step-by-step. Visualize performance gains on educational datasets.</p>
      </div>

      {/* Grid: Simulator (top/left) and Tasks Workbench (bottom/right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Simulator panel (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Linear vs. Binary Search Visualizer</h3>
                <p className="text-xxs text-gray-400">Search space of 16 educational resource items (sorted by relevance ID).</p>
              </div>
              <button 
                onClick={resetSimulation}
                className="p-2 rounded-lg bg-slate-900 border border-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Config controls */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xxs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1.5 uppercase">Target Resource Value</label>
                <select 
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                  value={targetVal}
                  onChange={(e) => {
                    setTargetVal(parseInt(e.target.value));
                    resetSimulation();
                  }}
                  disabled={activeSearch !== 'NONE'}
                >
                  {sortedArray.map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-500 font-semibold mb-1.5 uppercase">Simulation Speed</label>
                <select 
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                >
                  <option value={1000}>Slow (1s)</option>
                  <option value={600}>Medium (0.6s)</option>
                  <option value={200}>Fast (0.2s)</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                <button
                  onClick={runLinearSearch}
                  disabled={activeSearch !== 'NONE'}
                  className="flex-1 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold hover:bg-indigo-500/20 transition cursor-pointer text-center disabled:opacity-40"
                >
                  Linear
                </button>
                <button
                  onClick={runBinarySearch}
                  disabled={activeSearch !== 'NONE'}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition cursor-pointer text-center disabled:opacity-40"
                >
                  Binary
                </button>
              </div>
            </div>

            {/* Array Cells Visualizer */}
            <div className="space-y-3 pt-2">
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Index Array Grid</span>
              <div className="grid grid-cols-8 gap-2">
                {sortedArray.map((val, idx) => {
                  let cellClass = "border border-white/10 bg-slate-900/40 text-gray-400";
                  
                  if (activeSearch === 'LINEAR') {
                    if (idx === linearIdx) {
                      cellClass = val === targetVal ? "cell-target border" : "cell-scanned border";
                    } else if (idx < linearIdx) {
                      cellClass = "cell-scanned border opacity-50";
                    }
                  } else if (activeSearch === 'BINARY') {
                    const isMid = idx === binaryMid;
                    const inRange = idx >= binaryLow && idx <= binaryHigh;
                    
                    if (isMid) {
                      cellClass = val === targetVal ? "cell-target border" : "cell-mid border";
                    } else if (inRange) {
                      cellClass = "cell-active-range border text-white";
                    } else {
                      cellClass = "cell-ignored border";
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`py-3 rounded-lg text-center transition-all duration-300 ${cellClass}`}
                    >
                      <div className="text-[10px] text-gray-600 font-semibold mb-0.5">[{idx}]</div>
                      <div className="text-xs font-bold">{val}</div>
                    </div>
                  );
                })}
              </div>

              {/* Status info bar */}
              <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl flex justify-between items-center text-xxs">
                <span className="text-gray-400">Target Resource ID: <span className="text-indigo-400 font-bold">{targetVal}</span></span>
                <span className="text-gray-400">Comparisons Counter: <span className="text-purple-400 font-bold text-xs">{comparisons}</span></span>
              </div>
            </div>

            {/* Console output logs */}
            <div className="space-y-2 pt-2">
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Tracer Steps Console</span>
              <div className="bg-black/80 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-emerald-400 space-y-1 h-36 overflow-y-auto">
                {stepsLog.length === 0 && <span className="text-gray-600 italic">Select target and click Linear/Binary to initiate visual tracing...</span>}
                {stepsLog.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Tasks worksheet panel (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="glass rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Student Task Workbench
              </h3>
              <p className="text-xxs text-gray-400 mt-0.5">Submit complexity findings and personalized learning analyses for evaluation.</p>
            </div>

            <div className="space-y-4 pt-2 border-t border-white/5 text-xxs">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase">Task 1: Analyze Binary Search Complexity</label>
                <textarea
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white h-16 focus:outline-none focus:border-indigo-500"
                  placeholder="Explain why Binary Search takes O(log N) operations..."
                  value={task1}
                  onChange={(e) => setTask1(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase">Task 2: Compare Linear vs. Binary performance</label>
                <textarea
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white h-16 focus:outline-none focus:border-indigo-500"
                  placeholder="Compare step counts for N = 1,000,000 resources..."
                  value={task2}
                  onChange={(e) => setTask2(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase">Task 3: Discuss AI-driven personalized learning</label>
                <textarea
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white h-16 focus:outline-none focus:border-indigo-500"
                  placeholder="How does rapid search power adaptive platforms supporting SDG 4?"
                  value={task3}
                  onChange={(e) => setTask3(e.target.value)}
                />
              </div>

              <button
                onClick={handleVerifyTasks}
                disabled={verifying}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xxs font-bold text-white shadow transition cursor-pointer disabled:opacity-50"
              >
                {verifying ? 'Evaluating answers...' : 'Submit Answers for AI Grading'}
              </button>
            </div>

            {/* AI Grading result box */}
            {taskFeedback && (
              <div className="p-4 bg-indigo-500/[0.03] border border-indigo-500/20 rounded-xl space-y-2 text-xxs text-gray-300">
                {taskFeedback.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={i} className="text-xs font-bold text-white mt-1">{line.replace('### ', '')}</h4>;
                  } else if (line.startsWith('* ')) {
                    return <li key={i} className="list-disc pl-2 ml-2 leading-relaxed text-gray-400 mt-1">{line.substring(2)}</li>;
                  }
                  return <p key={i} className="leading-relaxed">{line}</p>;
                })}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
