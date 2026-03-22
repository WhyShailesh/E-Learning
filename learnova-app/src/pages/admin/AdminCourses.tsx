import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Search, Pencil, Share2, Plus, GraduationCap, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminCourses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [creating, setCreating] = useState(false);

  React.useEffect(() => {
    if (!token) return;
    api.getCoursesAll(token)
      .then((rows) => { setCourses(Array.isArray(rows) ? rows : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    if (filter === "published") return matchSearch && c.published;
    if (filter === "draft") return matchSearch && !c.published;
    return matchSearch;
  });

  const handleCreate = async () => {
    if (!newCourseName.trim() || !token) return;
    setCreating(true);
    try {
      const created = await api.createCourse(token, { title: newCourseName.trim(), description: "", published: true });
      setCourses((prev) => [created, ...prev]);
      setCreateOpen(false);
      setNewCourseName("");
      toast.success("Course created");
      navigate(`/admin/courses/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleShare = (course: any) => {
    navigator.clipboard.writeText(`${window.location.origin}/learner/courses/${course.id}`);
    toast.success("Course link copied to clipboard");
  };

  return (
    <div className="space-y-6 font-sans relative z-10 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-900/5 transition-all overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
            Course Catalog
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {loading ? "Loading…" : `Monitoring ${courses.length} active course${courses.length !== 1 ? "s" : ""} across the platform.`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="relative z-10 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </button>
      </div>

      {/* Filters + Search */}
      {!loading && courses.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
            <input
              type="text"
              placeholder="Search catalog…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-2xl border border-white bg-white/60 backdrop-blur-md pl-12 pr-4 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-1.5 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md p-1.5 shadow-sm">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-extrabold capitalize transition-all duration-300",
                  filter === f 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-sm shadow-xl shadow-indigo-900/5 overflow-hidden">
              <div className="h-32 bg-white/80 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-4 w-3/4 rounded-md bg-white/80 animate-pulse" />
                <div className="h-3 w-1/3 rounded-md bg-white/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 text-center shadow-inner relative overflow-hidden">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner border border-white">
            <GraduationCap className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">No Courses Authored</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm font-medium">
            Start structuring knowledge. Create your first course to populate the global catalog.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-8 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Create First Course
          </button>
        </div>
      )}

      {/* Search No-Results */}
      {!loading && courses.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/50 backdrop-blur-md py-16 text-center shadow-sm">
          <AlertCircle className="mb-4 h-10 w-10 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-800">No Matches Found</h3>
          <p className="mt-1 text-sm font-medium text-gray-500">Refine your search algorithms or clear filters.</p>
        </div>
      )}

      {/* Course Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl overflow-hidden shadow-xl shadow-indigo-900/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                {c.image_url ? (
                  <img src={c.image_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <BookOpen className="h-12 w-12 text-indigo-300 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="absolute top-4 right-4 z-20">
                  {c.published ? (
                    <span className="rounded-lg bg-emerald-50 backdrop-blur-md border border-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-lg bg-gray-50/90 backdrop-blur-md border border-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gray-500 shadow-sm">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-extrabold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {c.title}
                </h3>
                {c.category && (
                  <span className="mt-3 inline-flex w-fit items-center rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-widest">
                    {c.category}
                  </span>
                )}
                <div className="mt-auto pt-6 flex items-center justify-between gap-3 border-t border-gray-100/60">
                  <button
                    onClick={() => navigate(`/admin/courses/${c.id}`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm group-hover:shadow"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleShare(c)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm group-hover:shadow"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-2xl border-white rounded-3xl shadow-2xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Genesis Sequence
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-500">
              Provide a core nomenclature for the new curriculum asset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                Course Nomenclature
              </label>
              <Input
                autoFocus
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g. Advanced Quantum Mechanics"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-14 rounded-2xl border-gray-200 bg-gray-50 text-[15px] font-medium text-gray-900 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setCreateOpen(false)}
                className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!newCourseName.trim() || creating} 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 rounded-xl font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Synthesizing
                  </>
                ) : (
                  "Create Curriculum"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
