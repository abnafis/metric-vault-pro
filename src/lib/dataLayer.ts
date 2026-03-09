/**
 * GA4-compliant DataLayer utility
 * Supports: GA4, Google Ads Enhanced Conversions, Meta CAPI, Server-Side Tracking
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// Ensure dataLayer exists
export function initDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

// Push event to dataLayer
function push(payload: Record<string, unknown>) {
  initDataLayer();
  window.dataLayer.push(payload);
}

// --- Privacy-safe normalization ---

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9@.+\- ]/g, "");
}

async function sha256(value: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface UserData {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
}

/**
 * Build a privacy-safe user_data object.
 * Hashes email & phone; normalizes other fields.
 */
export async function buildUserData(raw: UserData): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  if (raw.email) {
    result.email_hash = await sha256(raw.email);
    // Also include normalized for Enhanced Conversions (GTM handles hashing)
    result.email = normalize(raw.email);
  }
  if (raw.phone_number) {
    result.phone_hash = await sha256(raw.phone_number);
    result.phone_number = raw.phone_number.trim();
  }
  if (raw.first_name) result.first_name = normalize(raw.first_name);
  if (raw.last_name) result.last_name = normalize(raw.last_name);
  if (raw.city) result.city = normalize(raw.city);
  if (raw.country) result.country = normalize(raw.country);

  return result;
}

// --- Event helpers ---

/** Page view — call on every route change */
export function trackPageView(overrides?: { page_title?: string }) {
  push({
    event: "page_view",
    page_title: overrides?.page_title || document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
}

/** CTA button click */
export function trackCTAClick(buttonName: string) {
  push({
    event: "cta_click",
    button_name: buttonName,
    page_location: window.location.pathname,
  });
}

/** Lead generation (form submission) */
export function trackGenerateLead(
  formName: string,
  leadType: string,
  userData?: Record<string, string>
) {
  push({
    event: "generate_lead",
    form_name: formName,
    lead_type: leadType,
    page_location: window.location.pathname,
    ...(userData ? { user_data: userData } : {}),
  });
}

/** Push raw user_data event */
export function trackUserData(userData: Record<string, string>) {
  push({
    event: "user_data",
    user_data: userData,
  });
}

/** Blog article view */
export function trackViewArticle(
  articleTitle: string,
  articleCategory?: string
) {
  push({
    event: "view_article",
    article_title: articleTitle.toLowerCase().replace(/\s+/g, "_").slice(0, 100),
    article_category: articleCategory?.toLowerCase().replace(/\s+/g, "_") || "",
    page_location: window.location.pathname,
  });
}

/** Scroll depth milestone */
export function trackScrollDepth(percent: number) {
  push({
    event: "scroll_depth",
    percent_scrolled: percent,
    page_location: window.location.pathname,
  });
}

/** Navigation menu click */
export function trackNavigationClick(menuItem: string) {
  push({
    event: "navigation_click",
    menu_item: menuItem.toLowerCase().replace(/\s+/g, "_"),
    page_location: window.location.pathname,
  });
}

/** Platform / integration logo click */
export function trackPlatformClick(platformName: string) {
  push({
    event: "platform_click",
    platform_name: platformName.toLowerCase().replace(/\s+/g, "_"),
  });
}
