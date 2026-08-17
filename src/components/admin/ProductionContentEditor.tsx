"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { updateProductionBodyAction } from "@/app/admin/productions/actions";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 400,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        fontSize: 13,
      }}
    >
      Chargement de l&apos;éditeur...
    </div>
  ),
});

interface Props {
  productionId: string;
  initialBody: string;
}

export function ProductionContentEditor({ productionId, initialBody }: Props) {
  const [error, formAction, isPending] = useActionState(updateProductionBodyAction, null);
  const [body, setBody] = useState(initialBody);
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !error) {
      setJustSaved(true);
      window.close();
    }
    wasPending.current = isPending;
  }, [isPending, error]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={productionId} />
      <input type="hidden" name="body" value={body} />

      {error && <p className="form-error">{error}</p>}
      {justSaved && (
        <p className="form-hint" style={{ marginBottom: 12 }}>
          Contenu enregistré. Vous pouvez fermer cet onglet.
        </p>
      )}

      {/* Largeur alignée sur la colonne de lecture réelle du site public
          (.detail-body), sans hériter des tokens de couleur/police globaux
          du site — le chrome de l'éditeur reste dans le thème admin, seul
          le contenu (.ck-content) reproduit la typographie publique. */}
      <div style={{ maxWidth: 820, margin: "0 auto 24px" }}>
        <RichTextEditor value={body} onChange={setBody} />
      </div>

      <div className="form-actions">
        <button type="submit" className="button primary" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
