import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlockRenderer from "@/components/page-builder/BlockRenderer";
import { BlockData } from "@/components/page-builder/blockTypes";
import NotFound from "./NotFound";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: p } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (!p) { setNotFound(true); setLoading(false); return; }
      setPage(p);
      const { data: b } = await supabase
        .from("page_blocks")
        .select("*")
        .eq("page_id", (p as any).id)
        .eq("visible", true)
        .order("sort_order");
      setBlocks((b as BlockData[]) ?? []);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = (page as any).seo_title || (page as any).title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && (page as any).seo_description) meta.setAttribute("content", (page as any).seo_description);
    }
  }, [page]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (notFound) return <NotFound />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
