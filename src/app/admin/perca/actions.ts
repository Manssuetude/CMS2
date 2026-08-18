"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageRepository } from "@/repositories/pageRepository";
import { logAction } from "@/lib/audit";

function parsePercaSteps(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const { letter, word, title, body } = entry as Record<string, unknown>;
      if (typeof letter !== "string" || typeof word !== "string") return [];
      return [
        {
          letter,
          word,
          title: typeof title === "string" && title.trim() ? title.trim() : null,
          body: typeof body === "string" && body.trim() ? body : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function savePercaFieldsAction(formData: FormData): Promise<void> {
  const fields: Record<string, unknown> = {
    eyebrow: formData.get("eyebrow") || null,
    title: formData.get("title") || null,
    body: formData.get("body") || null,
    perca_steps: parsePercaSteps(formData.get("percaSteps")),
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  };
  await pageRepository.updatePage("perca", fields);
  await logAction("update", { entityType: "page", entityId: "perca", summary: "Page PERCA modifiée" });
  revalidatePath("/perca");
  redirect("/admin/perca?saved=1");
}
