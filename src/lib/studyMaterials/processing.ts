import "server-only";
import { PDFDocument } from "pdf-lib";
import { SchemaType } from "@google/generative-ai";
import { genAI, GEMINI_CHAT_MODEL } from "@/lib/gemini/client";

export const STUDY_MATERIALS_BUCKET = "books";

/** Pages sent to Gemini per OCR request; small enough to finish well inside a request timeout. */
export const PAGES_PER_CHUNK = 5;

const OCR_MODEL = process.env.GEMINI_OCR_MODEL || GEMINI_CHAT_MODEL;

/** Characters per stored "page" when a plain-text file is split up. */
const TEXT_PAGE_CHARS = 3000;

export type MaterialFileKind = "pdf" | "txt";

export const materialFileKind = (fileName: string): MaterialFileKind =>
  fileName.toLowerCase().endsWith(".txt") ? "txt" : "pdf";

export const materialPaths = {
  original: (materialId: string, kind: MaterialFileKind = "pdf") => `${materialId}/original.${kind}`,
  chunk: (materialId: string, chunkIndex: number) =>
    `${materialId}/chunks/${String(chunkIndex).padStart(4, "0")}.pdf`,
  chunksDir: (materialId: string) => `${materialId}/chunks`,
};

/**
 * Splits a PDF into PAGES_PER_CHUNK-page PDFs so each OCR request only
 * downloads and sends a few pages instead of the whole material.
 */
export async function splitPdf(bytes: Uint8Array): Promise<{ pageCount: number; chunks: Uint8Array[] }> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = source.getPageCount();
  const chunks: Uint8Array[] = [];

  for (let start = 0; start < pageCount; start += PAGES_PER_CHUNK) {
    const indices = Array.from(
      { length: Math.min(PAGES_PER_CHUNK, pageCount - start) },
      (_, i) => start + i,
    );
    const chunkDoc = await PDFDocument.create();
    const pages = await chunkDoc.copyPages(source, indices);
    pages.forEach((page) => chunkDoc.addPage(page));
    chunks.push(await chunkDoc.save());
  }

  return { pageCount, chunks };
}

/**
 * Splits plain text into page-sized pieces. Form feeds are treated as explicit
 * page breaks; otherwise text is cut at paragraph (or line) boundaries near
 * TEXT_PAGE_CHARS so pages stay readable.
 */
export function splitTextIntoPages(text: string): string[] {
  const normalised = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const sections = normalised.includes("\f") ? normalised.split("\f") : [normalised];
  const pages: string[] = [];

  for (const section of sections) {
    let rest = section.trim();
    while (rest.length > TEXT_PAGE_CHARS) {
      const window = rest.slice(0, TEXT_PAGE_CHARS);
      let cut = window.lastIndexOf("\n\n");
      if (cut < TEXT_PAGE_CHARS / 2) cut = window.lastIndexOf("\n");
      if (cut < TEXT_PAGE_CHARS / 2) cut = window.lastIndexOf(" ");
      if (cut < TEXT_PAGE_CHARS / 2) cut = TEXT_PAGE_CHARS;
      pages.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) pages.push(rest);
  }

  return pages;
}

/**
 * OCRs a small PDF with Gemini (handles both scanned images and text PDFs).
 * Returns one string per page, in order.
 */
export async function ocrPdfChunk(bytes: Uint8Array, expectedPages: number): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: OCR_MODEL,
    systemInstruction:
      "You are a precise OCR engine. You transcribe documents verbatim and never summarise, translate, correct or add commentary.",
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 32768,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
      },
    },
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: Buffer.from(bytes).toString("base64"),
      },
    },
    {
      text: `This PDF has ${expectedPages} page(s). Transcribe ALL text on each page exactly as printed, in reading order. Keep headings, paragraphs, numbered lists and question options on separate lines; render tables as Markdown tables and formulas in plain text. Skip running headers/footers and page numbers. Return a JSON array of exactly ${expectedPages} strings, one per page in order; use "" for a blank page.`,
    },
  ]);

  let pages: unknown;
  try {
    pages = JSON.parse(result.response.text());
  } catch {
    throw new Error("OCR returned an unreadable response (output may have been truncated).");
  }
  if (!Array.isArray(pages)) {
    throw new Error("OCR returned an unexpected response format.");
  }

  // Normalise to exactly one entry per page so page numbers stay aligned.
  return Array.from({ length: expectedPages }, (_, i) =>
    typeof pages[i] === "string" ? (pages[i] as string).trim() : "",
  );
}
