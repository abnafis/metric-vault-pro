

## Problem

`profileImageUrl` starts as `null`, so on initial load the `HeroDashboard` fallback component renders. Once the Supabase query resolves (a few seconds later), `profileImageUrl` gets set and the portrait appears — causing a visible flash/swap.

## Solution

Add a loading state that prevents rendering either variant until the profile image query has completed. This way:
- If the DB returns a profile image URL → show the portrait immediately (no flash of HeroDashboard)
- If there's no profile image → show HeroDashboard as intended

## Changes

**`src/components/HeroSection.tsx`**:
1. Add a `loading` state initialized to `true`
2. Set `loading = false` after the `about_content` query resolves (whether it returns an image or not)
3. In the right-side render block, show a skeleton/placeholder (or nothing) while `loading` is true, then conditionally render the portrait or HeroDashboard

This is a minimal change — just 2-3 lines of state logic and a ternary update in the JSX.

