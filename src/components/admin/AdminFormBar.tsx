"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import type { ContentStatus } from "@/types/cms";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

// Barre d'actions fixe en bas d'une fiche : état à gauche (modifications non
// enregistrées, tout est enregistré, blocage ou erreur), à droite le statut,
// l'aperçu éventuel et « Enregistrer ». À placer DANS le <form> : elle suit
// ses modifications et prévient avant de quitter la page sans enregistrer.

const STATUS_OPTIONS: Array<{ value: ContentStatus; label: string }> = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
  { value: "archived", label: "Archivé" },
];

type StatusControl =
  | { value: ContentStatus; onChange: (value: ContentStatus) => void; defaultValue?: never }
  | { defaultValue: ContentStatus; value?: never; onChange?: never };

interface Props {
  /** Sélecteur de statut (champ `status` du formulaire). */
  status?: StatusControl;
  /** Boutons ajoutés avant « Enregistrer » (ex. Aperçu). */
  actions?: ReactNode;
  submitLabel?: string;
  /** Enregistrement impossible : message à gauche, bouton désactivé. */
  blockedMessage?: string | null;
  /** Erreur renvoyée par le dernier enregistrement. */
  error?: string | null;
  /** Contenu jamais enregistré (création). */
  isNew?: boolean;
}

export function AdminFormBar({ status, actions, submitLabel = "Enregistrer", blockedMessage, error, isNew }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const { pending } = useFormStatus();
  const params = useSearchParams();
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  // Le formulaire parent, retrouvé une fois la barre montée.
  useEffect(() => {
    setForm(barRef.current?.closest("form") ?? null);
  }, []);

  const { dirty, markSaved } = useUnsavedChanges(form);

  // Retour d'un enregistrement (redirection avec ?saved=1).
  useEffect(() => {
    if (params.get("saved") === "1") setJustSaved(true);
  }, [params]);

  // « à l'instant » seulement dans la minute qui suit.
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 60_000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  // Fin d'un enregistrement resté sur la page : sans erreur, tout est enregistré.
  useEffect(() => {
    if (wasPending.current && !pending && !error) {
      markSaved();
      setJustSaved(true);
    }
    wasPending.current = pending;
  }, [pending, error, markSaved]);

  let tone: "warning" | "ok" | "error" | "muted";
  let message: string;
  if (blockedMessage) {
    tone = "error";
    message = blockedMessage;
  } else if (pending) {
    tone = "muted";
    message = "Enregistrement…";
  } else if (error && dirty) {
    tone = "error";
    message = error;
  } else if (dirty) {
    tone = "warning";
    message = "Modifications non enregistrées";
  } else if (isNew && !justSaved) {
    tone = "muted";
    message = "Pas encore enregistré";
  } else {
    tone = "ok";
    message = justSaved ? "Tout est enregistré · à l'instant" : "Tout est enregistré";
  }

  return (
    <div className="admin-form-bar" ref={barRef}>
      <p className={`admin-form-bar-state is-${tone}`} role="status" aria-live="polite">
        {message}
      </p>
      <div className="admin-form-bar-actions">
        {status && (
          <label className="admin-form-bar-status">
            <span>Statut</span>
            <select
              name="status"
              {...(status.onChange
                ? { value: status.value, onChange: (e) => status.onChange(e.target.value as ContentStatus) }
                : { defaultValue: status.defaultValue })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {actions}
        <button type="submit" className="button primary" disabled={pending || !!blockedMessage}>
          {pending ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
