"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link2 } from "lucide-react";
import { LinkedInIcon, XIcon } from "@/components/public/SocialIcons";
import { buildShareUrls } from "@/utils/shareLinks";

interface SelectionState {
  text: string;
  top: number;
  left: number;
}

interface Props {
  url: string;
  children: ReactNode;
}

// Fait apparaître une mini-barre de partage flottante quand le lecteur
// sélectionne un extrait de texte dans le contenu — partage d'une citation
// forte, pas seulement de la page entière (contrairement à ShareButtons).
export function QuoteShareBar({ url, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!text || !containerRef.current || !sel || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSelection(null);
        return;
      }
      setSelection({ text, top: rect.top + window.scrollY - 44, left: rect.left + rect.width / 2 + window.scrollX });
      setCopied(false);
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const share = selection ? buildShareUrls(url, `« ${selection.text} »`) : null;

  async function handleCopy() {
    if (!selection) return;
    await navigator.clipboard.writeText(`« ${selection.text} » — ${url}`);
    setCopied(true);
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {children}
      {selection && share && (
        <div className="quote-share-bar" style={{ top: selection.top, left: selection.left }}>
          <a href={share.x} target="_blank" rel="noopener noreferrer" aria-label="Partager cette citation sur X">
            <XIcon size={14} />
          </a>
          <a
            href={share.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Partager cette citation sur LinkedIn"
          >
            <LinkedInIcon size={14} />
          </a>
          <button type="button" onClick={handleCopy} aria-label="Copier la citation">
            <Link2 size={14} strokeWidth={1.8} />
          </button>
          {copied && <span className="quote-share-copied">Copié</span>}
        </div>
      )}
    </div>
  );
}
