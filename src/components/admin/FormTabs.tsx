"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

// Fiche en onglets. Tous les panneaux restent dans le formulaire (masqués,
// pas retirés) : leurs champs sont toujours envoyés. Un point orange signale
// un onglet qui contient une erreur ou un champ obligatoire vide (détecté
// dans le formulaire, ou signalé par `issue`). Un champ invalide d'un onglet
// masqué fait ouvrir cet onglet à l'enregistrement. L'onglet ouvert suit
// l'ancre de l'adresse (#fichiers, #photos…).

export type FormTab = { id: string; label: string; issue?: boolean };

type TabsContextValue = { active: string; baseId: string };
const TabsContext = createContext<TabsContextValue | null>(null);

export function FormTabs({ tabs, children }: { tabs: FormTab[]; children: ReactNode }) {
  const baseId = useId();
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const [autoIssues, setAutoIssues] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const reporting = useRef(false);
  // Identité stable des onglets (le tableau est recréé à chaque rendu du parent).
  const tabIds = tabs.map((tab) => tab.id).join("|");

  const select = useCallback(
    (id: string) => {
      if (!tabIds.split("|").includes(id)) return;
      setActive(id);
      if (window.location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
    },
    [tabIds],
  );

  // Onglet demandé par l'adresse (au chargement et sur un lien « #onglet »).
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (tabIds.split("|").includes(id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabIds]);

  // Champs obligatoires vides / invalides, par onglet.
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const scan = () => {
      const next: Record<string, boolean> = {};
      for (const id of tabIds.split("|")) {
        const panel = document.getElementById(`${baseId}-panel-${id}`);
        next[id] = !!panel?.querySelector(":invalid:not(fieldset):not(form)");
      }
      setAutoIssues((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    };
    // Enregistrement avec un champ invalide dans un onglet masqué : on ouvre
    // cet onglet puis on relance la vérification (message du navigateur).
    const onInvalid = (event: Event) => {
      if (reporting.current) return;
      const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-tab-panel]");
      const id = panel?.dataset.tabPanel;
      if (!id || !panel.hidden) return;
      reporting.current = true;
      setActive(id);
      requestAnimationFrame(() => {
        form.reportValidity();
        reporting.current = false;
      });
    };
    scan();
    form.addEventListener("input", scan);
    form.addEventListener("change", scan);
    form.addEventListener("invalid", onInvalid, true);
    return () => {
      form.removeEventListener("input", scan);
      form.removeEventListener("change", scan);
      form.removeEventListener("invalid", onInvalid, true);
    };
  }, [tabIds, baseId]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    select(tabs[next].id);
    document.getElementById(`${baseId}-tab-${tabs[next].id}`)?.focus();
  }

  return (
    <TabsContext.Provider value={{ active, baseId }}>
      <div className="form-tabs" ref={rootRef}>
        <div className="form-tabs-list" role="tablist" aria-label="Sections de la fiche" onKeyDown={onKeyDown}>
          {tabs.map((tab) => {
            const issue = tab.issue || autoIssues[tab.id];
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(tab.id)}
              >
                {tab.label}
                {issue && (
                  <span className="form-tabs-dot">
                    <span className="sr-only"> (à compléter)</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function FormTabPanel({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("FormTabPanel doit être placé dans FormTabs.");
  const hidden = context.active !== id;
  return (
    <div
      role="tabpanel"
      id={`${context.baseId}-panel-${id}`}
      aria-labelledby={`${context.baseId}-tab-${id}`}
      data-tab-panel={id}
      hidden={hidden}
      className="form-tabs-panel"
    >
      {children}
    </div>
  );
}

/** Lien qui ouvre un onglet de la fiche (ex. « Ajouter les photos → »). */
export function TabLink({ tab, children, className }: { tab: string; children: ReactNode; className?: string }) {
  return (
    <a href={`#${tab}`} className={className}>
      {children}
    </a>
  );
}
