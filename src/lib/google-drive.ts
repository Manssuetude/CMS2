import { env } from "@/lib/env";

export type GoogleDrivePickedFile = {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  size?: string;
};

export function getGooglePickerConfig() {
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    apiKey: env.GOOGLE_API_KEY,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  };
}

export async function checkDriveFileIsPublic(fileId: string, accessToken: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,webViewLink,permissions`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!response.ok) return { public: false, warning: "Impossible de vérifier les autorisations du fichier Drive." };
  const file = await response.json();
  const isPublic =
    Array.isArray(file.permissions) &&
    file.permissions.some((permission: { type: string }) => permission.type === "anyone");
  return {
    public: isPublic,
    warning: isPublic
      ? null
      : "Ce fichier Google Drive n'est peut-être pas public. Vérifiez les autorisations de partage.",
    file,
  };
}
