"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { roleRepository } from "@/repositories/roleRepository";
import { allPermissionKeys } from "@/constants/permissions";
import { logAction } from "@/lib/audit";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createSchema = z.object({ label: z.string().min(2, "Nom trop court.") });

export async function createRoleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = createSchema.safeParse({ label: String(formData.get("label") ?? "").trim() });
  if (!parsed.success) return;
  const key = slugify(parsed.data.label);
  if (!key || key === "admin") return;
  await roleRepository.create({ key, label: parsed.data.label, permissions: [] });
  await logAction("create", { entityType: "role", entityId: key, summary: `Rôle créé : ${parsed.data.label}` });
  revalidatePath("/admin/roles");
}

export async function updateRolePermissionsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const roleKey = String(formData.get("roleKey") ?? "").trim();
  if (!roleKey || roleKey === "admin") return;
  const valid = new Set(allPermissionKeys());
  const permissions = formData
    .getAll("perm")
    .map((v) => String(v))
    .filter((p) => valid.has(p));
  await roleRepository.updatePermissions(roleKey, permissions);
  await logAction("update", {
    entityType: "role",
    entityId: roleKey,
    summary: `Permissions du rôle « ${roleKey} » mises à jour (${permissions.length})`,
  });
  revalidatePath("/admin/roles");
  redirect("/admin/roles?saved=1");
}

export async function deleteRoleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const roleKey = String(formData.get("roleKey") ?? "").trim();
  if (!roleKey || roleKey === "admin") return;
  await roleRepository.remove(roleKey);
  await logAction("delete", { entityType: "role", entityId: roleKey, summary: `Rôle supprimé : ${roleKey}` });
  revalidatePath("/admin/roles");
}
