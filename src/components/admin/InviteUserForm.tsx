"use client";

import { useActionState, useState } from "react";
import { inviteUserAction, type InviteState } from "@/app/admin/users/actions";
import type { Role } from "@/types/cms";

export function InviteUserForm({ roles }: { roles: Role[] }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteUserAction, null);
  const [copied, setCopied] = useState(false);

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez le lien d'invitation :", link);
    }
  }

  return (
    <div className="admin-form-section">
      <h2 className="admin-form-section-title">Inviter un utilisateur</h2>
      <p className="admin-form-section-hint">
        L&apos;utilisateur recevra un lien pour définir son <strong>nom</strong> et son <strong>mot de passe</strong>.
      </p>

      <form action={action} className="form-row" style={{ alignItems: "end" }}>
        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="prenom@exemple.com"
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="roleKey">
            Rôle
          </label>
          <select id="roleKey" name="roleKey" className="form-input" defaultValue="" required>
            <option value="" disabled>
              Choisir
            </option>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <button type="submit" className="cta" disabled={pending}>
            {pending ? "Invitation…" : "Inviter"}
          </button>
        </div>
      </form>

      {state?.error && <p className="form-error">{state.error}</p>}

      {state?.ok && (
        <div className="invite-result">
          <p>
            ✅ Invitation créée.{" "}
            {state.emailSent
              ? "Un e-mail vient d'être envoyé."
              : "E-mail non configuré (ou domaine non vérifié), partagez le lien ci-dessous :"}
          </p>
          {!state.emailSent && state.link && (
            <div className="invite-link">
              <button type="button" className="btn-sm" onClick={() => copyLink(state.link!)}>
                {copied ? "✓ Copié" : "Copier"}
              </button>
              <input
                readOnly
                aria-label="Lien d'invitation"
                value={state.link}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
