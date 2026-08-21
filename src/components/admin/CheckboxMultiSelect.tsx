"use client";

export interface CheckboxMultiSelectItem {
  id: string;
  label: string;
}

interface Props {
  items: CheckboxMultiSelectItem[];
  selected: string[];
  onChange: (next: string[]) => void;
  idPrefix: string;
}

// Liste de cases à cocher réutilisable pour les relations many-to-many de
// l'admin (sous-thèmes, auteurs, ressources, thèmes, projets, événements...).
// Le composant appelant reste responsable du champ hidden CSV soumis au formulaire.
export function CheckboxMultiSelect({ items, selected, onChange, idPrefix }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item) => (
        <div className="form-checkbox" key={item.id}>
          <input
            type="checkbox"
            id={`${idPrefix}-${item.id}`}
            checked={selected.includes(item.id)}
            onChange={(e) =>
              onChange(e.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))
            }
          />
          <label htmlFor={`${idPrefix}-${item.id}`}>{item.label}</label>
        </div>
      ))}
    </div>
  );
}
