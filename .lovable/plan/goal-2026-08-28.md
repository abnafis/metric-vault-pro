## Goal
Apply a consistent glassmorphism polish across the public site and admin panel, focusing on the key sections the user flagged.

## Design direction
Glassmorphism — translucent frosted surfaces, soft backdrop blur, subtle light borders, low-opacity colored glows, and floating depth. Keep the existing light lavender-white base and Space Grotesk typography; only upgrade how surfaces feel and interact.

## Public website improvements

### 1. Hero — floating glass data-flow
- Wrap the “Accurate Data Flow” diagram in a strongly glass card (`bg-white/60 backdrop-blur-xl border-white/40`) with a soft radial gradient glow behind it.
- Add a floating colored orb behind the diagram (brand blue / soft green) that shifts subtly on scroll.
- Replace generic fallback icons in the flow with small colored platform marks matching the chips.
- Make the primary CTA pill cast a colored shadow on hover and the secondary button become a glass variant.

### 2. Services — frosted card system
- Convert service cards to glass: `bg-white/50 backdrop-blur-md border-white/50` on light areas; for dark/tint presets, keep deeper translucency so the cards still feel layered.
- Swap hardcoded hex colors in the accent map for HSL tokens added to `index.css` so they respect the design system.
- Add a stronger colored inner glow behind the icon chip on hover.
- Featured card: gradient border ring using the accent color and a subtle “Most Popular” ribbon with glass background.
- CTA dark tile: glass-dark variant with blurred background and yellow accent glow.

### 3. Case Studies — glass story cards
- Apply glass panels to the before/after boxes and metric cards.
- Add a subtle shimmer reveal on the sparkline chart card.
- Detail modal: glass header and metric grid with frosted separators.

### 4. Testimonials — floating quote tiles
- Turn each testimonial into a glass card with a blurred colored blob behind it on hover.
- Replace the static quote icon with a subtle animated fade-in on scroll.
- Add a “Read more” expand for long quotes instead of clamping at 6 lines.

### 5. Why Not Scaling & Process — unified glass container
- Keep the large bordered container but add backdrop blur and an inner gradient.
- Process step mock panels become glass cards with colored status dots; add a thin connecting line between steps.

### 6. CTA — glass form stage
- Form panel: `bg-white/50 backdrop-blur-xl border-white/50` with a soft glow behind the submit button.
- Success state: a glass celebration card with a confetti-like micro-animation.
- Improve input focus rings to use a translucent primary glow.

### 7. Footer — glass footer
- Apply a frosted footer bar with subtle top border and a large blurred brand wordmark behind the links.

## Admin panel improvements

### 1. Glass admin chrome
- `AdminLayout` header becomes a frosted strip (`bg-background/70 backdrop-blur-xl`).
- `AdminSidebar` gets a translucent surface and active items receive a glass highlight with a colored left edge.

### 2. Glass editor cards
- Convert editor container cards (`glass-card`) to true glass surfaces with consistent blur/border tokens.
- Add hover lift + soft shadow on editor list items (services, case studies, etc.).
- Add a global “saving” shimmer state for buttons.

### 3. Reorder & form polish
- Make reorder handles more visible on hover.
- Improve dialog backgrounds with stronger backdrop blur.

## Token system (no hardcoded colors)
- Add to `index.css`: `--glass-bg`, `--glass-border`, `--glass-highlight`, `--glass-dark-bg`, `--glow-blue`, `--glow-green`, and utility classes `.glass`, `.glass-dark`, `.glass-card-glow`.
- Replace the service accent map hex values with references to these tokens so the theme stays consistent.

## Files to change
- `src/index.css` — new glass tokens and utility classes.
- `src/components/HeroSection.tsx` — glass diagram + floating glow.
- `src/components/ServicesSection.tsx` — frosted cards, featured gradient, CTA tile.
- `src/components/CaseStudiesSection.tsx` — glass metric/before-after panels + modal.
- `src/components/TestimonialsSection.tsx` — glass cards + read more.
- `src/components/WhyNotScalingSection.tsx` — glass container.
- `src/components/ProcessSection.tsx` — glass mocks + connecting line.
- `src/components/CTASection.tsx` — glass form + success state.
- `src/components/Footer.tsx` — glass footer.
- `src/components/admin/AdminLayout.tsx` — frosted header.
- `src/components/admin/AdminSidebar.tsx` — translucent sidebar + active highlight.

## Out of scope
- No structural layout changes (section order, grid columns remain the same).
- No new backend tables or admin editors; this is a pure styling/polish pass.
- No new sections or content.

## Success check
After the pass, the public site and admin should share the same frosted-glass language, surfaces should lift on hover with colored glows, and no hardcoded hex colors should remain in the touched components.
