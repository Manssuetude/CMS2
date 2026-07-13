import { getSupabaseAdmin } from "@/lib/db";
import type { FormSubmission, FormType } from "@/types/cms";
import { asNullableString, asRecord, asString, type DataRow } from "@/utils/row";

function mapSubmission(row: DataRow): FormSubmission {
  return {
    id: asString(row.id),
    formType: asString(row.form_type) as FormType,
    data: asRecord(row.data),
    status: asString(row.status) as FormSubmission["status"],
    notes: asNullableString(row.notes),
    receivedAt: asString(row.received_at),
    updatedAt: asString(row.updated_at),
  };
}

export const formRepository = {
  async list() {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("form_submissions").select("*").order("received_at", { ascending: false });
    if (error) throw error;
    return data.map(mapSubmission);
  },

  async create(formType: FormType, data: Record<string, unknown>) {
    const db = getSupabaseAdmin();
    const { data: row, error } = await db
      .from("form_submissions")
      .insert({
        form_type: formType,
        data,
        status: "reçu",
      })
      .select()
      .single();
    if (error) throw error;
    return mapSubmission(row);
  },

  async updateStatus(id: string, status: FormSubmission["status"], notes?: string) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("form_submissions")
      .update({ status, notes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapSubmission(data);
  },
};
