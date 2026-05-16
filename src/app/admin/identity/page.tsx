import { MediaField } from "@/components/media/MediaField";

export default function AdminIdentity() {
  return (
    <section className="admin-panel">
      <h1>Identité visuelle</h1>
      <MediaField label="Logo" />
      <MediaField label="Favicon" />
      <MediaField label="Image fallback" />
    </section>
  );
}
