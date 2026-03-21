import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopBar from "@/components/AdminTopBar";

/**
 * AdminLayout — light theme.
 * No 'dark' class — uses :root CSS variables (light by default).
 */
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
