import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";

interface SocialLink { label: string; href: string; visible: boolean; }

interface FooterData {
  id: string;
  footer_description: string;
  copyright_text: string;
  contact_email: string;
  social_links: SocialLink[];
}

export default function AdminFooterEditor() {
  const { toast } = useToast();
  const [data, setData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: row } = await supabase.from("site_settings" as any).select("*").limit(1).single();
    if (row) {
      const r = row as any;
      setData({
        id: r.id,
        footer_description: r.footer_description,
        copyright_text: r.copyright_text,
        contact_email: r.contact_email,
        social_links: r.social_links as SocialLink[],
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
        footer_description: data.footer_description,
        copyright_text: data.copyright_text,
        contact_email: data.contact_email,
        social_links: data.social_links,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Footer settings updated." });
    }
  };

  const addSocial = () => {
    if (!data || data.social_links.length >= 10) return;
    setData({ ...data, social_links: [...data.social_links, { label: "", href: "#", visible: true }] });
  };

  const removeSocial = (i: number) => {
    if (!data) return;
    setData({ ...data, social_links: data.social_links.filter((_, idx) => idx !== i) });
  };

  const updateSocial = (i: number, field: string, val: any) => {
    if (!data) return;
    const links = [...data.social_links];
    links[i] = { ...links[i], [field]: val };
    setData({ ...data, social_links: links });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No settings found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Footer Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage footer content, social links, and contact info.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Footer Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Footer Description</Label>
            <Textarea value={data.footer_description} onChange={(e) => setData({ ...data, footer_description: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Copyright Text</Label>
            <Input value={data.copyright_text} onChange={(e) => setData({ ...data, copyright_text: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">Use {"{year}"} for dynamic year.</p>
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input value={data.contact_email} onChange={(e) => setData({ ...data, contact_email: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.social_links.map((link, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3">
                <Input value={link.label} onChange={(e) => updateSocial(i, "label", e.target.value)} placeholder="Label" />
              </div>
              <div className="col-span-5">
                <Input value={link.href} onChange={(e) => updateSocial(i, "href", e.target.value)} placeholder="URL" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch checked={link.visible} onCheckedChange={(v) => updateSocial(i, "visible", v)} />
                <span className="text-xs text-muted-foreground">Visible</span>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => removeSocial(i)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSocial} size="sm" className="border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Social Link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
