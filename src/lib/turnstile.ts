import { logger } from "@/lib/logger";
import { TURNSTILE_FIELD_NAME } from "@/lib/turnstileField";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Si la clé secrète n'est pas configurée (dev local sans compte Cloudflare),
// la vérification est ignorée plutôt que de bloquer tous les formulaires —
// le honeypot reste actif dans tous les cas. En production, la clé doit être
// définie pour que la protection soit réellement active.
export async function verifyTurnstile(formData: FormData): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;

  const token = formData.get(TURNSTILE_FIELD_NAME);
  if (typeof token !== "string" || !token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });
    const result = (await response.json()) as { success: boolean };
    return result.success === true;
  } catch (error) {
    logger.error("turnstile.verify_failed", { message: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
