import { CtaButton } from "@/components/forms/CtaButton";
import type { CtaTarget } from "@/types/cms";

// Bloc en bas de page : « Vous voulez proposer … ? » + bouton qui ouvre le formulaire.
export function ProposeSection({
  lead,
  label,
  target,
  contextFields,
}: {
  lead: string;
  label: string;
  target: CtaTarget;
  contextFields?: Record<string, string>;
}) {
  return (
    <section className="propose-section">
      <p className="propose-lead">{lead}</p>
      <CtaButton label={label} target={target} variant="primary" contextFields={contextFields} />
    </section>
  );
}
