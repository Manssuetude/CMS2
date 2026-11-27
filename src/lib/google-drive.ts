import { env } from "@/lib/env";

export function getGooglePickerConfig() {
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    apiKey: env.GOOGLE_API_KEY,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  };
}
