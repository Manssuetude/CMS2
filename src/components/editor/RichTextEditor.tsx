"use client";

import { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import type { EditorConfig } from "ckeditor5";
import {
  Alignment,
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
  Alignment,
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

const CONFIG: EditorConfig = {
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
  mention: {
    feeds: [],
  },
  htmlSupport: {
    allow: [{ name: /./, attributes: true, classes: true, styles: true }],
  },
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function RichTextEditor({ value, onChange, name }: Props) {
  const wordCountRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {name && <input type="hidden" name={name} value={value} readOnly />}
      <CKEditor
        editor={ClassicEditor}
        config={CONFIG}
        data={value}
        onReady={(editor) => {
          const wc = editor.plugins.get("WordCount");
          if (wordCountRef.current && wc.wordCountContainer) {
            wordCountRef.current.replaceChildren(wc.wordCountContainer);
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
