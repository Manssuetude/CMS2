import type { Metadata } from "next";
import { CONTACT_EMAIL, HEADQUARTERS_ADDRESS, RNA_NUMBER } from "@/constants/site";

export const metadata: Metadata = {
  title: "Mentions légales · Manssuétude",
  description: "Informations légales relatives à l'éditeur et à l'hébergement de ce site.",
};

export default function LegalNoticePage() {
  return (
    <div className="history-page">
      <header className="history-header">
        <p className="eyebrow">Informations légales</p>
        <h1>Mentions légales</h1>
      </header>

      <div className="history-body rich-text">
        <h2>Éditeur du site</h2>
        <ul>
          <li>
            <strong>Dénomination :</strong> Manssuétude
          </li>
          <li>
            <strong>Forme juridique :</strong> Association loi 1901 à but non lucratif
          </li>
          <li>
            <strong>Numéro RNA :</strong> {RNA_NUMBER}
          </li>
          <li>
            <strong>Siège social :</strong> {HEADQUARTERS_ADDRESS}
          </li>
          <li>
            <strong>Contact :</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </li>
        </ul>

        <h2>Hébergement</h2>
        <ul>
          <li>
            <strong>Hébergement du site :</strong> Vercel Inc.
          </li>
          <li>
            <strong>Hébergement de la base de données :</strong> Supabase Inc.
          </li>
        </ul>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, images, mise en forme) est la propriété de
          Manssuétude ou de ses contributeurs, sauf mention contraire. Toute reproduction ou représentation, totale ou
          partielle, sans autorisation préalable, est interdite.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Le traitement de vos données personnelles est décrit dans notre{" "}
          <a href="/politique-de-confidentialite">politique de confidentialité</a>.
        </p>

        <h2>Cookies</h2>
        <p>
          Ce site utilise des cookies de mesure d&apos;audience uniquement après votre consentement, recueilli via le
          bandeau affiché lors de votre première visite.
        </p>

        <h2>Responsabilité</h2>
        <p>
          Manssuétude s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées sur ce site, sans
          garantie d&apos;exhaustivité. L&apos;association ne saurait être tenue responsable des erreurs, omissions, ou
          de l&apos;indisponibilité temporaire du site.
        </p>

        <h2>Droit applicable</h2>
        <p>Ce site et les présentes mentions légales sont soumis au droit français.</p>
      </div>
    </div>
  );
}
