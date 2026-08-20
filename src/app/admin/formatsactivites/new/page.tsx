import Link from "next/link";
import { ActivityFormatForm } from "@/components/admin/ActivityFormatForm";
import { createActivityFormatAction } from "../actions";

export default function NewActivityFormatPage() {
  return (
    <section className="admin-panel">
      <Link href="/admin/formatsactivites" className="admin-back">
        ← Retour aux formats
      </Link>
      <div className="admin-page-header">
        <div>
          <h1>Nouveau format</h1>
          <p>Ajoutez une technique d&apos;animation au répertoire.</p>
        </div>
      </div>
      <ActivityFormatForm action={createActivityFormatAction} />
    </section>
  );
}
