"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FormStatusSelect } from "@/components/admin/FormStatusSelect";
import { formDefinitions, type PublicFormType } from "@/constants/forms";
import type { FormSubmission } from "@/types/cms";

const FORM_TYPE_LABEL: Record<string, string> = {
  join: "Adhésion",
  theme: "Thème",
  activity: "Activité",
  project: "Projet",
  content: "Contenu",
  partner: "Partenariat",
  donation: "Don",
  contact: "Contact",
};

// Champs affichés en secondaire (déjà résumés ailleurs) — masqués du détail brut si voulu.
const HIDDEN_IN_DETAIL = new Set(["consent"]);

function statusClass(status: string) {
  if (status === "reçu") return "badge-recu";
  if (status === "en cours") return "badge-encours";
  if (status === "traité") return "badge-traite";
  if (status === "archivé") return "badge-archive";
  return "badge-recu";
}

function labelFor(formType: string, key: string): string {
  const t = (formType === "donation" ? "don" : formType) as PublicFormType;
  const def = formDefinitions[t]?.find((f) => f.name === key);
  return def?.label ?? key;
}

export function FormSubmissionRow({
  submission,
  action,
  columns,
}: {
  submission: FormSubmission;
  action: (formData: FormData) => Promise<void>;
  columns: number;
}) {
  const [open, setOpen] = useState(false);
  const d = submission.data as Record<string, unknown>;
  const contactName =
    d.firstName != null || d.lastName != null
      ? [d.firstName, d.lastName].filter(Boolean).join(" ")
      : String(d.name ?? d.nom ?? "-");

  const entries = Object.entries(d).filter(([, v]) => v !== "" && v != null);

  return (
    <>
      <tr>
        <td className="col-title" style={{ minWidth: 180 }}>
          <button type="button" className="form-row-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>
              <span className="form-row-name">{contactName}</span>
              {d.email != null && <span className="form-row-email">{String(d.email)}</span>}
            </span>
          </button>
        </td>
        <td>
          <span className="form-type-pill">{FORM_TYPE_LABEL[submission.formType] ?? submission.formType}</span>
        </td>
        <td style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
          {new Date(submission.receivedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td style={{ minWidth: 170 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`badge-status ${statusClass(submission.status)}`}>{submission.status}</span>
            <FormStatusSelect id={submission.id} currentStatus={submission.status} action={action} />
          </div>
        </td>
      </tr>
      {open && (
        <tr className="form-detail-row">
          <td colSpan={columns}>
            <dl className="form-detail">
              {entries.map(([k, v]) => (
                <div key={k} className="form-detail-item">
                  <dt>{labelFor(submission.formType, k)}</dt>
                  <dd>{HIDDEN_IN_DETAIL.has(k) ? (v ? "Oui" : "Non") : String(v)}</dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
