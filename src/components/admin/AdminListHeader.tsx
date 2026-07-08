import type { ReactNode } from "react";

/** En-tête de liste admin : titre, sous-ligne « N éléments · filtre », et actions à droite. */
export function AdminListHeader({
  title,
  count,
  singular,
  plural,
  activeStatusLabel,
  children,
}: {
  title: string;
  count: number;
  singular: string;
  plural: string;
  activeStatusLabel?: string | null;
  children?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        <p>
          {count} {count !== 1 ? plural : singular}
          {activeStatusLabel ? ` · filtre : ${activeStatusLabel}` : ""}
        </p>
      </div>
      {children ? <div style={{ display: "flex", gap: 10 }}>{children}</div> : null}
    </div>
  );
}
