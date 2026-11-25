"use client";

import { useMemo, type RefObject } from "react";
import type { HeaderStyle } from "@/utils/eventHeader";
import { EVENT_PREVIEW_PATH } from "@/constants/preview";
import { PagePreviewModal } from "@/components/admin/PagePreviewModal";

// Aperçu de la page événement avant enregistrement (voir PagePreviewModal) :
// ajoute le choix du style d'en-tête à la barre d'outils.
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
  const extraPayload = useMemo(() => ({ headerStyle }), [headerStyle]);

  return (
    <PagePreviewModal
      formRef={formRef}
      path={EVENT_PREVIEW_PATH}
      frameTitle="Aperçu de la page événement"
      extraPayload={extraPayload}
      onClose={onClose}
      onSave={onSave}
      toolbarStart={
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
      }
    />
  );
}
