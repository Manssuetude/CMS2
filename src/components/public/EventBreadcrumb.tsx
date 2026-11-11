import Link from "next/link";

// Fil d'Ariane de la page événement, au-dessus de l'en-tête (fond crème) dans
// les deux styles — jamais posé sur l'image de la bannière.
export function EventBreadcrumb({ title }: { title: string }) {
  return (
    <nav className="event-breadcrumb" aria-label="Fil d'Ariane">
      <Link href="/evenements">Événements</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}
