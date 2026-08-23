"use client";

import type { DossierItemEntityType } from "@/types/cms";

export interface DossierPickableItem {
  entityType: DossierItemEntityType;
  entityId: string;
  label: string;
}

export interface DossierPickerGroup {
  entityType: DossierItemEntityType;
  label: string;
  items: { id: string; label: string }[];
}

interface Props {
  groups: DossierPickerGroup[];
  value: DossierPickableItem[];
  onChange: (next: DossierPickableItem[]) => void;
}

// Sélection de contenus hétérogènes (par type, avec cases à cocher) + liste
// ordonnée réglable à la main (monter/descendre) — utilisé pour composer un
// dossier, dont l'ordre compte particulièrement en mode "guidé".
export function DossierItemPicker({ groups, value, onChange }: Props) {
  function isSelected(entityType: DossierItemEntityType, entityId: string) {
    return value.some((v) => v.entityType === entityType && v.entityId === entityId);
  }

  function toggle(entityType: DossierItemEntityType, item: { id: string; label: string }) {
    if (isSelected(entityType, item.id)) {
      onChange(value.filter((v) => !(v.entityType === entityType && v.entityId === item.id)));
    } else {
      onChange([...value, { entityType, entityId: item.id, label: item.label }]);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="dossier-picker">
      <div className="dossier-picker-groups">
        {groups.map((group) => (
          <div key={group.entityType} className="dossier-picker-group">
            <p className="field-label">{group.label}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Aucun élément disponible.</p>
              )}
              {group.items.map((item) => (
                <div className="form-checkbox" key={item.id}>
                  <input
                    type="checkbox"
                    id={`dossier-picker-${group.entityType}-${item.id}`}
                    checked={isSelected(group.entityType, item.id)}
                    onChange={() => toggle(group.entityType, item)}
                  />
                  <label htmlFor={`dossier-picker-${group.entityType}-${item.id}`}>{item.label}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {value.length > 0 && (
        <div className="dossier-picker-order">
          <p className="field-label">
            Ordre ({value.length} élément{value.length > 1 ? "s" : ""})
          </p>
          <ol className="dossier-picker-order-list">
            {value.map((item, index) => (
              <li key={`${item.entityType}-${item.entityId}`}>
                <span>{item.label}</span>
                <div className="dossier-picker-order-actions">
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label="Descendre"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-danger"
                    onClick={() => remove(index)}
                    aria-label="Retirer"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
