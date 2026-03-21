import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, BookOpen, Clock, Pencil, Share2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface CourseCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  totalLessons: number;
  totalDuration: string;
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
  const viewMode = outletContext?.viewMode ?? "kanban";

  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");

  React.useEffect(() => {
    if (!token) return;
    api.getCoursesAll(token).then((rows) => {
      const normalized: CourseCard[] = rows.map((c: any) => ({
        id: String(c.id),
        title: c.title,
        description: c.description || "",
        tags: c.tags || (c.category ? [c.category] : []),
        views: c.views || 0,
        totalLessons: c.total_lessons ?? c.totalLessons ?? 0,
        totalDuration: c.total_duration || c.totalDuration || "0m",
        published: !!c.published,
      }));
      setCourses(normalized);
    }).catch(() => {});
  }, [token]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newCourseName.trim() || !token) return;
    api
      .createCourse(token, { title: newCourseName.trim(), description: "", published: false })
      .then((created) => {
        const newCourse: CourseCard = {
          id: String(created.id),
          title: created.title,
          description: created.description || "",
          tags: [],
          views: 0,
          totalLessons: 0,
          totalDuration: "0m",
          published: false,
        };
        setCourses([newCourse, ...courses]);
        setCreateOpen(false);
        setNewCourseName("");
        toast.success("Course created");
        navigate(`/instructor/courses/${newCourse.id}`);
      })
      .catch((err) => toast.error(err.message));
  };

  const handleShare = (course: CourseCard) => {
    const url = `${window.location.origin}/learner/courses/${course.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const removeTag = (courseId: string, tagToRemove: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, tags: c.tags.filter((t) => t !== tagToRemove) } : c
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 p-5 transition-colors hover:border-gray-600"
          >
            {course.published && (
              <div
                className="absolute right-0 top-0 h-16 w-24 overflow-hidden"
                style={{ transform: "translate(0, -50%) rotate(45deg) translate(0, 50%)" }}
              >
                <div className="flex h-full w-full items-center justify-center bg-green-500/90 text-[10px] font-semibold uppercase text-white shadow">
                  Published
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <h3
                  className="cursor-pointer text-base font-semibold text-blue-400 hover:text-blue-300"
                  onClick={() => navigate(`/instructor/courses/${course.id}`)}
                >
                  {course.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-700 px-2 py-0.5 text-xs text-gray-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(course.id, tag)}
                        className="rounded p-0.5 hover:bg-gray-600 hover:text-white"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-6 rounded-lg border border-gray-600 bg-gray-800/80 px-4 py-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Eye className="h-4 w-4" />
                  {course.views}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  {course.totalLessons} contents
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  {course.totalDuration}
                </span>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(course)}
                  className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/instructor/courses/${course.id}`)}
                  className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-600 bg-gray-800/30 p-12 text-center">
          <p className="text-gray-500">No courses yet</p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-4 bg-[#6366f1] hover:bg-[#5558e3]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first course
          </Button>
        </div>
      )}

      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-8 left-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#6366f1] text-white shadow-lg transition hover:scale-105 hover:bg-[#5558e3]"
        title="Create new course"
        aria-label="Create new course"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-gray-700 bg-[#1a1d23] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create Course</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for your new course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Course name"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              className="border-gray-600 bg-gray-800 text-white placeholder:text-gray-500"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleCreate}
                disabled={!newCourseName.trim()}
                className="bg-[#6366f1] hover:bg-[#5558e3]"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
