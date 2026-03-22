import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Search, Users, Mail, BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 shadow-sm",
  inactive: "text-gray-500 bg-gray-50 ring-1 ring-gray-200 shadow-sm",
  completed: "text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200 shadow-sm",
};

const AVATAR_COLORS = ["bg-indigo-500", "bg-purple-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500"];

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
    <div className="space-y-6 font-sans relative z-10 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-900/5 transition-all overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
            Participant Records
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {loading ? "Loading…" : `Monitoring ${participants.length} registered learner${participants.length !== 1 ? "s" : ""} globally.`}
          </p>
        </div>
        
        {!loading && participants.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white border border-gray-100 px-4 py-2 text-sm font-extrabold text-gray-700 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              {activeCount} Active
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white border border-gray-100 px-4 py-2 text-sm font-extrabold text-gray-700 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
                <Clock className="h-4 w-4 text-indigo-500" />
              </div>
              {completedCount} Graduated
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {!loading && participants.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
          <input
            type="text"
            placeholder="Search learners by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 w-full rounded-2xl border border-white bg-white/60 backdrop-blur-md pl-12 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-sm shadow-xl shadow-indigo-900/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-5 border-b border-white/40 last:border-0">
              <div className="h-12 w-12 rounded-2xl bg-white/80 animate-pulse shadow-sm" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-48 rounded-md bg-white/80 animate-pulse" />
                <div className="h-3 w-64 rounded-md bg-white/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 text-center shadow-inner relative overflow-hidden">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner border border-white">
            <Users className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Empty Database</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm font-medium">
            Participants arrays will automatically compile and populate dynamically upon learner registration.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-2xl shadow-indigo-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/60 bg-white/40 backdrop-blur-md">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Learner Profile</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Encrypted Email</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Enrolled</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Completed</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Current Status</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {filtered.map((p, i) => (
                  <tr key={p.id ?? i} className="group hover:bg-white/80 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[14px] font-black text-white shadow-md relative overflow-hidden", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                           <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {p.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[15px] font-extrabold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors">{p.name}</p>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1 block">
                            ID: {p.id ?? "Unknown"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-gray-500">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        {p.email}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-[13px] font-extrabold text-indigo-700 shadow-sm shadow-indigo-900/5">
                        <BookOpen className="h-4 w-4 text-indigo-400 opacity-70" />
                        {p.enrolled ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-3 py-1.5 text-[14px] font-black text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm">
                        {p.completed ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all shadow-sm", STATUS_STYLES[p.status ?? "inactive"] ?? STATUS_STYLES.inactive)}>
                        {p.status ?? "inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] font-bold text-gray-600">
                      {p.joined ?? p.created_at ?? "—"}
                    </td>
                  </tr>
                ))}
                
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 mb-4">
                         <AlertCircle className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">No Participants Found</h3>
                      <p className="mt-1 text-sm font-medium text-gray-500">Zero matches corresponding to the utilized filters.</p>
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
