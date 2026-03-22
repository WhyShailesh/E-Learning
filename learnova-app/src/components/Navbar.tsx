import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LogOut, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/learner/dashboard", label: "Home" },
    { to: "/learner/courses", label: "Catalog" },
    { to: "/learner/my-courses", label: "My Courses" },
    { to: "/learner/about", label: "About" },
    { to: "/learner/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== "/learner/dashboard" && location.pathname.startsWith(path));

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white shadow-sm shadow-indigo-900/5 font-sans">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Brand */}
        <Link to="/learner/dashboard" className="flex flex-shrink-0 items-center gap-3 group">
          <div className="relative inline-flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow-lg border-2 border-white animate-pulse">
              <Sparkles className="h-3 w-3 text-amber-900" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Learnova</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-300",
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-inner border border-indigo-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-white shadow-inner text-indigo-700 font-extrabold text-sm">
               {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 leading-none">Welcome</span>
              <span className="text-sm font-extrabold text-gray-800 leading-tight block mt-0.5">{user?.name?.split(" ")[0]}</span>
            </div>
          </div>
          
          <div className="h-6 w-px bg-gray-200" />

          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="group h-10 px-4 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 font-bold transition-all border border-transparent hover:border-rose-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Mobile toggle */}
        <button 
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/60 bg-white/90 backdrop-blur-xl px-4 py-6 md:hidden absolute w-full shadow-2xl shadow-indigo-900/10">
          <div className="flex flex-col gap-2">
            {navLinks.map((l) => {
              const active = isActive(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-2xl px-5 py-4 text-base font-extrabold transition-all",
                    active 
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-inner" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-gray-100 pt-6">
              <Button 
                onClick={() => { handleLogout(); setMobileOpen(false); }} 
                className="w-full h-14 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-extrabold text-base border border-rose-200 shadow-sm"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
