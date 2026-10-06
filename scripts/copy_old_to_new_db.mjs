/**
 * Copies all data from the old Supabase project into the new one.
 *
 *   1. Run supabase/setup_new_project.sql in the NEW project's SQL Editor.
 *   2. Add to .env.local:
 *        OLD_SUPABASE_URL="https://<old-ref>.supabase.co"
 *        OLD_SUPABASE_SECRET_KEY="sb_secret_..."   (old project's secret / service_role key)
 *      NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY must point at the NEW project.
 *   3. node scripts/copy_old_to_new_db.mjs [--with-auth] [--skip-storage]
 *
 * Safe to re-run: rows are upserted by primary key and existing files are skipped.
 * --with-auth also recreates auth users (same id, email, metadata). Passwords
 * cannot be read through the API, so those users must reset their password.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  const env = { ...process.env };
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const raw = trimmed.slice(idx + 1).trim();
    // Quoted value: take what's inside the quotes; unquoted: drop any trailing "# comment".
    const quoted = raw.match(/^(["'])(.*?)\1/);
    env[trimmed.slice(0, idx).trim()] = quoted ? quoted[2] : raw.replace(/\s+#.*$/, "");
  }
  return env;
}

const env = loadEnv();
const args = new Set(process.argv.slice(2));

const OLD_URL = env.OLD_SUPABASE_URL;
const OLD_KEY = env.OLD_SUPABASE_SECRET_KEY || env.OLD_SUPABASE_SERVICE_ROLE_KEY;
const NEW_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const NEW_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error(
    "❌ Need OLD_SUPABASE_URL, OLD_SUPABASE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local",
  );
  process.exit(1);
}
if (OLD_URL.replace(/\/$/, "") === NEW_URL.replace(/\/$/, "")) {
  console.error("❌ OLD_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL are the same project.");
  process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const oldDb = createClient(OLD_URL, OLD_KEY, opts);
const newDb = createClient(NEW_URL, NEW_KEY, opts);

/**
 * Tables in foreign-key order. `old` lists the names the table may have in the
 * old project (first one found wins); `rename` maps old column names to new.
 */
const TABLES = [
  { name: "countries" },
  { name: "programs" },
  { name: "specialisations" },
  { name: "universities", drop: ["search_vector"] },
  { name: "university_claims" },
  { name: "courses" },
  { name: "leads" },
  { name: "buyers" },
  { name: "wallet_accounts" },
  { name: "wallet_transactions" },
  { name: "lead_deliveries" },
  { name: "student_shortlists" },
  { name: "counsellor_conversations" },
  { name: "ai_conversations" },
  { name: "ai_messages" },
  { name: "ai_counsellor_kb" },
  { name: "rag_embeddings" },
  { name: "test_module_settings", key: "exam_slug" },
  { name: "study_materials", old: ["study_materials", "books"] },
  {
    name: "study_material_pages",
    old: ["study_material_pages", "book_pages"],
    rename: { book_id: "material_id" },
    key: "material_id,page_number",
    batch: 200,
  },
  {
    name: "question_extraction_runs",
    rename: { book_id: "material_id" },
  },
  {
    name: "study_questions",
    old: ["study_questions", "book_questions"],
    rename: { book_id: "material_id" },
  },
];

const PAGE = 1000;

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await oldDb.from(table).select("*").range(from, from + PAGE - 1);
    if (error) return { error };
    rows.push(...data);
    if (data.length < PAGE) return { rows };
  }
}

async function writeAll(spec, rows) {
  const dropped = new Set(spec.drop ?? []);
  const batchSize = spec.batch ?? 500;
  const clean = (row) => {
    const out = {};
    for (const [col, val] of Object.entries(row)) {
      const target = spec.rename?.[col] ?? col;
      if (!dropped.has(target)) out[target] = val;
    }
    return out;
  };

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    for (;;) {
      const { error } = await newDb
        .from(spec.name)
        .upsert(batch.map(clean), { onConflict: spec.key ?? "id" });
      if (!error) break;

      // Column exists in the old project but not in the new schema: skip it and retry.
      const missing = error.message?.match(/Could not find the '([^']+)' column/);
      if (missing && !dropped.has(missing[1])) {
        console.warn(`   ⚠ ${spec.name}.${missing[1]} does not exist in the new schema — skipped`);
        dropped.add(missing[1]);
        continue;
      }
      return { error, written: start };
    }
  }
  return { written: rows.length, dropped: [...dropped] };
}

async function copyTables() {
  console.log("\n📦 Tables");
  const summary = [];

  for (const spec of TABLES) {
    let source = null;
    let result = null;
    let readError = null;
    for (const candidate of spec.old ?? [spec.name]) {
      result = await readAll(candidate);
      if (!result.error) {
        source = candidate;
        break;
      }
      // PGRST205 = table does not exist; anything else is a real failure.
      if (result.error.code !== "PGRST205") readError = result.error;
    }

    if (!source && readError) {
      console.log(`   ✗ ${spec.name.padEnd(26)} could not read old table: ${readError.message}`);
      summary.push({ table: spec.name, status: "failed", error: readError.message });
      continue;
    }
    if (!source) {
      console.log(`   – ${spec.name.padEnd(26)} not in old project, skipped`);
      summary.push({ table: spec.name, status: "absent" });
      continue;
    }
    if (result.rows.length === 0) {
      console.log(`   – ${spec.name.padEnd(26)} 0 rows`);
      summary.push({ table: spec.name, status: "empty" });
      continue;
    }

    const { error, written } = await writeAll(spec, result.rows);
    if (error) {
      console.log(`   ✗ ${spec.name.padEnd(26)} failed after ${written}/${result.rows.length}: ${error.message}`);
      summary.push({ table: spec.name, status: "failed", error: error.message });
    } else {
      const from = source === spec.name ? "" : ` (from ${source})`;
      console.log(`   ✓ ${spec.name.padEnd(26)} ${written} rows${from}`);
      summary.push({ table: spec.name, status: "ok", rows: written });
    }
  }
  return summary;
}

async function listFiles(storage, prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage.list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const item of data) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders have no id in Supabase Storage listings.
      if (item.id === null) files.push(...(await listFiles(storage, full)));
      else files.push({ path: full, contentType: item.metadata?.mimetype });
    }
    if (data.length < 1000) return files;
  }
}

async function copyStorage() {
  console.log("\n🗂  Storage");
  const { data: buckets, error } = await oldDb.storage.listBuckets();
  if (error) {
    console.log(`   ✗ Could not list old buckets: ${error.message}`);
    return;
  }

  const { data: newBuckets } = await newDb.storage.listBuckets();
  const existing = new Set((newBuckets ?? []).map((b) => b.id));

  for (const bucket of buckets) {
    if (!existing.has(bucket.id)) {
      const { error: createError } = await newDb.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit ?? undefined,
        allowedMimeTypes: bucket.allowed_mime_types ?? undefined,
      });
      if (createError) {
        console.log(`   ✗ ${bucket.id}: could not create bucket — ${createError.message}`);
        continue;
      }
    }

    const oldStorage = oldDb.storage.from(bucket.id);
    const newStorage = newDb.storage.from(bucket.id);
    const files = await listFiles(oldStorage);
    let copied = 0;
    let failed = 0;

    for (const file of files) {
      const { data: blob, error: downloadError } = await oldStorage.download(file.path);
      if (downloadError || !blob) {
        failed++;
        console.log(`   ✗ ${bucket.id}/${file.path}: download failed`);
        continue;
      }
      const { error: uploadError } = await newStorage.upload(file.path, blob, {
        contentType: file.contentType,
        upsert: false,
      });
      if (uploadError && !/exists/i.test(uploadError.message)) {
        failed++;
        console.log(`   ✗ ${bucket.id}/${file.path}: ${uploadError.message}`);
        continue;
      }
      copied++;
    }
    console.log(`   ✓ ${bucket.id.padEnd(26)} ${copied}/${files.length} files${failed ? `, ${failed} failed` : ""}`);
  }
}

async function copyAuthUsers() {
  console.log("\n👤 Auth users");
  let copied = 0;
  let skipped = 0;
  for (let page = 1; ; page++) {
    const { data, error } = await oldDb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.log(`   ✗ Could not list old users: ${error.message}`);
      return;
    }
    for (const user of data.users) {
      const { error: createError } = await newDb.auth.admin.createUser({
        id: user.id,
        email: user.email,
        phone: user.phone || undefined,
        email_confirm: Boolean(user.email_confirmed_at),
        phone_confirm: Boolean(user.phone_confirmed_at),
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      });
      if (createError) {
        skipped++;
        if (!/already|exists|registered/i.test(createError.message)) {
          console.log(`   ✗ ${user.email}: ${createError.message}`);
        }
      } else {
        copied++;
      }
    }
    if (data.users.length < 1000) break;
  }
  console.log(`   ✓ ${copied} users created, ${skipped} skipped (already present or failed)`);
  console.log("   ℹ Passwords are not copied — these users must use “forgot password” once.");
}

console.log(`Old: ${OLD_URL}\nNew: ${NEW_URL}`);

// Fail fast on bad keys instead of reporting every table as missing.
for (const [label, client] of [["old", oldDb], ["new", newDb]]) {
  const { error } = await client.storage.listBuckets();
  if (error) {
    console.error(`❌ The ${label} project rejected its key: ${error.message}`);
    process.exit(1);
  }
}

const summary = await copyTables();
if (!args.has("--skip-storage")) await copyStorage();
if (args.has("--with-auth")) await copyAuthUsers();

const failed = summary.filter((s) => s.status === "failed");
console.log(failed.length ? `\n⚠ Finished with ${failed.length} failed table(s).` : "\n✅ Copy finished.");
process.exit(failed.length ? 1 : 0);
