export default function LoginPage() {
  return (
    <main className="page-main">
      <section className="admin-panel login-panel">
        <p className="eyebrow">Administration</p>
        <h1>Connexion Manssuétude</h1>
        <form className="form-grid" action="/api/auth/login" method="post">
          <label>
            Email
            <input name="email" type="text" inputMode="email" autoComplete="email" required />
          </label>
          <label>
            Mot de passe
            <input name="password" type="password" required />
          </label>
          <button className="button primary" type="submit">
            Se connecter
          </button>
        </form>
      </section>
    </main>
  );
}
