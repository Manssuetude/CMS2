"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="page-main">
      <section className="admin-panel login-panel">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <img
            src="/assets/photos/logo-manssuetude.png?v=2"
            alt="Manssuétude"
            style={{ width: 46, height: 46, objectFit: "contain", flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted)",
              }}
            >
              Administration
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              Manssuetude CMS
            </p>
          </div>
        </div>

        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Connexion</h1>
        <p className="login-subtitle">Espace reserve aux membres de l&apos;equipe editoriale.</p>

        <form action={action} className="form-grid login-form">
          <label className="login-field">
            <span className="login-label">
              <Mail size={14} strokeWidth={2} style={{ opacity: 0.6 }} />
              Email
            </span>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="prenom.nom@manssuetude.org"
              required
              disabled={isPending}
            />
          </label>

          <label className="login-field">
            <span className="login-label">
              <Lock size={14} strokeWidth={2} style={{ opacity: 0.6 }} />
              Mot de passe
            </span>
            <span className="login-password-wrap">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                required
                disabled={isPending}
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <button className="button primary" type="submit" disabled={isPending}>
            {isPending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
