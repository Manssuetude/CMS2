import { getSupabaseAdmin } from "@/lib/db";
import type { FormStatus, FormSubmission } from "@/types/cms";
import { asNullableString, asString, type DataRow } from "@/utils/row";

function mapFormSubmission(row: DataRow): FormSubmission {
  return {
    id: asString(row.id),
    formType: asString(row.form_type) as FormSubmission["formType"],
    data: (row.data ?? {}) as Record<string, unknown>,
    status: asString(row.status, "reçu") as FormStatus,
    notes: asNullableString(row.notes),
    receivedAt: asString(row.received_at),
    updatedAt: asString(row.updated_at),
  };
}

export const formSubmissionRepository = {
  async listFormSubmissions(): Promise<FormSubmission[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("form_submissions").select("*").order("received_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapFormSubmission);
  },

  async updateFormStatus(id: string, status: FormStatus): Promise<void> {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("form_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
