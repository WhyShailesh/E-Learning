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
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In Progress", value: stats?.in_progress_courses ?? 0, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Courses", value: stats?.total_courses ?? 0, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reporting</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">Platform analytics and performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-4", k.bg)}>
              <k.icon className={cn("h-[18px] w-[18px]", k.color)} />
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded bg-gray-100 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            )}
            <p className="mt-0.5 text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      {!loading && !hasData ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
            <BarChart3 className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No reporting data yet</p>
          <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
            Analytics will appear once users start enrolling in courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Enrollment Summary</h2>
            <div className="space-y-4">
              {[
                { label: "Total Enrollments", value: total, color: "bg-indigo-500" },
                { label: "Completed", value: stats?.completed_courses ?? 0, color: "bg-emerald-500" },
                { label: "In Progress", value: stats?.in_progress_courses ?? 0, color: "bg-amber-400" },
              ].map((row) => {
                const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[12px] text-gray-500">{row.label}</span>
                      <span className="text-[12px] font-semibold text-gray-800">{row.value}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div className={cn("h-1.5 rounded-full transition-all", row.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Course Completion Rate</h2>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-emerald-100">
                <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                {stats?.completed_courses ?? 0} of {total} enrollments completed
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-400">
              <AlertCircle className="inline h-3.5 w-3.5 mr-1 text-gray-300" />
              Detailed charts will be available once more data is collected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
