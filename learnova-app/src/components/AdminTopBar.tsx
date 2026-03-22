import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminTopBar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/60 bg-white/70 backdrop-blur-xl px-8 z-30 font-sans shadow-sm shadow-indigo-900/5 relative">
      <div className="absolute top-0 right-1/4 w-full h-20 bg-gradient-to-r from-transparent via-indigo-50/50 to-transparent pointer-events-none" />
      
      {/* Search */}
      <div className="relative w-80 z-10 hidden sm:block">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Quick search anywhere..."
          className="h-10 w-full rounded-2xl border border-white bg-white/50 pl-11 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
        />
      </div>

      <div className="flex-1 sm:hidden"></div> {/* Spacer for mobile */}

      {/* Right side */}
      <div className="flex items-center gap-4 z-10">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm border border-gray-100 hover:border-indigo-100 group">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 shadow drop-shadow-sm group-hover:animate-ping" />
        </button>

        <div className="h-6 w-px bg-gray-200/60" />

        {/* User dropdown */}
        <div className="relative">
          <button
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm",
              dropdownOpen && "bg-white border-gray-100 shadow-sm"
            )}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 leading-none mb-1">Active</span>
              <p className="text-sm font-extrabold text-gray-800 leading-none">{user?.name?.split(" ")[0]}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner border border-white text-sm font-black text-indigo-700">
              {initials}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-300",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-3 w-64 rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-2 shadow-2xl shadow-indigo-900/10 transform origin-top-right transition-all">
                
                <div className="px-4 py-3 border-b border-gray-100/60 mb-2 bg-gray-50/50 rounded-2xl">
                  <p className="text-sm font-extrabold text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">{user?.email}</p>
                </div>
                
                <div className="px-1 space-y-1">
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-extrabold text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Secure Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
