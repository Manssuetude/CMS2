import { getSupabaseAdmin } from "@/lib/db";
import { env } from "@/lib/env";
import { asNullableString, asString, type DataRow } from "@/utils/row";

export type ManagedUser = {
  id: string;
  email: string;
  name: string | null;
  roleKey: string | null;
  createdAt: string;
};

function mapUser(row: DataRow): ManagedUser {
  return {
    id: asString(row.id),
    email: asString(row.email),
    name: asNullableString(row.name),
    roleKey: asNullableString(row.role_key),
    createdAt: asString(row.created_at),
  };
}

export const userRepository = {
  async list(): Promise<ManagedUser[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("users").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return (data as DataRow[]).map(mapUser);
  },

  // Crée le compte (invité) + la ligne `users`, et renvoie le lien d'activation.
  async invite(email: string, roleKey: string): Promise<{ link: string; userId: string }> {
    const db = getSupabaseAdmin();
    const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/admin/activation`;

    const { data, error } = await db.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo },
    });
    if (error || !data?.user) {
      throw new Error(error?.message ?? "Impossible de générer l'invitation (l'adresse existe peut-être déjà).");
    }

    const userId = data.user.id;
    const link = data.properties?.action_link ?? "";

    // Ligne `users` : rôle attribué par l'admin, nom défini par l'utilisateur à l'activation.
    const { error: upErr } = await db
      .from("users")
      .upsert({ id: userId, email, role_key: roleKey }, { onConflict: "id" });
    if (upErr) throw upErr;

    return { link, userId };
  },

  async updateRole(id: string, roleKey: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("users")
      .update({ role_key: roleKey, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async setName(id: string, name: string): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db.from("users").update({ name, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    // Supprime le compte d'auth (cascade sur `users` via FK on delete cascade).
    const { error } = await db.auth.admin.deleteUser(id);
    // Si le compte d'auth a déjà disparu (ligne orpheline, double suppression ou
    // suppression manuelle côté Supabase), on ignore l'erreur « User not found »
    // au lieu de faire planter l'action, puis on nettoie explicitement ci-dessous.
    const alreadyGone = error && (error.status === 404 || /user not found/i.test(error.message));
    if (error && !alreadyGone) throw error;

    // Filet de sécurité : supprime la ligne `users` au cas où la cascade FK
    // n'a pas eu lieu (compte d'auth absent). No-op si la ligne est déjà partie.
    const { error: rowErr } = await db.from("users").delete().eq("id", id);
    if (rowErr) throw rowErr;
  },
};
