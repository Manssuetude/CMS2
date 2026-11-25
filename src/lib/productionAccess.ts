import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

// Import Word : réservé à qui peut créer ou modifier une production.
export async function requireProductionEditor() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (can(session, "productions:edit") || can(session, "productions:create")) return session;
  redirect("/admin/dashboard");
}
