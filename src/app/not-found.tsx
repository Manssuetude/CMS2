import { MaintenanceNotice } from "@/components/public/MaintenanceNotice";

export default function NotFound() {
  return (
    <div className="site-shell">
      <main className="page-main">
        <MaintenanceNotice
          eyebrow="Page introuvable"
          title="Cette page n'est pas disponible."
          body="La page que vous cherchez n'existe pas ou est encore en préparation. Revenez à l'accueil pour continuer à explorer Manssuétude."
        />
      </main>
    </div>
  );
}
