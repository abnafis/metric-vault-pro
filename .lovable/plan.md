

# Why Login Page Isn't Accessible on Vercel

## Root Cause

This is a **client-side routing issue**. Your app uses React Router (a single-page application), but Vercel doesn't know to serve `index.html` for all routes by default. When you navigate directly to `/admin/login`, Vercel looks for a file at that path, finds nothing, and returns a 404.

## Fix

Create a `vercel.json` file in your project root with this rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel to serve `index.html` for all routes, letting React Router handle the routing client-side.

## Additional Check

Ensure your Vercel project has the required environment variables set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Without these, the app will build but authentication won't work.

## Summary

1. Add `vercel.json` with SPA rewrites
2. Verify environment variables in Vercel dashboard
3. Redeploy

