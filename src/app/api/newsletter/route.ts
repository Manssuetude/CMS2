import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { newsletterSubscribeSchema } from "@/lib/validation";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { logger } from "@/lib/logger";
import { isHoneypotFilled } from "@/lib/honeypot";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    if (isHoneypotFilled(formData)) {
      logger.warn("newsletter.honeypot_triggered");
      return NextResponse.json({ success: true });
    }

    const parsed = newsletterSubscribeSchema.parse({
      email: String(formData.get("email") || ""),
      consent: String(formData.get("consent") || ""),
    });

    const result = await subscribeToNewsletter(parsed.email);
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Erreur lors de l'inscription." }, { status: 502 });
    }

    logger.info("newsletter.subscribed", { email: parsed.email });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
