import type { Metadata } from "next";
import { CONTACT_EMAIL, RNA_NUMBER } from "@/constants/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité · Manssuétude",
  description: "Comment Manssuétude collecte, utilise et protège vos données personnelles.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="history-page">
      <header className="history-header">
        <p className="eyebrow">Vos données</p>
        <h1>Politique de confidentialité</h1>
      </header>

      <div className="history-body rich-text">
        <p>
          Dernière mise à jour : 20 août 2026. Cette politique explique quelles données Manssuétude collecte lorsque
          vous utilisez ce site, pourquoi, combien de temps elles sont conservées, et comment exercer vos droits.
        </p>

        <h2>Responsable de traitement</h2>
        <p>
          Manssuétude, association loi 1901 à but non lucratif (RNA {RNA_NUMBER}), est responsable du traitement des
          données décrites ici. Vous pouvez nous contacter à tout moment à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> pour toute question relative à vos données ou pour
          exercer vos droits.
        </p>

        <h2>Quelles données nous collectons, et pourquoi</h2>
        <ul>
          <li>
            <strong>Formulaires publics</strong> (adhésion, proposition de projet, de contenu, de thème,
            d&apos;événement, demande de partenariat, demande de don, contact) : les informations que vous saisissez
            volontairement (nom, email, et selon le formulaire, téléphone, ville, motivation, description de votre
            proposition...), utilisées uniquement pour étudier votre demande et vous répondre.
          </li>
          <li>
            <strong>Newsletter</strong> : votre adresse email, utilisée uniquement pour vous envoyer nos actualités.
            Elle est transmise à notre prestataire d&apos;envoi d&apos;emails (Brevo) et n&apos;est pas conservée dans
            notre propre base de données.
          </li>
          <li>
            <strong>Mesure d&apos;audience</strong> (cookies) : si vous l&apos;acceptez via le bandeau affiché lors de
            votre première visite, des statistiques de fréquentation anonymisées (pages consultées, performance du site)
            via Vercel Analytics et Vercel Speed Insights. Rien n&apos;est activé avant votre accord, et vous pouvez
            retirer votre consentement à tout moment en effaçant les données de navigation de votre navigateur pour ce
            site. Détail de chaque cookie et service tiers : <a href="/politique-cookies">politique cookies</a>.
          </li>
          <li>
            <strong>Comptes de l&apos;équipe éditoriale</strong> (accès à l&apos;espace d&apos;administration) :
            réservés aux membres de l&apos;équipe, gérés séparément de vos données de visiteur.
          </li>
        </ul>

        <h2>Base légale de ces traitements</h2>
        <p>
          Les formulaires et la newsletter reposent sur votre <strong>consentement explicite</strong> (case à cocher,
          jamais pré-cochée), que vous pouvez retirer à tout moment en nous écrivant. La mesure d&apos;audience repose
          également sur votre consentement, recueilli via le bandeau cookies. La gestion des comptes de l&apos;équipe
          repose sur l&apos;intérêt légitime de l&apos;association à administrer son propre site.
        </p>

        <h2>À qui vos données sont-elles transmises ?</h2>
        <p>
          Vos données ne sont jamais vendues. Elles peuvent être transmises aux prestataires suivants, uniquement pour
          assurer le fonctionnement du site :
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> : hébergement de notre base de données et de l&apos;authentification.
          </li>
          <li>
            <strong>Vercel</strong> : hébergement du site, et mesure d&apos;audience si vous l&apos;acceptez.
          </li>
          <li>
            <strong>Resend</strong> : envoi des emails automatiques (accusés de réception, invitations).
          </li>
          <li>
            <strong>Brevo</strong> : envoi de la newsletter, si vous vous y inscrivez.
          </li>
        </ul>
        <p>
          Certains de ces prestataires sont susceptibles de traiter des données en dehors de l&apos;Union européenne.
          Dans ce cas, nous nous appuyons sur les garanties prévues par ces prestataires (clauses contractuelles types
          ou mécanisme équivalent reconnu par la réglementation européenne).
        </p>

        <h2>Combien de temps conservons-nous vos données ?</h2>
        <p>
          Vos données sont conservées le temps nécessaire au traitement de votre demande, puis supprimées ou archivées
          de façon sécurisée. Si vous souhaitez connaître la durée exacte applicable à votre situation, ou demander une
          suppression anticipée, contactez-nous à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
        <ul>
          <li>Droit d&apos;accès : savoir quelles données nous avons sur vous.</li>
          <li>Droit de rectification : corriger des données inexactes.</li>
          <li>Droit à l&apos;effacement : demander la suppression de vos données.</li>
          <li>Droit à la limitation du traitement.</li>
          <li>Droit d&apos;opposition.</li>
          <li>Droit à la portabilité des données que vous nous avez fournies.</li>
          <li>Droit de retirer votre consentement à tout moment, sans affecter la licéité des traitements passés.</li>
        </ul>
        <p>
          Pour exercer l&apos;un de ces droits, écrivez-nous à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Nous vous répondrons dans les meilleurs délais.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la
          Commission nationale de l&apos;informatique et des libertés (CNIL), <em>cnil.fr</em>.
        </p>

        <h2>Décisions automatisées</h2>
        <p>Aucune décision vous concernant n&apos;est prise sur la seule base d&apos;un traitement automatisé.</p>

        <h2>Modifications de cette politique</h2>
        <p>
          Cette politique peut évoluer, notamment pour refléter un changement dans nos outils ou dans la réglementation.
          La date de dernière mise à jour est indiquée en haut de cette page.
        </p>
      </div>
    </div>
  );
}
