import React from "react";
import {
  Users, GraduationCap, PlayCircle, CheckCircle2,
  TrendingUp, Activity, ArrowUpRight, Clock, AlertCircle, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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
    { label: "Total Users", value: stats?.total_users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Courses", value: stats?.total_courses, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "In Progress", value: stats?.in_progress_courses, icon: PlayCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed", value: stats?.completed_courses, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const hasData = stats && (stats.total_users > 0 || stats.total_courses > 0);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">{greeting}</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Overview of your Learnova platform.</p>
          </div>
          <Activity className="h-8 w-8 text-indigo-200 hidden sm:block" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-4", s.bg)}>
              <s.icon className={cn("h-[18px] w-[18px]", s.color)} />
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded bg-gray-100 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{s.value ?? 0}</p>
            )}
            <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state or panels */}
      {!loading && !hasData ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No data yet</p>
          <p className="mt-1 text-xs text-gray-400 max-w-xs">
            Start by adding courses and inviting learners. Data will appear here once activity begins.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Quick Overview</h2>
              <ArrowUpRight className="h-4 w-4 text-gray-300" />
            </div>
            <div className="space-y-0 divide-y divide-gray-100">
              {[
                { label: "Total enrolled users", value: stats?.total_users ?? 0 },
                { label: "Published courses", value: stats?.total_courses ?? 0 },
                { label: "Completed enrollments", value: stats?.completed_courses ?? 0 },
                { label: "In-progress enrollments", value: stats?.in_progress_courses ?? 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Getting Started</h2>
            <div className="space-y-1">
              {[
                { icon: GraduationCap, label: "Create your first course", href: "/admin/courses" },
                { icon: Users, label: "Add participants & learners", href: "/admin/participants" },
                { icon: Clock, label: "Set up instructors", href: "/admin/instructors" },
                { icon: BarChart3, label: "View platform analytics", href: "/admin/reporting" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors group"
                >
                  <item.icon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                  {item.label}
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
