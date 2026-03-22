import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { BarChart3, TrendingUp, Users, GraduationCap, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminReporting() {
  const { token } = useAuth();
  const [stats, setStats] = React.useState<null | {
    total_users: number;
    total_courses: number;
    completed_courses: number;
    in_progress_courses: number;
  }>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!token) return;
    api.adminDashboard(token)
      .then((s) => { setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const hasData = stats && (stats.total_users > 0 || stats.total_courses > 0);
  const total = (stats?.in_progress_courses ?? 0) + (stats?.completed_courses ?? 0);
  const completionRate = total > 0 ? Math.round((stats!.completed_courses / total) * 100) : 0;

  const kpiCards = [
    { label: "Total Platform Users", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", dot: "bg-blue-400" },
    { label: "Global Completion Rate", value: `${completionRate}%`, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-400" },
    { label: "Active Enrollments", value: stats?.in_progress_courses ?? 0, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 border-amber-100", dot: "bg-amber-400" },
    { label: "Published Courses", value: stats?.total_courses ?? 0, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100", dot: "bg-indigo-400" },
  ];

  return (
    <div className="space-y-8 font-sans relative z-10 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-900/5 overflow-hidden relative group transition-all">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-white shadow-inner">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                Reporting & Analytics
              </h1>
              <p className="max-w-xl mt-1 text-sm font-medium text-gray-500">
                Global performance overview, completion metrics, and cohort engagement timelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k, idx) => (
          <div 
            key={k.label} 
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-xl shadow-indigo-900/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 animate-fade-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="absolute top-4 right-4 h-2 w-2 rounded-full ring-4 ring-white shadow-sm opacity-50 group-hover:opacity-100 transition-opacity" className={cn("absolute top-5 right-5 h-2.5 w-2.5 rounded-full ring-4 ring-white shadow-sm transition-all duration-300", k.dot)} />
            
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl mb-5 border shadow-inner transition-transform group-hover:scale-110 duration-300", k.bg)}>
              <k.icon className={cn("h-6 w-6", k.color)} />
            </div>
            {loading ? (
              <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse mb-1 mt-2" />
            ) : (
              <p className="text-3xl font-black text-gray-900 tracking-tight">{k.value}</p>
            )}
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
              {k.label}
            </p>
          </div>
        ))}
      </div>

      {!loading && !hasData ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 text-center shadow-inner relative overflow-hidden mt-8">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner border border-white">
            <BarChart3 className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Accumulating</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md font-medium px-4">
            Advanced analytics and cohort visualizations will compile dynamically once learners initiate course progression.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
          
          {/* Enrollment Summary */}
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-indigo-900/5 transition-all hover:shadow-2xl hover:shadow-indigo-900/10">
            <h2 className="mb-6 border-b border-gray-100/60 pb-3 text-sm font-extrabold uppercase tracking-widest text-gray-800">
              Engagement Trajectory
            </h2>
            <div className="space-y-6">
              {[
                { label: "Total Lifetime Enrollments", value: total, color: "bg-gradient-to-r from-blue-500 to-indigo-500" },
                { label: "Successfully Graduated", value: stats?.completed_courses ?? 0, color: "bg-gradient-to-r from-emerald-400 to-teal-500" },
                { label: "Currently Active", value: stats?.in_progress_courses ?? 0, color: "bg-gradient-to-r from-amber-400 to-orange-500" },
              ].map((row) => {
                const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
                return (
                  <div key={row.label} className="group">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">{row.label}</span>
                      <span className="text-sm font-black text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">{row.value}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100/80 shadow-inner overflow-hidden border border-gray-200/50">
                      <div className={cn("h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden", row.color)} style={{ width: `${pct}%` }}>
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion Rate Chart Stand-in */}
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-indigo-900/5 transition-all hover:shadow-2xl hover:shadow-indigo-900/10 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full blur-[40px] pointer-events-none" />
            
            <h2 className="w-full mb-6 border-b border-gray-100/60 pb-3 text-sm font-extrabold uppercase tracking-widest text-gray-800 text-left relative z-10">
              Graduation Index
            </h2>
            
            <div className="flex flex-col items-center justify-center py-6 flex-1 relative z-10 w-full">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-2xl shadow-emerald-900/10">
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="8" className="text-gray-50" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * completionRate) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" />
                </svg>
                <div className="text-center">
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-800">{completionRate}%</p>
                </div>
              </div>
              <p className="mt-8 text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-gray-900">{stats?.completed_courses ?? 0}</span> out of <span className="text-gray-900">{total}</span> enrollments satisfied
              </p>
            </div>
            
            <div className="mt-2 w-full rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 p-4 flex items-start gap-3 relative z-10">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs font-medium text-gray-500 leading-relaxed pt-0.5">
                Comprehensive data visualizations and heatmaps will deploy once demographic variance reaches analytical thresholds.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
