/**
 * API service layer.
 *
 * Each method is exported individually (named export) AND collected in the
 * default `api` object.  Using named exports avoids the Vite HMR edge-case
 * where mutations to a re-exported plain object are not reflected in already-
 * imported module references.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export { API_BASE_URL };

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  }

  return response.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = (payload: { email: string; password: string }) =>
  request<{ token: string; user: any }>("/auth/login", { method: "POST", body: payload });

export const signup = (payload: { name: string; email: string; password: string; role?: string }) =>
  request<{ token: string; user: any }>("/auth/signup", { method: "POST", body: payload });

export const me = (token: string) => request<any>("/auth/me", { token });

// ─── Courses ─────────────────────────────────────────────────────────────────

export const getCourses = () => request<any>("/courses").then((r) => r.data ?? r);

export const getCourseById = (id: string) => request<any>(`/courses/${id}`).then((r) => r.data ?? r);

export const getCoursesAll = (token: string) =>
  request<any>("/courses?includeAll=true", { token }).then((r) => r.data ?? r);

export const getInstructorCourses = (token: string) =>
  request<any>("/instructor/my-courses", { token }).then((r) => r.data ?? r);

export const createCourse = (token: string, payload: any) =>
  request<any>("/courses", { method: "POST", token, body: payload }).then((r) => r.data ?? r);

export const updateCourse = (token: string, id: string, payload: any) =>
  request<any>(`/courses/${id}`, { method: "PUT", token, body: payload }).then((r) => r.data ?? r);

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const createLesson = (token: string, courseId: string, payload: any) =>
  request<any>(`/courses/${courseId}/lessons`, { method: "POST", token, body: payload });

export const updateLesson = (token: string, lessonId: number, payload: any) =>
  request<any>(`/lessons/${lessonId}`, { method: "PUT", token, body: payload });

export const deleteLesson = (token: string, lessonId: number) =>
  request<any>(`/lessons/${lessonId}`, { method: "DELETE", token });

// ─── Learner ─────────────────────────────────────────────────────────────────

export const getMyEnrollments = (token: string) =>
  request<any>("/enrollments/me", { token }).then((r) => r.data ?? r);

export const enrollCourse = (token: string, payload: { course_id: string; payment_id?: string }) =>
  request<any>("/enrollments", { method: "POST", token, body: payload });

export const getProgress = (token: string, courseId: string) =>
  request<any>(`/progress/${courseId}`, { token });

export const markProgress = (
  token: string,
  payload: { course_id: string; lesson_id: string; completed: boolean }
) => request<any>("/progress", { method: "POST", token, body: payload });

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const getCourseQuizzes = (courseId: string) =>
  request<any[]>(`/quiz/course/${courseId}`);

export const submitQuiz = (
  token: string,
  payload: { quiz_id: string; answers: { option_id: string }[] }
) => request<any>("/quiz/submit", { method: "POST", token, body: payload });

// ─── Dashboards ───────────────────────────────────────────────────────────────

export const learnerDashboard = (token: string) =>
  request<any>("/dashboards/learner", { token });

export const instructorDashboard = (token: string) =>
  request<any>("/dashboards/instructor", { token });

export const adminDashboard = (token: string) =>
  request<any>("/dashboards/admin", { token });

// ─── Instructors (admin only) ─────────────────────────────────────────────────

export const getInstructors = (token: string) =>
  request<any>("/instructors", { token }).then((r) => r.data ?? r);

export const getParticipants = (token: string) =>
  request<any>("/instructors/participants", { token }).then((r) => r.data ?? r);

export const createInstructor = (
  token: string,
  payload: { name: string; email: string; password: string; courseIds?: number[] }
) => request<any>("/instructors", { method: "POST", token, body: payload }).then((r) => r.data ?? r);

export const deleteInstructor = (token: string, id: number) =>
  request<any>(`/instructors/${id}`, { method: "DELETE", token });

// ─── Convenience object (for imports that use `api.xxx`) ─────────────────────
// This object references the named functions above — it will always be in sync.

export const api = {
  // Auth
  login,
  signup,
  me,
  // Courses
  getCourses,
  getCourseById,
  getCoursesAll,
  getInstructorCourses,
  createCourse,
  updateCourse,
  // Lessons
  createLesson,
  updateLesson,
  deleteLesson,
  // Learner
  getMyEnrollments,
  enrollCourse,
  getProgress,
  markProgress,
  // Quiz
  getCourseQuizzes,
  submitQuiz,
  // Dashboards
  learnerDashboard,
  instructorDashboard,
  adminDashboard,
  // Instructors
  getInstructors,
  getParticipants,
  createInstructor,
  deleteInstructor,
};

