"use client";

import { AlertTriangle, Eye } from "lucide-react";

// Section « Fichiers de l'article » de la fiche production : le Word (texte
// lu sur le site, découpé en parties) et le PDF (téléchargement), tous deux
// obligatoires, et la liste des parties qu'affichera le site.

export type WordSlotState = {
  /** Le texte existe (enregistré ou importé). */
  present: boolean;
  fileName: string | null;
  importedAt: string | null;
  /** Importé pendant cette visite, pas encore enregistré. */
  pending: boolean;
};

export type PdfSlotState = {
  present: boolean;
  fileName: string | null;
  pending: boolean;
};

interface Props {
  word: WordSlotState;
  pdf: PdfSlotState;
  partTitles: string[];
  pages: string;
  onPagesChange: (value: string) => void;
  downloadLabel: string | null | undefined;
  /** Avertissement d'une production déjà publiée à qui il manque un fichier. */
  legacyWarning: string | null;
  onReplace: (kind: "word" | "pdf") => void;
  onPreview: () => void;
}

function formatImportDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const plural = (count: number, singular: string, pluralForm: string) => (count > 1 ? pluralForm : singular);

export function ProductionFilesPanel({
  word,
  pdf,
  partTitles,
  pages,
  onPagesChange,
  downloadLabel,
  legacyWarning,
  onReplace,
  onPreview,
}: Props) {
  const partCount = partTitles.length;
  const partsLabel = `${partCount} ${plural(partCount, "partie détectée", "parties détectées")}`;

  let wordStatus: string;
  if (!word.present) wordStatus = "Manquant : la publication est impossible sans le Word";
  else if (word.pending) wordStatus = `Importé, à enregistrer · ${partsLabel}`;
  else if (word.importedAt) wordStatus = `Importé le ${formatImportDate(word.importedAt)} · ${partsLabel}`;
  else wordStatus = `Texte saisi avant l'import Word · ${partsLabel}`;

  const pagesNumber = Number.parseInt(pages, 10);
  const pdfStatus = !pdf.present
    ? "Manquant : la publication est impossible sans le PDF"
    : `${pdf.pending ? "Importé, à enregistrer" : "Importé"}${pagesNumber > 0 ? ` · ${pagesNumber} ${plural(pagesNumber, "page", "pages")}` : ""}`;

  return (
    <div className="files-panel" id="fichiers">
      <div className="files-panel-main">
        <p className="files-panel-intro">
          Les deux fichiers sont obligatoires. Le Word donne le texte lu sur le site, découpé en parties. Le PDF est
          proposé en téléchargement en bas de chaque partie.
        </p>
        {legacyWarning && (
          <p className="admin-warning" role="status">
            <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
            <span>{legacyWarning}</span>
          </p>
        )}

        <div className={`files-slot${word.present ? "" : " is-missing"}`}>
          <span className="files-slot-icon files-slot-icon--docx" aria-hidden="true">
            DOCX
          </span>
          <div className="files-slot-text">
            <p className="files-slot-kicker">Texte de l&apos;article · obligatoire</p>
            <p className="files-slot-name">{word.fileName ?? (word.present ? "Texte en ligne" : "Aucun Word")}</p>
            <p className={`files-slot-status${word.present ? " is-ok" : " is-error"}`}>{wordStatus}</p>
          </div>
          <button type="button" className="button" onClick={() => onReplace("word")}>
            {word.present ? "Remplacer le Word" : "Importer le Word"}
          </button>
        </div>
        {word.present && partCount === 1 && (
          <p className="admin-warning" role="status">
            <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
            <span>
              Aucun « Titre 1 » détecté : l&apos;article s&apos;affiche en une seule partie. Vérifiez les styles de
              titres dans Word, puis remplacez-le.
            </span>
          </p>
        )}

        <div className={`files-slot${pdf.present ? "" : " is-missing"}`}>
          <span className="files-slot-icon files-slot-icon--pdf" aria-hidden="true">
            PDF
          </span>
          <div className="files-slot-text">
            <p className="files-slot-kicker">PDF à télécharger · obligatoire</p>
            <p className="files-slot-name">{pdf.fileName ?? (pdf.present ? "PDF attaché" : "Aucun PDF")}</p>
            <p className={`files-slot-status${pdf.present ? " is-ok" : " is-error"}`}>{pdfStatus}</p>
          </div>
          <button type="button" className="button" onClick={() => onReplace("pdf")}>
            {pdf.present ? "Remplacer le PDF" : "Importer le PDF"}
          </button>
        </div>

        <div className="form-row files-panel-fields">
          <div className="form-field">
            <label className="field-label" htmlFor="pages">
              Nombre de pages du PDF
            </label>
            <input
              id="pages"
              type="text"
              inputMode="numeric"
              name="pages"
              value={pages}
              onChange={(event) => onPagesChange(event.target.value)}
              placeholder="Lu dans le PDF, sinon à saisir"
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="downloadLabel">
              Libellé du bouton de téléchargement
            </label>
            <input
              id="downloadLabel"
              name="downloadLabel"
              defaultValue={downloadLabel ?? ""}
              placeholder="Ex. : Télécharger le rapport complet (PDF)"
            />
          </div>
        </div>

        <p className="files-panel-note">
          Le texte ne se modifie plus dans l&apos;admin : pour corriger l&apos;article, corrigez le Word puis
          remplacez-le. Le PDF reste la version mise en page.
        </p>
      </div>

      <aside className="files-panel-parts" aria-label="Parties sur le site">
        <p className="files-panel-parts-title">Parties sur le site</p>
        {partCount > 0 ? (
          <ol>
            {partTitles.map((title, index) => (
              <li key={`${index}-${title}`}>{title}</li>
            ))}
          </ol>
        ) : (
          <p className="files-panel-parts-empty">Les parties apparaîtront ici après l&apos;import du Word.</p>
        )}
        <button type="button" className="button files-panel-preview" onClick={onPreview} disabled={partCount === 0}>
          <Eye size={15} strokeWidth={1.75} aria-hidden="true" />
          Voir l&apos;aperçu
        </button>
      </aside>
    </div>
  );
}
