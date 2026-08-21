import type { CtaTarget } from "@/types/cms";

export const ctaLinks: Record<string, CtaTarget> = {
  join: "/nous-rejoindre",
  support: "/nous-soutenir",
  featuredTheme: "/themes/transformation-cemac",
  productions: "/productions",
  projects: "/projets",
  events: "/evenements",
  activities: "/activites",
  resources: "/ressources",
  perca: "/perca",
  about: "/a-propos",
  donate: "FORM:don",
  partner: "FORM:partner",
  contribution: "FORM:content",
  projectProposal: "FORM:project",
  memberApplication: "FORM:join",
};

export function resolveCta(target?: string | null) {
  if (!target) return "/";
  return ctaLinks[target] || target;
}

export function isFormCta(target: CtaTarget): target is `FORM:${string}` {
  return typeof target === "string" && target.startsWith("FORM:");
}
