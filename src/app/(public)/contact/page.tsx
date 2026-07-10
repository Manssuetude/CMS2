import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";

export const metadata: Metadata = {
  title: "Nous joindre — Manssuétude",
  description: "Contactez l'équipe de Manssuétude.",
};

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
          {/* Coordonnées réelles à renseigner en Phase E (documents-asso) */}
          <dl className="contact-coords">
            <div>
              <dt>Email</dt>
              <dd>à renseigner</dd>
            </div>
            <div>
              <dt>Réseaux</dt>
              <dd>à renseigner</dd>
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
