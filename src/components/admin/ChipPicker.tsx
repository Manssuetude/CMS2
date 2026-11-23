"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

// Sélection en pastilles (ex. formats d'activité) : chaque élément choisi est
// une pastille retirable, « + Ajouter » ouvre la liste des autres.

interface Props {
  items: Array<{ id: string; label: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
  addLabel?: string;
}

export function ChipPicker({ items, selected, onChange, addLabel = "Ajouter" }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const byId = new Map(items.map((item) => [item.id, item]));
  const available = items.filter((item) => !selected.includes(item.id));

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="chip-picker" ref={rootRef}>
      {selected.map((id) => {
        const item = byId.get(id);
        if (!item) return null;
        return (
          <span key={id} className="chip-picker-chip">
            {item.label}
            <button
              type="button"
              aria-label={`Retirer ${item.label}`}
              onClick={() => onChange(selected.filter((s) => s !== id))}
            >
              <X size={12} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </span>
        );
      })}
      {available.length > 0 && (
        <div className="chip-picker-add">
          <button
            type="button"
            className="chip-picker-add-button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
          >
            <Plus size={12} strokeWidth={2.5} aria-hidden="true" /> {addLabel}
          </button>
          {open && (
            <ul id={listId} className="chip-picker-menu">
              {available.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...selected, item.id]);
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
