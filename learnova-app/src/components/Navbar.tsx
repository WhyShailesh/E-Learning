import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    { to: "/learner/courses", label: "Courses" },
    { to: "/learner/my-courses", label: "My Courses" },
    { to: "/learner/about", label: "About" },
    { to: "/learner/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/learner/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Learnova</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-muted-foreground">Hi, {user?.name?.split(" ")[0]}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                isActive(l.to) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
              <LogOut className="mr-1.5 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
