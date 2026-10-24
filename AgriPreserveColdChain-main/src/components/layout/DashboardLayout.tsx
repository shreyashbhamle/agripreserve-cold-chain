import { useState, type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div
      className="dashboard-scene min-h-screen bg-[#0E1117] text-[#F1F5F9]"
      data-role={user.role}
    >
      <div className="flex min-h-screen">
        <Sidebar
          role={user.role}
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-7">
            <div className="mx-auto w-full max-w-[1750px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}