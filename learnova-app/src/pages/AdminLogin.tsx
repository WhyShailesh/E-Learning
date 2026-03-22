import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, getRoleRedirect } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/layouts/AuthLayout";

export default function AdminLogin() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"instructor" | "admin">("instructor");
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
      if (u.role !== role) {
        toast.error(`Your account is registered as ${u.role}, not ${role}. Logging you into the correct portal.`);
      } else {
        toast.success(`Welcome back to the ${u.role} portal`);
      }
      navigate(getRoleRedirect(u.role));
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Brand Context (Horizontal Layout Component) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800 items-start">
          <div className="bg-slate-800 p-3 rounded-lg inline-block mb-6 border border-slate-700">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Staff Portal</h1>
          <p className="text-sm text-slate-400 mb-6">Secure access for instructors and administrators.</p>
          <div className="hidden md:block w-12 h-1 bg-indigo-500 rounded-full mb-4"></div>
          <p className="hidden md:block text-xs text-slate-500">
            Restricted environment. Authorized personnel only.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center">
          {/* Role Toggle Selector */}
          <div className="flex rounded-md p-1 bg-slate-100 mb-8 w-fit shrink-0 mx-auto md:mx-0">
            <button
              onClick={() => setRole("instructor")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-sm px-6 py-2 text-sm font-medium transition-all ${
                role === "instructor" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-sm px-6 py-2 text-sm font-medium transition-all ${
                role === "admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-slate-700">Staff Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@learnova.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border-slate-300 text-slate-900 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-slate-700">Password</Label>
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
              className="w-full h-10 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-md transition-colors"
            >
              {loading ? "Authenticating..." : `Sign in as ${role === "admin" ? "Admin" : "Instructor"}`}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            <Link to="/" className="text-indigo-600 hover:underline font-medium">
              Return to learner login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
