import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Search, Users, Mail, BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
  inactive: "text-gray-500 bg-gray-100 ring-1 ring-gray-200",
  completed: "text-blue-700 bg-blue-50 ring-1 ring-blue-200",
};

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

export default function AdminParticipants() {
  const { token } = useAuth();
  const [participants, setParticipants] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!token) return;
    const fetchParticipants = async () => {
      try {
        const data = await api.getParticipants(token);
        if (Array.isArray(data)) setParticipants(data);
      } catch {
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [token]);

  const filtered = participants.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = participants.filter((p) => p.status === "active").length;
  const completedCount = participants.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Participants</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {loading ? "Loading…" : `${participants.length} registered learners`}
          </p>
        </div>
        {participants.length > 0 && (
          <div className="flex gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-600 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {activeCount} active
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-600 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              {completedCount} completed
            </div>
          </div>
        )}
      </div>

      {!loading && participants.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors shadow-sm"
          />
        </div>
      )}

      {loading ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-gray-100 animate-pulse" />
                <div className="h-2.5 w-48 rounded bg-gray-50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No participants yet</p>
          <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
            Participants will appear here once learners sign up and enroll in courses.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Learner</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-center">Enrolled</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-center">Completed</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p, i) => (
                  <tr key={p.id ?? i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                          {p.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <span className="text-[13px] font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Mail className="h-3 w-3" />{p.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[13px] text-gray-600">
                        <BookOpen className="h-3.5 w-3.5 text-gray-400" />{p.enrolled ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-[13px] font-semibold text-gray-700">{p.completed ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize", STATUS_STYLES[p.status ?? "inactive"] ?? STATUS_STYLES.inactive)}>
                        {p.status ?? "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-gray-500">
                      {p.joined ?? p.created_at ?? "—"}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                      No participants match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
