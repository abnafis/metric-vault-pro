import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Send, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CTAData {
  id: string;
  headline: string;
  headline_highlight: string;
  description: string;
  button_text: string;
  success_title: string;
  success_description: string;
  eyebrow: string;
  bullets: string[];
}

const AdminCTAEditor = () => {
  const [data, setData] = useState<CTAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: row } = await supabase
      .from("cta_content" as any)
      .select("*")
      .limit(1)
      .single();
    if (row) {
      const r = row as any;
      setData({
        id: r.id,
        headline: r.headline,
        headline_highlight: r.headline_highlight,
        description: r.description,
        button_text: r.button_text,
        success_title: r.success_title,
        success_description: r.success_description,
        eyebrow: r.eyebrow ?? "— Contact",
        bullets: Array.isArray(r.bullets) && r.bullets.length > 0 ? r.bullets : ["Free 30-minute audit call", "Detailed loom walkthrough", "No obligation, no spam"],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("cta_content" as any)
      .update({
        headline: data.headline.slice(0, 100),
        headline_highlight: data.headline_highlight.slice(0, 100),
        description: data.description.slice(0, 300),
        button_text: data.button_text.slice(0, 50),
        success_title: data.success_title.slice(0, 100),
        success_description: data.success_description.slice(0, 300),
        eyebrow: data.eyebrow.slice(0, 60),
        bullets: data.bullets.filter((b) => b.trim()).slice(0, 10),
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "CTA section updated." });
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No CTA content found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CTA Section</h1>
          <p className="text-sm text-muted-foreground">Edit the call-to-action form section</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="mr-2 h-4 w-4" />
            {preview ? "Hide Preview" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Headline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headline</CardTitle>
            <CardDescription>Displays as "Headline <span className="text-primary">Highlight</span>"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Eyebrow (above headline)</Label>
              <Input
                value={data.eyebrow}
                maxLength={60}
                placeholder="— Contact"
                onChange={(e) => setData({ ...data, eyebrow: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Main Text</Label>
              <Input
                value={data.headline}
                maxLength={100}
                onChange={(e) => setData({ ...data, headline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Highlighted Text</Label>
              <Input
                value={data.headline_highlight}
                maxLength={100}
                onChange={(e) => setData({ ...data, headline_highlight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.description}
                maxLength={300}
                rows={3}
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{data.description.length}/300</p>
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={data.button_text}
                maxLength={50}
                onChange={(e) => setData({ ...data, button_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Success State */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" /> Success Message
            </CardTitle>
            <CardDescription>Shown after form submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Success Title</Label>
              <Input
                value={data.success_title}
                maxLength={100}
                onChange={(e) => setData({ ...data, success_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Success Description</Label>
              <Textarea
                value={data.success_description}
                maxLength={300}
                rows={3}
                onChange={(e) => setData({ ...data, success_description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{data.success_description.length}/300</p>
            </div>

            {/* Success preview */}
            <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border/50 text-center">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--chart-green))]/20 flex items-center justify-center mx-auto mb-3">
                <Send className="w-5 h-5 text-[hsl(var(--chart-green))]" />
              </div>
              <p className="text-sm font-bold text-foreground">{data.success_title}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.success_description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="glass-card glow-border p-8 text-center max-w-xl mx-auto">
                  <h2 className="text-2xl font-bold mb-3">
                    {data.headline}{" "}
                    <span className="gradient-text">{data.headline_highlight}</span>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">{data.description}</p>
                  <button className="btn-primary-glow flex items-center justify-center gap-2 mx-auto text-sm">
                    <Send className="w-4 h-4" />
                    {data.button_text}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCTAEditor;
