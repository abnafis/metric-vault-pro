import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Upload, Eye, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface HeroData {
  id: string;
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  badge_text: string;
  hero_image_url: string | null;
  status_label: string;
  status_value: string;
  since_label: string;
  since_value: string;
  projects_label: string;
  projects_value: string;
}

const defaults: Omit<HeroData, "id"> = {
  headline: "Accurate Data. Better Marketing Decisions.",
  subheadline: "Expert GA4, Google Tag Manager, Server-Side Tracking, Meta CAPI & Conversion Tracking implementation — so every click, conversion and dollar is measured correctly.",
  primary_cta_text: "Get Tracking Audit",
  primary_cta_link: "#cta",
  secondary_cta_text: "View Case Studies →",
  secondary_cta_link: "#cases",
  badge_text: "Trusted by 100+ businesses",
  hero_image_url: null,
  status_label: "Currently",
  status_value: "Analytics Engineer",
  since_label: "Since",
  since_value: "2019",
  projects_label: "Projects",
  projects_value: "100+",
};

const AdminHeroEditor = () => {
  const [data, setData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    const { data: rows, error } = await supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      toast({ title: "Error loading hero content", description: error.message, variant: "destructive" });
    }
    setData(rows as HeroData | null);
    setLoading(false);
  };

  const handleChange = (field: keyof Omit<HeroData, "id">, value: string) => {
    setData((prev) => (prev ? { ...prev, [field]: value } : null));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const { id, ...rest } = data;
    const { error } = await supabase
      .from("hero_content")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      toast({ title: "Saved", description: "Hero section updated successfully." });
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `hero-bg-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("hero-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("hero-images").getPublicUrl(path);
    handleChange("hero_image_url", urlData.publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No hero content found. Please seed the database.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit the homepage hero area.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="border-border"
          >
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor Panel */}
        <div className="space-y-5">
          {/* Badge */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Badge Text</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Badge label</Label>
              <Input
                value={data.badge_text}
                onChange={(e) => handleChange("badge_text", e.target.value)}
                className="mt-1 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Headlines */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Headlines</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Headline</Label>
              <Textarea
                value={data.headline}
                onChange={(e) => handleChange("headline", e.target.value)}
                className="mt-1 bg-secondary border-border min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Subheadline</Label>
              <Textarea
                value={data.subheadline}
                onChange={(e) => handleChange("subheadline", e.target.value)}
                className="mt-1 bg-secondary border-border min-h-[100px]"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Call to Action Buttons</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Primary Button Text</Label>
                <Input
                  value={data.primary_cta_text}
                  onChange={(e) => handleChange("primary_cta_text", e.target.value)}
                  className="mt-1 bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Primary Button Link</Label>
                <Input
                  value={data.primary_cta_link}
                  onChange={(e) => handleChange("primary_cta_link", e.target.value)}
                  className="mt-1 bg-secondary border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Secondary Button Text</Label>
                <Input
                  value={data.secondary_cta_text}
                  onChange={(e) => handleChange("secondary_cta_text", e.target.value)}
                  className="mt-1 bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Secondary Button Link</Label>
                <Input
                  value={data.secondary_cta_link}
                  onChange={(e) => handleChange("secondary_cta_link", e.target.value)}
                  className="mt-1 bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          {/* Floating Tiles + Status (new redesign) */}
          <div className="glass-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Portrait Status & Floating Tiles</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Editable badges around your portrait card.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Status (under portrait)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={data.status_label}
                    maxLength={30}
                    onChange={(e) => handleChange("status_label", e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={data.status_value}
                    maxLength={50}
                    onChange={(e) => handleChange("status_value", e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Bottom-left tile</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={data.since_label}
                    maxLength={20}
                    onChange={(e) => handleChange("since_label", e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={data.since_value}
                    maxLength={20}
                    onChange={(e) => handleChange("since_value", e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Top-right tile</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={data.projects_label}
                    maxLength={20}
                    onChange={(e) => handleChange("projects_label", e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={data.projects_value}
                    maxLength={20}
                    onChange={(e) => handleChange("projects_value", e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Hero Image</h3>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="border-border"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                {uploading ? "Uploading…" : "Upload Image"}
              </Button>
              {data.hero_image_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange("hero_image_url", "")}
                  className="text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
            {data.hero_image_url && (
              <img
                src={data.hero_image_url}
                alt="Hero preview"
                className="rounded-lg border border-border max-h-40 object-cover"
              />
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 sticky top-6 self-start overflow-hidden"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Live Preview
            </h3>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 glass-card px-3 py-1.5 text-xs text-muted-foreground rounded-full">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--chart-green))] animate-pulse" />
                {data.badge_text}
              </div>

              <h1 className="text-2xl font-extrabold leading-tight text-foreground">
                {data.headline.includes(".")
                  ? <>
                      {data.headline.split(".")[0]}.{" "}
                      <span className="gradient-text">{data.headline.split(".").slice(1).join(".")}</span>
                    </>
                  : data.headline
                }
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.subheadline}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <span className="btn-primary-glow text-xs px-4 py-2">{data.primary_cta_text}</span>
                <span className="btn-secondary-glass text-xs px-4 py-2">{data.secondary_cta_text}</span>
              </div>

              {data.hero_image_url && (
                <img
                  src={data.hero_image_url}
                  alt="Hero"
                  className="rounded-lg border border-border mt-3 max-h-48 w-full object-cover"
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminHeroEditor;
