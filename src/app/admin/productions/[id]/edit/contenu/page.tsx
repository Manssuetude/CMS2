import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

// Le texte des productions ne s'édite plus dans l'admin : il vient du Word
// importé dans l'onglet « Fichiers de l'article ». Les anciens liens vers cet
// éditeur mènent à la fiche de la production.
export default async function EditProductionContentRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/productions/${id}/edit#fichiers`);
}
