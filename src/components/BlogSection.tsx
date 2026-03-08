import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Calendar } from "lucide-react";

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

  const getCatName = (id: string | null) => categories.find(c => c.id === id)?.name || "";

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-24 relative">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
      <div className="section-container relative z-10">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Latest Insights
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From the <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Expert articles on analytics, tracking, and data-driven marketing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="glass-card-hover overflow-hidden group flex flex-col">
              {post.featured_image_url ? (
                <img src={post.featured_image_url} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground text-sm">No image</div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {post.category_id && <Badge variant="secondary" className="text-xs">{getCatName(post.category_id)}</Badge>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time_minutes} min</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : ""}
                  </span>
                  <span className="text-primary font-medium flex items-center gap-1">Read <ArrowRight className="h-3 w-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blog">
            <Button variant="outline" size="lg" className="gap-2">
              View All Articles <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
