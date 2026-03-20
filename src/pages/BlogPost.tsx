import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { trackViewArticle } from "@/lib/dataLayer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; content: string; excerpt: string;
  featured_image_url: string | null; author_name: string; category_id: string | null;
  tags: string[]; publish_date: string | null; read_time_minutes: number;
  meta_title: string; meta_description: string; og_image_url: string | null;
}
interface Category { id: string; name: string; slug: string; }

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("slug", slug!).eq("status", "published").single(),
        supabase.from("blog_categories").select("*"),
      ]);
      if (p) {
        const postData = p as unknown as Post;
        setPost(postData);
        document.title = postData.meta_title || postData.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && postData.meta_description) metaDesc.setAttribute("content", postData.meta_description);
        // DataLayer: track article view
        const catName = (c as unknown as Category[])?.find(cat => cat.id === postData.category_id)?.name;
        trackViewArticle(postData.title, catName);
        const { data: rel } = await supabase.from("blog_posts").select("*").eq("status", "published").neq("id", postData.id).limit(3);
        if (rel) setRelated(rel as unknown as Post[]);
      }
      if (c) setCategories(c as unknown as Category[]);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getCatName = (id: string | null) => categories.find(c => c.id === id)?.name || "";

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="text-center py-40 text-muted-foreground">Loading…</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="section-container pt-28 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link to="/blog" className="text-primary hover:underline">← Back to blog</Link>
      </div>
      <Footer />
    </div>
  );

  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <Navbar />
      <article className="section-container pt-28 pb-20 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        {post.featured_image_url && (
          <img src={post.featured_image_url} alt={post.title} className="w-full h-64 sm:h-80 object-cover rounded-xl mb-8" loading="lazy" />
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          {post.category_id && <Badge variant="secondary">{getCatName(post.category_id)}</Badge>}
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.read_time_minutes} min read</span>
          {post.publish_date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.publish_date).toLocaleDateString()}</span>}
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{post.author_name}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {post.tags.map(t => (
              <Link key={t} to={`/blog?tag=${t}`}>
                <Badge variant="outline" className="text-xs">#{t}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Article body — sanitized */}
        <div className="prose prose-invert prose-lg max-w-none
          text-[hsl(var(--muted-foreground))]
          prose-headings:font-bold prose-headings:text-[hsl(var(--foreground))]
          prose-p:text-[hsl(var(--muted-foreground))] prose-p:leading-relaxed
          prose-a:text-[hsl(var(--primary))] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[hsl(var(--foreground))]
          prose-code:bg-[hsl(var(--muted))] prose-code:text-[hsl(var(--foreground))] prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
          prose-pre:bg-[hsl(var(--muted))] prose-pre:rounded-lg prose-pre:border prose-pre:border-[hsl(var(--border))]
          prose-img:rounded-lg prose-img:max-w-full
          prose-blockquote:border-l-[hsl(var(--primary))] prose-blockquote:text-[hsl(var(--muted-foreground))]
          prose-li:text-[hsl(var(--muted-foreground))]
          [&_*]:!text-[hsl(var(--muted-foreground))] [&_h1]:!text-[hsl(var(--foreground))] [&_h2]:!text-[hsl(var(--foreground))] [&_h3]:!text-[hsl(var(--foreground))] [&_h4]:!text-[hsl(var(--foreground))] [&_a]:!text-[hsl(var(--primary))] [&_strong]:!text-[hsl(var(--foreground))]"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="glass-card-hover overflow-hidden group">
                  {r.featured_image_url ? (
                    <img src={r.featured_image_url} alt={r.title} className="w-full h-36 object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-36 bg-muted" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{r.read_time_minutes} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
      <Footer />
    </div>
  );
}
