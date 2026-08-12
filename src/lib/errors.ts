import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "APP_ERROR",
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  // redirect()/notFound() from next/navigation throw a special error that Next's
  // routing layer must see to actually perform the redirect. If a route handler's
  // try/catch swallows it here, an expired-session redirect turns into a 500.
  unstable_rethrow(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Données invalides.", code: "VALIDATION_ERROR", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  if (error instanceof Error) {
    logger.error("api.unhandled_error", { message: error.message, stack: error.stack || "" });
    return NextResponse.json({ error: "Erreur interne.", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  logger.error("api.unhandled_error", { message: String(error) });
  return NextResponse.json({ error: "Erreur inconnue.", code: "UNKNOWN_ERROR" }, { status: 500 });
}
