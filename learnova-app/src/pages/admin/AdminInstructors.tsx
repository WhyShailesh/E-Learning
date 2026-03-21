import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  UserCog, Plus, Search, Mail, BookOpen,
  X, Check, AlertCircle, Trash2, Calendar,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Instructors</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {loading ? "Loading…" : `${instructors.length} instructor${instructors.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Instructor
        </button>
      </div>

      {/* Search */}
      {!loading && instructors.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search instructors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm"
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
              <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-36 rounded bg-gray-100 animate-pulse" />
                <div className="h-2.5 w-52 rounded bg-gray-50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && instructors.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
            <UserCog className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No instructors yet</p>
          <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
            Add instructors to assign them courses. They'll be able to manage course content.
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Instructor
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && instructors.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Instructor</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Assigned Courses</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Created</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((instructor, i) => (
                <tr key={instructor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                        {instructor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">{instructor.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Instructor</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                      <Mail className="h-3 w-3 shrink-0" />
                      {instructor.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {instructor.assigned_courses.length === 0 ? (
                      <span className="text-[12px] text-gray-400">None assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {instructor.assigned_courses.slice(0, 2).map((c) => (
                          <span key={c.id} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200">
                            <BookOpen className="h-3 w-3" />
                            {c.title}
                          </span>
                        ))}
                        {instructor.assigned_courses.length > 2 && (
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 ring-1 ring-gray-200">
                            +{instructor.assigned_courses.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(instructor.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(instructor.id)}
                      disabled={deletingId === instructor.id}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                    No instructors match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Add Instructor</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">Create a new instructor account</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-600">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-600">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="instructor@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-600">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 pr-10 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {form.password && form.password.length < 6 && (
                  <p className="text-[11px] text-red-500">Password must be at least 6 characters</p>
                )}
              </div>

              {/* Assign Courses */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-600">
                  Assign Courses <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {availableCourses.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[12px] text-gray-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    No courses available yet. Create courses first.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                    {availableCourses.map((course) => {
                      const isSelected = form.selectedCourseIds.includes(course.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course.id)}
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors",
                            isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-2 text-[12px]">
                            <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{course.title}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {form.selectedCourseIds.length > 0 && (
                  <p className="text-[11px] text-indigo-600">
                    {form.selectedCourseIds.length} course{form.selectedCourseIds.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Add Instructor
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
