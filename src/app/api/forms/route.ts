import { NextResponse } from "next/server";
import { formRepository } from "@/repositories/formRepository";
import type { FormType } from "@/types/cms";
import { errorResponse } from "@/lib/errors";
import { formTypeSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const formType = formTypeSchema.parse(String(formData.get("formType") || ""));

    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "formType") continue;
      if (value instanceof File) continue;
      data[key] = value;
    }

    const submission = await formRepository.create(formType as FormType, data);
    logger.info("form.submitted", { formType, id: submission.id });
    return NextResponse.json(submission);
  } catch (error) {
    return errorResponse(error);
  }
}
