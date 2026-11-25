"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const LEAVE_CONFIRM_MESSAGE = "Des modifications ne sont pas enregistrées. Quitter la page quand même ?";

// Valeurs du formulaire sous forme comparable (les fichiers sont ignorés).
function snapshot(form: HTMLFormElement): string {
  const entries: string[] = [];
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") entries.push(`${key}=${value}`);
  });
  return entries.join("\u0000");
}

/**
 * Suit les modifications non enregistrées d'un formulaire : compare ses
 * valeurs à celles du chargement. Tant que personne n'a touché au formulaire,
 * les changements faits par le code (éditeur riche qui normalise son contenu,
 * valeurs calculées) redéfinissent la référence au lieu de compter comme des
 * modifications. Quand `dirty` est vrai : avertissement du navigateur à la
 * fermeture de l'onglet et confirmation avant de suivre un lien interne.
 */
export function useUnsavedChanges(form: HTMLFormElement | null) {
  const [dirty, setDirty] = useState(false);
  const baseline = useRef<string | null>(null);
  const touched = useRef(false);
  const submitting = useRef(false);

  const check = useCallback(() => {
    if (!form) return;
    const current = snapshot(form);
    if (baseline.current === null || !touched.current) {
      baseline.current = current;
      setDirty(false);
      return;
    }
    setDirty(current !== baseline.current);
  }, [form]);

  /** Après un enregistrement réussi : l'état actuel devient la référence. */
  const markSaved = useCallback(() => {
    if (form) baseline.current = snapshot(form);
    submitting.current = false;
    setDirty(false);
  }, [form]);

  useEffect(() => {
    if (!form) return;
    check();
    const onUserEdit = () => {
      touched.current = true;
      // Laisse React appliquer la valeur avant de comparer.
      requestAnimationFrame(check);
    };
    const onTouch = () => {
      touched.current = true;
    };
    const onSubmit = () => {
      submitting.current = true;
    };
    form.addEventListener("input", onUserEdit);
    form.addEventListener("change", onUserEdit);
    form.addEventListener("keydown", onTouch);
    form.addEventListener("pointerdown", onTouch);
    form.addEventListener("submit", onSubmit);
    // Champs cachés mis à jour par le code (sélections, fichiers, éditeur riche).
    const observer = new MutationObserver(() => requestAnimationFrame(check));
    observer.observe(form, { subtree: true, childList: true, attributes: true, attributeFilter: ["value"] });
    return () => {
      form.removeEventListener("input", onUserEdit);
      form.removeEventListener("change", onUserEdit);
      form.removeEventListener("keydown", onTouch);
      form.removeEventListener("pointerdown", onTouch);
      form.removeEventListener("submit", onSubmit);
      observer.disconnect();
    };
  }, [form, check]);

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (submitting.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    // Navigation interne (liens Next) : le navigateur ne prévient pas, on demande.
    function onClick(event: MouseEvent) {
      if (submitting.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm(LEAVE_CONFIRM_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  return { dirty, markSaved };
}
