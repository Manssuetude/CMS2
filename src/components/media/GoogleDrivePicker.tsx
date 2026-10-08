"use client";

import { useState } from "react";
import { mediaClientService } from "@/services/mediaClientService";
import type { Media } from "@/types/cms";

// Types minimaux pour les deux SDK Google chargés dynamiquement (Identity
// Services pour l'OAuth, gapi pour le widget Picker) — pas de types officiels
// légers disponibles, on ne déclare que ce qu'on appelle réellement.
interface GooglePickerDoc {
  id: string;
  name: string;
  mimeType: string;
}
interface GooglePickerResponse {
  action: string;
  docs?: GooglePickerDoc[];
}
interface GoogleDocsView {
  setIncludeFolders(include: boolean): GoogleDocsView;
  setMimeTypes(mimeTypes: string): GoogleDocsView;
}
interface GooglePickerBuilder {
  addView(view: GoogleDocsView): GooglePickerBuilder;
  enableFeature(feature: string): GooglePickerBuilder;
  setOAuthToken(token: string): GooglePickerBuilder;
  setDeveloperKey(key: string): GooglePickerBuilder;
  setCallback(callback: (data: GooglePickerResponse) => void): GooglePickerBuilder;
  build(): { setVisible(visible: boolean): void };
}

declare global {
  interface Window {
    gapi?: { load: (api: string, callback: () => void) => void };
    google?: {
      accounts?: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken: () => void };
        };
      };
      picker?: {
        PickerBuilder: new () => GooglePickerBuilder;
        DocsView: new () => GoogleDocsView;
        Feature: { MULTISELECT_ENABLED: string };
      };
    };
  }
}

// Types de fichiers pris en charge par la médiathèque (voir utils/uploadValidation.ts) —
// les documents Google natifs (Docs/Sheets/Slides) sont exclus : ils nécessitent un
// export préalable (pas de binaire direct à télécharger via l'API Drive).
const SUPPORTED_MIME_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml,application/pdf";

// validateUpload (utils/uploadValidation.ts) se base sur l'extension du nom de
// fichier — un fichier Drive nommé sans extension (ex. "Photo retouchée")
// serait sinon rejeté malgré un contenu valide.
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

function ensureFileExtension(name: string, mimeType: string): string {
  const ext = EXTENSION_BY_MIME_TYPE[mimeType];
  if (!ext) return name;
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}

const GSI_SRC = "https://accounts.google.com/gsi/client";
const GAPI_SRC = "https://apis.google.com/js/api.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Échec du chargement de ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureGoogleApisLoaded(): Promise<void> {
  await Promise.all([loadScript(GSI_SRC), loadScript(GAPI_SRC)]);
  await new Promise<void>((resolve) => {
    const check = () => (window.gapi ? resolve() : setTimeout(check, 50));
    check();
  });
  if (!window.google?.picker) {
    await new Promise<void>((resolve) => window.gapi!.load("picker", () => resolve()));
  }
}

type Status = "idle" | "connecting" | "importing" | "error";

export function GoogleDrivePicker({ onImported }: { onImported: (item: Media) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function showPicker(accessToken: string, apiKey: string) {
    const picker = window.google!.picker!;
    const view = new picker.DocsView().setIncludeFolders(true).setMimeTypes(SUPPORTED_MIME_TYPES);
    new picker.PickerBuilder()
      .addView(view)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setCallback((data: GooglePickerResponse) => handlePicked(data, accessToken))
      .build()
      .setVisible(true);
  }

  async function handlePicked(data: GooglePickerResponse, accessToken: string) {
    if (data.action !== "picked" || !data.docs?.length) {
      setStatus("idle");
      return;
    }
    setStatus("importing");
    setError(null);
    try {
      for (const doc of data.docs) {
        if (doc.mimeType.startsWith("application/vnd.google-apps.")) {
          throw new Error(
            `« ${doc.name} » est un document Google natif (Docs/Sheets/Slides) — exportez-le d'abord en PDF depuis Drive, puis réimportez-le.`,
          );
        }
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!fileRes.ok) throw new Error(`Échec du téléchargement de « ${doc.name} » depuis Drive.`);
        const blob = await fileRes.blob();
        const filename = ensureFileExtension(doc.name, doc.mimeType);
        const file = new File([blob], filename, { type: doc.mimeType });
        const media = await mediaClientService.uploadFile(file, { title: doc.name });
        onImported(media);
      }
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Échec de l'import depuis Google Drive.");
    }
  }

  async function openPicker() {
    setStatus("connecting");
    setError(null);
    try {
      const res = await fetch("/api/google-drive/picker-token");
      if (!res.ok) throw new Error("Impossible de récupérer la configuration Google.");
      const config = (await res.json()) as { clientId: string; apiKey: string; scopes: string[] };
      if (!config.clientId || !config.apiKey) {
        throw new Error(
          "Intégration Google Drive non configurée — GOOGLE_CLIENT_ID et GOOGLE_API_KEY doivent être définies.",
        );
      }

      await ensureGoogleApisLoaded();

      const tokenClient = window.google!.accounts!.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: config.scopes.join(" "),
        callback: (response) => {
          if (response.error || !response.access_token) {
            setStatus("error");
            setError("Connexion à Google Drive refusée ou annulée.");
            return;
          }
          setStatus("idle");
          showPicker(response.access_token, config.apiKey);
        },
      });
      tokenClient.requestAccessToken();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erreur lors de l'ouverture de Google Drive.");
    }
  }

  return (
    <div className="google-drive-picker">
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)" }}>
        Choisissez une ou plusieurs images (ou un PDF) directement depuis votre Google Drive — le fichier est copié dans
        la médiathèque, il reste disponible même si vous retirez le partage sur Drive ensuite.
      </p>
      <button
        type="button"
        className="button primary"
        onClick={openPicker}
        disabled={status === "connecting" || status === "importing"}
      >
        {status === "importing"
          ? "Import en cours…"
          : status === "connecting"
            ? "Connexion à Google…"
            : "Parcourir Google Drive"}
      </button>
      {error && <p style={{ color: "var(--error, #b91c1c)", margin: "10px 0 0" }}>{error}</p>}
    </div>
  );
}
