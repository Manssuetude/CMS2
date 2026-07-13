"use client";

import Link from "next/link";
import { useState } from "react";
import { isFormCta, resolveCta } from "@/lib/cta";
import type { CtaTarget } from "@/types/cms";
import { FormModal } from "@/components/forms/FormModal";

export function CtaButton({
  label,
  target,
  variant = "secondary",
}: {
  label: string;
  target: CtaTarget;
  variant?: "primary" | "secondary";
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
        {formType ? <FormModal formType={formType} onClose={() => setFormType(null)} /> : null}
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
