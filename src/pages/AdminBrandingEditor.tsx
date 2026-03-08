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
import { Save, Upload, Trash2, Plus, GripVertical, BarChart3, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface NavLink { label: string; href: string; visible?: boolean; }
interface PageTitle { title: string; meta_title: string; meta_description: string; }
interface PageTitles { [key: string]: PageTitle; }

interface BrandingData {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_url: string | null;
  dark_logo_url: string | null;
  favicon_url: string | null;
  title_format: string;
  nav_links: NavLink[];
  page_titles: PageTitles;
}

const defaultPageTitles: PageTitles = {
  homepage: { title: "Home", meta_title: "", meta_description: "" },
  blog: { title: "Blog", meta_title: "", meta_description: "" },
  services: { title: "Services", meta_title: "", meta_description: "" },
  case_studies: { title: "Case Studies", meta_title: "", meta_description: "" },
  contact: { title: "Contact", meta_title: "", meta_description: "" },
};

const AdminBrandingEditor = () => {
  const [data, setData] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const darkLogoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: row } = await supabase
      .from("site_settings" as any)
      .select("*")
      .limit(1)
      .single();
    if (row) {
      const r = row as any;
      setData({
        id: r.id,
        site_name: r.site_name || "TrackRight",
        site_tagline: r.site_tagline || "",
        logo_url: r.logo_url,
        dark_logo_url: r.dark_logo_url,
        favicon_url: r.favicon_url,
        title_format: r.title_format || "{page} | {site}",
        nav_links: (r.nav_links as NavLink[]).map(l => ({ ...l, visible: l.visible !== false })),
        page_titles: { ...defaultPageTitles, ...(r.page_titles as PageTitles) },
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
        site_name: data.site_name.slice(0, 100),
        site_tagline: data.site_tagline.slice(0, 200),
        logo_url: data.logo_url,
        dark_logo_url: data.dark_logo_url,
        favicon_url: data.favicon_url,
        title_format: data.title_format.slice(0, 100),
        nav_links: data.nav_links,
        page_titles: data.page_titles,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Branding settings updated." });
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "dark_logo_url" | "favicon_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    const validTypes = ["image/svg+xml", "image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid format", description: "Please upload SVG, PNG, or WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 2MB.", variant: "destructive" });
      return;
    }

    setUploading(field);
    const ext = file.name.split(".").pop();
    const path = `branding/${field.replace("_url", "")}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("platform-logos").upload(path, file, { upsert: true });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("platform-logos").getPublicUrl(path);
    setData({ ...data, [field]: urlData.publicUrl });
    setUploading(null);
  };

  const removeImage = (field: "logo_url" | "dark_logo_url" | "favicon_url") => {
    if (!data) return;
    setData({ ...data, [field]: null });
  };

  // Nav link helpers
  const addNavLink = () => {
    if (!data || data.nav_links.length >= 10) return;
    setData({ ...data, nav_links: [...data.nav_links, { label: "", href: "#", visible: true }] });
  };
  const removeNavLink = (i: number) => {
    if (!data) return;
    setData({ ...data, nav_links: data.nav_links.filter((_, idx) => idx !== i) });
  };
  const updateNavLink = (i: number, field: string, val: any) => {
    if (!data) return;
    const links = [...data.nav_links];
    links[i] = { ...links[i], [field]: typeof val === "string" ? val.slice(0, 100) : val };
    setData({ ...data, nav_links: links });
  };
  const moveNavLink = (i: number, dir: -1 | 1) => {
    if (!data) return;
    const j = i + dir;
    if (j < 0 || j >= data.nav_links.length) return;
    const links = [...data.nav_links];
    [links[i], links[j]] = [links[j], links[i]];
    setData({ ...data, nav_links: links });
  };

  // Page title helpers
  const updatePageTitle = (key: string, field: keyof PageTitle, val: string) => {
    if (!data) return;
    setData({
      ...data,
      page_titles: {
        ...data.page_titles,
        [key]: { ...data.page_titles[key], [field]: val },
      },
    });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading branding settings…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No settings found.</div>;

  const previewTitle = data.title_format.replace("{page}", "Blog").replace("{site}", data.site_name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Identity & Branding</h1>
          <p className="text-sm text-muted-foreground">Manage your website's core branding elements</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save All"}
        </Button>
      </div>

      {/* Live Preview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> Live Header Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-background p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {data.logo_url ? (
                <img src={data.logo_url} alt="Logo" className="h-8 max-w-[140px] object-contain" />
              ) : (
                <BarChart3 className="w-6 h-6 text-primary" />
              )}
              <span className="font-bold text-foreground">{data.site_name}</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
              {data.nav_links.filter(l => l.visible !== false).slice(0, 5).map((l, i) => (
                <span key={i}>{l.label || "Link"}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Browser tab: <span className="font-mono text-foreground">{previewTitle}</span>
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="pages">Page Titles</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        {/* IDENTITY TAB */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Identity</CardTitle>
              <CardDescription>Core identity details used across the website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Website Name</Label>
                <Input
                  value={data.site_name}
                  maxLength={100}
                  onChange={(e) => setData({ ...data, site_name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Displayed in header, footer, and browser tab</p>
              </div>
              <div className="space-y-2">
                <Label>Website Tagline</Label>
                <Input
                  value={data.site_tagline}
                  maxLength={200}
                  onChange={(e) => setData({ ...data, site_tagline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Page Title Format</Label>
                <Input
                  value={data.title_format}
                  maxLength={100}
                  onChange={(e) => setData({ ...data, title_format: e.target.value })}
                  placeholder="{page} | {site}"
                />
                <p className="text-xs text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">{"{page}"}</code> for page name and <code className="bg-muted px-1 rounded">{"{site}"}</code> for website name.
                  Preview: <span className="font-mono">{previewTitle}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGOS TAB */}
        <TabsContent value="logos">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Main Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Main Logo</CardTitle>
                <CardDescription>Primary logo for the website header</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.logo_url ? (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                    <img src={data.logo_url} alt="Logo" className="h-10 max-w-[160px] object-contain" />
                    <Button size="icon" variant="ghost" onClick={() => removeImage("logo_url")}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    No logo uploaded
                  </div>
                )}
                <input ref={logoRef} type="file" accept=".svg,.png,.webp" className="hidden" onChange={(e) => handleImageUpload(e, "logo_url")} />
                <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={uploading === "logo_url"}>
                  <Upload className="mr-1 h-3 w-3" /> {uploading === "logo_url" ? "Uploading…" : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">SVG, PNG, or WebP. Max 2MB.</p>
              </CardContent>
            </Card>

            {/* Dark Mode Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dark Mode Logo</CardTitle>
                <CardDescription>Optional alternate logo for dark backgrounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.dark_logo_url ? (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-foreground/90">
                    <img src={data.dark_logo_url} alt="Dark Logo" className="h-10 max-w-[160px] object-contain" />
                    <Button size="icon" variant="ghost" onClick={() => removeImage("dark_logo_url")}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    No dark logo uploaded
                  </div>
                )}
                <input ref={darkLogoRef} type="file" accept=".svg,.png,.webp" className="hidden" onChange={(e) => handleImageUpload(e, "dark_logo_url")} />
                <Button variant="outline" size="sm" onClick={() => darkLogoRef.current?.click()} disabled={uploading === "dark_logo_url"}>
                  <Upload className="mr-1 h-3 w-3" /> {uploading === "dark_logo_url" ? "Uploading…" : "Upload Dark Logo"}
                </Button>
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Favicon</CardTitle>
                <CardDescription>Browser tab icon (32×32 or 64×64)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.favicon_url ? (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <img src={data.favicon_url} alt="Favicon" className="h-8 w-8 rounded" />
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">Uploaded</span>
                    <Button size="icon" variant="ghost" onClick={() => removeImage("favicon_url")}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    No favicon uploaded
                  </div>
                )}
                <input ref={faviconRef} type="file" accept=".svg,.png,.webp,.ico" className="hidden" onChange={(e) => handleImageUpload(e, "favicon_url")} />
                <Button variant="outline" size="sm" onClick={() => faviconRef.current?.click()} disabled={uploading === "favicon_url"}>
                  <Upload className="mr-1 h-3 w-3" /> {uploading === "favicon_url" ? "Uploading…" : "Upload Favicon"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PAGE TITLES TAB */}
        <TabsContent value="pages">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page Titles & SEO</CardTitle>
                <CardDescription>Control browser tab titles and meta tags for each page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(data.page_titles).map(([key, page]) => (
                  <div key={key} className="space-y-3 rounded-lg border border-border p-4">
                    <h4 className="font-medium text-sm text-foreground capitalize">{key.replace("_", " ")} Page</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Page Title</Label>
                        <Input
                          value={page.title}
                          maxLength={60}
                          onChange={(e) => updatePageTitle(key, "title", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Meta Title</Label>
                        <Input
                          value={page.meta_title}
                          maxLength={60}
                          placeholder={data.title_format.replace("{page}", page.title).replace("{site}", data.site_name)}
                          onChange={(e) => updatePageTitle(key, "meta_title", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Meta Description</Label>
                      <Textarea
                        value={page.meta_description}
                        maxLength={160}
                        rows={2}
                        onChange={(e) => updatePageTitle(key, "meta_description", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">{page.meta_description.length}/160</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NAVIGATION TAB */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Navigation Menu</CardTitle>
              <CardDescription>Manage header navigation items. Drag to reorder, toggle visibility. Max 10 items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.nav_links.map((link, i) => (
                <motion.div key={i} layout className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveNavLink(i, -1)}
                      disabled={i === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                    >▲</button>
                    <button
                      onClick={() => moveNavLink(i, 1)}
                      disabled={i === data.nav_links.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                    >▼</button>
                  </div>
                  <Switch
                    checked={link.visible !== false}
                    onCheckedChange={(v) => updateNavLink(i, "visible", v)}
                  />
                  <Input
                    placeholder="Label"
                    value={link.label}
                    maxLength={50}
                    onChange={(e) => updateNavLink(i, "label", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="#section or /page"
                    value={link.href}
                    maxLength={100}
                    onChange={(e) => updateNavLink(i, "href", e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeNavLink(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </motion.div>
              ))}
              <Button variant="outline" size="sm" onClick={addNavLink} disabled={data.nav_links.length >= 10}>
                <Plus className="mr-1 h-3 w-3" /> Add Menu Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBrandingEditor;
