"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

export default function ActivationPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"loading" | "ok" | "invalid">("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Le client Supabase capte automatiquement la session depuis le fragment d'URL.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setEmail(data.session.user.email ?? "");
        setReady("ok");
      } else {
        setReady("invalid");
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Indiquez votre nom.");
    if (password.length < 8) return setError("Le mot de passe doit faire au moins 8 caractères.");
    if (password !== confirm) return setError("Les mots de passe ne correspondent pas.");

    setSubmitting(true);
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;

    const { error: updErr } = await supabase.auth.updateUser({ password, data: { name: name.trim() } });
    if (updErr) {
      setSubmitting(false);
      return setError(updErr.message);
    }

    if (token) {
      await fetch("/api/activation/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      }).catch(() => {});
    }

    await supabase.auth.signOut();
    router.push("/admin/login?activated=1");
  }

  return (
    <div className="page-main">
      <div className="admin-panel login-panel activation-card" style={{ maxWidth: 460, margin: "48px auto" }}>
        <div className="activation-brand">
          <img src="/assets/photos/logo-manssuetude.png?v=3" alt="Manssuétude" />
          <span>Manssuétude</span>
        </div>
        <p className="eyebrow" style={{ color: "var(--orange)" }}>
          Bienvenue
        </p>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Activer votre compte</h1>
        {ready === "loading" && <p className="login-subtitle">Vérification du lien…</p>}
        {ready === "invalid" && (
          <p className="login-subtitle">
            Lien invalide ou expiré. Demandez une nouvelle invitation à un administrateur.
          </p>
        )}
        {ready === "ok" && (
          <>
            <p className="login-subtitle">
              Compte : <strong>{email}</strong>. Définissez votre nom et votre mot de passe.
            </p>
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 14, marginTop: 16 }}>
              <div className="form-field">
                <label className="form-label">Votre nom</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">Mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Confirmer le mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="cta" disabled={submitting}>
                {submitting ? "Activation…" : "Activer mon compte"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
