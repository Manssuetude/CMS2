"use client";

import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { ArticlePartsPreview } from "@/components/admin/ArticlePartsPreview";
import { importDocx, type DocxImportResult } from "@/services/docxImportClientService";

interface Props {
  productionId?: string | null;
  /** Un contenu existe déjà : l'import demandera confirmation avant de le remplacer. */
  hasContent: boolean;
  onImported: (html: string) => void;
}

// Bouton « Importer le texte depuis Word (.docx) » : convertit le document et
// remplit le contenu de la production, sans rien enregistrer (l'équipe relit
// puis enregistre). Affiche les parties détectées et les avertissements.
export function DocxImportButton({ productionId, hasContent, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocxImportResult | null>(null);

  async function handleFile(file: File) {
    if (
      hasContent &&
      !window.confirm("Cette production a déjà un contenu. Le remplacer par le texte du document Word ?")
    ) {
      return;
    }
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const imported = await importDocx(file, productionId);
      setResult(imported);
      onImported(imported.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'import du document a échoué.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="docx-import">
      <button
        type="button"
        className="button"
        disabled={importing}
        style={{ width: "fit-content" }}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp size={15} strokeWidth={1.75} aria-hidden="true" />
        {importing ? "Conversion en cours..." : "Importer le texte depuis Word (.docx)"}
      </button>
      <input
        ref={inputRef}
        hidden
        tabIndex={-1}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={importing}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="docx-import-result">
          <p className="docx-import-done">
            Texte importé
            {result.imageCount > 0 &&
              ` · ${result.imageCount} image${result.imageCount > 1 ? "s ajoutées" : " ajoutée"} à la médiathèque`}
            . Relisez puis enregistrez.
          </p>
          <ArticlePartsPreview html={result.html} source="word" />
          {result.warnings.length > 0 && (
            <details className="docx-import-warnings">
              <summary>
                {result.warnings.length} avertissement{result.warnings.length > 1 ? "s" : ""} de conversion
              </summary>
              <ul>
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
