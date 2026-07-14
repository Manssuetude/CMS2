import { CtaButton } from "@/components/forms/CtaButton";
import type { CtaTarget } from "@/types/cms";

// Bloc en bas de page : « Vous voulez proposer … ? » + bouton qui ouvre le formulaire.
export function ProposeSection({ lead, label, target }: { lead: string; label: string; target: CtaTarget }) {
  return (
    <section className="propose-section">
      <p className="propose-lead">{lead}</p>
      <CtaButton label={label} target={target} variant="primary" />
    </section>
  );
}
