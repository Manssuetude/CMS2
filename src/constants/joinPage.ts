import type { JoinPageContent } from "@/types/cms";

// Textes par défaut de /nous-rejoindre (pages.content vide ou clé absente).
// Modifiables depuis /admin/pages/nous-rejoindre ; les textes permanents de la
// page (étiquette, titre, bouton, SEO) restent dans les colonnes de `pages`.
export const DEFAULT_JOIN_CONTENT: JoinPageContent = {
  heroSubtitle:
    "Que vous soyez étudiant, jeune professionnel, créatif, chercheur, entrepreneur ou simplement curieux, il existe plusieurs manières de contribuer à Manssuétude.",
  heroAlt: "Table ronde Manssuétude : six intervenantes et intervenants échangent face au public",
  start: {
    eyebrow: "Notre point de départ",
    title: "Prendre le temps de penser ensemble.",
    text: "Notre époque ne manque pas d'informations. Elle manque d'espaces pour les comprendre, les confronter et les mettre en perspective.",
    photo: {
      imageId: null,
      crop: null,
      alt: "Séance Manssuétude : une intervenante lit un texte, debout devant les membres réunis en cercle",
    },
  },
  experience: {
    eyebrow: "Une expérience collective",
    title: "Ici, les idées se confrontent.",
    text: "Des séances préparées, des formats participatifs, des publications et des rencontres conviviales.",
    items: [
      {
        label: "Débattre",
        photo: {
          imageId: null,
          crop: null,
          alt: "Deux membres de Manssuétude échangent en riant, assis sur un canapé",
        },
      },
      {
        label: "Écouter",
        photo: { imageId: null, crop: null, alt: "Un membre colle une idée sur un post-it au mur pendant un atelier" },
      },
      {
        label: "Construire",
        photo: {
          imageId: null,
          crop: null,
          alt: "Une membre présente un gâteau d'anniversaire décoré de bougies dorées",
        },
      },
    ],
  },
  ambition: {
    eyebrow: "Le cap que nous nous donnons",
    title: "Faire grandir nos idées.",
    text: "Notre ambition : faire de Manssuétude un think tank citoyen de référence auprès des jeunes Africains et des diasporas.",
    items: [
      { title: "Approfondir nos analyses", text: "et développer nos publications" },
      { title: "Multiplier les débats publics", text: "et les rencontres avec des experts" },
      { title: "Faire émerger des initiatives", text: "conçues et portées par nos membres" },
    ],
  },
  audience: {
    eyebrow: "Qui peut nous rejoindre",
    title: "Pour qui ? Qu'attendons-nous ?",
    whoTitle: "Pour qui ?",
    whoText:
      "Jeunes adultes Afro-descendants d'Île-de-France (étudiant(e)s, actifs, entrepreneur(se)s, créatifs...). Ouverts à toute personne partageant notre démarche.",
    expectTitle: "Qu'attendons-nous ?",
    expectText:
      "Pas besoin d'être expert(e) : curiosité, ouverture, rigueur, écoute, initiative et fiabilité suffisent.",
    qualities: ["Curiosité", "Ouverture", "Rigueur", "Écoute", "Initiative", "Fiabilité"],
  },
  steps: {
    eyebrow: "Comment rejoindre ?",
    title: "Quatre étapes pour nous rejoindre.",
    items: [
      {
        title: "Découvrir",
        text: "Explorez nos activités, productions et projets pour vérifier que notre démarche vous parle.",
      },
      {
        title: "Candidater",
        text: "Remplissez le formulaire pour nous parler de votre parcours, vos intérêts et comment vous souhaiteriez contribuer.",
      },
      {
        title: "Échanger",
        text: "Nous vous proposons un échange pour faire connaissance, présenter le fonctionnement collectif et répondre à vos questions.",
      },
      {
        title: "Participer",
        text: "Vous êtes invité(e) à une première rencontre. Rejoignez progressivement selon vos envies et disponibilités.",
      },
    ],
    note: "Manssuétude repose sur le bénévolat. Nous attendons une réciprocité : participer à la vie du collectif à votre mesure et être fiable dans vos engagements.",
  },
  final: {
    eyebrow: "Rejoindre",
    title: "Il y a encore tant de questions à poser.",
    text: "Rejoignez une communauté qui prend le temps de penser, de débattre et de construire ensemble.",
    photo: {
      imageId: null,
      crop: null,
      alt: "Une membre sourit, debout au milieu d'autres membres assis lors d'une rencontre Manssuétude",
    },
  },
};

// Nombre d'éléments fixes par section (la mise en page ne change jamais).
export const JOIN_EXPERIENCE_COUNT = 3;
export const JOIN_AMBITION_COUNT = 3;
export const JOIN_STEPS_COUNT = 4;

// Valeurs permanentes du hero si les colonnes de `pages` sont vides.
export const JOIN_FALLBACK = {
  eyebrow: "Rejoindre Manssuétude",
  title: "Construisons ensemble une voix citoyenne.",
  ctaLabel: "Devenir membre",
  ctaTarget: "memberApplication",
} as const;
