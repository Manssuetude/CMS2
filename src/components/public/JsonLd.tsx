// Injecte un bloc JSON-LD (données structurées Schema.org) dans la page —
// évite de répéter le `dangerouslySetInnerHTML` à chaque type de contenu.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
