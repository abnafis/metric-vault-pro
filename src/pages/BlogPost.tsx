import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { trackViewArticle } from "@/lib/dataLayer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  ArrowUp,
  ChevronRight,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  author_name: string;
  category_id: string | null;
  tags: string[];
  publish_date: string | null;
  read_time_minutes: number;
  meta_title: string;
  meta_description: string;
  og_image_url: string | null;
}
interface Category {
  id: string;
  name: string;
  slug: string;
}

/* ——— animation variants ——— */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};
const scaleFade = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug!)
          .eq("status", "published")
          .single(),
        supabase.from("blog_categories").select("*"),
      ]);
      if (p) {
        const postData = p as unknown as Post;
        setPost(postData);
        document.title = postData.meta_title || postData.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && postData.meta_description)
          metaDesc.setAttribute("content", postData.meta_description);
        const catName = (c as unknown as Category[])?.find(
          (cat) => cat.id === postData.category_id
        )?.name;
        trackViewArticle(postData.title, catName);
        const { data: rel } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .neq("id", postData.id)
          .limit(3);
        if (rel) setRelated(rel as unknown as Post[]);
      }
      if (c) setCategories(c as unknown as Category[]);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const progress = h > 0 ? (window.scrollY / h) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getCatName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "";

  const formattedDate = useMemo(() => {
    if (!post?.publish_date) return "";
    return new Date(post.publish_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [post?.publish_date]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  /* ——— Loading skeleton ——— */
  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="section-container pt-28 pb-20 max-w-4xl mx-auto">
          {/* Hero skeleton */}
          <div className="w-full h-[340px] rounded-2xl bg-muted/30 animate-pulse mb-10" />
          {/* Title skeleton */}
          <div className="h-10 w-3/4 bg-muted/30 rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-1/2 bg-muted/20 rounded-lg animate-pulse mb-8" />
          {/* Body skeletons */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted/15 rounded animate-pulse mb-3"
              style={{ width: `${85 - i * 8}%` }}
            />
          ))}
        </div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="section-container pt-28 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">
            ← Back to blog
          </Link>
        </div>
        <Footer />
      </div>
    );

  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "target",
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ── Reading progress bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent">
        <motion.div
          className="h-full rounded-r-full"
          style={{
            width: `${scrollProgress}%`,
            background:
              "linear-gradient(90deg, hsl(var(--glow-blue)), hsl(var(--glow-purple)), hsl(var(--glow-cyan)))",
          }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <Navbar />

      {/* ── Cinematic hero section ── */}
      <motion.header
        className="relative w-full pt-20"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Back link — overlayed on top */}
        <div className="section-container pt-6 pb-4 relative z-10">
          <motion.div variants={fadeUp}>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{" "}
              Back to blog
            </Link>
          </motion.div>
        </div>

        {/* Featured image — full-bleed with gradient fade */}
        {post.featured_image_url && (
          <motion.div
            className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2"
            variants={scaleFade}
          >
            <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-[280px] sm:h-[360px] lg:h-[440px] object-cover"
                loading="eager"
              />
              {/* Bottom gradient overlay for seamless blend */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Title block — layered on or below image */}
        <div
          className={`section-container max-w-4xl mx-auto ${
            post.featured_image_url ? "-mt-20 relative z-10" : "mt-6"
          }`}
        >
          {/* Meta badges */}
          <motion.div
            className="flex flex-wrap items-center gap-3 mb-5"
            variants={fadeUp}
          >
            {post.category_id && (
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs font-medium px-3 py-1">
                {getCatName(post.category_id)}
              </Badge>
            )}
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {post.read_time_minutes} min read
            </span>
            {post.publish_date && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6"
            style={{ textWrap: "balance" } as React.CSSProperties}
            variants={fadeUp}
          >
            {post.title}
          </motion.h1>

          {/* Author + share row */}
          <motion.div
            className="flex items-center justify-between gap-4 pb-8 border-b border-gray-200"
            variants={fadeUp}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {post.author_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.author_name}
                </p>
                {post.publish_date && (
                  <p className="text-xs text-gray-500">
                    {formattedDate}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors rounded-lg border border-gray-200 px-3 py-2 hover:border-gray-400 active:scale-[0.97]"
              title="Share article"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* ── Article body ── */}
      <motion.article
        className="section-container max-w-4xl mx-auto pt-10 pb-16"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?tag=${t}`}>
                <Badge
                  variant="outline"
                  className="text-xs border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-500 transition-colors"
                >
                  #{t}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Sanitized article content */}
        <div
          className="blog-article-content prose prose-lg max-w-none
            [&_*]:!text-gray-700
            [&_h1]:!text-gray-900 [&_h1]:!text-2xl [&_h1]:!sm:text-3xl [&_h1]:!font-bold [&_h1]:!mt-12 [&_h1]:!mb-5
            [&_h2]:!text-gray-900 [&_h2]:!text-xl [&_h2]:!sm:text-2xl [&_h2]:!font-bold [&_h2]:!mt-10 [&_h2]:!mb-4 [&_h2]:!border-l-[3px] [&_h2]:!border-l-primary [&_h2]:!pl-4
            [&_h3]:!text-gray-900 [&_h3]:!text-lg [&_h3]:!font-semibold [&_h3]:!mt-8 [&_h3]:!mb-3
            [&_h4]:!text-gray-900 [&_h4]:!font-semibold
            [&_p]:!leading-[1.85] [&_p]:!mb-5
            [&_a]:!text-primary [&_a]:!underline [&_a]:!underline-offset-4 [&_a]:!decoration-primary/30 hover:[&_a]:!decoration-primary
            [&_strong]:!text-gray-900 [&_strong]:!font-semibold
            [&_em]:!text-gray-600
            [&_code]:!bg-gray-100 [&_code]:!text-gray-800 [&_code]:!rounded-md [&_code]:!px-2 [&_code]:!py-1 [&_code]:!text-sm [&_code]:!font-mono
            [&_pre]:!bg-gray-50 [&_pre]:!rounded-xl [&_pre]:!border [&_pre]:!border-gray-200 [&_pre]:!p-5 [&_pre]:!overflow-x-auto [&_pre]:!my-8
            [&_img]:!rounded-xl [&_img]:!max-w-full [&_img]:!my-8
            [&_blockquote]:!border-l-[3px] [&_blockquote]:!border-l-primary [&_blockquote]:!bg-gray-50 [&_blockquote]:!rounded-r-xl [&_blockquote]:!pl-6 [&_blockquote]:!py-4 [&_blockquote]:!my-8 [&_blockquote]:!italic
            [&_ul]:!space-y-2 [&_ol]:!space-y-2
            [&_li]:!text-gray-700 [&_li]:!leading-relaxed
            [&_li::marker]:!text-primary/60
            [&_hr]:!border-gray-200 [&_hr]:!my-10
            [&_table]:!border-collapse [&_th]:!text-left [&_th]:!text-gray-900 [&_th]:!border-b [&_th]:!border-gray-200 [&_th]:!pb-3 [&_td]:!py-3 [&_td]:!border-b [&_td]:!border-gray-100"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </motion.article>

      {/* ── Related posts ── */}
      {related.length > 0 && (
        <motion.section
          className="border-t border-gray-200 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          <div className="section-container max-w-6xl mx-auto py-20">
            <motion.div
              className="flex items-center justify-between mb-10"
              variants={fadeUp}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Continue Reading
              </h2>
              <Link
                to="/blog"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 group"
              >
                All articles{" "}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <motion.div key={r.id} variants={fadeUp} custom={i}>
                  <Link
                    to={`/blog/${r.slug}`}
                    className="group block rounded-2xl overflow-hidden border border-border/30 bg-[hsl(var(--card)/0.5)] hover:border-border/60 transition-all duration-500 hover:shadow-[0_8px_40px_-12px_hsl(var(--glow-blue)/0.12)]"
                  >
                    <div className="relative overflow-hidden">
                      {r.featured_image_url ? (
                        <img
                          src={r.featured_image_url}
                          alt={r.title}
                          className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-44 bg-muted/20 flex items-center justify-center">
                          <span className="text-muted-foreground/30 text-4xl font-bold">
                            {r.title[0]}
                          </span>
                        </div>
                      )}
                      {/* Subtle overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-5">
                      {r.category_id && (
                        <span className="text-[11px] font-medium uppercase tracking-wider text-primary/70 mb-2 block">
                          {getCatName(r.category_id)}
                        </span>
                      )}
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
                        {r.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {r.read_time_minutes} min
                        </span>
                        {r.publish_date && (
                          <span>
                            {new Date(r.publish_date).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Back to top FAB ── */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary active:scale-95 transition-all"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showBackToTop ? 1 : 0,
          scale: showBackToTop ? 1 : 0.8,
          pointerEvents: showBackToTop ? "auto" : "none",
        }}
        transition={{ duration: 0.25 }}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>

      <Footer />
    </div>
  );
}
