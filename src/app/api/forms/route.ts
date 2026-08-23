import { NextResponse } from "next/server";
import { formRepository } from "@/repositories/formRepository";
import type { FormType } from "@/types/cms";
import { errorResponse, AppError } from "@/lib/errors";
import { formTypeSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { sendEmail, submissionConfirmationSubject, submissionConfirmationHtml } from "@/lib/email";
import { isHoneypotFilled } from "@/lib/honeypot";
import { verifyTurnstile } from "@/lib/turnstile";
import { uploadToStorage } from "@/lib/media";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Anti-spam : un bot qui remplit le champ honeypot reçoit une fausse
    // réponse de succès (pas d'indice que sa soumission a été détectée),
    // sans rien persister ni envoyer d'email.
    if (isHoneypotFilled(formData)) {
      logger.warn("form.honeypot_triggered");
      return NextResponse.json({ id: "ok" });
    }

    if (!(await verifyTurnstile(formData))) {
      logger.warn("form.turnstile_rejected");
      throw new AppError("Vérification anti-robot échouée. Merci de réessayer.", 400, "TURNSTILE_FAILED");
    }

    const rawFormType = String(formData.get("formType") || "");
    const formType = formTypeSchema.parse(rawFormType);

    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "formType") continue;
      if (value instanceof File) {
        // Champ file facultatif non rempli : le navigateur envoie quand même
        // un File vide (size 0, name ""), à ignorer silencieusement.
        if (value.size === 0) continue;
        const { url } = await uploadToStorage(value, "form-uploads");
        data[key] = url;
        continue;
      }
      data[key] = value;
    }

    const submission = await formRepository.create(formType as FormType, data);
    logger.info("form.submitted", { formType, id: submission.id });

    // Accusé de réception best-effort : sendEmail() ne rejette jamais (échec = log + false),
    // donc on ne bloque/n'échoue jamais la soumission si l'email ne part pas.
    const visitorEmail = typeof data.email === "string" ? data.email : null;
    if (visitorEmail) {
      void sendEmail(visitorEmail, submissionConfirmationSubject(rawFormType), submissionConfirmationHtml(rawFormType));
    }

    return NextResponse.json(submission);
  } catch (error) {
    return errorResponse(error);
  }
}
