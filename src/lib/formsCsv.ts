import { formDefinitions, FORM_TYPE_LABEL, type PublicFormType } from "@/constants/forms";
import type { FormSubmission } from "@/types/cms";

// Champs techniques jamais utiles dans un export destiné à un humain (jeton
// anti-bot Turnstile, piège à robots) — jamais remplis par un vrai visiteur.
const EXCLUDED_FIELDS = new Set(["cf-turnstile-response", "website"]);

function definitionType(formType: string): PublicFormType {
  return (formType === "donation" ? "don" : formType) as PublicFormType;
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatConsent(value: unknown): string {
  return value === true || value === "on" || value === "true" ? "Oui" : "Non";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Construit le CSV (avec BOM UTF-8 pour un affichage correct des accents à
// l'ouverture directe dans Excel) — partagé entre l'export admin authentifié
// (/api/forms/export) et le lien de téléchargement signé envoyé par email
// (/api/forms/digest-download).
export function buildFormsCsv(rows: FormSubmission[]): string {
  // Colonnes dynamiques : union des champs (hors techniques et consentement,
  // traité à part) rencontrés, dans l'ordre de déclaration de formDefinitions —
  // les champs communs (email...) tombent ainsi au même endroit d'un type à
  // l'autre plutôt que dans un ordre arbitraire.
  const fieldOrder: string[] = [];
  const fieldLabel = new Map<string, string>();
  for (const row of rows) {
    for (const field of formDefinitions[definitionType(row.formType)] ?? []) {
      if (field.name === "consent" || EXCLUDED_FIELDS.has(field.name)) continue;
      if (!fieldLabel.has(field.name)) {
        fieldLabel.set(field.name, field.label);
        fieldOrder.push(field.name);
      }
    }
  }

  const headers = [
    "Type",
    "Statut",
    "Reçu le",
    ...fieldOrder.map((name) => fieldLabel.get(name) ?? name),
    "Consentement RGPD",
    "Notes",
    "ID",
  ];

  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => {
      const data = row.data as Record<string, unknown>;
      const cells = [
        FORM_TYPE_LABEL[row.formType] ?? row.formType,
        row.status,
        formatDate(row.receivedAt),
        ...fieldOrder.map((name) => String(data[name] ?? "")),
        formatConsent(data.consent),
        row.notes ?? "",
        row.id,
      ];
      return cells.map((value) => csvCell(String(value))).join(",");
    }),
  ];

  return "﻿" + lines.join("\r\n");
}
