"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ImpactStat } from "@/types/cms";

export function ImpactStatsEditor({ initial = [] }: { initial?: ImpactStat[] }) {
  const [stats, setStats] = useState<ImpactStat[]>(initial);

  function update(index: number, patch: Partial<ImpactStat>) {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function add() {
    setStats((prev) => [...prev, { label: "", value: "" }]);
  }

  function remove(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input type="hidden" name="impactStats" value={JSON.stringify(stats.filter((s) => s.label || s.value))} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stats.map((stat, index) => (
          <div key={index} className="form-row" style={{ alignItems: "flex-end" }}>
            <div className="form-field">
              <label className="form-label">Valeur</label>
              <input
                className="form-input"
                value={stat.value}
                onChange={(e) => update(index, { value: e.target.value })}
                placeholder="150"
              />
            </div>
            <div className="form-field" style={{ flex: 2 }}>
              <label className="form-label">Libellé</label>
              <input
                className="form-input"
                value={stat.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Membres"
              />
            </div>
            <button
              type="button"
              className="btn-sm btn-danger"
              onClick={() => remove(index)}
              aria-label="Retirer ce compteur"
              style={{ marginBottom: 2 }}
            >
              <Trash2 size={13} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-sm" onClick={add} style={{ marginTop: 10 }}>
        <Plus size={13} strokeWidth={2} />
        Ajouter un compteur
      </button>
    </div>
  );
}
