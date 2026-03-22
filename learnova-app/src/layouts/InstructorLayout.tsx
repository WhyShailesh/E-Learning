import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, LayoutGrid, List, LogOut, BookOpen, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 font-sans selection:bg-indigo-200">
      {/* Top navigation bar — Premium Glass */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white shadow-sm shadow-indigo-900/5">
        <div className="flex h-16 items-center gap-4 px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative group cursor-pointer inline-flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/20 transition-transform group-hover:scale-105 duration-300">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-md border-2 border-white animate-pulse">
                <Sparkles className="h-2 w-2 text-amber-900" />
              </div>
            </div>
            <div>
              <span className="block text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 leading-none tracking-tight">Learnova</span>
              <span className="block text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">Instructor</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/60 mx-2" />

          {/* Tab nav */}
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.to);
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-inner border border-indigo-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Search */}
          <div className="relative ml-auto flex-1 max-w-sm hidden md:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="h-10 w-full rounded-xl border border-white bg-white/50 pl-10 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
            />
          </div>



          {/* User + logout */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner border border-white text-sm font-black text-indigo-700">
              {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
            <div className="hidden lg:block">
              <span className="block text-[13px] font-extrabold text-gray-800 leading-none">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="group flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-2 rounded-xl sm:px-3 sm:py-2 text-[13px] font-bold text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all ml-1 border border-transparent hover:border-rose-100 hover:shadow-sm"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <Outlet context={{ search, viewMode }} />
      </main>
    </div>
  );
}
