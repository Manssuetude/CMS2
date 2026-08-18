"use client";

import { useState } from "react";
import { CheckboxMultiSelect, type CheckboxMultiSelectItem } from "@/components/admin/CheckboxMultiSelect";

export function FeaturedDossiersField({
  items,
  initial = [],
}: {
  items: CheckboxMultiSelectItem[];
  initial?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initial);

  return (
    <div className="form-field">
      <input type="hidden" name="featuredDossierIds" value={selected.join(",")} />
      {items.length === 0 ? (
        <p className="admin-form-section-hint" style={{ marginTop: 0 }}>
          Aucun dossier publié pour l&apos;instant.{" "}
          <a href="/admin/dossiers/new" style={{ color: "var(--orange)" }}>
            Créer un dossier →
          </a>
        </p>
      ) : (
        <CheckboxMultiSelect items={items} selected={selected} onChange={setSelected} idPrefix="featured-dossier" />
      )}
    </div>
  );
}
