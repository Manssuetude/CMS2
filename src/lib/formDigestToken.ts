import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

// Jeton signé (HMAC-SHA256) encodant la plage de dates d'un envoi groupé —
// permet au lien de téléchargement dans l'email de fonctionner sans connexion
// à l'espace admin, tout en restant infalsifiable et borné dans le temps.
// Dérivé de SUPABASE_SERVICE_ROLE_KEY (déjà secret, déjà en place) plutôt que
// signé directement avec elle, pour ne jamais exposer la clé elle-même via
// une éventuelle fuite de signature, et éviter d'exiger une variable
// d'environnement supplémentaire pour une fonctionnalité secondaire.
function signingKey(): string {
  return createHmac("sha256", "form-digest-token-v1")
    .update(env.SUPABASE_SERVICE_ROLE_KEY ?? "")
    .digest("hex");
}

export type FormDigestTokenPayload = { from: string; to: string };

export function signFormDigestToken(from: string, to: string, expiresAt: number): string {
  const payload = `${from}|${to}|${expiresAt}`;
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const signature = createHmac("sha256", signingKey()).update(payload).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyFormDigestToken(token: string): FormDigestTokenPayload | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedSignature = createHmac("sha256", signingKey()).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [from, to, expiresAtRaw] = payload.split("|");
  const expiresAt = Number(expiresAtRaw);
  if (!from || !to || !expiresAt || Date.now() > expiresAt) return null;
  return { from, to };
}
