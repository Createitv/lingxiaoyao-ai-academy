/**
 * Patches source files for Next.js static export (output: 'export') compatibility.
 * Run BEFORE `next build` in the desktop build pipeline.
 * CI workspaces are disposable, so no restore step is needed.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..", "app");

let patched = 0;

function patch(relPath, transform) {
  const abs = join(appDir, relPath);
  try {
    const src = readFileSync(abs, "utf8");
    const out = transform(src);
    if (out !== src) {
      writeFileSync(abs, out);
      patched++;
      console.log(`  patched: ${relPath}`);
    }
  } catch (e) {
    console.warn(`  skip (not found): ${relPath}`);
  }
}

// ── 1. Replace "force-dynamic" → "force-static" ─────────────────────
const forceDynamicFiles = [
  "courses/page.tsx",
  "search/page.tsx",
];

for (const f of forceDynamicFiles) {
  patch(f, (src) =>
    src.replace(
      'export const dynamic = "force-dynamic"',
      'export const dynamic = "force-static"'
    )
  );
}

// ── 2. Add force-static to pages that use dynamic functions ──────────
//    (headers(), cookies() via getCurrentUser / requireAdmin)
const addForceStatic = [
  "(admin)/layout.tsx",
  "articles/page.tsx",
  "dashboard/page.tsx",
  "dashboard/orders/page.tsx",
];

for (const f of addForceStatic) {
  patch(f, (src) => {
    if (src.includes("export const dynamic")) return src; // already set
    // Insert after the last import statement
    const lines = src.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImport = i;
    }
    if (lastImport === -1) return src;
    lines.splice(lastImport + 1, 0, '\nexport const dynamic = "force-static";');
    return lines.join("\n");
  });
}

// ── 3. Add generateStaticParams to admin dynamic-route pages ─────────
const adminDynamicPages = [
  "(admin)/admin/articles/[id]/edit/page.tsx",
  "(admin)/admin/courses/[id]/edit/page.tsx",
  "(admin)/admin/courses/[id]/chapters/page.tsx",
  "(admin)/admin/courses/[id]/chapters/new/page.tsx",
  "(admin)/admin/courses/[id]/chapters/[chapterId]/edit/page.tsx",
  "(admin)/admin/users/[id]/edit/page.tsx",
  "(admin)/admin/series/[id]/edit/page.tsx",
];

for (const f of adminDynamicPages) {
  patch(f, (src) => {
    if (src.includes("generateStaticParams")) return src; // already has it
    const lines = src.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImport = i;
    }
    if (lastImport === -1) return src;
    lines.splice(
      lastImport + 1,
      0,
      "\nexport function generateStaticParams() {\n  return [];\n}"
    );
    return lines.join("\n");
  });
}

console.log(`desktop-prepare: ${patched} file(s) patched for static export`);
