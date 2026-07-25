/**
 * Generates public/sitemap.xml from the app's static routes plus dynamic
 * blog posts, funnels, and landing pages pulled from Supabase.
 * Runs via predev / prebuild hooks in package.json.
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://naftracks.lovable.app";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
];

function xml(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const entries: SitemapEntry[] = [...staticEntries];

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const [posts, funnels, pages] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("slug, updated_at, publish_date")
          .eq("status", "published"),
        supabase.from("funnels").select("slug, updated_at").eq("status", "published"),
        supabase.from("pages").select("slug, updated_at").eq("status", "published"),
      ]);

      for (const p of posts.data ?? []) {
        entries.push({
          path: `/blog/${p.slug}`,
          lastmod: (p.updated_at ?? p.publish_date)?.slice(0, 10),
          changefreq: "monthly",
          priority: "0.7",
        });
      }
      for (const f of funnels.data ?? []) {
        entries.push({ path: `/f/${f.slug}`, changefreq: "monthly", priority: "0.6" });
      }
      for (const pg of pages.data ?? []) {
        entries.push({ path: `/p/${pg.slug}`, changefreq: "monthly", priority: "0.6" });
      }
    } catch (err) {
      console.warn("[sitemap] dynamic fetch failed, using static routes only:", err);
    }
  } else {
    console.warn("[sitemap] no Supabase env vars found; static routes only");
  }

  writeFileSync(resolve("public/sitemap.xml"), xml(entries));
  console.log(`[sitemap] wrote ${entries.length} entries to public/sitemap.xml`);
}

main().catch((e) => {
  console.error("[sitemap] failed:", e);
  process.exit(0); // don't block dev/build
});
