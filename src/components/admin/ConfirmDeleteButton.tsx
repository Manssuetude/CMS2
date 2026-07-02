"use client";

import { Trash2 } from "lucide-react";

export function ConfirmDeleteButton() {
  return (
    <button
      type="submit"
      className="btn-sm btn-danger"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.confirm("Supprimer ? Cette action est irreversible.")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 size={13} strokeWidth={2} />
      Supprimer
    </button>
  );
}
