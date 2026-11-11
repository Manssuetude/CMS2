"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { renderEventPreview } from "@/app/admin/evenements/preview";
import { EVENT_PREVIEW_DATA, EVENT_PREVIEW_READY, type EventPreviewMessage } from "@/constants/eventPreview";

// Contenu de l'iframe d'aperçu : signale au formulaire parent qu'il est prêt,
// reçoit ses valeurs (postMessage, même origine), demande le rendu au serveur
// (renderEventPreview, lecture seule) et affiche la page obtenue.
// `detailComponent` n'est pas utilisé au rendu : il garantit seulement que la
// page serveur importe bien EvenementDetail (voir page /apercu/evenement).
export function EventPreviewFrame({ detailComponent }: { detailComponent: string }) {
  const [node, setNode] = useState<ReactNode>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const requestId = useRef(0);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const message = event.data as EventPreviewMessage;
      if (message?.type !== EVENT_PREVIEW_DATA) return;
      document.documentElement.setAttribute("data-theme", message.theme);
      const current = ++requestId.current;
      startTransition(async () => {
        const result = await renderEventPreview(message.payload);
        if (current !== requestId.current) return; // une demande plus récente est en cours
        if (result.ok) {
          setNode(result.node);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: EVENT_PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div data-preview-of={detailComponent}>
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
