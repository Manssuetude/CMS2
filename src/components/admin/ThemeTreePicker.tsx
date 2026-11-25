"use client";

import { useState } from "react";
import type { SubTheme, Theme } from "@/types/cms";
import { archivedHiddenLabel, themeOptionLabel } from "@/utils/themePicker";

// Thèmes et sous-thèmes en arbre : les sous-thèmes d'un thème s'affichent
// sous lui quand il est coché. Avec `selectedThemeIds`, le thème est lui-même
// une relation enregistrée (événements) ; sans, cocher un thème sert seulement
// à déplier ses sous-thèmes (productions, reliées aux sous-thèmes uniquement).

interface Props {
  themes: Theme[];
  subThemes: SubTheme[];
  archivedHiddenCount?: number;
  selectedThemeIds?: string[];
  onThemesChange?: (ids: string[]) => void;
  selectedSubThemeIds: string[];
  onSubThemesChange: (ids: string[]) => void;
  title?: string;
}

const plural = (n: number) => `${n} sous-thème${n > 1 ? "s" : ""}`;

export function ThemeTreePicker({
  themes,
  subThemes,
  archivedHiddenCount = 0,
  selectedThemeIds,
  onThemesChange,
  selectedSubThemeIds,
  onSubThemesChange,
  title = "Thèmes et sous-thèmes",
}: Props) {
  const subThemesOf = (themeId: string) => subThemes.filter((st) => st.themeId === themeId);
  const [opened, setOpened] = useState<string[]>(() =>
    themes.filter((t) => subThemesOf(t.id).some((st) => selectedSubThemeIds.includes(st.id))).map((t) => t.id),
  );
  const managesThemes = !!selectedThemeIds && !!onThemesChange;
  const isChecked = (themeId: string) =>
    managesThemes ? selectedThemeIds.includes(themeId) || opened.includes(themeId) : opened.includes(themeId);
  const hiddenLabel = archivedHiddenLabel(archivedHiddenCount);

  function toggleTheme(themeId: string, checked: boolean) {
    setOpened((list) => (checked ? [...list, themeId] : list.filter((id) => id !== themeId)));
    if (managesThemes) {
      onThemesChange(checked ? [...selectedThemeIds, themeId] : selectedThemeIds.filter((id) => id !== themeId));
    }
    if (!checked) {
      const ids = new Set(subThemesOf(themeId).map((st) => st.id));
      onSubThemesChange(selectedSubThemeIds.filter((id) => !ids.has(id)));
    }
  }

  return (
    <fieldset className="theme-tree">
      <legend className="theme-tree-head">
        <span>{title}</span>
        {hiddenLabel && <span className="theme-tree-hidden">{hiddenLabel}</span>}
      </legend>
      {themes.length === 0 && <p className="theme-tree-empty">Aucun thème disponible.</p>}
      <ul>
        {themes.map((theme) => {
          const children = subThemesOf(theme.id);
          const checked = isChecked(theme.id);
          const id = `theme-tree-${theme.id}`;
          return (
            <li key={theme.id}>
              <div className="theme-tree-row">
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => toggleTheme(theme.id, e.target.checked)}
                  />
                  <label htmlFor={id}>{themeOptionLabel(theme)}</label>
                </div>
                <span className="theme-tree-count">{plural(children.length)}</span>
              </div>
              {checked && children.length > 0 && (
                <ul className="theme-tree-children">
                  {children.map((st) => {
                    const childId = `theme-tree-st-${st.id}`;
                    return (
                      <li key={st.id} className="form-checkbox">
                        <input
                          type="checkbox"
                          id={childId}
                          checked={selectedSubThemeIds.includes(st.id)}
                          onChange={(e) =>
                            onSubThemesChange(
                              e.target.checked
                                ? [...selectedSubThemeIds, st.id]
                                : selectedSubThemeIds.filter((sid) => sid !== st.id),
                            )
                          }
                        />
                        <label htmlFor={childId}>{st.title}</label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
