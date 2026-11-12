import { notFound } from "next/navigation";
import { HomeEditorial } from "@/components/public/HomeEditorial";
import { requirePermission } from "@/lib/auth";
import { announcementService } from "@/services/announcementService";
import { loadHomePage } from "@/services/homePageService";

export const dynamic = "force-dynamic";

export default async function AnnouncementHomePreview({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("annonces:view");
  const { id } = await params;
  const announcement = await announcementService.getForPreview(id);
  if (!announcement) notFound();
  const props = await loadHomePage(announcement);
  if (!props) notFound();
  return <HomeEditorial {...props} />;
}
