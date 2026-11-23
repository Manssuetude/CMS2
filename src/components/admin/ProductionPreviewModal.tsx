"use client";

import { useCallback, useId, useMemo, useState, type RefObject } from "react";
import { PRODUCTION_PREVIEW_PATH } from "@/constants/preview";
import { PagePreviewModal } from "@/components/admin/PagePreviewModal";

// Aperçu de la page de lecture d'une production avant enregistrement (voir
// PagePreviewModal) : ajoute le choix de la partie affichée. Un clic sur un
// lien de partie dans l'aperçu change aussi la partie.

interface Props {
  formRef: RefObject<HTMLFormElement | null>;
  /** Titres des parties détectées dans le texte affiché. */
  partTitles: string[];
  /** Texte importé pas encore enregistré (sinon le texte enregistré est utilisé). */
  body?: string | null;
  /** PDF choisi pas encore enregistré (prime sur le champ du formulaire). */
  fileId?: string | null;
  onClose: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
}

export function ProductionPreviewModal({ formRef, partTitles, body, fileId, onClose, onSave, saveDisabled }: Props) {
  const [partIndex, setPartIndex] = useState(0);
  const selectId = useId();

  const extraPayload = useMemo(() => {
    const payload: Record<string, string> = { partIndex: String(partIndex) };
    if (body != null) payload.body = body;
    if (fileId != null) payload.fileId = fileId;
    return payload;
  }, [partIndex, body, fileId]);

  const onNavigate = useCallback(
    (index: number) => setPartIndex(Math.min(Math.max(index, 0), Math.max(partTitles.length - 1, 0))),
    [partTitles.length],
  );

  return (
    <PagePreviewModal
      formRef={formRef}
      path={PRODUCTION_PREVIEW_PATH}
      frameTitle="Aperçu de la page de lecture"
      extraPayload={extraPayload}
      onNavigate={onNavigate}
      onClose={onClose}
      onSave={onSave}
      saveDisabled={saveDisabled}
      toolbarStart={
        partTitles.length > 1 ? (
          <div className="preview-part-picker">
            <label htmlFor={selectId}>Partie</label>
            <select id={selectId} value={partIndex} onChange={(event) => setPartIndex(Number(event.target.value))}>
              {partTitles.map((title, index) => (
                <option key={`${index}-${title}`} value={index}>
                  {index + 1}. {title}
                </option>
              ))}
            </select>
          </div>
        ) : null
      }
    />
  );
}
