import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { RequireAuth } from "@/routes";

import LearnerLayout from "@/layouts/LearnerLayout";
import InstructorLayout from "@/layouts/InstructorLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminLogin from "@/pages/AdminLogin";
import DashboardRedirect from "@/pages/DashboardRedirect";

import Index from "@/pages/Index";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import MyCourses from "@/pages/MyCourses";
import LessonPlayer from "@/pages/LessonPlayer";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

import InstructorDashboard from "@/pages/instructor/InstructorDashboard";
import InstructorReporting from "@/pages/instructor/InstructorReporting";
import InstructorSettings from "@/pages/instructor/InstructorSettings";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminParticipants from "@/pages/admin/AdminParticipants";
import AdminInstructors from "@/pages/admin/AdminInstructors";
import AdminReporting from "@/pages/admin/AdminReporting";
import AdminSettings from "@/pages/admin/AdminSettings";

import CourseFormPage from "@/pages/shared/CourseFormPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CourseProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes — wrapped in AuthLayout (light theme) */}
                <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
                <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
                <Route path="/admin/login" element={<AuthLayout><AdminLogin /></AuthLayout>} />
                <Route path="/dashboard" element={<RequireAuth><DashboardRedirect /></RequireAuth>} />

                {/* Learner routes */}
                <Route
                  path="/learner"
                  element={
                    <RequireAuth allowedRoles={["learner"]}>
                      <LearnerLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/learner/dashboard" replace />} />
                  <Route path="dashboard" element={<Index />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="courses/:id" element={<CourseDetail />} />
                  <Route path="courses/:id/lesson/:lessonIndex" element={<LessonPlayer />} />
                  <Route path="my-courses" element={<MyCourses />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="terms" element={<Terms />} />
                </Route>

                {/* Instructor routes */}
                <Route
                  path="/instructor"
                  element={
                    <RequireAuth allowedRoles={["instructor"]}>
                      <InstructorLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/instructor/dashboard" replace />} />
                  <Route path="dashboard" element={<InstructorDashboard />} />
                  <Route path="reporting" element={<InstructorReporting />} />
                  <Route path="settings" element={<InstructorSettings />} />
                  <Route path="courses/:id" element={<CourseFormPage />} />
                </Route>

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <RequireAuth allowedRoles={["admin"]}>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="courses/:id" element={<CourseFormPage />} />
                  <Route path="participants" element={<AdminParticipants />} />
                  <Route path="instructors" element={<AdminInstructors />} />
                  <Route path="reporting" element={<AdminReporting />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CourseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
