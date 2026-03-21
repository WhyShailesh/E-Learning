
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Search, Pencil, Share2, Plus, GraduationCap, BookOpen, AlertCircle } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Courses</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {loading ? "Loading…" : `${courses.length} course${courses.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Course
        </button>
      </div>

      {/* Filters + Search */}
      {!loading && courses.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors shadow-sm"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-colors",
                  filter === f ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="h-28 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3.5 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-2.5 w-1/3 rounded bg-gray-50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
            <GraduationCap className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No courses yet</p>
          <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
            Create your first course to get started.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create First Course
          </button>
        </div>
      )}

      {/* Search no-results */}
      {!loading && courses.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 text-center shadow-sm">
          <AlertCircle className="mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No courses match your filters.</p>
        </div>
      )}

      {/* Course grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
                <BookOpen className="h-9 w-9 text-indigo-200" />
                <div className="absolute top-3 right-3">
                  {c.published ? (
                    <span className="rounded-full bg-emerald-100 ring-1 ring-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 ring-1 ring-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">
                  {c.title}
                </h3>
                {c.category && (
                  <span className="mt-2 inline-flex w-fit items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200">
                    {c.category}
                  </span>
                )}
                <div className="mt-auto pt-3 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${c.id}`)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleShare(c)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Enter a name to get started. You can fill in the details on the next screen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <Input
              autoFocus
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Course name"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newCourseName.trim() || creating} className="bg-indigo-600 hover:bg-indigo-700">
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
