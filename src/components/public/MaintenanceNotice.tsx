import Link from "next/link";

export function MaintenanceNotice({
  eyebrow = "Bientôt disponible",
  title = "Cette page est en maintenance.",
  body = "Nous préparons ce contenu avec soin. Revenez d'ici peu — en attendant, vous pouvez continuer à explorer Manssuétude.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="maintenance">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="maintenance-body">{body}</p>
      <div className="maintenance-actions">
        <Link className="button primary" href="/">
          Retour à l&apos;accueil
        </Link>
        <Link className="button secondary" href="/a-propos">
          À propos de nous
        </Link>
      </div>
    </section>
  );
}
