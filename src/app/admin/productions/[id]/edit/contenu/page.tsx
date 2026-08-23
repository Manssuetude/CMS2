import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { productionRepository } from "@/repositories/productionRepository";
import { ProductionContentEditor } from "@/components/admin/ProductionContentEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductionContentPage({ params }: Props) {
  const { id } = await params;
  const item = await productionRepository.getProductionById(id);
  if (!item) notFound();

  return (
    <section className="admin-panel">
      <div className="admin-page-header">
        <div>
          <h1>Contenu : {item.title}</h1>
          <p>Cet onglet se ferme automatiquement après l&apos;enregistrement.</p>
        </div>
        <a
          href={`/productions/${item.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn-sm"
          title="Voir la page publique dans un nouvel onglet"
        >
          <ExternalLink size={13} strokeWidth={2} />
          Voir sur le site
        </a>
      </div>

      <ProductionContentEditor productionId={item.id} initialBody={item.body ?? ""} />
    </section>
  );
}
