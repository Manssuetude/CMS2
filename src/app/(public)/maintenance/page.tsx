import type { Metadata } from "next";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const metadata: Metadata = {
  title: "Page en maintenance",
  description: "Cette page est en cours de préparation.",
};

export default function MaintenancePage() {
  return <MaintenanceNotice />;
}
