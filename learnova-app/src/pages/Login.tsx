import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) return <Navigate to={getRoleRedirect(user.role)} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const u = await login(email, password);
    setLoading(false);
    if (u) {
      toast.success("Welcome back!");
      navigate(getRoleRedirect(u.role));
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <AuthLayout>
      <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 opacity-60 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-amber-50 to-orange-100 opacity-50 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-5 inline-flex">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-slate-900/20">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
                <Sparkles className="h-3 w-3 text-amber-900" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/[0.06]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0 focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0 focus-visible:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition-all shadow-lg shadow-slate-900/20 font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-slate-800 hover:text-slate-900 hover:underline transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Are you an admin?{" "}
            <Link to="/admin/login" className="font-medium text-slate-600 hover:text-slate-800 hover:underline transition-colors">
              Admin login →
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
