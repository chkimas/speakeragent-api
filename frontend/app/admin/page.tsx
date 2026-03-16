"use client";

import React from 'react';
import { Mic, Sparkles, HeartPulse, BarChart3, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Speaker Interest', value: '1,284', icon: Mic },
  { label: 'Gigs Identified', value: '8,432', icon: Sparkles },
  { label: 'Match Quality', value: '74%', icon: TrendingUp },
  { label: 'App Reliability', value: 'Healthy', icon: HeartPulse, color: 'text-green-500' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Speaker Success Center</h1>
          <p className="text-slate-600 text-lg">Overview of community growth and opportunity matching.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <stat.icon className="w-6 h-6 text-blue-600 mb-4" />
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-tight">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color || 'text-slate-900'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Speaker Activity</h2>
          <div className="space-y-6">
            {['Dr. Leigh Vinocur', 'Aaron Camp', 'Justin B.'].map((name) => (
              <div key={name} className="flex justify-between items-center p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{name}</p>
                    <p className="text-sm text-slate-500">14 new gigs found this week</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Up to date
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );  
}