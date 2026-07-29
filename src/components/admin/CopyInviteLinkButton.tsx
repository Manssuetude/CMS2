"use client";

import { useState } from "react";
import { inviteLinkAction } from "@/app/admin/users/actions";

type State = "idle" | "loading" | "copied" | "error";

// Régénère un lien d'activation à la demande (server action) puis le copie dans le
// presse-papiers. Affiché uniquement pour les comptes en attente d'activation.
export function CopyInviteLinkButton({ userId }: { userId: string }) {
  const [state, setState] = useState<State>("idle");

  async function onClick() {
    setState("loading");
    const res = await inviteLinkAction(userId);
    if (!res.link) {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(res.link);
      setState("copied");
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : on montre le lien à copier.
      window.prompt("Copiez le lien d'invitation :", res.link);
      setState("idle");
      return;
    }
    setTimeout(() => setState("idle"), 2500);
  }

  const label =
    state === "loading" ? "…" : state === "copied" ? "✓ Copié" : state === "error" ? "Erreur" : "Copier le lien";

  return (
    <button
      type="button"
      className="btn-sm"
      onClick={onClick}
      disabled={state === "loading"}
      title="Copier le lien d'invitation"
    >
      {label}
    </button>
  );
}
