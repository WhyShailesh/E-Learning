import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type?: "video" | "document" | "quiz";
  content_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
  rating?: number;
  students?: number;
  category?: string;
  level?: string;
  instructor_name?: string;
  lessons: Lesson[];
}

interface CourseContextType {
  courses: Course[];
  loadingCourses: boolean;
  refreshCourses: () => Promise<void>;
  purchasedCourses: string[];
  purchaseCourse: (courseId: string) => Promise<void>;
  isCourseOwned: (courseId: string) => boolean;
  getProgress: (courseId: string) => string[];
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | null>(null);

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be inside CourseProvider");
  return ctx;
};

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [purchasedCourses, setPurchased] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const result = await api.getCourses();
        const withLessons = await Promise.all(
          result.map(async (course) => {
            const detail = await api.getCourseById(String(course.id));
            return detail;
          })
        );
        setCourses(withLessons);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const refreshCourses = async () => {
    const result = await api.getCourses();
    const withLessons = await Promise.all(result.map((course) => api.getCourseById(String(course.id))));
    setCourses(withLessons);
  };

  useEffect(() => {
    const loadMyData = async () => {
      if (!token) {
        setPurchased([]);
        setProgress({});
        return;
      }

      const enrollments = await api.getMyEnrollments(token);
      const courseIds = enrollments.map((e) => String(e.course_id));
      setPurchased(courseIds);

      const progressMap: Record<string, string[]> = {};
      await Promise.all(
        courseIds.map(async (courseId) => {
          const p = await api.getProgress(token, courseId).catch(() => null);
          progressMap[courseId] = p?.lessons?.filter((l: any) => l.completed).map((l: any) => String(l.lesson_id)) || [];
        })
      );
      setProgress(progressMap);
    };
    loadMyData();
  }, [token]);

  const purchaseCourse = async (courseId: string) => {
    if (!token) return;
    await api.enrollCourse(token, { course_id: courseId, payment_id: `demo_${Date.now()}` });
    if (!purchasedCourses.includes(courseId)) {
      setPurchased((prev) => [...prev, courseId]);
    }
  };

  const isCourseOwned = (courseId: string) => purchasedCourses.includes(courseId);

  const getProgress = (courseId: string) => progress[courseId] || [];

  const markLessonComplete = async (courseId: string, lessonId: string) => {
    if (!token) return;
    await api.markProgress(token, { course_id: courseId, lesson_id: lessonId, completed: true });
    const current = progress[courseId] || [];
    if (!current.includes(lessonId)) {
      const next = { ...progress, [courseId]: [...current, lessonId] };
      setProgress(next);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loadingCourses,
        refreshCourses,
        purchasedCourses,
        purchaseCourse,
        isCourseOwned,
        getProgress,
        markLessonComplete,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
