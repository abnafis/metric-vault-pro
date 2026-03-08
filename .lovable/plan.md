

# Add Portrait Photo to About Section, Hero Section, and Navbar

## What We'll Do

Add a `profile_image_url` field to the `about_content` table so you can upload your portrait via the admin panel. The image will then appear in three places:

1. **About Section** — Replace the BarChart3 icon with your portrait photo (circular, with a glow border)
2. **Hero Section** — Add a portrait alongside/above the CTA area on the left column
3. **Navbar** — Small circular avatar next to the site name

## Technical Changes

### 1. Database Migration
- Add `profile_image_url text` column (nullable) to `about_content`

### 2. Storage Bucket
- Create a `profile-images` public bucket for the portrait upload

### 3. AdminAboutEditor.tsx
- Add an image upload section (similar to the hero editor pattern) that uploads to the `profile-images` bucket and saves the URL to `profile_image_url`
- Show a preview of the current portrait

### 4. AboutSection.tsx
- Add `profile_image_url` to the interface and fallback
- Replace the `<div className="w-20 h-20 rounded-full ..."><BarChart3 /></div>` with a conditional: if `profile_image_url` exists, render an `<img>` in a styled circular container with glow border; otherwise keep the icon fallback

### 5. HeroSection.tsx
- Fetch `profile_image_url` from the `about_content` table
- Display a circular portrait photo above or beside the headline text on the left column, giving a personal branding feel

### 6. Navbar.tsx
- Fetch `profile_image_url` from `about_content`
- Show a small (32px) circular avatar next to the site name/logo

### 7. Types
- The `about_content` table types will auto-update after migration

