import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, Globe, Mail } from "lucide-react";

interface Settings {
  id: string;
  contact_email: string;
  cta_form_email: string;
  seo_title: string;
  seo_description: string;
}

const AdminSettings = () => {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data: row } = await supabase.from("site_settings" as any).select("*").limit(1).single();
    if (row) {
      const r = row as any;
      setData({
        id: r.id,
        contact_email: r.contact_email,
        cta_form_email: r.cta_form_email,
        seo_title: r.seo_title,
        seo_description: r.seo_description,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings" as any)
      .update({
        contact_email: data.contact_email.slice(0, 100),
        cta_form_email: data.cta_form_email.slice(0, 100),
        seo_title: data.seo_title.slice(0, 60),
        seo_description: data.seo_description.slice(0, 160),
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Settings updated successfully." });
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading settings…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No settings found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Contact emails & SEO configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save All"}
        </Button>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Email (displayed in footer)</Label>
                <Input type="email" value={data.contact_email} maxLength={100} onChange={(e) => setData({ ...data, contact_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CTA Form Destination Email</Label>
                <Input type="email" value={data.cta_form_email} maxLength={100} onChange={(e) => setData({ ...data, cta_form_email: e.target.value })} />
                <p className="text-xs text-muted-foreground">Where the "Get Audit" form submissions go</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> SEO Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={data.seo_title} maxLength={60} onChange={(e) => setData({ ...data, seo_title: e.target.value })} />
                <p className="text-xs text-muted-foreground">{data.seo_title.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={data.seo_description} maxLength={160} rows={3} onChange={(e) => setData({ ...data, seo_description: e.target.value })} />
                <p className="text-xs text-muted-foreground">{data.seo_description.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
