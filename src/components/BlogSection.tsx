import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Clock } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; excerpt: string;
  featured_image_url: string | null; author_name: string; category_id: string | null;
  tags: string[]; publish_date: string | null; read_time_minutes: number;
}
interface Category { id: string; name: string; }

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("status", "published").order("publish_date", { ascending: false }).limit(3),
        supabase.from("blog_categories").select("id, name"),
      ]);
      if (p) setPosts(p as any);
      if (c) setCategories(c as any);
    })();
  }, []);

  const getCatName = (id: string | null) => categories.find((c) => c.id === id)?.name || "";

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-32 relative border-t border-border">
      <div className="section-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <p className="pill-eyebrow">— Journal</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight max-w-2xl">
              From the <span className="font-serif-display text-primary">blog</span>.
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm story-link self-start md:self-end"
          >
            View all articles
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-border overflow-hidden bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
            >
              {post.featured_image_url ? (
                <div className="overflow-hidden aspect-[16/10]">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  No image
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  {post.category_id && <span>{getCatName(post.category_id)}</span>}
                  {post.category_id && <span>·</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.read_time_minutes} min
                  </span>
                </div>

                <h3 className="text-xl font-semibold tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>

                <div className="flex items-center gap-2 mt-5 text-sm text-foreground">
                  Read article
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
