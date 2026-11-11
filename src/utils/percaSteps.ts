import type { PercaStep } from "@/types/cms";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// Nettoie le contenu riche des étapes PERCA côté serveur, avant de les passer
// au composant client PercaStepsInteractive (qui n'embarque donc pas le
// nettoyeur HTML dans le JavaScript du navigateur).
export function sanitizeSteps(steps: PercaStep[] | null | undefined): PercaStep[] {
  return (steps ?? []).map((step) => ({ ...step, body: step.body ? sanitizeHtml(step.body) : step.body }));
}
