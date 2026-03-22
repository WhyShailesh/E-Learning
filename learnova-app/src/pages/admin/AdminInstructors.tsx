import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  UserCog, Plus, Search, Mail, BookOpen,
  X, Check, AlertCircle, Trash2, Calendar, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Instructor {
  id: number;
  name: string;
  email: string;
  assigned_courses: { id: number; title: string }[];
  created_at: string;
}

const AVATAR_COLORS = ["bg-indigo-500", "bg-purple-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500"];

export default function AdminInstructors() {
  const { token } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    selectedCourseIds: [] as number[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const courses = await api.getCoursesAll(token);
        setAvailableCourses(Array.isArray(courses) ? courses : []);
      } catch { setAvailableCourses([]); }

      try {
        const data = await api.getInstructors(token);
        setInstructors(Array.isArray(data) ? data : []);
      } catch { setInstructors([]); }

      setLoading(false);
    };
    load();
  }, [token]);

  const filtered = instructors.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", selectedCourseIds: [] });
    setShowPassword(false);
  };

  const validate = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Valid email is required"); return false;
    }
    if (!form.password || form.password.length < 6) {
      toast.error("Password must be at least 6 characters"); return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const newInstructor = await api.createInstructor(token!, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        courseIds: form.selectedCourseIds,
      });
      setInstructors((prev) => [newInstructor, ...prev]);
      toast.success("Instructor created successfully");
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to create instructor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this instructor? Their courses will be unassigned.")) return;
    setDeletingId(id);
    try {
      await api.deleteInstructor(token!, id);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      toast.success("Instructor removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete instructor");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCourse = (id: number) => {
    setForm((prev) => ({
      ...prev,
      selectedCourseIds: prev.selectedCourseIds.includes(id)
        ? prev.selectedCourseIds.filter((c) => c !== id)
        : [...prev.selectedCourseIds, id],
    }));
  };

  const formatDate = (ds: string) => {
    if (!ds) return "—";
    return new Date(ds).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6 font-sans relative z-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-900/5 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
            Instructor Management
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {loading ? "Loading…" : `Managing ${instructors.length} accredited instructor${instructors.length !== 1 ? "s" : ""} across the platform.`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="relative z-10 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Onboard Instructor
        </button>
      </div>

      {/* Search Bar */}
      {!loading && instructors.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
          <input
            type="text"
            placeholder="Search instructors by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 w-full rounded-2xl border border-white bg-white/60 backdrop-blur-md pl-12 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-inner transition-all"
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-sm shadow-xl shadow-indigo-900/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-5 border-b border-white/40 last:border-0">
              <div className="h-12 w-12 rounded-2xl bg-white/80 animate-pulse shadow-sm" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-48 rounded-md bg-white/80 animate-pulse" />
                <div className="h-3 w-64 rounded-md bg-white/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && instructors.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 text-center shadow-inner relative overflow-hidden">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner border border-white">
            <UserCog className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">No Instructors Found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm font-medium">
            Onboard instructors to securely designate course generation capabilities.
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-8 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add First Instructor
          </button>
        </div>
      )}

      {/* Data Table */}
      {!loading && instructors.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-2xl shadow-indigo-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/60 bg-white/40 backdrop-blur-md">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Instructor Name</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Contact Details</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Assigned Courses</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Date Joined</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {filtered.map((instructor, i) => (
                  <tr key={instructor.id} className="group hover:bg-white/80 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[14px] font-black text-white shadow-md relative overflow-hidden", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                           <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {instructor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[15px] font-extrabold text-gray-900 leading-tight">{instructor.name}</p>
                          <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100">
                            Instructor ID: {instructor.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        {instructor.email}
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-[200px]">
                      {instructor.assigned_courses.length === 0 ? (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unassigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {instructor.assigned_courses.slice(0, 2).map((c) => (
                            <span key={c.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold text-indigo-700 border border-indigo-100 shadow-sm shadow-indigo-900/5">
                              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                              {c.title}
                            </span>
                          ))}
                          {instructor.assigned_courses.length > 2 && (
                            <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-extrabold text-gray-500 border border-gray-100">
                              +{instructor.assigned_courses.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        {formatDate(instructor.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDelete(instructor.id)}
                        disabled={deletingId === instructor.id}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100 hover:border-rose-100 shadow-sm disabled:opacity-40 align-middle"
                        title="Revoke Instructor Access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 mb-4">
                         <Search className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-[15px] font-bold text-gray-500">No instructors match your precise search parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-indigo-900/10 overflow-hidden text-left font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100/60 bg-gray-50/50 px-8 py-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Onboard Instructor</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Initiate a secure staff credentials package.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 hover:text-gray-900 border border-gray-100 shadow-sm transition-colors"
                title="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-6">
              
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white/50 px-4 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="instructor@learnova.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white/50 px-4 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  Secure Password Array <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 encrypted characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-white/50 pl-4 pr-12 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {form.password && form.password.length < 6 && (
                  <p className="text-[12px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Password criteria insufficient.</p>
                )}
              </div>

              {/* Assign Courses */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                    Course Authorization Array
                  </label>
                  {form.selectedCourseIds.length > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {form.selectedCourseIds.length} course{form.selectedCourseIds.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                
                {availableCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center shadow-inner">
                    <AlertCircle className="h-8 w-8 shrink-0 text-gray-300" />
                    <p className="text-[13px] font-bold text-gray-500">No active catalog found.<br/>Initiate course creation first.</p>
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-200 bg-white/50 shadow-inner flex flex-col gap-1.5 p-2">
                    {availableCourses.map((course) => {
                      const isSelected = form.selectedCourseIds.includes(course.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course.id)}
                          className={cn(
                            "group flex w-full items-center justify-between px-4 py-3 rounded-xl text-left transition-all",
                            isSelected 
                              ? "bg-indigo-50 border border-indigo-100 shadow-sm" 
                              : "bg-white border border-transparent hover:border-gray-100 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-center gap-3 text-[14px]">
                            <BookOpen className={cn("h-4 w-4 shrink-0 transition-colors", isSelected ? "text-indigo-600" : "text-gray-400")} />
                            <span className={cn("truncate font-bold transition-colors", isSelected ? "text-indigo-900" : "text-gray-600 group-hover:text-gray-900")}>
                              {course.title}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100/60 bg-gray-50/50 px-8 py-6 rounded-b-3xl">
              <button
                onClick={() => setShowModal(false)}
                className="h-12 rounded-xl border border-gray-200 px-6 font-bold text-gray-600 hover:bg-white hover:border-gray-300 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.name || !form.email || form.password.length < 6}
                className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Transmitting…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Authorize
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
