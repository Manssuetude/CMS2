"use client";

import { useState } from "react";
import { Quote } from "lucide-react";

interface Props {
  title: string;
  author?: string | null;
  date?: string | null;
  url: string;
}

// Génère une référence bibliographique courte et la copie au clic — pas de
// norme (APA/MLA) imposée, juste de quoi citer proprement une publication.
export function CiteButton({ title, author, date, url }: Props) {
  const [copied, setCopied] = useState(false);
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
  const citation = `${author ? `${author}. ` : ""}(${year}). ${title}. Manssuétude. ${url}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="cite-block">
      <p className="cite-text">{citation}</p>
      <button type="button" className="btn secondary" onClick={handleCopy}>
        <Quote size={14} strokeWidth={1.8} />
        {copied ? "Citation copiée" : "Copier la citation"}
      </button>
    </div>
  );
}
