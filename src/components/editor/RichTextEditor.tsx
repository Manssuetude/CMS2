"use client";

import { useMemo, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import type { EditorConfig, MentionFeedObjectItem } from "ckeditor5";
import {
  Autoformat,
  AutoLink,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  ClassicEditor,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

const PLUGINS = [
  Autoformat,
  AutoLink,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
];

const TOOLBAR = {
  items: [
    "heading",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "subscript",
    "superscript",
    "code",
    "|",
    "removeFormat",
    "-",
    "alignment:left",
    "alignment:center",
    "alignment:right",
    "alignment:justify",
    "|",
    "bulletedList",
    "numberedList",
    "todoList",
    "|",
    "indent",
    "outdent",
    "|",
    "blockQuote",
    "codeBlock",
    "-",
    "link",
    "insertImage",
    "mediaEmbed",
    "htmlEmbed",
    "|",
    "insertTable",
    "|",
    "horizontalLine",
    "pageBreak",
    "specialCharacters",
    "|",
    "findAndReplace",
    "showBlocks",
  ],
  shouldNotGroupWhenFull: true,
};

const BASE_CONFIG: Omit<EditorConfig, "mention"> = {
  licenseKey: "GPL",
  plugins: PLUGINS,
  toolbar: TOOLBAR,
  heading: {
    options: [
      { model: "paragraph" as const, title: "Paragraphe", class: "ck-heading_paragraph" },
      { model: "heading2" as const, view: "h2" as const, title: "Titre 2", class: "ck-heading_heading2" },
      { model: "heading3" as const, view: "h3" as const, title: "Titre 3", class: "ck-heading_heading3" },
      { model: "heading4" as const, view: "h4" as const, title: "Titre 4", class: "ck-heading_heading4" },
    ],
  },
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
      "toggleTableCaption",
    ],
  },
  image: {
    toolbar: [
      "toggleImageCaption",
      "imageTextAlternative",
      "|",
      "imageStyle:inline",
      "imageStyle:wrapText",
      "imageStyle:breakText",
      "|",
      "resizeImage",
    ],
  },
  list: {
    properties: { styles: true, startIndex: true, reversed: true },
  },
  htmlSupport: {
    allow: [{ name: /./, attributes: true, classes: true, styles: true }],
  },
};

// Item d'un répertoire (ex. formats d'activité) insérable dans le texte via "#" —
// tape le marqueur, choisit dans la liste, un repère cliquable est inséré. La
// description associée n'est jamais dupliquée dans le corps : elle est résolue
// à l'affichage public à partir de l'id (voir src/utils/formatBubbles.ts).
export interface MentionItem {
  id: string;
  title: string;
}

interface FormatMentionFeedItem extends MentionFeedObjectItem {
  formatId: string;
  title: string;
}

const EMPTY_MENTION_ITEMS: MentionItem[] = [];

interface Props {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  mentionItems?: MentionItem[];
}

export function RichTextEditor({ value, onChange, name, mentionItems = EMPTY_MENTION_ITEMS }: Props) {
  const wordCountRef = useRef<HTMLDivElement>(null);

  // Mémoïsé sur `mentionItems` (le composant appelant doit lui-même fournir une
  // référence stable) : CKEditor recrée l'éditeur à chaque changement de `config`,
  // donc un nouvel objet à chaque rendu casserait la frappe (perte du curseur).
  const config: EditorConfig = useMemo(
    () => ({
      ...BASE_CONFIG,
      mention: {
        feeds:
          mentionItems.length > 0
            ? [
                {
                  marker: "#",
                  feed: mentionItems.map(
                    (item): FormatMentionFeedItem => ({ id: `#${item.id}`, formatId: item.id, title: item.title }),
                  ),
                  itemRenderer: (item) => {
                    const el = document.createElement("span");
                    el.className = "ck-format-mention-item";
                    el.textContent = (item as FormatMentionFeedItem).title;
                    return el;
                  },
                },
              ]
            : [],
      },
    }),
    [mentionItems],
  );

  return (
    <div>
      {name && <input type="hidden" name={name} value={value} readOnly />}
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        onReady={(editor) => {
          const wc = editor.plugins.get("WordCount");
          if (wordCountRef.current && wc.wordCountContainer) {
            wordCountRef.current.replaceChildren(wc.wordCountContainer);
          }
          if (mentionItems.length > 0) {
            // Ne personnalise que la sortie sauvegardée (dataDowncast) : la vue
            // d'édition garde le rendu "mention" natif de CKEditor (pastille bleue),
            // seul le HTML enregistré porte le repère `data-format-id`.
            editor.conversion.for("dataDowncast").attributeToElement({
              model: { key: "mention", name: "$text" },
              view: (modelAttributeValue, { writer }) => {
                if (!modelAttributeValue || typeof modelAttributeValue !== "object") return undefined;
                const data = modelAttributeValue as unknown as FormatMentionFeedItem & { uid: string };
                if (!data.formatId) return undefined;
                return writer.createAttributeElement(
                  "span",
                  { class: "format-chip-tip", "data-format-id": data.formatId },
                  { priority: 20, id: data.uid },
                );
              },
              converterPriority: "high",
            });
          }
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />
      <div ref={wordCountRef} className="ck-word-count-bar" />
    </div>
  );
}
