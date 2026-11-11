import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/constants/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique cookies",
  description:
    "Politique cookies de Manssuétude : liste des cookies et services tiers utilisés sur le site, leur finalité, leur durée et comment gérer votre consentement.",
  path: "/politique-cookies",
});

export default function CookiesPolicyPage() {
  return (
    <div className="history-page">
      <header className="history-header">
        <p className="eyebrow">Vos données</p>
        <h1>Politique cookies</h1>
      </header>

      <div className="history-body rich-text">
        <p>
          Dernière mise à jour : 11 novembre 2026. Cette page détaille les cookies et services tiers utilisés par ce
          site, leur finalité, et si votre consentement est requis avant leur activation.
        </p>

        <h2>Qu&apos;est-ce qu&apos;un cookie ?</h2>
        <p>
          Un cookie est un petit fichier déposé sur votre appareil lors de votre visite. Certains sont nécessaires au
          fonctionnement du site, d&apos;autres (mesure d&apos;audience) ne sont activés qu&apos;avec votre accord,
          recueilli via le bandeau affiché lors de votre première visite et modifiable à tout moment via le lien « Gérer
          les cookies » en bas de chaque page.
        </p>

        <h2>Cookies et services tiers utilisés</h2>
        <table>
          <thead>
            <tr>
              <th>Élément</th>
              <th>Finalité</th>
              <th>Consentement requis ?</th>
              <th>Données transmises</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel Analytics</td>
              <td>Mesure d&apos;audience anonymisée</td>
              <td>Oui</td>
              <td>Visite, pages vues</td>
            </tr>
            <tr>
              <td>Vercel Speed Insights</td>
              <td>Mesure de la performance du site (temps de chargement)</td>
              <td>Oui</td>
              <td>Performance du navigateur</td>
            </tr>
            <tr>
              <td>Google Analytics</td>
              <td>Mesure d&apos;audience (pages vues, provenance des visites)</td>
              <td>Oui, aucune requête n&apos;est envoyée à Google avant votre accord (voir ci-dessous)</td>
              <td>Visite, pages vues, provenance, type d&apos;appareil</td>
            </tr>
            <tr>
              <td>Google Fonts</td>
              <td>Typographie du site</td>
              <td>Non, polices auto-hébergées, aucun appel à Google au chargement</td>
              <td>Aucune</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Envoi des emails transactionnels (accusés de réception, invitations)</td>
              <td>Non, nécessaire au service demandé</td>
              <td>Email du visiteur, serveur-à-serveur</td>
            </tr>
            <tr>
              <td>Brevo</td>
              <td>Envoi de la newsletter</td>
              <td>Oui, case dédiée lors de l&apos;inscription</td>
              <td>Email, serveur-à-serveur</td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>Hébergement des données et de l&apos;authentification</td>
              <td>Non, infrastructure du site</td>
              <td>Toutes les données de l&apos;application</td>
            </tr>
            <tr>
              <td>Google (images), Cloudinary</td>
              <td>Affichage de certaines images du site</td>
              <td>Non, requête passive au chargement de la page</td>
              <td>Adresse IP et navigateur, transmis à Google/Cloudinary lors du chargement de l&apos;image</td>
            </tr>
            <tr>
              <td>Google Drive</td>
              <td>Import de médias par l&apos;équipe éditoriale (usage interne, espace d&apos;administration)</td>
              <td>Non, usage réservé à l&apos;équipe, pas aux visiteurs</td>
              <td>Fichiers importés par l&apos;équipe</td>
            </tr>
          </tbody>
        </table>

        <p>Aucun pixel publicitaire ni outil de reciblage n&apos;est utilisé sur ce site.</p>

        <p>
          Les outils de mesure d&apos;audience ne sont chargés qu&apos;après un clic sur « Accepter ». Tant que vous
          n&apos;avez pas répondu au bandeau, ou si vous refusez, le script de Google Analytics n&apos;est pas chargé :
          aucune requête n&apos;est envoyée à Google et aucun cookie n&apos;est déposé.
        </p>

        <h2>Durées de conservation</h2>
        <ul>
          <li>
            <strong>Cookies Google Analytics</strong> (<code>_ga</code>, <code>_ga_*</code>) : 13 mois maximum à compter
            de leur dépôt.
          </li>
          <li>
            <strong>Vercel Analytics et Vercel Speed Insights</strong> : aucun cookie déposé ; les statistiques sont
            agrégées et anonymisées.
          </li>
          <li>
            <strong>Votre choix de consentement</strong> (accepté ou refusé, et sa date) : conservé 6 mois dans votre
            navigateur (stockage local, pas un cookie). Passé ce délai, le bandeau vous est de nouveau proposé.
          </li>
        </ul>

        <h2>Gérer votre consentement</h2>
        <p>
          Vous pouvez accepter ou refuser les cookies de mesure d&apos;audience (Vercel Analytics, Vercel Speed Insights
          et Google Analytics) via le bandeau affiché lors de votre première visite. Vous pouvez changer d&apos;avis à
          tout moment, dans un sens comme dans l&apos;autre, grâce au lien <strong>« Gérer les cookies »</strong> en bas
          de chaque page. Si vous retirez votre accord, la mesure d&apos;audience est immédiatement arrêtée et les
          cookies Google Analytics déjà déposés sont supprimés.
        </p>

        <h2>Questions</h2>
        <p>
          Pour toute question sur cette politique, contactez-nous à{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Pour le détail complet du traitement de vos données
          personnelles, voir notre <a href="/politique-de-confidentialite">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
