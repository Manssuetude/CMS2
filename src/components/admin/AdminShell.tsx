"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { OnboardingTour } from "./OnboardingTour";
import { AdminToaster } from "./AdminToaster";

export function AdminShell({
  children,
  isAdmin = false,
  permissions = [],
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  permissions?: string[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("admin-sidebar-collapsed") === "true");
    } catch {
      // ignore
    }
  }, []);

  const toggle = () =>
    setCollapsed((v) => {
      try {
        localStorage.setItem("admin-sidebar-collapsed", String(!v));
      } catch {
        // ignore
      }
      return !v;
    });

  return (
    <div className={`admin-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <AdminSidebar collapsed={collapsed} onToggle={toggle} isAdmin={isAdmin} permissions={permissions} />
      <div className="admin-main">
        <AdminTopbar />
        <main className="admin-content">{children}</main>
      </div>
      <OnboardingTour />
      <AdminToaster />
    </div>
  );
}
