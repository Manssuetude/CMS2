"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  href: string;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  event: "Événements",
  production: "Productions",
  project: "Projets",
  theme: "Thèmes",
  sub_theme: "Sous-thèmes",
  author: "Auteurs",
  journal: "Journal",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Publié",
  draft: "Brouillon",
  archived: "Archivé",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 260);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  const hasResults = results.length > 0;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div className="admin-search-wrap">
        <Search size={13} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.45 }} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setOpen(true);
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 2,
              cursor: "pointer",
              color: "var(--muted)",
              display: "flex",
              flexShrink: 0,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="search-results-dropdown">
          {loading && <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>Recherche...</div>}
          {!loading && !hasResults && (
            <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>
              Aucun résultat pour &ldquo;{query}&rdquo;
            </div>
          )}
          {!loading &&
            Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="search-results-section">
                <div className="search-results-section-label">{TYPE_LABELS[type] ?? type}</div>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="search-result-item"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </span>
                    <span className={`badge-status badge-${item.status}`} style={{ fontSize: 10, flexShrink: 0 }}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
