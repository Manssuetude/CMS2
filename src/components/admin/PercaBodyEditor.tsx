"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 400,
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        background: "var(--soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        fontSize: 13,
      }}
    >
      Chargement de l&apos;éditeur...
    </div>
  ),
});

export function PercaBodyEditor({ initial = "" }: { initial?: string }) {
  const [body, setBody] = useState(initial);

  return (
    <>
      <input type="hidden" name="body" value={body} />
      <RichTextEditor value={body} onChange={setBody} />
    </>
  );
}
