import { z } from "zod";

export const idSchema = z.string().min(1);

export const contentStatusSchema = z.enum(["draft", "review", "validated", "published", "archived"]);

export const visibilitySchema = z.enum([
  "public",
  "members",
  "commission",
  "project",
  "admin",
  "shared-draft",
  "archived",
  "private",
  "draft",
]);

export const formTypeSchema = z.enum([
  "join",
  "project",
  "content",
  "partner",
  "donation",
  "theme",
  "event",
  "contact",
]);

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  consent: z.literal("on", { errorMap: () => ({ message: "Le consentement est requis." }) }),
});

export const mediaMetadataSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  visibility: visibilitySchema.default("draft"),
});

export const externalMediaSchema = z.object({
  externalUrl: z.string().url(),
  title: z.string().optional(),
  type: z.string().optional(),
  tags: z.string().optional(),
  visibility: visibilitySchema.default("draft"),
});
