"use client";

import { useActionState } from "react";

type ActionFn = (prevState: string | null, formData: FormData) => Promise<string | null>;

export function RedirectForm({ action }: { action: ActionFn }) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="form-row" style={{ alignItems: "flex-end" }}>
      <div className="form-field">
        <label className="field-label" htmlFor="fromPath">
          Chemin source
        </label>
        <input id="fromPath" name="fromPath" placeholder="/ancienne-page" required />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="toPath">
          Chemin cible
        </label>
        <input id="toPath" name="toPath" placeholder="/nouvelle-page" required />
      </div>
      <button type="submit" className="button primary" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter"}
      </button>
      {error && (
        <p className="form-error" style={{ flexBasis: "100%" }}>
          {error}
        </p>
      )}
    </form>
  );
}
