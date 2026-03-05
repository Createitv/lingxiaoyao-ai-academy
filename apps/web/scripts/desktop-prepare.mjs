/**
 * Patches source files for Next.js static export (output: 'export') compatibility.
 * Run BEFORE `next build` in the desktop build pipeline.
 * CI workspaces are disposable, so no restore step is needed.
 *
 * Strategy: aggressively remove server-dependent routes, stub auth modules,
 * and patch remaining pages for fully-static rendering.
 */
import { readFileSync, writeFileSync, rmSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..", "app");
const libDir = join(__dirname, "..", "lib");

let actions = 0;

function removeDir(rel) {
  const abs = join(appDir, rel);
  if (existsSync(abs)) {
    rmSync(abs, { recursive: true, force: true });
    actions++;
    console.log(`  rm -rf app/${rel}/`);
  }
}

function removeFile(rel) {
  const abs = join(appDir, rel);
  try { unlinkSync(abs); actions++; console.log(`  rm     app/${rel}`); } catch { /* skip */ }
}

function patch(rel, transform) {
  const abs = join(appDir, rel);
  try {
    const src = readFileSync(abs, "utf8");
    const out = transform(src);
    if (out !== src) { writeFileSync(abs, out); actions++; console.log(`  patch  app/${rel}`); }
  } catch { /* skip */ }
}

function writeLib(rel, content) {
  const abs = join(libDir, rel);
  try {
    writeFileSync(abs, content);
    actions++;
    console.log(`  stub   lib/${rel}`);
  } catch { /* skip */ }
}

function insertAfterImports(src, line) {
  const lines = src.split("\n");
  let last = -1;
  for (let i = 0; i < lines.length; i++) { if (/^import\s/.test(lines[i])) last = i; }
  if (last === -1) return src;
  lines.splice(last + 1, 0, line);
  return lines.join("\n");
}

console.log("desktop-prepare: patching for static export...\n");

// ═══════════════════════════════════════════════════════════════════
// 1. Remove entire directories that are server-only / need auth+DB
// ═══════════════════════════════════════════════════════════════════
removeDir("api");
removeDir("(admin)");
removeDir("dashboard");
removeDir("payment");
// Dynamic-route pages that import getCurrentUser → session.ts → next/headers
// are incompatible with output: 'export'. Remove entirely.
removeDir("articles/[slug]");
removeDir("courses/[slug]");
// Nested series article pages — Prisma module loading prevents Next.js
// from seeing generateStaticParams in output: 'export' context.
removeDir("series/[seriesSlug]/[slug]");

// ═══════════════════════════════════════════════════════════════════
// 2. Remove OG image files (incompatible with static export —
//    generateStaticParams is ignored in opengraph-image files)
// ═══════════════════════════════════════════════════════════════════
removeFile("opengraph-image.tsx");

// ═══════════════════════════════════════════════════════════════════
// 3. Stub auth/session.ts to eliminate next/headers from import chain
//    Pages like articles/page.tsx import getCurrentUser which calls
//    headers()/cookies() — these throw in static export context.
// ═══════════════════════════════════════════════════════════════════
writeLib("auth/session.ts", `\
import type { User } from "@workspace/types";

export async function getCurrentUser(): Promise<User | null> {
  return null;
}

export function getSessionCookieOptions() {
  return {
    name: "lxy_session",
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
`);

// ═══════════════════════════════════════════════════════════════════
// 4. Replace "force-dynamic" → "force-static"
// ═══════════════════════════════════════════════════════════════════
for (const f of ["courses/page.tsx", "search/page.tsx"]) {
  patch(f, (src) =>
    src.replace('export const dynamic = "force-dynamic"', 'export const dynamic = "force-static"')
  );
}

// ═══════════════════════════════════════════════════════════════════
// 5. Add force-static to pages that need it
// ═══════════════════════════════════════════════════════════════════
for (const f of ["articles/page.tsx"]) {
  patch(f, (src) => {
    if (src.includes("export const dynamic")) return src;
    return insertAfterImports(src, '\nexport const dynamic = "force-static";');
  });
}

// ═══════════════════════════════════════════════════════════════════
// 6. Fix sitemap.ts — replace revalidate with force-static
// ═══════════════════════════════════════════════════════════════════
patch("sitemap.ts", (src) =>
  src.replace(/export const revalidate = \d+;/, 'export const dynamic = "force-static";')
);

console.log(`\ndesktop-prepare: ${actions} action(s) completed`);
