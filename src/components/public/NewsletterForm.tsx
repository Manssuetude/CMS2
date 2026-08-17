"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", { method: "POST", body: new FormData(e.currentTarget) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Erreur lors de l'inscription.");
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    }
  }

  if (status === "success") {
    return <p className={`newsletter-form-success${compact ? " is-compact" : ""}`}>Merci, vous êtes inscrit·e !</p>;
  }

  return (
    <form className={`newsletter-form${compact ? " is-compact" : ""}`} onSubmit={handleSubmit}>
      <div className="newsletter-form-row">
        <input type="email" name="email" required placeholder="Votre adresse email" aria-label="Adresse email" />
        <button type="submit" className="button primary" disabled={status === "loading"}>
          {status === "loading" ? "..." : "S'inscrire"}
        </button>
      </div>
      <label className="newsletter-form-consent">
        <input type="checkbox" name="consent" required />
        J&apos;accepte de recevoir la newsletter de Manssuétude par email.
      </label>
      {error && <p className="newsletter-form-error">{error}</p>}
    </form>
  );
}
