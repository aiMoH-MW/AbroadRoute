"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Country, Program } from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import {
  CONTENT_TABLES,
  type ContentField,
  type ContentTableConfig,
  type ContentTableKey,
} from "@/lib/siteContentConfig";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

type Row = Record<string, any>;
type FormValues = Record<string, string | boolean>;

const TABLE_KEYS = Object.keys(CONTENT_TABLES) as ContentTableKey[];

function emptyForm(config: ContentTableConfig): FormValues {
  const form: FormValues = { sort_order: "0", is_active: true };
  config.fields.forEach((f) => {
    form[f.column] = f.type === "boolean" ? false : "";
  });
  return form;
}

function rowToForm(config: ContentTableConfig, row: Row): FormValues {
  const form = emptyForm(config);
  config.fields.forEach((f) => {
    const v = row[f.column];
    form[f.column] =
      f.type === "boolean" ? v === true : v === null || v === undefined ? "" : String(v);
  });
  form.sort_order = String(row.sort_order ?? 0);
  form.is_active = row.is_active !== false;
  return form;
}

/**
 * Admin editor for the site content tables (FAQs, country highlights and
 * costs, testimonials, trust badges, wallet packs, AI questions, settings).
 */
export function AdminSiteContentTab({
  countriesList,
  programsList,
}: {
  countriesList: Country[];
  programsList: Program[];
}) {
  const [tableKey, setTableKey] = useState<ContentTableKey>(TABLE_KEYS[0]);
  const config: ContentTableConfig = CONTENT_TABLES[tableKey];
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState("all");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<FormValues>(() => emptyForm(config));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const countryName = useCallback(
    (id: string) => countriesList.find((c) => c.id === id)?.name ?? id,
    [countriesList],
  );
  const programName = useCallback(
    (id: string) => programsList.find((p) => p.id === id)?.name ?? id,
    [programsList],
  );

  // How a stored value reads in the list (country/program ids → names)
  const displayValue = useCallback(
    (column: string, value: unknown): string => {
      if (value === null || value === undefined || value === "") return "";
      const field = config.fields.find((f) => f.column === column);
      if (field?.type === "country") return countryName(String(value));
      if (field?.type === "program") return programName(String(value));
      if (field?.type === "select") {
        return field.options?.find((o) => o.value === value)?.label ?? String(value);
      }
      return String(value);
    },
    [config, countryName, programName],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${tableKey}`, {
        headers: await getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load");
      setRows(json.rows);
    } catch (err: any) {
      setRows([]);
      setError(
        `${err.message || "Failed to load"}. If the table is missing, run migrations 0020 and 0021.`,
      );
    } finally {
      setLoading(false);
    }
  }, [tableKey]);

  useEffect(() => {
    setGroupFilter("all");
    load();
  }, [load]);

  const groups = useMemo(() => {
    if (!config.groupColumn) return [];
    const values = Array.from(
      new Set(rows.map((r) => r[config.groupColumn!]).filter(Boolean)),
    ) as string[];
    return values
      .map((v) => ({ value: v, label: displayValue(config.groupColumn!, v) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows, config, displayValue]);

  const visibleRows = rows.filter(
    (r) =>
      groupFilter === "all" ||
      !config.groupColumn ||
      r[config.groupColumn] === groupFilter,
  );

  const openForm = (row: Row | "new") => {
    const base = row === "new" ? emptyForm(config) : rowToForm(config, row);
    // New rows start in the group being viewed
    if (row === "new" && config.groupColumn && groupFilter !== "all") {
      base[config.groupColumn] = groupFilter;
    }
    setForm(base);
    setFormError(null);
    setEditing(row);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {};
      config.fields.forEach((f) => {
        body[f.column] = form[f.column];
      });
      body.sort_order = Number(form.sort_order) || 0;
      body.is_active = form.is_active === true;

      const isNew = editing === "new";
      const res = await fetch(
        isNew
          ? `/api/admin/content/${tableKey}`
          : `/api/admin/content/${tableKey}/${(editing as Row).id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify(body),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    const name = row[config.titleColumn] ?? "this row";
    if (!window.confirm(`Delete "${displayValue(config.titleColumn, name)}"?`)) return;
    const res = await fetch(`/api/admin/content/${tableKey}/${row.id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setError(json.error || "Delete failed");
      return;
    }
    load();
  };

  const renderInput = (f: ContentField) => {
    const value = form[f.column];
    const set = (v: string | boolean) => setForm((s) => ({ ...s, [f.column]: v }));
    if (f.type === "textarea") {
      return (
        <textarea
          rows={4}
          value={value as string}
          onChange={(e) => set(e.target.value)}
          className={inputClass}
        />
      );
    }
    if (f.type === "boolean") {
      return (
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => set(e.target.checked)}
          className="h-4 w-4 accent-[#102C57]"
        />
      );
    }
    if (f.type === "select" || f.type === "country" || f.type === "program") {
      const options =
        f.type === "country"
          ? countriesList.map((c) => ({ value: c.id, label: c.name }))
          : f.type === "program"
            ? programsList.map((p) => ({ value: p.id, label: p.name }))
            : (f.options ?? []);
      return (
        <select
          value={value as string}
          onChange={(e) => set(e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={f.type === "number" ? "number" : "text"}
        step={f.type === "number" ? "any" : undefined}
        value={value as string}
        onChange={(e) => set(e.target.value)}
        className={inputClass}
      />
    );
  };

  return (
    <div className="space-y-5">
      {/* Content type picker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#102C57]">
          <FileText className="h-4 w-4 text-[#EA5C2B]" />
          Site Content
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Text, lists and settings shown on the public site. Inactive rows are
          hidden from visitors.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TABLE_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setTableKey(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                key === tableKey
                  ? "bg-[#102C57] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {CONTENT_TABLES[key].title}
            </button>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#102C57]">{config.title}</h3>
            <p className="text-[11px] text-slate-500">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {groups.length > 0 && (
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
              >
                <option value="all">All ({rows.length})</option>
                {groups.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => openForm("new")}
              className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0c2242] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : visibleRows.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">
            Nothing added yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {visibleRows.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    {displayValue(config.titleColumn, row[config.titleColumn])}
                    {!row.is_active && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {[
                      config.groupColumn && groupFilter === "all"
                        ? displayValue(config.groupColumn, row[config.groupColumn])
                        : "",
                      config.subtitleColumn
                        ? displayValue(config.subtitleColumn, row[config.subtitleColumn])
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openForm(row)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#102C57] cursor-pointer"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(row)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add / edit form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#102C57]">
                {editing === "new" ? "Add" : "Edit"} · {config.title}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {config.fields.map((f) => (
                <div key={f.column}>
                  <label className={labelClass}>
                    {f.label}
                    {f.required && <span className="text-rose-500"> *</span>}
                  </label>
                  {renderInput(f)}
                  {f.hint && <p className="mt-1 text-[10px] text-slate-500">{f.hint}</p>}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Display order</label>
                  <input
                    type="number"
                    value={form.sort_order as string}
                    onChange={(e) => setForm((s) => ({ ...s, sort_order: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <label className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_active === true}
                    onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
                    className="h-4 w-4 accent-[#102C57]"
                  />
                  Active (shown on the site)
                </label>
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
                {formError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-5 py-2 text-xs font-bold text-white hover:bg-[#0c2242] disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
