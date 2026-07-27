
## Goal
Make the Services section richer visually and fully customizable from the admin panel — per-card CTA button (text + link), custom icon uploads, per-card background/accent styling, and a few polish upgrades.

## Design upgrades (frontend)
- **Per-card CTA button**: Replace the shared "#contact" underline link with a real button per service (label + link editable). Support two styles: `link` (current underline) or `button` (filled pill).
- **Custom icon support**: Allow either a Lucide icon name (current) OR an uploaded image/SVG URL. If `icon_image_url` is set, render it inside the chip instead of the Lucide icon.
- **Background customization**: Per-card options for
  - `card_bg` (solid color or preset: white / soft-tint / dark)
  - `card_bg_image_url` (optional subtle pattern/image, low opacity)
  - `accent` stays as the color family (chip + blob + ring)
- **Optional price/starting-at line** under description (e.g. "From $499") — hidden when empty.
- **Featured flag** — a "Most Popular" style ribbon on one card.
- **Layout polish**: Softer inner shadow on hover, animated icon chip, subtle gradient border for featured card, and a stronger dark CTA tile with icon.
- **Section-level CTA tile**: Make its heading, subheading, button label + link editable (currently hardcoded).

## Admin customization (AdminServicesEditor)
Add fields per service:
- `cta_label` (exists) + `cta_link` (new) + `cta_style` (new: link | button)
- `icon` (Lucide) + `icon_image_url` (new, upload via existing media/storage)
- `card_bg_preset` (new: light | tint | dark | custom)
- `card_bg_color` (new, hex, when custom)
- `card_bg_image_url` (new, optional upload)
- `price_label` (new, optional)
- `featured` (new, boolean — only one at a time UX hint)

Upload UI reuses the existing Supabase storage pattern (same as platform logos / testimonial avatars). New bucket: `service-icons` (public) — or reuse `platform-logos`.

Add a new "Section CTA Tile" panel at the top of AdminServicesEditor to edit the dark tile (eyebrow, headline, headline highlight, button label, button link). Stored in a new `services_cta` single-row table (same pattern as `cta_content`, `testimonials_meta`).

## Database changes
Single migration:
- `ALTER TABLE services` add: `cta_link text`, `cta_style text default 'link'`, `icon_image_url text`, `card_bg_preset text default 'light'`, `card_bg_color text`, `card_bg_image_url text`, `price_label text`, `featured boolean default false`.
- `CREATE TABLE services_cta` (single-row): `eyebrow`, `headline`, `headline_highlight`, `button_label`, `button_link`, timestamps. GRANTs + RLS (public read, admin write) matching existing `cta_content` pattern.
- New storage bucket `service-icons` (public) — or confirm reuse of `platform-logos`.

## Files to change
- `supabase migration` (schema + bucket)
- `src/components/ServicesSection.tsx` — render new fields, per-card button, custom icon/bg, featured ribbon, dynamic CTA tile
- `src/pages/AdminServicesEditor.tsx` — new fields, icon/bg uploaders, CTA tile panel
- `src/integrations/supabase/types.ts` — regenerated after migration

## Out of scope
- Reordering UX (already exists via sort_order)
- Per-card animations beyond current hover
- Section header text (already editable via Section Headers admin)

## Open questions
1. Reuse `platform-logos` bucket or create dedicated `service-icons`?
2. Should `featured` auto-enforce single card, or allow multiple?
3. Keep the existing shared color `accent` palette, or replace entirely with free-form `card_bg_color`?
