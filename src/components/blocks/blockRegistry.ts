import type { ContentBlock } from "@/types/cms";

export type BlockDefinition = {
  type: ContentBlock["type"];
  label: string;
  description: string;
  variants: string[];
  allowedSettings: string[];
};

export const blockRegistry: BlockDefinition[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Grande introduction éditoriale avec image, texte et CTA.",
    variants: ["minimal", "editorial", "immersive", "dark", "split"],
    allowedSettings: ["titre", "texte", "média", "cta", "variante", "visibilité"],
  },
  {
    type: "editorial",
    label: "Bloc éditorial",
    description: "Texte cadré pour mission, méthode, manifeste ou analyse courte.",
    variants: ["light", "cream", "dark", "split"],
    allowedSettings: ["titre", "corps", "variante", "visibilité"],
  },
  {
    type: "feed",
    label: "Flux dynamique",
    description: "Liste automatique de productions, projets, ressources ou activités.",
    variants: ["compact", "featured", "editorial", "media", "masonry"],
    allowedSettings: ["source", "limite", "variante", "relations", "visibilité"],
  },
  {
    type: "gallery",
    label: "Galerie",
    description: "Sélection visuelle de médias avec ratios verrouillés.",
    variants: ["grid", "masonry", "editorial"],
    allowedSettings: ["médias", "variante", "alt text", "visibilité"],
  },
  {
    type: "quote",
    label: "Citation",
    description: "Citation forte pour rythmer une page ou un dossier.",
    variants: ["standard", "premium-black"],
    allowedSettings: ["texte", "source", "visibilité"],
  },
  {
    type: "cta",
    label: "CTA",
    description: "Bouton ou bande d’action relié au système centralisé.",
    variants: ["primary", "secondary", "ghost", "premium-black"],
    allowedSettings: ["texte", "destination", "variante", "visibilité"],
  },
  {
    type: "references",
    label: "Références",
    description: "Bibliographie, sources, notes et liens utiles.",
    variants: ["compact", "editorial"],
    allowedSettings: ["sources", "visibilité"],
  },
];

export function defaultHomepageBlocks(): ContentBlock[] {
  return [
    {
      id: "hero-home",
      type: "hero",
      variant: "editorial",
      title: "Penser, produire et relier les idées utiles.",
      text: "Manssuétude est une communauté intellectuelle et créative qui transforme la réflexion collective en productions, formats et projets concrets.",
      cta: "FORM:join",
      visible: true,
    },
    {
      id: "featured-theme",
      type: "feed",
      source: "productions",
      variant: "featured",
      limit: 3,
      visible: true,
    },
    {
      id: "perca-block",
      type: "editorial",
      variant: "cream",
      title: "PERCA",
      body: "Penser, Exprimer, Relier, Concrétiser, Ancrer : la méthode qui structure nos séances, nos productions et nos projets.",
      visible: true,
    },
    {
      id: "cta-final",
      type: "cta",
      variant: "premium-black",
      label: "Rejoindre Manssuétude",
      target: "FORM:join",
      visible: true,
    },
  ];
}
