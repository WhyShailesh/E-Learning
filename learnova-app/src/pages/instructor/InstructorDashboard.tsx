import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BookOpen, Pencil, Share2, Plus, GraduationCap,
  FileText, Loader2, CheckCircle2, Circle,
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

  const [courses, setCourses]     = useState<CourseCard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle]   = useState("");
  const [creating, setCreating]   = useState(false);

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
        published: false,
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-200">
          <GraduationCap className="h-7 w-7 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No courses assigned yet</p>
        <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
          Ask your admin to assign courses to you, or create a new course below.
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create a Course
        </button>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Give your course a title to get started.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. React for Beginners"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  {creating ? "Creating…" : "Create"}
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
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">My Courses</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {courses.length} course{courses.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Course
        </button>
      </div>

      {/* No search results */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-10 text-center">
          <FileText className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No courses match your search.</p>
        </div>
      )}

      {/* Course cards */}
      {filtered.map((course) => (
        <div
          key={course.id}
          className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
        >
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-200">
            <BookOpen className="h-6 w-6 text-indigo-500" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="cursor-pointer text-[14px] font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                {course.title}
              </h3>
              {/* Published badge */}
              {course.published ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 ring-1 ring-gray-200">
                  <Circle className="h-3 w-3" />
                  Draft
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {course.category && (
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span className="capitalize">{course.level}</span>
              )}
              <span>{course.total_lessons} lesson{course.total_lessons !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => handleShare(course)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}`)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      ))}

      {/* FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:scale-105 hover:bg-indigo-700"
        title="Create new course"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Give your course a title to get started.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. React for Beginners"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
