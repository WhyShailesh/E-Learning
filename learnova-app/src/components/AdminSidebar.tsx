import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  UserCog,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/courses", icon: GraduationCap, label: "Courses" },
  { to: "/admin/participants", icon: Users, label: "Participants" },
  { to: "/admin/instructors", icon: UserCog, label: "Instructors" },
  { to: "/admin/reporting", icon: BarChart3, label: "Reporting" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-white/70 backdrop-blur-xl border-r border-white shadow-xl shadow-indigo-900/5 transition-all duration-300 ease-out overflow-hidden z-20 shrink-0 font-sans relative",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
      
      {/* Logo */}
      <div
        className={cn(
          "flex h-20 items-center px-6 shrink-0 border-b border-gray-100/60 relative z-10",
          collapsed ? "justify-center px-0" : "gap-4"
        )}
      >
        <div className="relative group cursor-pointer inline-flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-lg border-2 border-white animate-pulse">
              <Sparkles className="h-2 w-2 text-amber-900" />
            </div>
          )}
        </div>
        {!collapsed && (
          <div>
            <span className="block text-[17px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight leading-none">
              Learnova
            </span>
            <span className="block text-[11px] font-bold text-indigo-500 mt-1 tracking-widest uppercase">
              Admin Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 space-y-2 px-4 overflow-y-auto relative z-10">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-4 rounded-2xl py-3 text-[14px] font-bold transition-all duration-300",
                collapsed ? "justify-center px-0 mx-2" : "px-4",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
                  : "text-gray-500 hover:bg-white/60 hover:text-gray-900 border border-transparent hover:border-gray-100 hover:shadow-sm"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-t border-gray-100/60 p-4 shrink-0 relative z-10">
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-2xl p-3 mb-3 bg-white/50 border border-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner border border-white text-sm font-black text-indigo-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold text-gray-800 leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mt-0.5">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl py-3 text-[13px] font-extrabold text-gray-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all shadow-sm",
            collapsed ? "justify-center px-0 mx-auto w-12" : "px-4"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={onToggle}
          className="mt-2 flex w-full items-center justify-center rounded-full p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-colors border border-transparent hover:border-gray-200 shadow-sm"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("h-5 w-5 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
