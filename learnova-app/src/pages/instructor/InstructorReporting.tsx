import React from "react";
import { BarChart3 } from "lucide-react";

export default function InstructorReporting() {
  return (
    <div className="space-y-6 font-sans relative z-10 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-900/5 transition-all overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
            Instructor Analytics
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Course metrics and engagement tracking will appear here dynamically.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-32 text-center shadow-inner relative overflow-hidden">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner border border-white relative z-10">
          <BarChart3 className="h-10 w-10 text-indigo-400" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight relative z-10">Metrics Accumulating</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm font-medium relative z-10">
          Advanced cohort analytics and course engagement visualizations will deploy upon threshold verification.
        </p>
      </div>
    </div>
  );
}
