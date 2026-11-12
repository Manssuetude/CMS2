import { notFound } from "next/navigation";
import { JoinEditorial } from "@/components/public/JoinEditorial";
import { requirePermission } from "@/lib/auth";
import { announcementService } from "@/services/announcementService";
import { loadJoinPage } from "@/services/joinPageService";

export const dynamic = "force-dynamic";

export default async function AnnouncementJoinPreview({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("annonces:view");
  const { id } = await params;
  const announcement = await announcementService.getForPreview(id);
  if (!announcement) notFound();
  const props = await loadJoinPage(announcement);
  if (!props) notFound();
  return <JoinEditorial {...props} />;
}
