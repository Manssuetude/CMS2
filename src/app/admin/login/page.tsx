"use client";

import { useActionState, useState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="page-main">
      <section className="admin-panel login-panel">
        <p className="eyebrow">Administration</p>
        <h1>Connexion Manssuétude</h1>
        <p className="login-subtitle">Espace réservé aux membres de l&apos;équipe éditoriale.</p>

        <form action={action} className="form-grid login-form">
          <label className="login-field">
            <span className="login-label">
              Email
              <span
                className="login-hint"
                title="Utilisez l'adresse email associée à votre compte Manssuétude"
                aria-label="Information sur le champ email"
              >
                ?
              </span>
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
            <span className="login-label">Mot de passe</span>
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
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <button className="button primary" type="submit" disabled={isPending}>
            {isPending ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
