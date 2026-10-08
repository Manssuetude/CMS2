import type { Metadata } from "next";
import { SITE_NAME, SITE_LOGO, SITE_URL, SITE_DESCRIPTION } from "@/constants/site";
import { linkRepository } from "@/repositories/linkRepository";
import { siteSettingsRepository } from "@/repositories/siteSettingsRepository";
import { LinkButton } from "@/components/public/LinkButton";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let description = SITE_DESCRIPTION;
  try {
    description = (await siteSettingsRepository.getLinkPageDescription()) || SITE_DESCRIPTION;
  } catch {
    // Base injoignable au build : repli sur la description générale du site.
  }
  return {
    title: `Liens · ${SITE_NAME}`,
    description,
    alternates: { canonical: "/link" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `Liens · ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/link`,
      locale: "fr_FR",
      images: [{ url: SITE_LOGO, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title: `Liens · ${SITE_NAME}`,
      description,
      images: [SITE_LOGO],
    },
  };
}

export default async function LinkPage() {
  let items: Awaited<ReturnType<typeof linkRepository.listLinks>> = [];
  let description = SITE_DESCRIPTION;
  try {
    [items, description] = await Promise.all([
      linkRepository.listLinks(),
      siteSettingsRepository.getLinkPageDescription(),
    ]);
  } catch {
    // Base injoignable : page quand même rendue, juste sans liens pour l'instant.
  }

  return (
    <div className="site-shell link-page">
      <main className="link-page-main">
        <img src={SITE_LOGO} alt={SITE_NAME} className="link-page-logo" />
        <h1 className="link-page-title">{SITE_NAME}</h1>
        {description && <p className="link-page-description">{description}</p>}
        <div className="link-page-list">
          {items.map((item) => (
            <LinkButton key={item.id} label={item.label} url={item.url} icon={item.icon} />
          ))}
        </div>
      </main>
    </div>
  );
}
