import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronRight,
  FileVideo,
  FileText,
  Image,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  id: number;
  title: string;
  content_type?: string;   // video | document | image | quiz
  content_url?: string;
  duration?: string;
  order_index?: number;
}

interface Course {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  level?: string;
  price?: number;
  published?: boolean;
  lessons: Lesson[];
}

interface QuizQuestion {
  id: number;
  question_text: string;
  options?: any[];
}
interface Quiz {
  id: number;
  title: string;
  questions?: QuizQuestion[];
}

// ─── Content type icon ────────────────────────────────────────────────────────

const TypeIcon = ({ type }: { type?: string }) => {
  switch (type?.toLowerCase()) {
    case "video":    return <FileVideo  className="h-4 w-4 text-indigo-500" />;
    case "document": return <FileText   className="h-4 w-4 text-blue-500"   />;
    case "image":    return <Image      className="h-4 w-4 text-emerald-500" />;
    case "quiz":     return <HelpCircle className="h-4 w-4 text-amber-500"  />;
    default:         return <FileText   className="h-4 w-4 text-gray-400"   />;
  }
};

const CONTENT_TYPES = ["video", "document", "image", "quiz"];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const isAdmin = window.location.pathname.startsWith("/admin");
  const basePath = isAdmin ? "/admin" : "/instructor";
  // Instructors have no stand-alone /courses list page — send them back to dashboard
  const backPath = isAdmin ? "/admin/courses" : "/instructor/dashboard";
  const backLabel = isAdmin ? "Courses" : "Dashboard";

  // ── State ─────────────────────────────────────────────────────────────────
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form fields
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl]     = useState("");
  const [level, setLevel]           = useState("");
  const [price, setPrice]           = useState<number>(0);
  const [published, setPublished]   = useState(false);
  const [tags, setTags]             = useState<string[]>([]);
  const [tagInput, setTagInput]     = useState("");
  
  // new access options
  const [visibility, setVisibility] = useState("everyone");
  const [accessRule, setAccessRule] = useState("open");
  const [responsibleId, setResponsibleId] = useState<number | null>(null);
  const [staffList, setStaffList] = useState<{id: number, name: string, role: string}[]>([]);

  // tabs
  const [tab, setTab] = useState<"content" | "description" | "options" | "quiz">("content");

  // lessons / content
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // add-content form
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle]       = useState("");
  const [newType, setNewType]         = useState("video");
  const [newUrl, setNewUrl]           = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [addSaving, setAddSaving]     = useState(false);

  // edit-content
  const [editId, setEditId]               = useState<number | null>(null);
  const [editTitle, setEditTitle]         = useState("");
  const [editType, setEditType]           = useState("video");
  const [editUrl, setEditUrl]             = useState("");
  const [editDuration, setEditDuration]   = useState("");

  // Quiz items
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [addingQuiz, setAddingQuiz] = useState(false);

  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [addingQuestion, setAddingQuestion] = useState<{ [quizId: number]: boolean }>({});

  const loadQuizzes = async (courseId: string) => {
    setLoadingQuizzes(true);
    try {
      const qList = await api.getCourseQuizzes(courseId);
      const data = qList;
      if (Array.isArray(data)) {
        const full = await Promise.all(
          data.map((q: any) => api.getQuiz(String(q.id)).then((r: any) => r.data || r))
        );
        setQuizzes(full);
      }
    } catch {
      // ignore
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // ── Load course ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    api.getCourseById(id)
      .then((data: any) => {
        setCourse(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setImageUrl(data.image_url || "");
        setLevel(data.level || "");
        setPrice(data.price ?? 0);
        setPublished(!!data.published);
        setVisibility(data.visibility || "everyone");
        setAccessRule(data.access_rule || "open");
        setResponsibleId(data.responsible_id || null);
        setLessons(Array.isArray(data.lessons) ? data.lessons : []);
        setTags(data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : []);
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));

    api.getCourseStaff(token).then(setStaffList).catch(console.error);

    loadQuizzes(id);
  }, [id]);

  // ── Save course ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!token || !id) return;
    setSaving(true);
    try {
      await api.updateCourse(token, id, {
        title: title.trim(),
        description,
        image_url: imageUrl,
        level,
        price,
        published,
        visibility,
        access_rule: accessRule,
        responsible_id: responsibleId,
      });
      toast.success("Course saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Image Uploads ───────────────────────────────────────────────────────────
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(token, file);
      setImageUrl(res.url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Quiz Builders ───────────────────────────────────────────────────────────
  const handleCreateQuiz = async () => {
    if (!newQuizTitle.trim() || !token || !id) return;
    setAddingQuiz(true);
    try {
      await api.createQuiz(token, { course_id: id, title: newQuizTitle.trim() });
      toast.success("Quiz created");
      setNewQuizTitle("");
      loadQuizzes(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create quiz");
    } finally {
      setAddingQuiz(false);
    }
  };

  const handleAddQuestion = async (quizId: number) => {
    if (!newQuestion.trim() || !token) return toast.error("Question cannot be empty");
    const validOptions = newOptions.filter((o) => o.text.trim());
    if (validOptions.length < 2) return toast.error("Provide at least 2 options");
    if (!validOptions.some((o) => o.isCorrect)) return toast.error("Select a correct option");

    setAddingQuestion((prev) => ({ ...prev, [quizId]: true }));
    try {
      const qRes = await api.addQuizQuestion(token, { quiz_id: quizId, question_text: newQuestion.trim() });
      const questionId = qRes.id;
      for (const opt of validOptions) {
        await api.addQuizOption(token, { question_id: questionId, option_text: opt.text.trim(), is_correct: opt.isCorrect });
      }
      toast.success("Question added");
      setNewQuestion("");
      setNewOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      loadQuizzes(id!);
    } catch (err: any) {
      toast.error(err.message || "Failed to add question");
    } finally {
      setAddingQuestion((prev) => ({ ...prev, [quizId]: false }));
    }
  };

  // ── Toggle published ────────────────────────────────────────────────────────
  const handleTogglePublished = async () => {
    if (!token || !id) return;
    const next = !published;
    setPublished(next);
    try {
      await api.updateCourse(token, id, { published: next });
      toast.success(next ? "Course published" : "Course unpublished");
    } catch {
      setPublished(!next); // revert
      toast.error("Failed to update publish status");
    }
  };

  // ── Tags ────────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  // ── Add lesson ──────────────────────────────────────────────────────────────
  const handleAddLesson = async () => {
    if (!newTitle.trim() || !token || !id) return;
    setAddSaving(true);
    try {
      const payload = {
        title: newTitle.trim(),
        content_type: newType,
        content_url: newUrl,
        duration: newDuration,
        order_index: lessons.length + 1,
      };
      const created: Lesson = await api.createLesson(token, id, payload);
      setLessons((prev) => [...prev, created]);
      setAddOpen(false);
      setNewTitle(""); setNewType("video"); setNewUrl(""); setNewDuration("");
      toast.success("Content added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add lesson");
    } finally {
      setAddSaving(false);
    }
  };

  // ── Edit lesson ─────────────────────────────────────────────────────────────
  const openEdit = (lesson: Lesson) => {
    setEditId(lesson.id);
    setEditTitle(lesson.title);
    setEditType(lesson.content_type || "video");
    setEditUrl(lesson.content_url || "");
    setEditDuration(lesson.duration || "");
  };

  const handleSaveLesson = async () => {
    if (editId === null || !token) return;
    const payload = {
      title: editTitle.trim(),
      content_type: editType,
      content_url: editUrl,
      duration: editDuration,
    };
    try {
      await api.updateLesson(token, editId, payload);
      setLessons((prev) =>
        prev.map((l) => (l.id === editId ? { ...l, ...payload } : l))
      );
      toast.success("Content updated");
      setEditId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update lesson");
    }
  };

  // ── Delete lesson ───────────────────────────────────────────────────────────
  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm("Delete this content item?")) return;
    try {
      await api.deleteLesson(token!, lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast.success("Content deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lesson");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Course not found.
      </div>
    );
  }

  const TABS = [
    { id: "content",     label: "Content" },
    { id: "description", label: "Description" },
    { id: "options",     label: "Options" },
    { id: "quiz",        label: "Quiz" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{title}</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Published toggle */}
          <button
            onClick={handleTogglePublished}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
              published
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            {published
              ? <ToggleRight className="h-4 w-4" />
              : <ToggleLeft  className="h-4 w-4" />
            }
            {published ? "Published" : "Draft"}
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Course Title + Tags row ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Course Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
              placeholder="e.g. React for Beginners"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Course Image
            </label>
            <div className="relative flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden group transition-colors hover:border-indigo-400 hover:bg-indigo-50/50">
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-1.5 text-indigo-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[11px] font-medium">Uploading...</span>
                </div>
              ) : imageUrl ? (
                <>
                  <img src={imageUrl} alt="Course cover" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 hover:text-indigo-600 hover:scale-110 transition-all shadow-lg"
                      title="Change Image"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setImageUrl("")}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 hover:text-red-600 hover:scale-110 transition-all shadow-lg"
                      title="Remove Image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-indigo-500 transition-colors w-full h-full justify-center"
                >
                  <Image className="h-6 w-6" />
                  <span className="text-[11px] font-medium">Upload Image</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImagePick}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200"
              >
                {t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="ml-0.5 hover:text-indigo-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag…"
                className="h-7 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 w-28"
              />
              <button
                type="button"
                onClick={addTag}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content Tab ─────────────────────────────────────────────────── */}
        {tab === "content" && (
          <div className="p-5 space-y-4">
            {/* Lessons table */}
            {lessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-12 text-center">
                <FileText className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">No content yet</p>
                <p className="mt-1 text-xs text-gray-300">Add your first lesson or resource below.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lessons.map((lesson) =>
                      editId === lesson.id ? (
                        /* Inline edit row */
                        <tr key={lesson.id} className="bg-indigo-50">
                          <td className="px-4 py-2">
                            <div className="flex flex-col gap-2">
                              <input
                                autoFocus
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Title"
                                className="w-full rounded border border-indigo-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                              <input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="URL (e.g. YouTube/Drive link)"
                                className="w-full rounded border border-indigo-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-600"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                              className="rounded border border-indigo-300 bg-white px-2 py-1 text-sm focus:outline-none"
                            >
                              {CONTENT_TYPES.map((ct) => (
                                <option key={ct} value={ct}>{ct}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              placeholder="e.g. 12m"
                              className="w-20 rounded border border-indigo-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={handleSaveLesson}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        /* Normal row */
                        <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 font-medium text-gray-800">
                              <TypeIcon type={lesson.content_type} />
                              {lesson.title}
                            </div>
                            {lesson.content_url && (
                              <p className="mt-0.5 truncate text-xs text-gray-400 max-w-xs">{lesson.content_url}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize bg-gray-100 text-gray-600">
                              {lesson.content_type || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {lesson.duration || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openEdit(lesson)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add content form */}
            {addOpen ? (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3">
                <p className="text-[13px] font-semibold text-indigo-700">New Content Item</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Title *</label>
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                      placeholder="Lesson title"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    >
                      {CONTENT_TYPES.map((ct) => (
                        <option key={ct} value={ct} className="capitalize">{ct}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">URL / File path</label>
                    <input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                      placeholder="https://…"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Duration</label>
                    <input
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                      placeholder="e.g. 15m"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddLesson}
                    disabled={!newTitle.trim() || addSaving}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {addSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Add
                  </button>
                  <button
                    onClick={() => { setAddOpen(false); setNewTitle(""); setNewType("video"); setNewUrl(""); setNewDuration(""); }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-[13px] text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Content
              </button>
            )}
          </div>
        )}

        {/* ── Description Tab ──────────────────────────────────────────────── */}
        {tab === "description" && (
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Full Description
              </label>
              <textarea
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors resize-none"
                placeholder="Describe what students will learn in this course…"
              />
            </div>
          </div>
        )}

        {/* ── Options Tab ──────────────────────────────────────────────────── */}
        {tab === "options" && (
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">— Select level —</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Course Admin
                </label>
                <select
                  value={responsibleId || ""}
                  onChange={(e) => setResponsibleId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">— Unassigned —</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="everyone">Everyone (Public)</option>
                  <option value="signed-in">Signed-in Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  How People Enroll
                </label>
                <select
                  value={accessRule}
                  onChange={(e) => setAccessRule(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="open">Open (Free)</option>
                  <option value="on-invitation">On Invitation</option>
                  <option value="on-payment">On Payment</option>
                </select>
              </div>

              {accessRule === "on-payment" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                    placeholder="e.g. 500"
                  />
                </div>
              )}


            </div>
          </div>
        )}

        {/* ── Quiz Tab ─────────────────────────────────────────────────────── */}
        {tab === "quiz" && (
          <div className="p-5 space-y-6">
            {loadingQuizzes ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="space-y-6">
                {quizzes.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                    <HelpCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-800">No quizzes yet</h3>
                    <p className="mt-1 text-xs text-gray-500 mb-4">Create a quiz to test your learners' knowledge.</p>
                  </div>
                ) : (
                  quizzes.map((quiz) => (
                    <div key={quiz.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-800">{quiz.title}</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {quiz.questions && quiz.questions.length > 0 ? (
                          <div className="space-y-4">
                            {quiz.questions.map((q, idx) => (
                              <div key={q.id} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
                                <p className="text-sm font-medium text-gray-800">Q{idx + 1}. {q.question_text}</p>
                                <div className="mt-2 space-y-1.5 pl-4">
                                  {q.options?.map((opt: any) => (
                                    <div key={opt.id} className={cn("text-xs px-2 py-1 rounded", opt.is_correct ? "bg-emerald-100 text-emerald-800" : "text-gray-600")}>
                                      • {opt.option_text} {opt.is_correct && <Check className="inline h-3 w-3 ml-1" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No questions added yet.</p>
                        )}

                        <div className="border-t border-gray-100 pt-4 mt-4">
                          <h4 className="text-[13px] font-semibold text-gray-700 mb-3">Add Question</h4>
                          <div className="space-y-3">
                            <input
                              value={newQuestion}
                              onChange={(e) => setNewQuestion(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                              placeholder="Type your question here..."
                            />
                            <div className="grid gap-2 sm:grid-cols-2">
                              {newOptions.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-opt-${quiz.id}`}
                                    checked={opt.isCorrect}
                                    onChange={() => setNewOptions(newOptions.map((o, idx) => ({ ...o, isCorrect: idx === oIdx })))}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <input
                                    value={opt.text}
                                    onChange={(e) => setNewOptions(newOptions.map((o, idx) => idx === oIdx ? { ...o, text: e.target.value } : o))}
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                    placeholder={`Option ${oIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => handleAddQuestion(quiz.id)}
                              disabled={addingQuestion[quiz.id]}
                              className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {addingQuestion[quiz.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                              Save Question
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
                  <h4 className="text-[13px] font-semibold text-indigo-800 mb-2">Create New Quiz</h4>
                  <div className="flex items-center gap-2">
                    <input
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                      className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      placeholder="Quiz Title (e.g. End of Chapter 1)"
                    />
                    <button
                      onClick={handleCreateQuiz}
                      disabled={addingQuiz || !newQuizTitle.trim()}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {addingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Save bar ─────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={() => navigate(backPath)}
          className="rounded-lg border border-gray-200 px-5 py-2 text-[13px] text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
