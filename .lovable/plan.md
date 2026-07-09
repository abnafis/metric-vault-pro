
# Redesign to match abdulkayium.com

Full visual + structural overhaul of the homepage. Your existing CMS content (hero copy, case studies, testimonials, blog) is preserved; new sections get new admin fields with sensible defaults so nothing breaks on first paint.

## Reference (what we're matching)

- Soft lavender/blue-tinted **light** background, near-black text, a single warm-yellow announcement bar on top.
- Floating **pill navbar** with round avatar, text links (Review, Services, Process), and a green-dot "WhatsApp" pill on the right.
- Hero: giant black display headline where the first line is grey and the second line is solid black ("Same ad spend / Track 60% more Conversion"), a short bold sub-line, and a black pill CTA with your avatar inside it. On the right, **two dark stacked dashboard cards** (slightly rotated) showing platform icons wired to a portrait.
- Client-avatar cluster + 5-star + "250+ Happy clients" row, then an infinite **logo marquee**.
- Case-studies section with two large screenshot cards.
- Big testimonial quote with author card.
- "Why your ads aren't scaling" — 3 pill features + floating avatar/badge collage.
- Metrics strip: 300% Ad revenue · 35% Lower cost · 4:1 ROAS · 2.7X ROI.
- Services grid: dashboard-style cards (tracking setup, server-side, platform coverage).
- "Trusted by 500+ satisfied clients" testimonial grid (video + text cards).
- Process: 3 steps (Audit → Setup → Reporting) with code/UI mock cards.
- FAQ accordion.
- Final CTA: "Let's fix your website tracking issues" with WhatsApp pill button.
- Footer: socials + Stape partner badge.

## Design system

Rewrite `src/index.css` tokens to a light theme:

```text
--background: 225 60% 97%     (soft lavender-blue)
--foreground: 0 0% 6%         (near black)
--card: 0 0% 100%
--card-foreground: 0 0% 6%
--primary: 0 0% 6%            (buttons = solid black pills)
--primary-foreground: 0 0% 100%
--accent-yellow: 48 100% 70%  (announcement bar)
--accent-green: 142 71% 45%   (WhatsApp dot + status pips)
--muted-foreground: 0 0% 45%
--border: 225 20% 88%
--surface-dark: 220 15% 10%   (dashboard cards on hero)
```

Typography: switch heading font to a tight geometric sans in the Satoshi/General Sans family (use `Space Grotesk` from Google Fonts as a free stand-in with `-0.04em` tracking, weight 700). Body stays `Inter`. Drop the italic serif accent and the JetBrains mono display usage on the homepage.

New utility classes: `.pill-nav`, `.pill-cta-avatar` (black pill with embedded round image), `.announcement-bar`, `.marquee`, `.dashboard-card` (dark rounded card with 4–6° rotation variants), `.metric-tile`, `.faq-item`.

## Section-by-section changes

Files to edit or create under `src/components/`:

1. **AnnouncementBar.tsx** (new) — thin yellow strip at top of `Index.tsx`, text pulled from `site_settings.announcement_text`.
2. **Navbar.tsx** — restyle to floating centered pill: avatar + "Tracking Specialist" label on the left inside the pill, links in the middle, green-dot WhatsApp pill on the right. Remove the current "Get Audit" button.
3. **HeroSection.tsx** — replace portrait-card composition with:
   - Left col: "Available for New Projects" green pill, two-line headline (line 1 muted grey, line 2 solid black — both driven by existing `hero_content.headline` split on newline), bold sub-line from `subheadline`, black pill CTA with circular avatar inside pulling from `primary_cta_text` + profile image.
   - Right col: two stacked dark dashboard cards, slightly rotated, built from the existing `status_*`/`since_*`/`projects_*` fields plus platform icons (Google Ads, Meta, TikTok, Shopify, GA4) rendered as inline SVG so no new assets are needed.
4. **ClientProofRow.tsx** (new) — avatar cluster + 5 stars + "{n}+ Happy clients". Fields: `hero_content.social_proof_avatars` (jsonb array) and `hero_content.social_proof_label`.
5. **LogoMarquee.tsx** (new) — infinite CSS marquee of partner logos. Backed by a new `partner_logos` table (`id, image_url, alt, sort_order, visible`) + admin editor.
6. **CaseStudiesSection.tsx** — keep data source, restyle to two large light cards with big screenshot, headline, and a bottom-left "→ read case" link. Headline uses the new section-header meta already in place.
7. **BigTestimonialSection.tsx** (new) — one hero-sized quote pulled from the top testimonial (highest `sort_order` or a new `featured` flag) with author avatar/role card floating bottom-left.
8. **WhyNotScalingSection.tsx** (new) — 3 rounded pill features ("Tracking in 3 Hours", "I Manage Everything", "24/7 Expert Support") + floating collage on the right. New table `why_features` (`id, label, sort_order, visible`) + admin editor. Seed with the three defaults.
9. **MetricsStrip.tsx** (new) — 4 big numbers with captions. New table `hero_metrics` (`id, value, label, sort_order, visible`), seeded with 300% / 35% / 4:1 / 2.7X.
10. **ServicesSection.tsx** (new, distinct from the deleted legacy file) — 3 dashboard cards: "Tracking & Analytics Setup", "Server-side tracking", "Complete tracking for every platform". Uses a new `services_content` table with `title, description, image_url, sort_order`.
11. **TestimonialsSection.tsx** — restyle to a masonry-ish grid of light cards mixing video thumbnails and text quotes. Data source unchanged; add optional `video_thumbnail_url` + `video_duration` columns to `testimonials`.
12. **ProcessSection.tsx** (new) — 3 numbered steps with a UI-mock card next to each. New table `process_steps` (`id, step_number, title, description, mock_variant, sort_order`) + admin editor. `mock_variant` picks between predefined visuals ("tracking-panel", "code-block", "report-card").
13. **FAQSection.tsx** (new) — accordion (shadcn `Accordion`). New table `faqs` (`id, question, answer, sort_order, visible`) + admin editor.
14. **CTASection.tsx** — restyle to centered card with big black headline and WhatsApp pill button showing avatar. Reuse existing `cta_content` bullets and add a `whatsapp_url` field to `site_settings`.
15. **Footer.tsx** — simplify to socials row + Stape/LinkedIn partner badges. Reuse `site_settings.social_links`.
16. **FloatingSocials.tsx** — keep, restyle to light theme.

## Database migration

One migration adds:

- `announcement_text`, `whatsapp_url` on `site_settings`.
- `social_proof_avatars jsonb`, `social_proof_label text` on `hero_content`.
- `video_thumbnail_url text`, `video_duration text` on `testimonials`.
- New tables (each with GRANT + RLS + admin-only write, public read where relevant): `partner_logos`, `why_features`, `hero_metrics`, `services_content`, `process_steps`, `faqs`.
- Seed rows for the four defaults on every new table so the page renders correctly before you edit anything.

## Admin panel

Add five new pages/editors under `src/pages/`, wire into `AdminSidebar.tsx`:

- `AdminPartnerLogosEditor.tsx`
- `AdminWhyFeaturesEditor.tsx`
- `AdminMetricsEditor.tsx`
- `AdminProcessStepsEditor.tsx`
- `AdminFAQEditor.tsx`

`AdminServicesEditor.tsx` already exists — repoint it at the new `services_content` schema (drop the legacy fields it manages, keep the file). Extend `AdminSettings.tsx` with the announcement text + WhatsApp URL fields. Extend `AdminHeroEditor.tsx` with the social-proof avatars/label card.

## New homepage order (Index.tsx)

```text
<AnnouncementBar />
<Navbar />
<HeroSection />
<ClientProofRow />
<LogoMarquee />
<CaseStudiesSection />
<BigTestimonialSection />
<WhyNotScalingSection />
<MetricsStrip />
<ServicesSection />
<TestimonialsSection />
<ProcessSection />
<FAQSection />
<CTASection />
<Footer />
<FloatingSocials />
```

## Out of scope for this pass

- Admin theme (stays dark).
- BlogPost reader theme (stays dark; separate task).
- Funnel/DynamicPage renderers.
- Copy rewriting — content stays yours; only visual layout changes.

## Verification

After build: Playwright screenshot at 1280×1800 and 390×844 against `localhost:8080`, then read both screenshots to confirm the announcement bar, pill nav, dashboard-card hero, marquee, metrics, services grid, FAQ, and CTA all render and read like the reference at both breakpoints.
