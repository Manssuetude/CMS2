import { NextResponse } from "next/server";
import { formRepository } from "@/repositories/formRepository";
import type { FormType } from "@/types/cms";
import { errorResponse } from "@/lib/errors";
import { formTypeSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { sendEmail, submissionConfirmationSubject, submissionConfirmationHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawFormType = String(formData.get("formType") || "");
    const formType = formTypeSchema.parse(rawFormType);

    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "formType") continue;
      if (value instanceof File) continue;
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
