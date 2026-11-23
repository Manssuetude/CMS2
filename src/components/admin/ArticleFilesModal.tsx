"use client";

import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { importDocx } from "@/services/docxImportClientService";
import { isPdfFile, uploadProductionPdf } from "@/services/pdfClientService";
import { splitIntoParts } from "@/utils/articleParts";

// Fenêtre « Ajouter les fichiers de l'article » (fiche production) :
// 1. choisir le Word et/ou le PDF, 2. conversion (texte, images vers la
// médiathèque, notes, PDF), 3. vérifier. Rien n'est enregistré sur la
// production : « Valider les fichiers » remplit la fiche, qu'il reste à
// enregistrer. Les images et le PDF rejoignent la médiathèque dès la conversion.

export type ArticleFilesMode = "both" | "word" | "pdf";

export type ArticleWordFile = {
  html: string;
  fileName: string;
  warnings: string[];
  imageCount: number;
  noteCount: number;
};
export type ArticlePdfFile = { id: string; name: string; pages: number | null };
export type ArticleFilesResult = { word: ArticleWordFile | null; pdf: ArticlePdfFile | null };

type Step = "choose" | "convert" | "verify";
type TaskStatus = "pending" | "active" | "done" | "error";
type Task = { key: string; label: string; status: TaskStatus; detail?: string };

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "choose", label: "Choisir les fichiers" },
  { key: "convert", label: "Conversion" },
  { key: "verify", label: "Vérifier" },
];

const isDocxFile = (file: File) => /\.docx$/i.test(file.name);
const plural = (count: number, singular: string, pluralForm: string) => (count > 1 ? pluralForm : singular);

function initialTasks(mode: ArticleFilesMode): Task[] {
  const tasks: Task[] = [];
  if (mode !== "pdf") {
    tasks.push(
      { key: "read", label: "Lecture du Word", status: "pending" },
      { key: "titles", label: "Titres détectés", status: "pending" },
      { key: "images", label: "Images envoyées dans la médiathèque", status: "pending" },
      { key: "notes", label: "Notes de bas de page conservées", status: "pending" },
    );
  }
  if (mode !== "word") tasks.push({ key: "pdf", label: "PDF enregistré dans la médiathèque", status: "pending" });
  return tasks;
}

function FileSlot({
  kind,
  label,
  file,
  error,
  onFile,
}: {
  kind: "docx" | "pdf";
  label: string;
  file: File | null;
  error: string | null;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const labelId = useId();

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  }

  return (
    <div
      className={`files-slot files-slot--drop${file ? " is-filled" : ""}${dragging ? " is-dragging" : ""}${error ? " is-invalid" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <span className={`files-slot-icon files-slot-icon--${kind}`} aria-hidden="true">
        {kind === "docx" ? "DOCX" : "PDF"}
      </span>
      <div className="files-slot-text">
        <p className="files-slot-kicker" id={labelId}>
          {label}
        </p>
        <p className="files-slot-name">{file ? file.name : "Aucun fichier choisi"}</p>
        <p className="files-slot-hint">
          {error ?? (file ? "Prêt pour la conversion" : "Glissez le fichier ici ou cliquez sur « Choisir »")}
        </p>
      </div>
      <button type="button" className="button" aria-describedby={labelId} onClick={() => inputRef.current?.click()}>
        {file ? "Changer" : "Choisir"}
      </button>
      <input
        ref={inputRef}
        hidden
        tabIndex={-1}
        type="file"
        accept={
          kind === "docx"
            ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : ".pdf,application/pdf"
        }
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          event.target.value = "";
          if (chosen) onFile(chosen);
        }}
      />
    </div>
  );
}

interface Props {
  mode: ArticleFilesMode;
  productionId?: string | null;
  onClose: () => void;
  onValidate: (result: ArticleFilesResult) => void;
  /** Aperçu de la page de lecture avec les fichiers convertis (pas encore validés). */
  onPreview: (result: ArticleFilesResult) => void;
}

export function ArticleFilesModal({ mode, productionId, onClose, onValidate, onPreview }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("choose");
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks(mode));
  const [failure, setFailure] = useState<string | null>(null);
  const [result, setResult] = useState<ArticleFilesResult>({ word: null, pdf: null });
  const converting = step === "convert" && !failure;

  const needsWord = mode !== "pdf";
  const needsPdf = mode !== "word";
  const missing = [needsWord && !wordFile ? "le Word" : null, needsPdf && !pdfFile ? "le PDF" : null].filter(Boolean);
  const parts = useMemo(() => (result.word ? splitIntoParts(result.word.html) : []), [result.word]);

  // Fenêtre modale : Échap ferme (sauf pendant la conversion), focus gardé dans la fenêtre.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !converting) onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), summary, a[href]"),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, converting]);

  function chooseWord(file: File) {
    setWordError(isDocxFile(file) ? null : "Ce fichier n'est pas un document Word (.docx).");
    setWordFile(isDocxFile(file) ? file : null);
  }
  function choosePdf(file: File) {
    setPdfError(isPdfFile(file) ? null : "Ce fichier n'est pas un PDF.");
    setPdfFile(isPdfFile(file) ? file : null);
  }

  function updateTask(key: string, status: TaskStatus, detail?: string) {
    setTasks((current) => current.map((task) => (task.key === key ? { ...task, status, detail } : task)));
  }

  async function convert() {
    setStep("convert");
    setFailure(null);
    setTasks(initialTasks(mode));
    const next: ArticleFilesResult = { word: null, pdf: null };
    let runningTask = "";
    try {
      if (needsWord && wordFile) {
        runningTask = "read";
        updateTask("read", "active");
        const imported = await importDocx(wordFile, productionId);
        updateTask("read", "done");
        const detected = splitIntoParts(imported.html).length;
        updateTask("titles", "done", `${detected} ${plural(detected, "partie", "parties")}`);
        updateTask("images", "done", `${imported.imageCount} ${plural(imported.imageCount, "image", "images")}`);
        updateTask("notes", "done", `${imported.noteCount} ${plural(imported.noteCount, "note", "notes")}`);
        next.word = { ...imported, fileName: wordFile.name };
      }
      if (needsPdf && pdfFile) {
        runningTask = "pdf";
        updateTask("pdf", "active");
        const { media, pages } = await uploadProductionPdf(pdfFile);
        updateTask("pdf", "done", pages ? `${pages} ${plural(pages, "page", "pages")}` : "pages non lues");
        next.pdf = { id: media.id, name: pdfFile.name, pages };
      }
      setResult(next);
      setStep("verify");
    } catch (error) {
      if (runningTask) updateTask(runningTask, "error");
      setFailure(error instanceof Error ? error.message : "La conversion a échoué.");
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="modal-backdrop files-modal-backdrop" role="presentation">
      <div className="files-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
        <div className="files-modal-head">
          <h2 id={titleId}>
            {mode === "both"
              ? "Ajouter les fichiers de l'article"
              : mode === "word"
                ? "Remplacer le Word"
                : "Remplacer le PDF"}
          </h2>
          <button
            type="button"
            className="files-modal-close"
            aria-label="Fermer"
            onClick={onClose}
            disabled={converting}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <ol className="files-steps">
          {STEPS.map((s, index) => (
            <li
              key={s.key}
              className={index < stepIndex ? "is-done" : index === stepIndex ? "is-current" : undefined}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <span className="files-steps-num" aria-hidden="true">
                {index < stepIndex ? <Check size={13} strokeWidth={2.5} /> : index + 1}
              </span>
              {index === 0 && mode === "both" ? "Choisir les 2 fichiers" : s.label}
            </li>
          ))}
        </ol>

        {step === "choose" && (
          <div className="files-modal-body">
            {needsWord && (
              <FileSlot
                kind="docx"
                label={`${mode === "both" ? "1 · " : ""}Le Word (texte en ligne) · obligatoire`}
                file={wordFile}
                error={wordError}
                onFile={chooseWord}
              />
            )}
            {needsPdf && (
              <FileSlot
                kind="pdf"
                label={`${mode === "both" ? "2 · " : ""}Le PDF (téléchargement) · obligatoire`}
                file={pdfFile}
                error={pdfError}
                onFile={choosePdf}
              />
            )}
            {needsWord && (
              <div className="files-modal-tip">
                <p className="files-modal-tip-title">Dans le Word</p>
                <p>
                  Grands titres en style « Titre 1 » (une partie chacun), sous-titres en « Titre 2 », notes avec «
                  Insérer une note de bas de page ».
                </p>
              </div>
            )}
          </div>
        )}

        {step === "convert" && (
          <div className="files-modal-body">
            <ul className="files-tasks" aria-live="polite">
              {tasks.map((task) => (
                <li key={task.key} className={`is-${task.status}`}>
                  <span className="files-tasks-mark" aria-hidden="true">
                    {task.status === "done" ? <Check size={13} strokeWidth={2.5} /> : null}
                    {task.status === "error" ? <X size={13} strokeWidth={2.5} /> : null}
                  </span>
                  <span>
                    {task.label}
                    {task.detail && <span className="files-tasks-detail"> · {task.detail}</span>}
                    {task.status === "active" && <span className="sr-only"> (en cours)</span>}
                  </span>
                </li>
              ))}
            </ul>
            {failure && (
              <p className="form-error" role="alert">
                {failure}
              </p>
            )}
          </div>
        )}

        {step === "verify" && (
          <div className="files-modal-body">
            <dl className="files-stats">
              {result.word && (
                <>
                  <div>
                    <dt>{plural(parts.length, "partie", "parties")}</dt>
                    <dd>{parts.length}</dd>
                  </div>
                  <div>
                    <dt>{plural(result.word.imageCount, "image", "images")}</dt>
                    <dd>{result.word.imageCount}</dd>
                  </div>
                  <div>
                    <dt>{plural(result.word.noteCount, "note", "notes")}</dt>
                    <dd>{result.word.noteCount}</dd>
                  </div>
                </>
              )}
              {result.pdf && (
                <div>
                  <dt>pages de PDF</dt>
                  <dd>{result.pdf.pages ?? "?"}</dd>
                </div>
              )}
            </dl>
            {result.pdf && result.pdf.pages === null && (
              <p className="admin-warning" role="status">
                <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
                <span>Le nombre de pages n&apos;a pas pu être lu : saisissez-le dans la fiche.</span>
              </p>
            )}
            {result.word && parts.length > 1 && (
              <ol className="files-modal-parts">
                {parts.map((part) => (
                  <li key={part.slug}>{part.title}</li>
                ))}
              </ol>
            )}
            {result.word && parts.length === 1 && (
              <p className="admin-warning" role="status">
                <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
                <span>
                  Aucun « Titre 1 » détecté : l&apos;article s&apos;affichera en une seule partie. Vérifiez que les
                  grands titres utilisent le style « Titre 1 » dans Word.
                </span>
              </p>
            )}
            {result.word && result.word.warnings.length > 0 && (
              <details className="files-modal-warnings">
                <summary>
                  {result.word.warnings.length} {plural(result.word.warnings.length, "avertissement", "avertissements")}{" "}
                  de conversion
                </summary>
                <ul>
                  {result.word.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="files-modal-foot">
          {step === "choose" && (
            <>
              <p className="files-modal-status">
                {missing.length > 0 ? `Il manque ${missing.join(" et ")}.` : "Fichiers prêts."}
              </p>
              <button type="button" className="button" onClick={onClose}>
                Annuler
              </button>
              <button
                type="button"
                className="button primary"
                disabled={missing.length > 0}
                onClick={() => void convert()}
              >
                Convertir
              </button>
            </>
          )}
          {step === "convert" && (
            <>
              <p className="files-modal-status">{failure ? "La conversion n'a pas abouti." : "Conversion en cours…"}</p>
              {failure && (
                <button type="button" className="button" onClick={() => setStep("choose")}>
                  Revenir au choix des fichiers
                </button>
              )}
            </>
          )}
          {step === "verify" && (
            <>
              {result.word ? (
                <button type="button" className="files-modal-preview" onClick={() => onPreview(result)}>
                  Voir l&apos;aperçu <span aria-hidden="true">→</span>
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="button" onClick={onClose}>
                Annuler
              </button>
              <button type="button" className="button primary" onClick={() => onValidate(result)}>
                Valider les fichiers
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
