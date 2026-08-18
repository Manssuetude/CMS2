"use client";

import { useState, type FormEvent } from "react";
import { Mail, Check } from "lucide-react";

export function NewsletterForm() {
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
    return (
      <p className="newsletter-form-success">
        <Check size={18} strokeWidth={2.25} aria-hidden />
        Merci, vous êtes inscrit·e !
      </p>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        className="honeypot-field"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="newsletter-form-row">
        <Mail size={18} strokeWidth={1.75} className="newsletter-form-icon" aria-hidden />
        <input type="email" name="email" required placeholder="Votre adresse email" aria-label="Adresse email" />
        <button type="submit" disabled={status === "loading"}>
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
