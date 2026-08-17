// Rôle RBAC personnalisable (table `roles`). `isAdmin` = rôle tout-puissant figé.
export type Role = {
  id: string;
  key: string;
  label: string;
  isAdmin: boolean;
  permissions: string[]; // clés "section:action"
};
export type ContentStatus = "draft" | "review" | "validated" | "published" | "archived";
export type ProgressStatus = "idea" | "preparation" | "active" | "completed" | "paused";
export type MediaSource = "upload" | "google-drive" | "external-url" | "youtube" | "vimeo";
export type MediaType = "image" | "video" | "pdf" | "document" | "audio" | "archive";
export type Visibility =
  | "public"
  | "members"
  | "commission"
  | "project"
  | "admin"
  | "shared-draft"
  | "archived"
  | "private"
  | "draft";
export type FormType = "join" | "project" | "content" | "partner" | "donation" | "theme" | "activity";
export type FormStatus = "reçu" | "en cours" | "traité" | "archivé";
export type CtaTarget = string | `FORM:${"join" | "project" | "content" | "partner" | "don" | "theme" | "activity"}`;

export type ContentBlock =
  | {
      id?: string;
      type: "hero";
      variant: "minimal" | "editorial" | "immersive" | "dark" | "split";
      title: string;
      text?: string;
      mediaId?: string;
      cta?: CtaTarget;
      visible?: boolean;
    }
  | {
      id?: string;
      type: "editorial";
      variant: "light" | "cream" | "dark" | "split";
      title?: string;
      body: string;
      visible?: boolean;
    }
  | { id?: string; type: "heading"; value: string; visible?: boolean }
  | { id?: string; type: "paragraph"; value: string; visible?: boolean }
  | { id?: string; type: "quote"; value: string; source?: string; visible?: boolean }
  | { id?: string; type: "image"; mediaId?: string; src?: string; caption?: string; ratio?: string; visible?: boolean }
  | { id?: string; type: "gallery"; mediaIds: string[]; variant: "grid" | "masonry" | "editorial"; visible?: boolean }
  | {
      id?: string;
      type: "feed";
      source: "productions" | "projects" | "resources" | "activities";
      variant: "compact" | "featured" | "editorial" | "media" | "masonry";
      limit?: number;
      visible?: boolean;
    }
  | { id?: string; type: "file"; mediaId?: string; url?: string; label: string; visible?: boolean }
  | { id?: string; type: "video"; mediaId?: string; url?: string; label?: string; visible?: boolean }
  | {
      id?: string;
      type: "cta";
      variant: "primary" | "secondary" | "ghost" | "premium-black";
      label: string;
      target: CtaTarget;
      visible?: boolean;
    }
  | { id?: string; type: "timeline"; items: string[]; visible?: boolean }
  | { id?: string; type: "faq"; items: Array<{ question: string; answer: string }>; visible?: boolean }
  | { id?: string; type: "references"; items: string[]; visible?: boolean }
  | { id?: string; type: "list"; items: string[]; visible?: boolean };

export type Media = {
  id: string;
  title: string;
  filename: string;
  source: MediaSource;
  type: MediaType;
  mimeType: string;
  url: string;
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
  size?: string | null;
  alt?: string | null;
  caption?: string | null;
  description?: string | null;
  tags: string[];
  visibility: Visibility;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Recadrage non destructif d'une image, appliqué en CSS à l'affichage.
 * x, y, width, height = croppedArea de react-easy-crop (pourcentages de l'image).
 * zoom = échelle de l'éditeur, conservée uniquement pour restaurer l'état d'édition.
 */
export type ImageCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string | null;
  body?: string | null;
  imageId?: string | null;
  imageUrl?: string | null;
  imageCrop?: ImageCrop | null;
  focusImageUrl?: string | null;
  focusImageCrop?: ImageCrop | null;
  image?: Media | null;
  quote?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaTarget?: CtaTarget | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaTarget?: CtaTarget | null;
  sections: ContentBlock[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageId?: string | null;
  status: ContentStatus;
  updatedAt: string;
};

export type Theme = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string | null;
  description?: string | null;
  longDescription?: string | null;
  heroImageId?: string | null;
  thumbnailId?: string | null;
  status: ContentStatus;
  progressStatus?: ProgressStatus | null;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Production = {
  id: string;
  slug: string;
  title: string;
  type: string;
  description?: string | null;
  body?: string | null;
  contentBlocks: ContentBlock[];
  author?: string | null;
  date?: string | null;
  thumbnailId?: string | null;
  fileId?: string | null;
  downloadLabel?: string | null;
  videoUrl?: string | null;
  readingTime?: string | null;
  pages?: string | null;
  tags: string[];
  status: ContentStatus;
  featured: boolean;
  subThemeIds?: string[];
  authorIds?: string[];
  resourceIds?: string[];
  createdAt: string;
  updatedAt: string;
};

// Sujet traité au sein d'un thème (ex. thème "Écologie" → sous-thème "Sobriété énergétique").
// Peut regrouper 0, 1 ou plusieurs productions.
export type SubTheme = {
  id: string;
  themeId: string;
  slug: string;
  title: string;
  description?: string | null;
  longDescription?: string | null;
  date?: string | null;
  status: ContentStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Speaker = {
  name: string;
  role?: string;
};

export type RegistrationStatus = "a-venir" | "ouvertes" | "complet" | "termine";

export type Activity = {
  id: string;
  slug: string;
  title: string;
  format: string;
  description?: string | null;
  body?: string | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  capacity?: string | null;
  eventbriteUrl?: string | null;
  registrationStatus?: RegistrationStatus | null;
  status: ContentStatus;
  progressStatus?: ProgressStatus | null;
  gallery: string[];
  documents: string[];
  speakers: Speaker[];
  featured: boolean;
  themeIds?: string[];
  projectIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  status: ContentStatus;
  progressStatus?: ProgressStatus | null;
  priority?: string | null;
  description?: string | null;
  body?: string | null;
  objectives: string[];
  deliverables: string[];
  documents: string[];
  featured: boolean;
  themeIds?: string[];
  productionIds?: string[];
  activityIds?: string[];
  createdAt: string;
  updatedAt: string;
};

// Fiche auteur réutilisable, reliable à plusieurs productions
// (remplace le champ texte libre Production.author pour les productions
// qui veulent une fiche complète — le champ texte reste un repli simple).
export type Author = {
  id: string;
  name: string;
  bio?: string | null;
  photoId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FormSubmission = {
  id: string;
  formType: FormType;
  data: Record<string, unknown>;
  status: FormStatus;
  notes?: string | null;
  receivedAt: string;
  updatedAt: string;
};

export type FooterLink = {
  label: string;
  url: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterConfig = {
  description?: string;
  columns?: FooterColumn[];
  socialLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  newsletterEnabled?: boolean;
};
