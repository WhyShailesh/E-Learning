import React from "react";
import {
  Users, GraduationCap, PlayCircle, CheckCircle2,
  Activity, ArrowUpRight, Clock, AlertCircle, BarChart3, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
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

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Total Users", value: stats?.total_users, icon: Users, color: "text-blue-600", bg: "bg-blue-50/80 border-blue-100", shadow: "shadow-blue-500/10" },
    { label: "Total Courses", value: stats?.total_courses, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50/80 border-indigo-100", shadow: "shadow-indigo-500/10" },
    { label: "In Progress", value: stats?.in_progress_courses, icon: PlayCircle, color: "text-amber-600", bg: "bg-amber-50/80 border-amber-100", shadow: "shadow-amber-500/10" },
    { label: "Completed", value: stats?.completed_courses, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-100", shadow: "shadow-emerald-500/10" },
  ];

  const hasData = stats && (stats.total_users > 0 || stats.total_courses > 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-indigo-900/5 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-[50px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300/20 rounded-full blur-[50px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" /> {greeting}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
              Admin Platform Overview
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium max-w-lg">
              Monitor key metrics, manage premium courses, and oversee user progress from your centralized command center.
            </p>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner border border-white">
            <Activity className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, idx) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-xl shadow-indigo-900/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 animate-fade-up"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl mb-5 border shadow-sm", s.bg, s.shadow)}>
              <s.icon className={cn("h-6 w-6", s.color)} />
            </div>
            {loading ? (
              <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse mb-1" />
            ) : (
              <p className="text-3xl font-black text-gray-900 tracking-tight">{s.value ?? 0}</p>
            )}
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state or panels */}
      {!loading && !hasData ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 text-center shadow-inner relative overflow-hidden">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-100 shadow-sm border border-white relative z-10">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xl font-extrabold text-gray-900 tracking-tight relative z-10">No activity data yet</p>
          <p className="mt-2 text-sm text-gray-500 max-w-sm relative z-10 font-medium">
            Start by adding premium courses and inviting learners. Analytics and metrics will populate here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Quick Overview Panel */}
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-shadow">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100/60 pb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800">Quick Analytics</h2>
              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-indigo-500" />
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Total enrolled users", value: stats?.total_users ?? 0, color: "text-blue-600", dot: "bg-blue-500" },
                { label: "Published courses", value: stats?.total_courses ?? 0, color: "text-indigo-600", dot: "bg-indigo-500" },
                { label: "Completed enrollments", value: stats?.completed_courses ?? 0, color: "text-emerald-600", dot: "bg-emerald-500" },
                { label: "In-progress enrollments", value: stats?.in_progress_courses ?? 0, color: "text-amber-600", dot: "bg-amber-500" },
              ].map((row) => (
                <div key={row.label} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className={cn("w-2 h-2 rounded-full", row.dot)} />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{row.label}</span>
                  </div>
                  <span className={cn("text-base font-black px-3 py-1 bg-gray-50 rounded-lg whitespace-nowrap", row.color)}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-7 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-shadow">
            <h2 className="mb-6 border-b border-gray-100/60 pb-4 text-sm font-extrabold uppercase tracking-widest text-gray-800">Administrator Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: GraduationCap, label: "Manage Courses", desc: "Curate the premium catalog", href: "/admin/courses", color: "text-indigo-600", bg: "bg-indigo-50 group-hover:bg-indigo-100" },
                { icon: Users, label: "Participants", desc: "Oversee learner accounts", href: "/admin/participants", color: "text-emerald-600", bg: "bg-emerald-50 group-hover:bg-emerald-100" },
                { icon: Clock, label: "Instructors", desc: "Assign course permissions", href: "/admin/instructors", color: "text-amber-600", bg: "bg-amber-50 group-hover:bg-amber-100" },
                { icon: BarChart3, label: "Analytics", desc: "Global metric reporting", href: "/admin/reporting", color: "text-blue-600", bg: "bg-blue-50 group-hover:bg-blue-100" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex flex-col gap-3 rounded-2xl p-4 border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-colors", item.bg)}>
                      <item.icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
