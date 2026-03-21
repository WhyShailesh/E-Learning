import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, ArrowRight, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";

const Signup = () => {
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) return <Navigate to={getRoleRedirect(user.role)} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error("Please fill all fields"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Invalid email format"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const ok = await signup(name, email, password);
    if (ok) {
      toast.success("Account created!");
      const u = JSON.parse(localStorage.getItem("learnova_auth") || "{}")?.user;
      navigate(u ? getRoleRedirect(u.role) : "/learner/dashboard");
    } else {
      toast.error("Email already registered");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-sky-50 to-blue-100 opacity-50 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-slate-900/20">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Start your learning journey today — it's free
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/[0.06]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Anika Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0 focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
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
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0 focus-visible:bg-white transition-colors"
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

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={loading}
                  className="group h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition-all shadow-lg shadow-slate-900/20 font-medium"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/" className="font-semibold text-slate-800 hover:text-slate-900 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By creating an account you agree to our{" "}
            <span className="text-slate-600 hover:underline cursor-pointer">Terms</span>{" "}
            and{" "}
            <span className="text-slate-600 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
