import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, Globe, Mail, Megaphone } from "lucide-react";

interface Settings {
  id: string;
  contact_email: string;
  cta_form_email: string;
  seo_title: string;
  seo_description: string;
  announcement_text: string;
  whatsapp_url: string;
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
        contact_email: r.contact_email ?? "",
        cta_form_email: r.cta_form_email ?? "",
        seo_title: r.seo_title ?? "",
        seo_description: r.seo_description ?? "",
        announcement_text: r.announcement_text ?? "",
        whatsapp_url: r.whatsapp_url ?? "",
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
        announcement_text: data.announcement_text.slice(0, 200),
        whatsapp_url: data.whatsapp_url.slice(0, 300),
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
          <p className="text-sm text-muted-foreground">Contact, announcement bar, WhatsApp & SEO</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save All"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcement Bar & WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Announcement Bar Text</Label>
                <Input value={data.announcement_text} maxLength={200} onChange={(e) => setData({ ...data, announcement_text: e.target.value })} placeholder="🎉 Available for new projects — book a call" />
                <p className="text-xs text-muted-foreground">Leave empty to hide the yellow bar at the top.</p>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp URL</Label>
                <Input value={data.whatsapp_url} maxLength={300} onChange={(e) => setData({ ...data, whatsapp_url: e.target.value })} placeholder="https://wa.me/1234567890" />
                <p className="text-xs text-muted-foreground">Used by the navbar and CTA pill buttons.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
