"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { getAuthHeaders, supabase } from "@/lib/supabase/client";
import {
  UNIVERSITY_MEDIA_BUCKET,
  UNIVERSITY_MEDIA_HINTS,
  UNIVERSITY_MEDIA_MAX_BYTES,
  UNIVERSITY_MEDIA_TYPES,
  UniversityMediaKind,
} from "@/lib/universityMedia";

interface Props {
  slug: string;
  kind: UniversityMediaKind;
  url?: string;
  disabled?: boolean;
  onChange: (url: string | undefined) => void;
}

async function callMediaApi(method: "POST" | "PUT" | "DELETE", body: object) {
  const res = await fetch("/api/universities/media", {
    method,
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || "Request failed");
  return json;
}

/** Uploads, replaces or removes a university's logo or banner. Saves immediately. */
export function UniversityMediaUploader({ slug, kind, url, disabled, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const label = kind === "logo" ? "Logo" : "Banner Image";

  const upload = async (file: File) => {
    setError("");
    if (!UNIVERSITY_MEDIA_TYPES[file.type]) {
      setError("Only PNG, JPG or WebP images are allowed.");
      return;
    }
    if (file.size > UNIVERSITY_MEDIA_MAX_BYTES[kind]) {
      setError(`File is too large (max ${UNIVERSITY_MEDIA_MAX_BYTES[kind] / (1024 * 1024)} MB).`);
      return;
    }
    setBusy(true);
    try {
      const { path, token } = await callMediaApi("POST", {
        slug,
        kind,
        contentType: file.type,
        size: file.size,
      });
      const { error: uploadError } = await supabase.storage
        .from(UNIVERSITY_MEDIA_BUCKET)
        .uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);
      const saved = await callMediaApi("PUT", { slug, kind, path });
      onChange(saved.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove the ${label.toLowerCase()}?`)) return;
    setError("");
    setBusy(true);
    try {
      await callMediaApi("DELETE", { slug, kind });
      onChange(undefined);
    } catch (err: any) {
      setError(err.message || "Could not remove the image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="block font-bold text-slate-700 mb-1">{label}</label>
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 ${
          kind === "logo" ? "h-24 w-24" : "h-24 w-full"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`${label} preview`}
            className={`h-full w-full ${kind === "logo" ? "object-contain p-2" : "object-cover"}`}
          />
        ) : (
          <ImagePlus className="h-6 w-6 text-slate-400" />
        )}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{UNIVERSITY_MEDIA_HINTS[kind]}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-label={`Upload ${label.toLowerCase()}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          disabled={busy || disabled}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-bold text-[#102C57] hover:bg-slate-50 transition disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
          <span>{url ? "Replace" : "Upload"}</span>
        </button>
        {url && (
          <button
            type="button"
            disabled={busy || disabled}
            onClick={remove}
            className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 font-bold text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            <span>Remove</span>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-700">{error}</p>}
    </div>
  );
}
