import { NextResponse } from "next/server";
import { formRepository } from "@/repositories/formRepository";
import { mediaRepository } from "@/repositories/mediaRepository";
import type { FormType } from "@/types/cms";
import { errorResponse } from "@/lib/errors";
import { formTypeSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const formType = formTypeSchema.parse(String(formData.get("formType") || ""));

    const data: Record<string, unknown> = {};
    const attachments: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "formType") continue;
      if (value instanceof File) {
        if (value.size > 0) {
          const media = await mediaRepository.upload(value, {
            title: value.name,
            visibility: "private",
            description: `Pièce jointe du formulaire ${formType}`,
          });
          attachments.push(media.id);
        }
      } else {
        data[key] = value;
      }
    }

    const submission = await formRepository.create(formType as FormType, data, attachments);
    logger.info("form.submitted", { formType, id: submission.id });
    return NextResponse.json(submission);
  } catch (error) {
    return errorResponse(error);
  }
}
