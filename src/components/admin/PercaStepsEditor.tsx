"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PercaStep } from "@/types/cms";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 160,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        fontSize: 13,
      }}
    >
      Chargement de l&apos;éditeur...
    </div>
  ),
});

// Lettres et mots de la méthode PERCA — fixes, seuls le titre et le corps de
// chaque étape sont éditables.
const FIXED_STEPS: Array<[string, string]> = [
  ["P", "Penser"],
  ["E", "Exprimer"],
  ["R", "Relier"],
  ["C", "Concrétiser"],
  ["A", "Ancrer"],
];

export function PercaStepsEditor({ initial = [] }: { initial?: PercaStep[] }) {
  const [steps, setSteps] = useState<PercaStep[]>(() =>
    FIXED_STEPS.map(([letter, word]) => {
      const existing = initial.find((s) => s.letter === letter);
      return { letter, word, title: existing?.title ?? "", body: existing?.body ?? "" };
    }),
  );

  function update(letter: string, patch: Partial<PercaStep>) {
    setSteps((prev) => prev.map((s) => (s.letter === letter ? { ...s, ...patch } : s)));
  }

  return (
    <>
      <input type="hidden" name="percaSteps" value={JSON.stringify(steps)} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {steps.map((step) => (
          <div key={step.letter} className="admin-form-section" style={{ background: "var(--soft)" }}>
            <h3 className="admin-form-section-title">
              {step.letter} — {step.word}
            </h3>
            <div className="form-field">
              <label className="form-label">Titre de l&apos;étape</label>
              <input
                className="form-input"
                value={step.title ?? ""}
                onChange={(e) => update(step.letter, { title: e.target.value })}
                placeholder={step.word}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Contenu détaillé</label>
              <RichTextEditor value={step.body ?? ""} onChange={(value) => update(step.letter, { body: value })} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
