"use client";

import dynamic from "next/dynamic";

// react-pdf/pdf.js dépend du DOM (canvas, ResizeObserver) — rendu clientside
// uniquement. `ssr: false` n'est permis que depuis un composant client, d'où
// ce petit fichier séparé (ProductionDetail.tsx, qui l'utilise, est un
// composant serveur).
export const PdfViewer = dynamic(() => import("@/components/public/PdfViewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => <p>Chargement du PDF…</p>,
});
