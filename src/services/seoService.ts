export const seoService = {
  title(base?: string | null, suffix = "Manssuétude") {
    return base ? `${base} - ${suffix}` : suffix;
  },

  description(value?: string | null) {
    return (value || "Manssuétude, plateforme de réflexion, de production et d'expérimentation collective.").slice(
      0,
      160,
    );
  },

  missingSeo(items: Array<{ title?: string | null; seoTitle?: string | null; seoDescription?: string | null }>) {
    return items.filter((item) => !item.seoTitle || !item.seoDescription);
  },
};
