import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { CONTACT_EMAIL, SITE_SOCIALS } from "@/constants/site";

export const metadata: Metadata = {
  title: "Nous joindre · Manssuétude",
  description: "Contactez l'équipe de Manssuétude.",
};

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
