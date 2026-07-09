"use client";

import { useRef } from "react";

const STATUS_OPTIONS = [
  { value: "reçu", label: "Reçu" },
  { value: "en cours", label: "En cours" },
  { value: "traité", label: "Traité" },
  { value: "archivé", label: "Archivé" },
] as const;

interface Props {
  id: string;
  currentStatus: string;
  action: (formData: FormData) => Promise<void>;
}

export function FormStatusSelect({ id, currentStatus, action }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        style={{
          fontSize: 11,
          padding: "3px 6px",
          minHeight: "auto",
          width: "auto",
          border: "1px solid var(--line)",
          borderRadius: 6,
          color: "var(--muted)",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </form>
  );
}
