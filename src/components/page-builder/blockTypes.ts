export const BLOCK_TYPES = [
  { type: "text", label: "Text Block", icon: "Type" },
  { type: "image", label: "Image Block", icon: "Image" },
  { type: "cta", label: "CTA Block", icon: "MousePointerClick" },
  { type: "testimonial", label: "Testimonial Block", icon: "MessageSquareQuote" },
  { type: "service_cards", label: "Service Cards Block", icon: "LayoutGrid" },
  { type: "metrics", label: "Analytics Metrics Block", icon: "BarChart3" },
  { type: "code", label: "Code / Embed Block", icon: "Code" },
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number]["type"];

export interface BlockData {
  id: string;
  page_id: string;
  block_type: BlockType;
  content: Record<string, unknown>;
  sort_order: number;
  visible: boolean;
}

export const defaultContent: Record<BlockType, Record<string, unknown>> = {
  text: { heading: "", subheading: "", paragraph: "", alignment: "left" },
  image: { url: "", caption: "", alt: "", alignment: "center", size: "full" },
  cta: { heading: "", description: "", button_text: "Get Started", button_link: "#", bg_style: "gradient" },
  testimonial: { name: "", role: "", text: "", avatar_url: "", rating: 5 },
  service_cards: {
    cards: [{ icon: "Settings", title: "Service", description: "Description" }],
  },
  metrics: {
    items: [{ icon: "BarChart3", title: "Metric", value: "0", description: "" }],
  },
  code: { html: "", css: "" },
};
