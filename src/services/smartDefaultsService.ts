import type { ContentBlock, CtaTarget, EntityType } from "@/types/cms";
import { slugify } from "@/utils/slug";

export const smartDefaultsService = {
  slug(title: string) {
    return slugify(title);
  },

  ctaFor(type: EntityType): { label: string; target: CtaTarget } {
    const map: Partial<Record<EntityType, { label: string; target: CtaTarget }>> = {
      theme: { label: "Explorer le thème", target: "/themes" },
      production: { label: "Lire la production", target: "/productions" },
      activity: { label: "Participer", target: "FORM:join" },
      project: { label: "Contribuer au projet", target: "FORM:project" },
      resource: { label: "Télécharger", target: "/ressources" },
    };
    return map[type] || { label: "Découvrir", target: "/" };
  },

  starterBlocks(type: EntityType, title: string): ContentBlock[] {
    const cta = this.ctaFor(type);
    return [
      {
        id: `${type}-hero`,
        type: "hero",
        variant: "editorial",
        title,
        text: "Ajoutez ici une introduction claire, courte et vivante.",
        cta: cta.target,
        visible: true,
      },
      {
        id: `${type}-editorial`,
        type: "editorial",
        variant: "light",
        title: "À retenir",
        body: "Structurez cette section avec les idées essentielles, les liens utiles et les prochaines étapes.",
        visible: true,
      },
    ];
  },
};
