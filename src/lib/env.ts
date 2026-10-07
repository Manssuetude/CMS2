import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Manssuétude <noreply@manssuetude.com>"),
  BREVO_API_KEY: z.string().optional(),
  ADMIN_INITIAL_EMAIL: z.string().email().optional(),
  ADMIN_INITIAL_PASSWORD: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  // Protège /api/cron/form-digest — voir ce fichier pour le détail. Vercel
  // l'envoie automatiquement en en-tête Authorization sur les invocations cron.
  CRON_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
