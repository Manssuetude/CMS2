"use client";

// Bouton de validation du changement de rôle avec confirmation.
// Lit le rôle sélectionné dans le <select> voisin pour un message explicite.
export function ConfirmRoleButton() {
  return (
    <button
      type="submit"
      className="btn-sm"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        const form = e.currentTarget.form;
        const select = form?.querySelector<HTMLSelectElement>("select[name='roleKey']");
        const label = select?.selectedOptions[0]?.text ?? "ce rôle";
        if (!window.confirm(`Attribuer le rôle « ${label} » à cet utilisateur ?`)) {
          e.preventDefault();
        }
      }}
    >
      OK
    </button>
  );
}
