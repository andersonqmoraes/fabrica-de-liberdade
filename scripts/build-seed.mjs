#!/usr/bin/env node
/**
 * Reads drafts/*.md, parses frontmatter, and writes public/seed-articles.json
 * The admin /admin/import-drafts page fetches that JSON and creates Firestore docs.
 *
 * Usage:
 *   node scripts/build-seed.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DRAFTS = join(ROOT, "drafts");
const OUT = join(ROOT, "public", "seed-articles.json");

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { data: {}, content: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: text };
  const raw = text.slice(3, end).trim();
  const content = text.slice(end + 4).replace(/^\n/, "");
  const data = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Arrays in flow style [a, b, c]
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (val && !isNaN(Number(val))) {
      val = Number(val);
    }
    data[key] = val;
  }
  return { data, content };
}

function deriveExcerpt(content, fallback) {
  const lines = content.split("\n");
  // First paragraph after the H1
  let foundH1 = false;
  const paragraphs = [];
  for (const line of lines) {
    if (!foundH1 && line.startsWith("# ")) {
      foundH1 = true;
      continue;
    }
    if (foundH1) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (paragraphs.length > 0) break;
        continue;
      }
      if (trimmed.startsWith("#") || trimmed.startsWith(">") || trimmed.startsWith("-") || trimmed.startsWith("```")) {
        if (paragraphs.length > 0) break;
        continue;
      }
      paragraphs.push(trimmed);
    }
  }
  const text = paragraphs.join(" ").replace(/\s+/g, " ").trim();
  if (text.length > 0) return text.slice(0, 220).trim() + (text.length > 220 ? "..." : "");
  return fallback || "";
}

function deriveTitle(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  return fallback || "Sem título";
}

async function main() {
  const files = (await readdir(DRAFTS)).filter((f) => f.endsWith(".md")).sort();
  const articles = [];
  for (const file of files) {
    const text = await readFile(join(DRAFTS, file), "utf8");
    const { data, content } = parseFrontmatter(text);
    const title = data.metaTitle || deriveTitle(content);
    const excerpt = data.metaDescription || deriveExcerpt(content, data.metaDescription);
    articles.push({
      sourceFile: file,
      slug: data.slug,
      category: data.category,
      tags: Array.isArray(data.tags) ? data.tags : [],
      targetKeyword: data.targetKeyword || "",
      readTime: typeof data.readTime === "number" ? data.readTime : 7,
      publishedAtOffsetDays: typeof data.publishedAtOffset === "number" ? data.publishedAtOffset : 0,
      title,
      excerpt,
      metaTitle: data.metaTitle || title,
      metaDescription: data.metaDescription || excerpt,
      content,
    });
  }
  await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 2), "utf8");
  console.log(`Wrote ${articles.length} articles to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
