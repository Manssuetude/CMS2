"use client";

import { useEffect, useRef, useState, useTransition, type MouseEvent, type ReactNode } from "react";
import {
  PREVIEW_DATA,
  PREVIEW_NAVIGATE,
  PREVIEW_READY,
  type PreviewDataMessage,
  type PreviewNavigateMessage,
  type PreviewResult,
} from "@/constants/preview";

// Contenu de l'iframe d'aperçu : signale à la fiche parente qu'il est prêt,
// reçoit ses valeurs (postMessage, même origine), demande le rendu au serveur
// (`render`, server action en lecture seule) et affiche la page obtenue.
// `rendererName` n'est pas utilisé au rendu : il garantit seulement que la
// page serveur importe bien le composant public rendu (voir les pages
// /apercu/*).
export function PagePreviewFrame({
  render,
  rendererName,
}: {
  render: (payload: Record<string, string>) => Promise<PreviewResult>;
  rendererName: string;
}) {
  const [node, setNode] = useState<ReactNode>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const requestId = useRef(0);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const message = event.data as PreviewDataMessage;
      if (message?.type !== PREVIEW_DATA) return;
      document.documentElement.setAttribute("data-theme", message.theme);
      const current = ++requestId.current;
      startTransition(async () => {
        const result = await render(message.payload);
        if (current !== requestId.current) return; // une demande plus récente est en cours
        if (result.ok) {
          setNode(result.node);
          setLinks(result.links ?? []);
          setError(null);
          window.scrollTo(0, 0);
        } else {
          setError(result.error);
        }
      });
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [render]);

  // Liens vers une autre partie : restent dans l'aperçu (la page publique
  // n'existe pas encore, ou n'a pas les modifications en cours).
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (links.length === 0) return;
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor?.href) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    const index = links.indexOf(url.pathname);
    if (index < 0) return;
    event.preventDefault();
    const message: PreviewNavigateMessage = { type: PREVIEW_NAVIGATE, index };
    window.parent.postMessage(message, window.location.origin);
  }

  return (
    <div data-preview-of={rendererName} onClickCapture={onClickCapture}>
      {/* Le bandeau cookies du site n'a pas de sens dans l'aperçu. */}
      <style>{".cookie-banner{display:none!important}"}</style>
      {error && (
        <p className="event-preview-error" role="alert">
          Aperçu impossible : {error}
        </p>
      )}
      {node ?? (
        <p className="event-preview-loading" aria-live="polite">
          {pending ? "Préparation de l'aperçu…" : "En attente des données du formulaire…"}
        </p>
      )}
    </div>
  );
}
