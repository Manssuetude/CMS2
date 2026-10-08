import Link from "next/link";
import { LinkItemForm } from "@/components/admin/LinkItemForm";
import { createLinkAction } from "../actions";

export default function NewLinkPage() {
  return (
    <section className="admin-panel">
      <Link href="/admin/links" className="admin-back">
        ← Retour aux liens
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau lien</h1>
          <p>Ajoutez un lien à la page /link.</p>
        </div>
      </div>
      <LinkItemForm action={createLinkAction} />
    </section>
  );
}
