

# CMS Improvement Plan

## Current State

The site already has a solid CMS with editors for Hero, Services, Case Studies, Platforms, Testimonials, About, CTA, Blog, Scripts, Audit Requests, Branding, and a Page Builder. Here are the key gaps and improvements:

## 1. Make the Process Section CMS-Editable

The Process/Workflow section on the homepage is currently hardcoded in `ProcessSection.tsx`. Create an admin editor so steps can be added, edited, reordered, and removed.

- Add a `process_steps` table (id, title, description, icon, sort_order)
- Create `AdminProcessEditor.tsx` with drag-and-drop reordering
- Update `ProcessSection.tsx` to fetch from the database with hardcoded fallback
- Add route `/admin/process` and sidebar link

## 2. Make the Dashboard Showcase Section CMS-Editable

`DashboardShowcase.tsx` is hardcoded. Add CMS control for its heading, description, and feature highlights.

- Store content in `site_settings` as a new JSONB column `dashboard_showcase` or create a dedicated table
- Create an admin editor page
- Add route and sidebar link

## 3. Add a Footer Editor

The Footer route (`/admin/footer`) currently points to `AdminSettings` which manages footer text, but social links and nav links are split across Settings and Branding. Consolidate footer editing into a dedicated `AdminFooterEditor.tsx` that manages:
- Footer description and copyright
- Footer navigation links
- Social links with icons
- Contact email display

## 4. Dashboard Improvements

Enhance `AdminDashboard.tsx` with:
- Blog post count and audit request count in the stats grid
- Recent audit requests list (last 5)
- Recent blog posts list (last 5)
- Quick links for all CMS sections (currently only 4)

## 5. Add Media Library

Create a centralized media manager so admins can browse, upload, and delete images across all storage buckets instead of uploading per-section.

- New page `AdminMediaLibrary.tsx` at `/admin/media`
- Lists files from all public buckets
- Upload, preview, copy URL, delete functionality
- Sidebar link under System group

## 6. Consolidate Settings and Branding

Currently `AdminSettings` and `AdminBrandingEditor` overlap (both manage nav_links, favicon, etc.). Merge them:
- Move footer/social/contact/SEO tabs from Settings into Branding
- Make `/admin/settings` redirect to `/admin/branding` or combine into one unified settings page
- Remove duplication

## 7. Add Bulk Actions to Blog and Audit Requests

- Blog: bulk delete, bulk publish/unpublish
- Audit Requests: bulk status change, bulk delete

## Implementation Priority

1. **Process Section CMS** — straightforward, high impact (removes hardcoded content)
2. **Dashboard improvements** — quick win, better admin UX
3. **Consolidate Settings/Branding** — reduces confusion
4. **Dashboard Showcase CMS** — removes more hardcoded content
5. **Media Library** — quality-of-life improvement
6. **Bulk actions** — efficiency for content-heavy use

## Technical Approach

- New database tables use the same RLS pattern (public SELECT, authenticated INSERT/UPDATE/DELETE)
- All new admin pages follow existing patterns: fetch on mount, save with toast, Card-based layout
- Frontend sections fetch from DB with hardcoded fallback for resilience
- New sidebar items added to existing content/system groups

