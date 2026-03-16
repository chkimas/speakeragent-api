"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Target, PenTool, CheckCircle2, Terminal } from 'lucide-react';

const steps = [
  { id: 'scout', label: 'Scout Agent: Scanning Conferences', icon: Search, file: 'scout.py' },
  { id: 'scoring', label: 'Scoring Agent: Matching Expertise', icon: Target, file: 'scoring.py' },
  { id: 'pitch', label: 'Pitch Agent: Generating Pitches', icon: PenTool, file: 'pitch.py' },
];

export default function ProcessingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress > 33 && activeStep === 0) setActiveStep(1);
    if (progress > 66 && activeStep === 1) setActiveStep(2);
  }, [progress, activeStep]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Preparing Your Leads</h1>
          <p className="text-slate-400">Estimated time: 2–5 minutes</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-slate-700">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between text-sm mb-2 font-mono">
              <span className="text-blue-400">System Processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Agent Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isDone = index < activeStep;
              const isCurrent = index === activeStep;
              return (
                <div key={step.id} className={`flex items-center gap-4 transition-all ${isCurrent ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                  <div className={`p-3 rounded-lg ${isDone ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {isDone ? <CheckCircle2 size={20} /> : isCurrent ? <Loader2 size={20} className="animate-spin" /> : <step.icon size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{step.label}</p>
                    {isCurrent && (
                      <p className="text-xs font-mono text-blue-400 mt-1">Executing src/agent/{step.file}...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal Console */}
          <div className="mt-12 bg-black/50 rounded-lg p-4 font-mono text-xs text-green-500 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-2">
              <Terminal size={14} />
              <span>Agent Activity Log</span>
            </div>
            <div className="space-y-1 h-16 overflow-hidden">
              <p className="animate-pulse">{`> [INFO] Initializing orchestrator...`}</p>
              {progress > 20 && <p>{`> [INFO] Loading leigh_vinocur profile...`}</p>}
              {progress > 40 && <p>{`> [INFO] Scraping recent conference URLs...`}</p>}
              {progress > 80 && <p>{`> [SUCCESS] Generated 15 high-match leads.`}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}