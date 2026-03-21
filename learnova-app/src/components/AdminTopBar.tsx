import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, ChevronDown, Settings } from "lucide-react";
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
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search…"
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-1 ring-white" />
        </button>

        <div className="h-5 w-px bg-gray-200" />

        {/* User dropdown */}
        <div className="relative">
          <button
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100",
              dropdownOpen && "bg-gray-100"
            )}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-bold text-indigo-700">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-gray-800 leading-none">{user?.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg shadow-gray-900/10">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-[12px] font-semibold text-gray-800 leading-none">{user?.name}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{user?.email}</p>
                </div>
                <button
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
                <div className="my-1 h-px bg-gray-100" />
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
