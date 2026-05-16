export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      pages: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      themes: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      productions: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      activities: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      projects: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      resources: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      form_submissions: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
      site_settings: { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> };
    };
  };
};
