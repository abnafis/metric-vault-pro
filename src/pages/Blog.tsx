import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search, Clock, ArrowUpRight } from "lucide-react";

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
  const { settings } = useSiteSettings();

  const activeCategory = searchParams.get("category");
  const activeTag = searchParams.get("tag");

  useEffect(() => {
    window.scrollTo(0, 0);
    const blogPage = settings.page_titles?.blog;
    document.title =
      blogPage?.meta_title ||
      settings.title_format?.replace("{page}", "Blog").replace("{site}", settings.site_name) ||
      "Blog";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && blogPage?.meta_description) metaDesc.setAttribute("content", blogPage.meta_description);
  }, [settings]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("status", "published").order("publish_date", { ascending: false }),
        supabase.from("blog_categories").select("*").order("sort_order"),
      ]);
      if (p) setPosts(p as unknown as Post[]);
      if (c) setCategories(c as unknown as Category[]);
      setLoading(false);
    })();
  }, []);

  const filtered = posts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (activeCategory && p.category_id !== activeCategory) return false;
    if (activeTag && !p.tags.includes(activeTag)) return false;
    return true;
  });

  const featuredPost = filtered.find((p) => p.featured) || filtered[0];
  const otherPosts = filtered.filter((p) => p !== featuredPost);
  const getCatName = (id: string | null) => categories.find((c) => c.id === id)?.name || "";
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (value === null) p.delete(key);
    else p.set(key, value);
    setSearchParams(p);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="section-container pt-32 pb-20">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <p className="pill-eyebrow mb-6">— Journal</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Analytics <span className="font-serif-display text-primary">insights</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Expert guides on GA4, conversion tracking, server-side tagging, and marketing analytics.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-full bg-card border-border"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setParam("category", null)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-all ${
              !activeCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setParam("category", c.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-all ${
                activeCategory === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-12">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setParam("tag", activeTag === t ? null : t)}
                className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                  activeTag === t
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No articles found.</div>
        ) : (
          <div className="space-y-12">
            {/* Featured */}
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="block group rounded-2xl border border-border overflow-hidden bg-card/30 hover:border-primary/30 transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {featuredPost.featured_image_url ? (
                    <div className="overflow-hidden aspect-[16/11] md:aspect-auto md:h-full">
                      <img
                        src={featuredPost.featured_image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/11] md:aspect-auto bg-muted" />
                  )}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                      <span className="text-primary">Featured</span>
                      {featuredPost.category_id && <span>· {getCatName(featuredPost.category_id)}</span>}
                      <span className="flex items-center gap-1">
                        · <Clock className="w-3 h-3" />
                        {featuredPost.read_time_minutes} min
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      Read article
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((post) => (
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
                    <div className="aspect-[16/10] bg-muted" />
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
                      Read
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
