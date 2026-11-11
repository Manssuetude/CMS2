"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { isFormCta, resolveCta } from "@/lib/cta";
import type { CtaTarget } from "@/types/cms";

// La modale de formulaire (et le catalogue de champs de tous les formulaires)
// n'est utile qu'au clic : chargée à la demande pour alléger le JS initial de
// toutes les pages publiques (PageSpeed « JavaScript inutilisé »).
const FormModal = dynamic(() => import("@/components/forms/FormModal").then((m) => m.FormModal), { ssr: false });

export function CtaButton({
  label,
  target,
  variant = "secondary",
  contextFields,
  selectOptions,
}: {
  label: string;
  target: CtaTarget;
  variant?: "primary" | "secondary";
  contextFields?: Record<string, string>;
  selectOptions?: Record<string, string[]>;
}) {
  const resolved = resolveCta(target);
  const [formType, setFormType] = useState<string | null>(null);

  if (isFormCta(resolved)) {
    return (
      <>
        <button
          className={`button ${variant}`}
          type="button"
          onClick={() => setFormType(resolved.replace("FORM:", ""))}
        >
          {label}
        </button>
        {formType ? (
          <FormModal
            formType={formType}
            onClose={() => setFormType(null)}
            contextFields={contextFields}
            selectOptions={selectOptions}
          />
        ) : null}
      </>
    );
  }

  if (/^https?:\/\//.test(resolved)) {
    return (
      <a className={`button ${variant}`} href={resolved} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className={`button ${variant}`} href={resolved}>
      {label}
    </Link>
  );
}
