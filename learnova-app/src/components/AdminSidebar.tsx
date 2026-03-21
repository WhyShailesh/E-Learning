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
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-out overflow-hidden shrink-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-gray-200 px-4 shrink-0",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="block text-[13px] font-bold text-gray-900 tracking-tight leading-none">
              Learnova
            </span>
            <span className="block text-[10px] text-gray-400 mt-0.5 tracking-widest uppercase">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0",
                  isActive ? "text-indigo-600" : "text-gray-400"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-2 space-y-1 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 mb-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-bold text-indigo-700">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-gray-800 leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
