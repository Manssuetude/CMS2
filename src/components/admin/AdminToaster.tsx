"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Toaster() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params.get("saved") !== "1") return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3200);
    // Nettoie l'URL pour que le toast ne réapparaisse pas au rafraîchissement.
    const next = new URLSearchParams(params.toString());
    next.delete("saved");
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    return () => clearTimeout(timer);
  }, [params, pathname, router]);

  if (!visible) return null;
  return (
    <div className="admin-toast" role="status" aria-live="polite">
      <span className="admin-toast-check">✓</span> Modifications enregistrées
    </div>
  );
}

export function AdminToaster() {
  return (
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
  );
}
