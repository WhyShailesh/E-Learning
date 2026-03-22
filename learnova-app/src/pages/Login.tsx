import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
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
      toast.success("Welcome back");
      navigate(getRoleRedirect(u.role));
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Brand Context (Horizontal Layout Component) */}
        <div className="md:w-5/12 bg-slate-100 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200 items-start">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Sign in to Learnova</h1>
          <p className="text-sm text-slate-500 mb-6">Access your courses and continue learning.</p>
          <div className="hidden md:block w-12 h-1 bg-indigo-600 rounded-full mb-4"></div>
          <p className="hidden md:block text-xs text-slate-400">
            For technical support, visit the contact page.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border-slate-300 text-slate-900 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-slate-700">Password</Label>
                <button type="button" className="text-xs text-indigo-600 hover:underline">
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
                  className="h-10 rounded-md border-slate-300 pr-10 text-slate-900 focus-visible:ring-indigo-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline font-medium">
              Create one
            </Link>
          </div>
          
          <div className="mt-4 text-center">
             <Link to="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
              Admin login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
