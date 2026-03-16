"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Target, PenTool, CheckCircle2, Mic2 } from 'lucide-react';

const steps = [
  { id: 'scout', label: 'Finding Relevant Stages', icon: Search },
  { id: 'scoring', label: 'Checking for Interest Fit', icon: Target },
  { id: 'pitch', label: 'Writing Your Personal Intro', icon: PenTool },
];

export default function ProcessingPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress > 33 && activeStep === 0) setActiveStep(1);
    if (progress > 66 && activeStep === 1) setActiveStep(2);
  }, [progress, activeStep]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <Mic2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Finding Your Next Stage</h1>
          <p className="text-slate-400 font-medium text-lg">We're curating the best speaking opportunities for you.</p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl p-10 shadow-2xl border border-slate-700">
          <div className="mb-12">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-blue-400 font-medium uppercase tracking-wider">Curating Content...</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const isDone = index < activeStep;
              const isCurrent = index === activeStep;
              const Icon = step.icon;
              return (
                <div key={step.id} className={`flex items-center gap-5 transition-all ${isCurrent ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                  <div className={`p-3 rounded-full ${isDone ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {isDone ? <CheckCircle2 size={24} /> : isCurrent ? <Loader2 size={24} className="animate-spin" /> : <Icon size={24} />}
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{step.label}</p>
                    {isCurrent && <p className="text-sm text-blue-400">Our assistant is analyzing event themes...</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}