# Recommended Improvements

Here are focused, high-impact changes I'd suggest. Pick any subset and I'll build them.

## 1. Performance & Polish
- **Image optimization**: Convert hero portrait and case study images to WebP with responsive `srcset`; add explicit `width`/`height` to prevent CLS.
- **Lazy-load below-the-fold sections** (FAQ, Testimonials, Process) via `React.lazy` + `Suspense` to shrink initial JS.
- **Font loading**: Preload `Space Grotesk` and use `font-display: swap` to eliminate flash of invisible text.
- **Route-level code splitting** for admin pages (they currently ship with the public bundle).

## 2. SEO & Discoverability
- Per-page `<title>` and meta description via `react-helmet-async` (currently only index.html has one).
- Add JSON-LD: `Person`, `WebSite`, `BreadcrumbList`, and `Article` for blog posts.
- Generate `sitemap.xml` and `robots.txt` dynamically from Supabase (blog posts, funnels, landing pages).
- OpenGraph images per blog post (auto-generated from title, or admin-uploadable).

## 3. Admin UX
- **Unified dashboard home**: metric cards (leads this week, published posts, funnel conversion) instead of the blank landing.
- **Global search** in admin to jump to any post/funnel/lead by name.
- **Draft autosave** in Tiptap editor + revision history for blog posts.
- **Media library improvements**: folders, search, bulk delete, alt-text enforcement.
- **Reorder via drag-drop** for testimonials, case studies, FAQs (currently manual sort_order editing).

## 4. Lead & Funnel Enhancements
- **Email notifications** to admin on new lead / funnel submission (Resend edge function).
- **Webhook step** in the funnel builder (send lead data to Zapier/Make/CRM).
- **UTM capture** on funnel_leads (source, medium, campaign, referrer).
- **A/B testing** flag on funnels (two variants, random split, conversion tracking).
- **Funnel analytics dashboard**: step-by-step drop-off chart.

## 5. Content & Trust
- **Case study detail pages** (`/work/:slug`) with problem → solution → results structure — currently only cards.
- **Blog reading progress bar** and estimated read time.
- **Related posts** at the end of each article.
- **Newsletter signup** block (store in a `subscribers` table, later plug into email tool).

## 6. Accessibility
- Audit color contrast on lavender theme (some muted text may fail WCAG AA).
- Keyboard focus rings on all interactive elements (pill navbar, floating socials).
- `prefers-reduced-motion` respected on marquee, orbits, floating tiles.
- Skip-to-content link.

## 7. Security & Hardening
- Rate limit funnel/CTA form submissions (edge function with IP-based throttle).
- Add a honeypot field or hCaptcha on public forms to cut spam.
- Review RLS on new tables (`funnels`, `funnel_steps`, `funnel_leads`, `faqs`, `metrics`, `partner_logos`, `why_features`) — confirm anon can read published rows only and only service-role can write.

## 8. Analytics
- Wire GA4 events for: funnel step view, funnel completion, CTA submit, blog post read (75% scroll).
- Track outbound WhatsApp clicks from announcement bar and floating socials.

---

Tell me which items to tackle (e.g. "1, 4, and 6") and I'll turn the selected ones into a concrete build plan.