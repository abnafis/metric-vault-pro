import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, ArrowRight, Calendar } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; excerpt: string;
  featured_image_url: string | null; author_name: string; category_id: string | null;
  tags: string[]; status: string; featured: boolean; publish_date: string | null;
  read_time_minutes: number;
}
interface Category { id: string; name: string; slug: string; }

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const activeCategory = searchParams.get("category");
  const activeTag = searchParams.get("tag");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("status", "published").order("publish_date", { ascending: false }),
        supabase.from("blog_categories").select("*").order("sort_order"),
      ]);
      if (p) setPosts(p as any);
      if (c) setCategories(c as any);
      setLoading(false);
    })();
  }, []);

  const filtered = posts.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory && p.category_id !== activeCategory) return false;
    if (activeTag && !p.tags.includes(activeTag)) return false;
    return true;
  });

  const featuredPost = filtered.find(p => p.featured) || filtered[0];
  const otherPosts = filtered.filter(p => p !== featuredPost);
  const getCatName = (id: string | null) => categories.find(c => c.id === id)?.name || "";
  const allTags = [...new Set(posts.flatMap(p => p.tags))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="section-container pt-28 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Analytics <span className="gradient-text">Insights</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Expert guides on GA4, conversion tracking, server-side tagging, and marketing analytics.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant={!activeCategory ? "default" : "outline"} className="cursor-pointer"
            onClick={() => { const p = new URLSearchParams(searchParams); p.delete("category"); setSearchParams(p); }}>
            All
          </Badge>
          {categories.map(c => (
            <Badge key={c.id} variant={activeCategory === c.id ? "default" : "outline"} className="cursor-pointer"
              onClick={() => { const p = new URLSearchParams(searchParams); p.set("category", c.id); setSearchParams(p); }}>
              {c.name}
            </Badge>
          ))}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-10">
            {allTags.map(t => (
              <Badge key={t} variant={activeTag === t ? "secondary" : "outline"} className="cursor-pointer text-xs"
                onClick={() => { const p = new URLSearchParams(searchParams); activeTag === t ? p.delete("tag") : p.set("tag", t); setSearchParams(p); }}>
                #{t}
              </Badge>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No articles found.</div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <div className="glass-card-hover overflow-hidden grid md:grid-cols-2 gap-0">
                  {featuredPost.featured_image_url ? (
                    <img src={featuredPost.featured_image_url} alt={featuredPost.title}
                      className="w-full h-64 md:h-full object-cover" />
                  ) : (
                    <div className="w-full h-64 md:h-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      {featuredPost.category_id && <Badge variant="secondary">{getCatName(featuredPost.category_id)}</Badge>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featuredPost.read_time_minutes} min</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      Read article <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="glass-card-hover overflow-hidden group flex flex-col">
                  {post.featured_image_url ? (
                    <img src={post.featured_image_url} alt={post.title} className="w-full h-48 object-cover" />
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
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
