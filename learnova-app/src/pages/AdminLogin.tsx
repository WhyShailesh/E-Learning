import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, BookOpen, Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";
import { cn } from "@/lib/utils";

type Role = "admin" | "instructor";

const ROLES: { id: Role; label: string; desc: string; icon: React.ElementType; accent: string }[] = [
  {
    id: "admin",
    label: "Admin",
    desc: "Full platform access",
    icon: ShieldCheck,
    accent: "border-indigo-500 bg-indigo-50 text-indigo-700",
  },
  {
    id: "instructor",
    label: "Instructor",
    desc: "Course management",
    icon: BookOpen,
    accent: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
];

export default function AdminLogin() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user?.role === "admin")
    return <Navigate to="/admin/dashboard" replace />;
  if (isAuthenticated && user?.role === "instructor")
    return <Navigate to="/instructor/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const loggedInUser = await login(email, password);
    setLoading(false);
    if (loggedInUser) {
      if (selectedRole === "admin" && loggedInUser.role !== "admin") {
        toast.error("Access denied. This account is not an admin.");
        return;
      }
      if (selectedRole === "instructor" && loggedInUser.role !== "instructor") {
        toast.error("Access denied. This account is not an instructor.");
        return;
      }
      toast.success(`Welcome, ${loggedInUser.name}!`);
      if (loggedInUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (loggedInUser.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate(getRoleRedirect(loggedInUser.role));
      }
    } else {
      toast.error("Invalid email or password");
    }
  };

  const activeRole = ROLES.find((r) => r.id === selectedRole)!;

  return (
    <AuthLayout>
      <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-60 -left-60 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-slate-100 to-blue-50 opacity-70 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-indigo-50 to-slate-100 opacity-60 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-xl shadow-indigo-600/20">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Staff Portal
            </h1>
            <p className="mt-1.5 text-[14px] text-slate-500">
              Sign in to manage your Learnova platform
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[0.06]">

            {/* Role Selector */}
            <div className="mb-5">
              <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
                Sign in as
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-3 text-center transition-all",
                      selectedRole === role.id
                        ? role.accent
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                    )}
                  >
                    <role.icon className={cn("h-5 w-5", selectedRole === role.id ? "" : "text-slate-400")} />
                    <span className="text-[13px] font-semibold">{role.label}</span>
                    <span className={cn("text-[10px]", selectedRole === role.id ? "opacity-70" : "text-slate-400")}>
                      {role.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="portal-email" className="text-[13px] font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="portal-email"
                  type="email"
                  placeholder={selectedRole === "admin" ? "admin@example.com" : "instructor@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-0 focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="portal-password" className="text-[13px] font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="portal-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-0 focus-visible:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "group h-11 w-full rounded-xl font-medium transition-all shadow-lg",
                  selectedRole === "admin"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In as {activeRole.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-500 ring-1 ring-inset ring-slate-200">
              <span className="font-semibold text-slate-700">Admin demo:</span> admin@gmail.com / admin
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link to="/" className="font-medium text-slate-600 hover:underline">
              ← Back to learner login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
