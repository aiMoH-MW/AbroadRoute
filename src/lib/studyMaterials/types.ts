/** Client-safe types for the admin Study Data library. */

export type MaterialStatus = "uploaded" | "processing" | "completed" | "failed";

export interface Material {
  id: string;
  title: string;
  author: string | null;
  edition: string | null;
  description: string | null;
  exam_slug: string | null;
  program_slug: string | null;
  specialisation_slug: string | null;
  subject: string | null;
  tags: string[];
  language: string | null;
  storage_path: string;
  file_name: string;
  file_size_bytes: number | null;
  page_count: number | null;
  pages_processed: number;
  status: MaterialStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialPage {
  page_number: number;
  content: string;
}

export interface MaterialMetadataInput {
  title: string;
  author?: string;
  edition?: string;
  description?: string;
  examSlug?: string;
  programSlug?: string;
  specialisationSlug?: string;
  subject?: string;
  tags?: string[];
  language?: string;
}

export interface ProcessProgress {
  status: MaterialStatus;
  pageCount: number;
  pagesProcessed: number;
  done: boolean;
}
