"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Program, Specialisation } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { fetchLiveSpecialisations } from "@/lib/supabase/dataFetchers";
import { TEST_PREP_EXAMS } from "@/lib/data/testPrepData";
import type { Book, BookPage, ProcessProgress } from "@/lib/books/types";

interface Props {
  programsList: Program[];
}

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const PAGES_PER_VIEW = 20;

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

const STATUS_STYLES: Record<Book["status"], string> = {
  uploaded: "bg-slate-100 text-slate-700",
  processing: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-700",
};

const EMPTY_FORM = {
  title: "",
  author: "",
  edition: "",
  description: "",
  examSlug: "",
  programSlug: "",
  specialisationSlug: "",
  subject: "",
  tags: "",
  language: "English",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  return bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export function AdminBooksTab({ programsList }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialisations, setSpecialisations] = useState<Specialisation[]>([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterExam, setFilterExam] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Book ids with an OCR loop currently running in this browser tab.
  const [activeJobs, setActiveJobs] = useState<Set<string>>(new Set());
  const activeJobsRef = useRef<Set<string>>(new Set());

  const [viewer, setViewer] = useState<{
    book: Book;
    pages: BookPage[];
    from: number;
    pdfUrl: string | null;
    loading: boolean;
  } | null>(null);

  const examNames = useMemo(
    () => Object.fromEntries(TEST_PREP_EXAMS.map((e) => [e.slug, e.shortName])),
    [],
  );
  const programNames = useMemo(
    () => Object.fromEntries(programsList.map((p) => [p.slug, p.name])),
    [programsList],
  );
  const specialisationNames = useMemo(
    () => Object.fromEntries(specialisations.map((s) => [s.slug, s.name])),
    [specialisations],
  );
  const programSpecialisations = specialisations.filter(
    (s) => !form.programSlug || s.programSlug === form.programSlug,
  );

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterExam) params.set("exam", filterExam);
      if (filterProgram) params.set("program", filterProgram);
      if (debouncedQuery) params.set("q", debouncedQuery);
      const res = await fetch(`/api/admin/books?${params}`);
      const data = await res.json();
      if (data.success) {
        setBooks(data.items);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to load books" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error loading books." });
    } finally {
      setLoading(false);
    }
  }, [filterExam, filterProgram, debouncedQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    fetchLiveSpecialisations().then(setSpecialisations);
  }, []);

  const updateBook = (id: string, patch: Partial<Book>) =>
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const setJobActive = (id: string, active: boolean) => {
    const next = new Set(activeJobsRef.current);
    if (active) next.add(id);
    else next.delete(id);
    activeJobsRef.current = next;
    setActiveJobs(next);
  };

  /** Prepares the book if needed, then OCRs chunk by chunk until done or an error occurs. */
  const runProcessing = async (book: Book) => {
    if (activeJobsRef.current.has(book.id)) return;
    setJobActive(book.id, true);
    updateBook(book.id, { status: "processing", error_message: null });

    try {
      if (!book.page_count) {
        const res = await fetch(`/api/admin/books/${book.id}/prepare`, { method: "POST" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to prepare PDF");
        updateBook(book.id, { page_count: data.pageCount, pages_processed: 0 });
      }

      while (activeJobsRef.current.has(book.id)) {
        const res = await fetch(`/api/admin/books/${book.id}/process`, { method: "POST" });
        const data: ProcessProgress & { success: boolean; error?: string } = await res.json();
        if (!data.success) throw new Error(data.error || "OCR failed");
        updateBook(book.id, {
          status: data.status,
          page_count: data.pageCount,
          pages_processed: data.pagesProcessed,
        });
        if (data.done) break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      updateBook(book.id, { status: "failed", error_message: message });
    } finally {
      setJobActive(book.id, false);
    }
  };

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setStatusMessage({ type: "error", text: "Please choose a PDF file." });
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setStatusMessage({ type: "error", text: "PDF must be 100 MB or smaller." });
      return;
    }
    setFile(selected);
    setStatusMessage(null);
    if (!form.title) {
      setForm((f) => ({ ...f, title: selected.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ") }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage({ type: "error", text: "Please choose a PDF to upload." });
      return;
    }
    if (form.title.trim().length < 2) {
      setStatusMessage({ type: "error", text: "Please enter the book title." });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          fileName: file.name,
          fileSize: file.size,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create book");

      const { error: uploadError } = await supabase.storage
        .from(data.upload.bucket)
        .uploadToSignedUrl(data.upload.path, data.upload.token, file, {
          contentType: "application/pdf",
        });
      if (uploadError) {
        // Remove the orphaned record so it doesn't sit in the list without a file.
        await fetch(`/api/admin/books/${data.book.id}`, { method: "DELETE" });
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const book: Book = data.book;
      setBooks((prev) => [book, ...prev]);
      setForm(EMPTY_FORM);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatusMessage({
        type: "success",
        text: `"${book.title}" uploaded. OCR has started — keep this tab open until it completes.`,
      });
      runProcessing(book);
    } catch (err) {
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete "${book.title}" and all its extracted text? This cannot be undone.`)) {
      return;
    }
    setJobActive(book.id, false);
    const res = await fetch(`/api/admin/books/${book.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      if (viewer?.book.id === book.id) setViewer(null);
    } else {
      setStatusMessage({ type: "error", text: data.error || "Delete failed" });
    }
  };

  const openViewer = async (book: Book, from = 1) => {
    setViewer((v) => ({
      book,
      pages: v?.book.id === book.id ? v.pages : [],
      from,
      pdfUrl: v?.book.id === book.id ? v.pdfUrl : null,
      loading: true,
    }));
    try {
      const res = await fetch(`/api/admin/books/${book.id}?from=${from}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setViewer({ book: data.book, pages: data.pages, from, pdfUrl: data.pdfUrl, loading: false });
    } catch {
      setViewer(null);
      setStatusMessage({ type: "error", text: "Failed to load extracted text." });
    }
  };

  const tagsFor = (book: Book) =>
    [
      book.exam_slug && (examNames[book.exam_slug] || book.exam_slug),
      book.program_slug && (programNames[book.program_slug] || book.program_slug),
      book.specialisation_slug && (specialisationNames[book.specialisation_slug] || book.specialisation_slug),
      book.subject,
      ...book.tags,
    ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <div className="flex items-start gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload a Book</h3>
                <p className="text-[11px] text-slate-500">
                  PDF up to 100 MB. Text is extracted page by page with Gemini OCR.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className={labelClass}>
                  PDF File <span className="text-rose-500">*</span>
                </label>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e.dataTransfer.files?.[0] ?? null);
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center hover:border-[#102C57]/40"
                >
                  <FileText className="h-6 w-6 text-slate-400" />
                  {file ? (
                    <span className="text-xs font-bold text-slate-800">
                      {file.name} · {formatBytes(file.size)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Drop a PDF here or click to browse</span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <div>
                <label className={labelClass}>
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Official Guide to the GRE General Test"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Edition / Year</label>
                  <input
                    type="text"
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                    placeholder="e.g., 3rd Ed. 2025"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Exam</label>
                <select
                  value={form.examSlug}
                  onChange={(e) => setForm({ ...form, examSlug: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Not exam-specific</option>
                  {TEST_PREP_EXAMS.map((exam) => (
                    <option key={exam.slug} value={exam.slug}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Program</label>
                  <select
                    value={form.programSlug}
                    onChange={(e) => setForm({ ...form, programSlug: e.target.value, specialisationSlug: "" })}
                    className={inputClass}
                  >
                    <option value="">Any program</option>
                    {programsList.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Specialisation</label>
                  <select
                    value={form.specialisationSlug}
                    onChange={(e) => setForm({ ...form, specialisationSlug: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Any specialisation</option>
                    {programSpecialisations.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Subject / Section</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g., Quantitative Reasoning"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g., practice questions, vocabulary"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#102C57] py-3 text-xs font-bold text-white hover:bg-[#0b1f3f] transition disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? "Uploading…" : "Upload & Extract Text"}
              </button>
            </form>
          </div>
        </div>

        {/* Library */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <BookMarked className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Books Library ({books.length})</h3>
              </div>
              <button
                onClick={fetchBooks}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, author…"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className={inputClass}>
                <option value="">All exams</option>
                {TEST_PREP_EXAMS.map((exam) => (
                  <option key={exam.slug} value={exam.slug}>
                    {exam.shortName}
                  </option>
                ))}
              </select>
              <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} className={inputClass}>
                <option value="">All programs</option>
                {programsList.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {loading && books.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading books…
              </div>
            ) : books.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-500">No books uploaded yet.</p>
            ) : (
              <ul className="space-y-3">
                {books.map((book) => {
                  const running = activeJobs.has(book.id);
                  const total = book.page_count ?? 0;
                  const percent = total ? Math.round((book.pages_processed / total) * 100) : 0;
                  return (
                    <li key={book.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{book.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {[book.author, book.edition, formatBytes(book.file_size_bytes), total ? `${total} pages` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[book.status]}`}
                        >
                          {book.status}
                        </span>
                      </div>

                      {tagsFor(book).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tagsFor(book).map((tag) => (
                            <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {book.status !== "completed" && total > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-[#102C57] transition-all" style={{ width: `${percent}%` }} />
                          </div>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {book.pages_processed} / {total} pages extracted ({percent}%)
                          </p>
                        </div>
                      )}

                      {book.status === "failed" && book.error_message && (
                        <p className="mt-2 text-[11px] font-semibold text-rose-600">{book.error_message}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {book.pages_processed > 0 && (
                          <button
                            onClick={() => openViewer(book)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Text
                          </button>
                        )}
                        {book.status !== "completed" &&
                          (running ? (
                            <button
                              onClick={() => setJobActive(book.id, false)}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Extracting… (Pause)
                            </button>
                          ) : (
                            <button
                              onClick={() => runProcessing(book)}
                              className="flex items-center gap-1.5 rounded-lg bg-[#102C57] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0b1f3f]"
                            >
                              <Play className="h-3.5 w-3.5" />
                              {book.status === "failed" ? "Retry" : book.pages_processed > 0 ? "Resume" : "Start OCR"}
                            </button>
                          ))}
                        <button
                          onClick={() => handleDelete(book)}
                          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Extracted text viewer */}
      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setViewer(null)}>
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{viewer.book.title}</p>
                <p className="text-[11px] text-slate-500">
                  {viewer.book.pages_processed} of {viewer.book.page_count ?? "?"} pages extracted
                </p>
              </div>
              <div className="flex items-center gap-2">
                {viewer.pdfUrl && (
                  <a
                    href={viewer.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open PDF
                  </a>
                )}
                <button onClick={() => setViewer(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {viewer.loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading pages…
                </div>
              ) : viewer.pages.length === 0 ? (
                <p className="py-12 text-center text-xs text-slate-500">No extracted pages in this range.</p>
              ) : (
                viewer.pages.map((page) => (
                  <div key={page.page_number} className="rounded-2xl border border-slate-200">
                    <p className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Page {page.page_number}
                    </p>
                    <pre className="whitespace-pre-wrap break-words p-4 font-sans text-xs leading-relaxed text-slate-800">
                      {page.content || <span className="italic text-slate-400">(blank page)</span>}
                    </pre>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4">
              <button
                disabled={viewer.from <= 1 || viewer.loading}
                onClick={() => openViewer(viewer.book, Math.max(1, viewer.from - PAGES_PER_VIEW))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-[11px] text-slate-500">
                Pages {viewer.from}–{viewer.from + Math.max(viewer.pages.length, 1) - 1}
              </span>
              <button
                disabled={viewer.loading || viewer.pages.length < PAGES_PER_VIEW}
                onClick={() => openViewer(viewer.book, viewer.from + PAGES_PER_VIEW)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
