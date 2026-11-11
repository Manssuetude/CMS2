import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/public/ContactForm";
import { CONTACT_EMAIL, SITE_SOCIALS } from "@/constants/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Nous joindre",
  description:
    "Contactez l'équipe Manssuétude : une question, une proposition de partenariat, d'intervention ou de contenu ? Écrivez-nous, nous vous répondons vite.",
  path: "/contact",
});

const SOCIAL_LABELS = ["Instagram", "TikTok", "LinkedIn"];

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-grid">
        <aside className="contact-intro">
          <p className="eyebrow">Nous joindre</p>
          <h1>Une question, une idée, une envie de contribuer ?</h1>
          <p>
            Écrivez-nous : nous lisons chaque message et revenons vers vous. Pour rejoindre l&apos;association ou
            proposer un projet, un mot suffit pour lancer la conversation.
          </p>
          <dl className="contact-coords">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </dd>
            </div>
            <div>
              <dt>Réseaux</dt>
              <dd>
                {SITE_SOCIALS.map((href, i) => (
                  <span key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {SOCIAL_LABELS[i]}
                    </a>
                    {i < SITE_SOCIALS.length - 1 ? " · " : ""}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>
        <div className="contact-form-wrap">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
