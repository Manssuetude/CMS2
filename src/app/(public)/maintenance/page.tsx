import type { Metadata } from "next";
import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export const metadata: Metadata = {
  title: "Page en maintenance",
  description: "Cette page est en cours de préparation.",
  // Surcharge le « index, follow » du layout racine (MaintenanceNotice ajoute
  // aussi un noindex, qui couvre les replis affichés à la place d'une page).
  robots: { index: false, follow: true },
};

export default function MaintenancePage() {
  return <MaintenanceNotice />;
}
