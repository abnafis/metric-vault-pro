import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, GripVertical, Upload, Globe, Mail, FileText, Link2 } from "lucide-react";
import { motion } from "framer-motion";

interface NavLink { label: string; href: string; }
interface SocialLink { label: string; href: string; visible: boolean; }

interface Settings {
  id: string;
  footer_description: string;
  copyright_text: string;
  contact_email: string;
  cta_form_email: string;
  seo_title: string;
  seo_description: string;
  nav_links: NavLink[];
  social_links: SocialLink[];
  favicon_url: string | null;
}

const AdminSettings = () => {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data: row } = await supabase
      .from("site_settings" as any)
      .select("*")
      .limit(1)
      .single();
    if (row) {
      const r = row as any;
      setData({
        id: r.id,
        footer_description: r.footer_description,
        copyright_text: r.copyright_text,
        contact_email: r.contact_email,
        cta_form_email: r.cta_form_email,
        seo_title: r.seo_title,
        seo_description: r.seo_description,
        nav_links: r.nav_links as NavLink[],
        social_links: r.social_links as SocialLink[],
        favicon_url: r.favicon_url,
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
        footer_description: data.footer_description.slice(0, 200),
        copyright_text: data.copyright_text.slice(0, 200),
        contact_email: data.contact_email.slice(0, 100),
        cta_form_email: data.cta_form_email.slice(0, 100),
        seo_title: data.seo_title.slice(0, 60),
        seo_description: data.seo_description.slice(0, 160),
        nav_links: data.nav_links,
        social_links: data.social_links,
        favicon_url: data.favicon_url,
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

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `favicon.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("platform-logos").upload(path, file, { upsert: true });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("platform-logos").getPublicUrl(path);
    setData({ ...data, favicon_url: urlData.publicUrl });
    setUploading(false);
  };

  // Nav links helpers
  const addNavLink = () => {
    if (!data || data.nav_links.length >= 10) return;
    setData({ ...data, nav_links: [...data.nav_links, { label: "", href: "#" }] });
  };
  const removeNavLink = (i: number) => {
    if (!data) return;
    setData({ ...data, nav_links: data.nav_links.filter((_, idx) => idx !== i) });
  };
  const updateNavLink = (i: number, field: keyof NavLink, val: string) => {
    if (!data) return;
    const links = [...data.nav_links];
    links[i] = { ...links[i], [field]: val.slice(0, 50) };
    setData({ ...data, nav_links: links });
  };

  // Social links helpers
  const addSocialLink = () => {
    if (!data || data.social_links.length >= 10) return;
    setData({ ...data, social_links: [...data.social_links, { label: "", href: "#", visible: true }] });
  };
  const removeSocialLink = (i: number) => {
    if (!data) return;
    setData({ ...data, social_links: data.social_links.filter((_, idx) => idx !== i) });
  };
  const updateSocialLink = (i: number, field: string, val: any) => {
    if (!data) return;
    const links = [...data.social_links];
    links[i] = { ...links[i], [field]: typeof val === "string" ? val.slice(0, 200) : val };
    setData({ ...data, social_links: links });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading settings…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No settings found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage global website content & configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save All"}
        </Button>
      </div>

      <Tabs defaultValue="footer" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* FOOTER TAB */}
        <TabsContent value="footer">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Footer Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={data.footer_description}
                    maxLength={200}
                    onChange={(e) => setData({ ...data, footer_description: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">{data.footer_description.length}/200</p>
                </div>
                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input
                    value={data.copyright_text}
                    maxLength={200}
                    onChange={(e) => setData({ ...data, copyright_text: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Use {"{year}"} for dynamic year</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Navigation Links
                </CardTitle>
                <CardDescription>Footer navigation items (max 10)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.nav_links.map((link, i) => (
                  <motion.div key={i} layout className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="Label"
                      value={link.label}
                      maxLength={50}
                      onChange={(e) => updateNavLink(i, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="#section"
                      value={link.href}
                      maxLength={50}
                      onChange={(e) => updateNavLink(i, "href", e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeNavLink(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
                <Button variant="outline" size="sm" onClick={addNavLink} disabled={data.nav_links.length >= 10}>
                  <Plus className="mr-1 h-3 w-3" /> Add Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SOCIAL TAB */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Links</CardTitle>
              <CardDescription>Toggle visibility and set URLs. Max 10 links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.social_links.map((link, i) => (
                <motion.div key={i} layout className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Switch
                    checked={link.visible}
                    onCheckedChange={(v) => updateSocialLink(i, "visible", v)}
                  />
                  <Input
                    placeholder="Platform name"
                    value={link.label}
                    maxLength={50}
                    onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                    className="w-40"
                  />
                  <Input
                    placeholder="https://..."
                    value={link.href}
                    maxLength={200}
                    onChange={(e) => updateSocialLink(i, "href", e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeSocialLink(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </motion.div>
              ))}
              <Button variant="outline" size="sm" onClick={addSocialLink} disabled={data.social_links.length >= 10}>
                <Plus className="mr-1 h-3 w-3" /> Add Social Link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT TAB */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Email (displayed in footer)</Label>
                <Input
                  type="email"
                  value={data.contact_email}
                  maxLength={100}
                  onChange={(e) => setData({ ...data, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Form Destination Email</Label>
                <Input
                  type="email"
                  value={data.cta_form_email}
                  maxLength={100}
                  onChange={(e) => setData({ ...data, cta_form_email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Where the "Get Audit" form submissions go</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO TAB */}
        <TabsContent value="seo">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> SEO Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={data.seo_title}
                    maxLength={60}
                    onChange={(e) => setData({ ...data, seo_title: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">{data.seo_title.length}/60 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={data.seo_description}
                    maxLength={160}
                    rows={3}
                    onChange={(e) => setData({ ...data, seo_description: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">{data.seo_description.length}/160 characters</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Favicon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.favicon_url && (
                  <div className="flex items-center gap-3">
                    <img src={data.favicon_url} alt="Favicon" className="h-8 w-8 rounded" />
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{data.favicon_url}</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="mr-1 h-3 w-3" /> {uploading ? "Uploading…" : "Upload Favicon"}
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: 32×32 or 64×64 PNG/ICO</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
