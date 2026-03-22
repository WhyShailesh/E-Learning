import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopBar from "@/components/AdminTopBar";

/**
 * AdminLayout — Premium Glassmorphism Theme.
 */
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 font-sans selection:bg-indigo-200 overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <AdminTopBar />
        
        <main className="flex-1 overflow-auto p-6 md:p-10 relative z-10 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
