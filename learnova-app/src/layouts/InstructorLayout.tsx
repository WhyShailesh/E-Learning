import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, LayoutGrid, List, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstructorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const tabs = [
    { to: "/instructor/dashboard", label: "Courses" },
    { to: "/instructor/reporting", label: "Reporting" },
    { to: "/instructor/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar — light theme */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-14 items-center gap-4 px-6">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="block text-[13px] font-bold text-gray-900 leading-none">Learnova</span>
              <span className="block text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">Instructor</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* Tab nav */}
          <nav className="flex gap-0.5">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.to);
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Search */}
          <div className="relative mx-auto flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn("p-2 transition-colors", viewMode === "kanban" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              title="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-colors", viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* User + logout */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
              {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
            <span className="hidden sm:block text-[12px] font-medium text-gray-700">{user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ml-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Outlet context={{ search, viewMode }} />
      </main>
    </div>
  );
}
