"use server";

import { revalidatePath } from "next/cache";
import { contentRepository } from "@/repositories/contentRepository";
import type { ContentBlock } from "@/types/cms";

export async function savePageBlocksAction(slug: string, blocks: ContentBlock[]): Promise<void> {
  await contentRepository.updatePageSections(slug, blocks);
  revalidatePath("/");
  revalidatePath(`/${slug === "accueil" ? "" : slug}`);
}
