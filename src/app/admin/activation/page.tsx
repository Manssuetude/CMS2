"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="act-shell">
      <div className="act-grid">
        <aside className="act-aside">
          <img className="act-logo" src="/assets/photos/logo-manssuetude.png?v=3" alt="Manssuétude" />
          <p className="act-eyebrow">Espace d&apos;administration</p>
          <h1 className="act-welcome">Bienvenue chez Manssuétude.</h1>
          <p className="act-lede">
            Un espace de réflexion, de production et d&apos;expérimentation collective. Encore un pas et votre compte
            est prêt.
          </p>
        </aside>

        <main className="act-panel">
          {ready === "loading" && (
            <div className="act-state">
              <span className="act-spinner" aria-hidden />
              <p className="act-state__text">Vérification de votre invitation…</p>
            </div>
          )}

          {ready === "invalid" && (
            <div className="act-state">
              <AlertCircle className="act-state__icon" size={30} strokeWidth={1.75} aria-hidden />
              <h2 className="act-state__title">Lien invalide ou expiré</h2>
              <p className="act-state__text">
                Demandez une nouvelle invitation à un administrateur pour activer votre compte.
              </p>
            </div>
          )}

          {ready === "ok" && (
            <div className="act-form-wrap">
              <header className="act-form-head">
                <h2 className="act-form-title">Activer votre compte</h2>
                <p className="act-form-sub">
                  Compte <strong>{email}</strong>. Choisissez votre nom et un mot de passe.
                </p>
              </header>

              <form onSubmit={onSubmit} className="act-form" noValidate>
                <div className="act-field">
                  <label className="act-label" htmlFor="act-name">
                    Votre nom
                  </label>
                  <input
                    id="act-name"
                    className="act-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    autoFocus
                    required
                  />
                </div>

                <div className="act-field">
                  <label className="act-label" htmlFor="act-pw">
                    Mot de passe
                  </label>
                  <div className="act-input-wrap">
                    <input
                      id="act-pw"
                      className="act-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="act-eye"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                    </button>
                  </div>
                  <p className="act-hint">8 caractères minimum.</p>
                </div>

                <div className="act-field">
                  <label className="act-label" htmlFor="act-confirm">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="act-confirm"
                    className="act-input"
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                {error && (
                  <p className="act-error">
                    <AlertCircle size={14} strokeWidth={2} aria-hidden />
                    {error}
                  </p>
                )}

                <button type="submit" className="act-submit" disabled={submitting}>
                  {submitting ? (
                    "Activation…"
                  ) : (
                    <>
                      Activer mon compte
                      <ArrowRight size={16} strokeWidth={2} aria-hidden />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
