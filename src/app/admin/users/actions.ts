"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { userRepository } from "@/repositories/userRepository";
import { roleRepository } from "@/repositories/roleRepository";
import { sendEmail, inviteEmailHtml } from "@/lib/email";
import { logAction } from "@/lib/audit";

export type InviteState = { ok: boolean; link?: string; emailSent?: boolean; error?: string } | null;

const inviteSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
  roleKey: z.string().min(1, "Choisissez un rôle."),
});

export async function inviteUserAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  await requireAdmin();

  const parsed = inviteSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    roleKey: String(formData.get("roleKey") ?? "").trim(),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message };

  const role = await roleRepository.getByKey(parsed.data.roleKey);
  if (!role) return { ok: false, error: "Rôle introuvable." };

  try {
    const { link, userId } = await userRepository.invite(parsed.data.email, parsed.data.roleKey);
    const emailSent = await sendEmail(
      parsed.data.email,
      "Votre invitation à l'espace Manssuétude",
      inviteEmailHtml(link, role.label),
    );
    await logAction("invite", {
      entityType: "user",
      entityId: userId,
      summary: `Invité ${parsed.data.email} (rôle : ${role.label})`,
    });
    revalidatePath("/admin/users");
    return { ok: true, link, emailSent };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Échec de l'invitation." };
  }
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const roleKey = String(formData.get("roleKey") ?? "").trim();
  if (!id || !roleKey) return;
  await userRepository.updateRole(id, roleKey);
  await logAction("role change", { entityType: "user", entityId: id, summary: `Rôle changé → ${roleKey}` });
  revalidatePath("/admin/users");
}

export type InviteLinkState = { link?: string; error?: string };

// Régénère et renvoie un lien d'activation pour un compte en attente (copier-coller
// manuel si l'e-mail n'est pas parti). Réservé aux administrateurs.
export async function inviteLinkAction(id: string): Promise<InviteLinkState> {
  await requireAdmin();
  try {
    const user = await userRepository.getById(id);
    if (!user) return { error: "Utilisateur introuvable." };
    const link = await userRepository.activationLink(user.email);
    return { link };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible de générer le lien." };
  }
}

export async function removeUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id || id === admin.userId) return; // on ne se supprime pas soi-même
  await userRepository.remove(id);
  await logAction("delete", { entityType: "user", entityId: id, summary: "Compte supprimé" });
  revalidatePath("/admin/users");
}
