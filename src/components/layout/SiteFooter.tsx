import type { FooterConfig } from "@/types/cms";

export function SiteFooter({ config }: { config?: FooterConfig }) {
  const footer = config || {};
  return (
    <footer className="site-footer">
      <div>
        <strong>Manssuétude</strong>
        <p>{footer.description || "Un espace de réflexion, de production et d'expérimentation collective."}</p>
      </div>
      {(footer.columns || []).map((column) => (
        <div key={column.title}>
          <h2 className="eyebrow">{column.title}</h2>
          {(column.links || []).map((link) => (
            <a key={link.url} href={link.url}>
              {link.label}
            </a>
          ))}
        </div>
      ))}
    </footer>
  );
}
