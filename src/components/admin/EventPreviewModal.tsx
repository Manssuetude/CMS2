"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Monitor, Moon, Smartphone, Sun, Tablet, X } from "lucide-react";
import type { HeaderStyle } from "@/utils/eventHeader";
import {
  EVENT_PREVIEW_DATA,
  EVENT_PREVIEW_PATH,
  EVENT_PREVIEW_READY,
  type EventPreviewMessage,
  type PreviewTheme,
} from "@/constants/eventPreview";

// Aperçu de la page événement AVANT enregistrement : la vraie page publique,
// rendue dans une iframe (pour que les media queries réagissent à la largeur
// choisie) avec les valeurs actuelles du formulaire, transmises par postMessage
// (même origine). Rien n'est enregistré : voir renderEventPreview.

// Tailles d'écran réelles (pixels CSS) : iPad Air 11" et iPhone 16 Pro Max.
// L'ordinateur n'a pas de hauteur imposée (cadre à la hauteur disponible).
const DEVICES = {
  desktop: { label: "Ordinateur", detail: "1440 px", width: 1440, height: null, Icon: Monitor },
  tablet: { label: "Tablette", detail: "iPad Air", width: 820, height: 1180, Icon: Tablet },
  mobile: { label: "Mobile", detail: "iPhone 16 Pro Max", width: 440, height: 956, Icon: Smartphone },
} as const;
type Device = keyof typeof DEVICES;

// Valeurs texte du formulaire (les champs fichiers n'existent pas ici).
function serializeForm(form: HTMLFormElement): Record<string, string> {
  const entries: Record<string, string> = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") entries[key] = value;
  });
  return entries;
}

export function EventPreviewModal({
  formRef,
  headerStyle,
  onHeaderStyleChange,
  onClose,
  onSave,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  headerStyle: HeaderStyle;
  onHeaderStyleChange: (value: HeaderStyle) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const [scale, setScale] = useState(1);
  const [stageHeight, setStageHeight] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const frameWidth = DEVICES[device].width;
  const deviceHeight = DEVICES[device].height;

  const sendData = useCallback(() => {
    const form = formRef.current;
    const target = iframeRef.current?.contentWindow;
    if (!form || !target) return;
    // Le style choisi dans la barre d'outils prime (le formulaire peut ne pas
    // avoir encore été re-rendu au moment de l'envoi).
    const payload = { ...serializeForm(form), headerStyle };
    const message: EventPreviewMessage = { type: EVENT_PREVIEW_DATA, payload, theme };
    target.postMessage(message, window.location.origin);
  }, [formRef, headerStyle, theme]);

  // L'iframe signale qu'elle est prête → on envoie les données du formulaire.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if ((event.data as { type?: string })?.type === EVENT_PREVIEW_READY) sendData();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendData]);

  // Style ou thème modifié dans la barre d'outils → nouveau rendu.
  useEffect(() => {
    sendData();
  }, [sendData]);

  // Cadre réduit à l'échelle pour tenir dans l'écran disponible.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const fitWidth = (stage.clientWidth - 32) / frameWidth;
      const fitHeight = deviceHeight ? (stage.clientHeight - 32) / deviceHeight : 1;
      setScale(Math.min(1, fitWidth, fitHeight));
      setStageHeight(stage.clientHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [frameWidth, deviceHeight]);

  // Modale : défilement de la page bloqué, Échap pour fermer, focus initial.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  // Hauteur de l'écran simulé : celle de l'appareil, ou toute la place disponible.
  const frameHeight = deviceHeight ?? Math.max(0, stageHeight - 32) / scale;

  return (
    <div className="event-preview" role="dialog" aria-modal="true" aria-label="Aperçu de la page" ref={dialogRef}>
      <p className="event-preview-flag">Aperçu : non publié</p>
      <div className="event-preview-toolbar">
        <div className="event-preview-group" role="group" aria-label="Style d'en-tête">
          {(["classic", "banner"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={headerStyle === value}
              onClick={() => onHeaderStyleChange(value)}
            >
              {value === "classic" ? "Classique" : "Bannière"}
            </button>
          ))}
        </div>
        <div className="event-preview-group" role="group" aria-label="Largeur d'écran">
          {(Object.keys(DEVICES) as Device[]).map((key) => {
            const { label, detail, Icon } = DEVICES[key];
            return (
              <button key={key} type="button" aria-pressed={device === key} onClick={() => setDevice(key)}>
                <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                {label} <span className="event-preview-width">{detail}</span>
              </button>
            );
          })}
        </div>
        <div className="event-preview-group" role="group" aria-label="Thème">
          <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
            <Sun size={15} strokeWidth={1.75} aria-hidden="true" />
            Clair
          </button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
            <Moon size={15} strokeWidth={1.75} aria-hidden="true" />
            Sombre
          </button>
        </div>
        <div className="event-preview-actions">
          <button type="button" className="button" onClick={onClose}>
            <X size={15} strokeWidth={1.75} aria-hidden="true" />
            Fermer l&apos;aperçu
          </button>
          <button type="button" className="button primary" onClick={onSave}>
            Enregistrer
          </button>
        </div>
      </div>
      <div className="event-preview-stage" ref={stageRef}>
        <div
          className={`event-preview-frame event-preview-frame--${device}`}
          style={{ width: frameWidth * scale, height: frameHeight * scale }}
        >
          <iframe
            ref={iframeRef}
            src={EVENT_PREVIEW_PATH}
            title="Aperçu de la page événement"
            style={{ width: frameWidth, height: frameHeight, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
