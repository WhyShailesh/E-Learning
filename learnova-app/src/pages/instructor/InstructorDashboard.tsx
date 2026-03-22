import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BookOpen, Pencil, Share2, Plus, GraduationCap,
  FileText, Loader2, CheckCircle2, Circle, Sparkles, LayoutGrid, List
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CourseCard {
  id: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  total_lessons: number;
  published: boolean;
  image_url?: string;
}

interface OutletContext {
  search: string;
  viewMode: "kanban" | "list";
}

export default function InstructorDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContext | null>();
  const search = outletContext?.search ?? "";

  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">(outletContext?.viewMode || "kanban");

  React.useEffect(() => {
    if (!token) return;
    api.getInstructorCourses(token)
      .then((rows: any[]) => {
        setCourses(
          rows.map((c) => ({
            id: String(c.id),
            title: c.title,
            description: c.description || "",
            category: c.category,
            level: c.level,
            total_lessons: c.total_lessons ?? 0,
            published: !!c.published,
            image_url: c.image_url,
          }))
        );
      })
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newTitle.trim() || !token) return;
    setCreating(true);
    try {
      const created = await api.createCourse(token, {
        title: newTitle.trim(),
        description: "",
        published: true,
      });
      toast.success("Course created");
      setCreateOpen(false);
      setNewTitle("");
      navigate(`/instructor/courses/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleShare = (course: CourseCard) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/learner/courses/${course.id}`
    );
    toast.success("Course link copied");
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-white/60 bg-white/40 shadow-sm"
          />
        ))}
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 px-4 text-center shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-600/30 text-white relative z-10">
          <GraduationCap className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight relative z-10">No courses assigned yet</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm relative z-10">
          Ask your admin to assign courses to you, or initiate a brand new premium course below.
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-sm font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 relative z-10"
        >
          <Plus className="h-5 w-5" />
          Create a New Course
        </button>

        {/* Create Dialog inside Empty state for scope access */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md border-0 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Create Premium Course</DialogTitle>
              <DialogDescription className="text-gray-500">Provide a stunning title for your new curriculum.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Masterclass React Navigation"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-14 rounded-2xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/20 text-base"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" className="h-12 rounded-xl text-gray-500" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  className="h-12 rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg shadow-indigo-600/30"
                >
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {creating ? "Forging…" : "Create Course"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Course list ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">Active Curriculum</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {courses.length} premium course{courses.length !== 1 ? "s" : ""} securely assigned to your profile
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center rounded-xl bg-white border border-gray-200 shadow-sm p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn("p-2 rounded-lg transition-colors", viewMode === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600")}
              title="Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-lg transition-colors", viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </div>
      </div>

      {/* No search results */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/40 backdrop-blur-sm py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-base font-semibold text-gray-500">No courses match your active search filter.</p>
        </div>
      )}

      {/* Course cards */}
      <div className={cn(
        viewMode === "kanban" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
      )}>
        {filtered.map((course) => (
          <div
            key={course.id}
            className={cn(
              "group flex gap-4 rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl p-5 shadow-xl shadow-indigo-900/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/10",
              viewMode === "kanban" ? "flex-col" : "flex-col sm:flex-row sm:items-center"
            )}
          >
            {/* Icon / Thumbnail */}
            <div className={cn(
              "shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-500 shadow-inner border border-white overflow-hidden",
              viewMode === "kanban" ? "h-40 w-full flex relative" : "h-16 w-16 flex"
            )}>
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className={viewMode === "kanban" ? "h-16 w-16 absolute opacity-50" : "h-8 w-8"} />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h3
                  className="cursor-pointer text-[17px] font-extrabold text-gray-900 hover:text-indigo-600 transition-colors leading-tight"
                  onClick={() => navigate(`/instructor/courses/${course.id}`)}
                >
                  {course.title}
                </h3>
                {/* Published badge */}
                {course.published ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                    <Circle className="h-3 w-3" />
                    Draft
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {course.category && (
                  <span className="rounded-md bg-indigo-50 text-indigo-600 px-2 py-0.5 border border-indigo-100">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="rounded-md bg-gray-50 text-gray-500 px-2 py-0.5 border border-gray-100">
                    {course.level}
                  </span>
                )}
                <span className="bg-white/50 px-2 py-0.5 rounded-md border border-gray-100">{course.total_lessons} Mod{course.total_lessons !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Actions */}
            <div className={cn(
              "flex shrink-0 gap-3",
              viewMode === "kanban" ? "mt-4 pt-4 border-t border-gray-100/60 justify-between w-full" : "mt-4 sm:mt-0"
            )}>
              <button
                onClick={() => handleShare(course)}
                className="group/btn flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                <Share2 className="h-4 w-4 text-gray-400 group-hover/btn:text-indigo-500" />
                Share
              </button>
              <button
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
                className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-2.5 text-sm font-extrabold text-white hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/20"
              >
                <Pencil className="h-4 w-4 text-gray-300" />
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Create Premium Course</DialogTitle>
            <DialogDescription className="text-gray-500">Provide a stunning title for your new curriculum.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Next.js App Router Masterclass"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-14 rounded-2xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/20 text-base shadow-sm font-medium"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="h-12 rounded-xl text-gray-500 hover:text-gray-900 font-bold" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                className="h-12 rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/25"
              >
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {creating ? "Forging…" : "Create Course"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
