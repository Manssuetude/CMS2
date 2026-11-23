"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { themeDeletionSummary } from "@/utils/themeDeletion";

// « Supprimer » un thème. S'il a des sous-thèmes, la suppression est bloquée :
// la fenêtre les liste et propose de les rattacher à un autre thème ou
// d'archiver le thème. Sinon, confirmation avec le nombre d'événements et de
// projets dont il sera retiré. Le serveur applique la même règle.

type Action = (formData: FormData) => void | Promise<void>;

interface Props {
  theme: { id: string; title: string };
  subThemeTitles: string[];
  eventCount: number;
  projectCount: number;
  otherThemes: Array<{ id: string; title: string }>;
  deleteAction: Action;
  archiveAction: Action;
  reattachAction: Action;
}

export function ThemeDeleteButton({
  theme,
  subThemeTitles,
  eventCount,
  projectCount,
  otherThemes,
  deleteAction,
  archiveAction,
  reattachAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(otherThemes[0]?.id ?? "");
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const blocked = subThemeTitles.length > 0;

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    dialogRef.current?.querySelector<HTMLElement>("button, select")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" className="btn-sm btn-danger" onClick={() => setOpen(true)}>
        <Trash2 size={13} strokeWidth={2} aria-hidden="true" />
        Supprimer
      </button>
      {open &&
        createPortal(
          <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
            <div
              className="theme-delete-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              ref={dialogRef}
              onClick={(event) => event.stopPropagation()}
            >
              {blocked ? (
                <>
                  <h2 id={titleId}>Impossible de supprimer ce thème pour l&apos;instant</h2>
                  <p>
                    « {theme.title} » contient {subThemeTitles.length} sous-thème{subThemeTitles.length > 1 ? "s" : ""}.
                    Les supprimer avec le thème ferait disparaître leurs liens avec les productions et les événements.
                  </p>
                  <ul className="theme-delete-list">
                    {subThemeTitles.map((title) => (
                      <li key={title}>{title}</li>
                    ))}
                  </ul>
                  <p>
                    Rattachez-les d&apos;abord à un autre thème, ou archivez ce thème : il disparaîtra du site et des
                    listes de l&apos;admin.
                  </p>
                  {otherThemes.length > 0 && (
                    <form action={reattachAction} id={`${titleId}-reattach`} className="theme-delete-target">
                      <input type="hidden" name="id" value={theme.id} />
                      <label htmlFor={`${titleId}-target`}>Rattacher à</label>
                      <select
                        id={`${titleId}-target`}
                        name="targetThemeId"
                        value={target}
                        onChange={(event) => setTarget(event.target.value)}
                      >
                        {otherThemes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </form>
                  )}
                  <div className="theme-delete-actions">
                    <button type="button" className="button" onClick={() => setOpen(false)}>
                      Fermer
                    </button>
                    <form action={archiveAction}>
                      <input type="hidden" name="id" value={theme.id} />
                      <button type="submit" className="button">
                        Archiver le thème
                      </button>
                    </form>
                    {otherThemes.length > 0 && (
                      <button type="submit" form={`${titleId}-reattach`} className="button primary">
                        Rattacher les sous-thèmes
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 id={titleId}>Supprimer ce thème ?</h2>
                  <p>{themeDeletionSummary(theme.title, eventCount, projectCount)}</p>
                  <div className="theme-delete-actions">
                    <button type="button" className="button" onClick={() => setOpen(false)}>
                      Annuler
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={theme.id} />
                      <button type="submit" className="button danger">
                        Supprimer définitivement
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
