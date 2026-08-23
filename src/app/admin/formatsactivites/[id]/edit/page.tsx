import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { activityFormatRepository } from "@/repositories/activityFormatRepository";
import { ActivityFormatForm } from "@/components/admin/ActivityFormatForm";
import { updateActivityFormatAction } from "../../actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditActivityFormatPage({ params }: Props) {
  const { id } = await params;
  const item = await activityFormatRepository.getFormatById(id);
  if (!item) notFound();

  return (
    <section className="admin-panel">
      <Link href="/admin/formatsactivites" className="admin-back">
        ← Retour aux formats
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Modifier : {item.title}</h1>
          <p>Éditez cette technique d&apos;animation.</p>
        </div>
        <a
          href="/activites/formats-d-activites"
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir le rendu final
        </a>
      </div>
      <ActivityFormatForm initialData={item} action={updateActivityFormatAction} />
    </section>
  );
}
