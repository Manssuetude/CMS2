"use client";

import { useDeferredValue, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { splitIntoParts } from "@/utils/articleParts";

const NO_PARTS_MESSAGE = {
  word: "Aucun titre détecté : l'article s'affichera en une seule partie. Vérifiez que les grands titres utilisent le style « Titre 1 » dans Word.",
  editor:
    "Aucun « Titre de partie » : l'article s'affichera en une seule page. Pour le découper, appliquez « Titre de partie » aux grands titres.",
};

interface Props {
  html: string;
  /** Origine du contenu : adapte le conseil affiché quand aucune partie n'est détectée. */
  source?: "word" | "editor";
}

// Liste des parties que verra le lecteur (une par « Titre de partie », h2),
// recalculée au fil de la saisie — même découpage que les pages publiques.
export function ArticlePartsPreview({ html, source = "editor" }: Props) {
  const deferredHtml = useDeferredValue(html);
  const parts = useMemo(() => splitIntoParts(deferredHtml), [deferredHtml]);

  if (parts.length === 0) return null;

  if (parts.length === 1) {
    return (
      <p className="admin-warning" role="status">
        <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
        <span>{NO_PARTS_MESSAGE[source]}</span>
      </p>
    );
  }

  return (
    <div className="article-parts-preview" role="status">
      <p className="article-parts-preview-count">{parts.length} parties détectées</p>
      <ol>
        {parts.map((part) => (
          <li key={part.slug}>
            {part.title}
            {part.isIntro && <span className="article-parts-preview-tag">avant le premier titre</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
