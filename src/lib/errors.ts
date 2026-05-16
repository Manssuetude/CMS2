import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
    return NextResponse.json({ error: "Erreur interne.", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ error: "Erreur inconnue.", code: "UNKNOWN_ERROR" }, { status: 500 });
}
