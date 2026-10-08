import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGooglePickerConfig } from "@/lib/google-drive";

export async function GET() {
  await requireRole(["admin", "editor"]);
  return NextResponse.json(getGooglePickerConfig());
}
