import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, GripVertical, Loader2, Save, Upload as UploadIcon, X, Star,
  Settings, Tag, Target, Server, Plug, Bug, BarChart3, Code, Database,
  Globe, Shield, Zap, Search, Layout, Monitor, Smartphone,
  Facebook, Linkedin, LineChart, Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reorder } from "framer-motion";

const ICON_OPTIONS = [
  { value: "BarChart3", label: "Chart", icon: BarChart3 },
  { value: "Facebook", label: "Facebook", icon: Facebook },
  { value: "Linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "LineChart", label: "Line Chart", icon: LineChart },
  { value: "Upload", label: "Upload", icon: Upload },
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "Tag", label: "Tag", icon: Tag },
  { value: "Target", label: "Target", icon: Target },
  { value: "Server", label: "Server", icon: Server },
  { value: "Plug", label: "Plug", icon: Plug },
  { value: "Bug", label: "Bug", icon: Bug },
  { value: "Code", label: "Code", icon: Code },
  { value: "Database", label: "Database", icon: Database },
  { value: "Globe", label: "Globe", icon: Globe },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Search", label: "Search", icon: Search },
  { value: "Layout", label: "Layout", icon: Layout },
  { value: "Monitor", label: "Monitor", icon: Monitor },
  { value: "Smartphone", label: "Smartphone", icon: Smartphone },
];

const ACCENT_OPTIONS = [
  { value: "amber",  label: "Amber",  swatch: "#F59E0B" },
  { value: "blue",   label: "Blue",   swatch: "#3B82F6" },
  { value: "pink",   label: "Pink",   swatch: "#EC4899" },
  { value: "green",  label: "Green",  swatch: "#22C55E" },
  { value: "purple", label: "Purple", swatch: "#8B5CF6" },
  { value: "orange", label: "Orange", swatch: "#F97316" },
  { value: "teal",   label: "Teal",   swatch: "#14B8A6" },
  { value: "slate",  label: "Slate",  swatch: "#64748B" },
];

const BG_PRESETS = [
  { value: "light", label: "Light (card)" },
  { value: "tint", label: "Soft tint" },
  { value: "dark", label: "Dark" },
  { value: "custom", label: "Custom color" },
];

export const iconMap: Record<string, React.ComponentType<any>> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.value, o.icon])
);

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  sort_order: number;
  eyebrow: string | null;
  badge: string | null;
  accent: string;
  cta_label: string;
  cta_link: string;
  cta_style: string;
  icon_image_url: string | null;
  card_bg_preset: string;
  card_bg_color: string | null;
  card_bg_image_url: string | null;
  price_label: string | null;
  featured: boolean;
}

interface ServicesCTA {
  id: string;
  eyebrow: string;
  headline: string;
  headline_highlight: string;
  button_label: string;
  button_link: string;
}

const emptyService = (): Omit<Service, "id" | "sort_order"> => ({
  title: "",
  description: "",
  icon: "BarChart3",
  features: [],
  eyebrow: "",
  badge: "",
  accent: "amber",
  cta_label: "Book this service",
  cta_link: "#contact",
  cta_style: "link",
  icon_image_url: null,
  card_bg_preset: "light",
  card_bg_color: null,
  card_bg_image_url: null,
  price_label: null,
  featured: false,
});

const AdminServicesEditor = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService());
  const [featureInput, setFeatureInput] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const [cta, setCta] = useState<ServicesCTA | null>(null);
  const [savingCta, setSavingCta] = useState(false);

  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const [{ data: servicesData, error }, { data: ctaData }] = await Promise.all([
      supabase.from("services").select("*").order("sort_order", { ascending: true }),
      supabase.from("services_cta").select("*").limit(1).maybeSingle(),
    ]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setServices((servicesData as Service[]) || []);
    }
    if (ctaData) setCta(ctaData as ServicesCTA);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyService());
    setFeatureInput("");
    setDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description,
      icon: s.icon,
      features: s.features || [],
      eyebrow: s.eyebrow || "",
      badge: s.badge || "",
      accent: s.accent || "amber",
      cta_label: s.cta_label || "Book this service",
      cta_link: s.cta_link || "#contact",
      cta_style: s.cta_style || "link",
      icon_image_url: s.icon_image_url || null,
      card_bg_preset: s.card_bg_preset || "light",
      card_bg_color: s.card_bg_color || null,
      card_bg_image_url: s.card_bg_image_url || null,
      price_label: s.price_label || null,
      featured: !!s.featured,
    });
    setFeatureInput("");
    setDialogOpen(true);
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !form.features.includes(trimmed)) {
      setForm((f) => ({ ...f, features: [...f.features, trimmed] }));
      setFeatureInput("");
    }
  };

  const removeFeature = (idx: number) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  const handleImageUpload = async (
    file: File,
    field: "icon_image_url" | "card_bg_image_url",
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true);
    const path = `services/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("platform-logos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("platform-logos").getPublicUrl(path);
      setForm((f) => ({ ...f, [field]: data.publicUrl }));
      toast({ title: "Uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Title and description are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = { ...form };

    if (editing) {
      const { error } = await supabase
        .from("services")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Service updated" });
    } else {
      const { error } = await supabase
        .from("services")
        .insert({ ...payload, sort_order: services.length });
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Service created" });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Service deleted" });
      fetchAll();
    }
  };

  const handleReorder = async (newOrder: Service[]) => {
    setServices(newOrder);
    const updates = newOrder.map((s, i) =>
      supabase.from("services").update({ sort_order: i }).eq("id", s.id)
    );
    await Promise.all(updates);
  };

  const saveCta = async () => {
    if (!cta) return;
    setSavingCta(true);
    const { error } = await supabase
      .from("services_cta")
      .update({
        eyebrow: cta.eyebrow,
        headline: cta.headline,
        headline_highlight: cta.headline_highlight,
        button_label: cta.button_label,
        button_link: cta.button_link,
      })
      .eq("id", cta.id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "CTA tile saved" });
    setSavingCta(false);
  };

  const IconComp = (name: string) => iconMap[name] || Settings;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your services. Drag to reorder.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
      </div>

      <div className="text-xs text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2">
        Section eyebrow, title & subtitle are managed in <strong>Section Headers</strong> (slug: <code>services</code>).
      </div>

      {/* CTA Tile Editor */}
      {cta && (
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Section CTA Tile</h2>
              <p className="text-xs text-muted-foreground">The dark card at the end of the services grid.</p>
            </div>
            <Button size="sm" onClick={saveCta} disabled={savingCta} className="bg-primary text-primary-foreground">
              {savingCta ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Eyebrow</Label>
              <Input value={cta.eyebrow} onChange={(e) => setCta({ ...cta, eyebrow: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Headline</Label>
              <Input value={cta.headline} onChange={(e) => setCta({ ...cta, headline: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Headline highlight (italic)</Label>
              <Input value={cta.headline_highlight} onChange={(e) => setCta({ ...cta, headline_highlight: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Button label</Label>
              <Input value={cta.button_label} onChange={(e) => setCta({ ...cta, button_label: e.target.value })} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Button link</Label>
              <Input value={cta.button_link} onChange={(e) => setCta({ ...cta, button_link: e.target.value })} className="mt-1 bg-secondary border-border" placeholder="#contact or https://…" />
            </div>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          No services yet. Click "Add Service" to get started.
        </div>
      ) : (
        <Reorder.Group axis="y" values={services} onReorder={handleReorder} className="space-y-2">
          {services.map((s) => {
            const Icon = IconComp(s.icon);
            return (
              <Reorder.Item
                key={s.id}
                value={s}
                className="glass-card p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {s.icon_image_url ? (
                    <img src={s.icon_image_url} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    <Icon className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate flex items-center gap-2">
                    {s.title}
                    {s.featured && <Star className="w-3 h-3 fill-primary text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                </div>
                {s.features && s.features.length > 0 && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {s.features.length} feature{s.features.length !== 1 ? "s" : ""}
                  </span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Basics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Eyebrow</Label>
                <Input
                  value={form.eyebrow || ""}
                  onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
                  placeholder="01 / Paid search"
                  className="mt-1 bg-secondary border-border"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Badge</Label>
                <Input
                  value={form.badge || ""}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="Most requested"
                  className="mt-1 bg-secondary border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 bg-secondary border-border"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 bg-secondary border-border min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Price / starting-at (optional)</Label>
                <Input
                  value={form.price_label || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value || null }))}
                  placeholder="From $499"
                  className="mt-1 bg-secondary border-border"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
                  Mark as “Popular”
                </label>
              </div>
            </div>

            {/* Icon */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Built-in icon</Label>
                  <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                    <SelectTrigger className="mt-1 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      {ICON_OPTIONS.map((opt) => {
                        const I = opt.icon;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <I className="h-4 w-4" /> {opt.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Or upload custom icon</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {form.icon_image_url && (
                      <div className="relative w-10 h-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        <img src={form.icon_image_url} alt="" className="w-8 h-8 object-contain" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, icon_image_url: null }))}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                    <input
                      ref={iconFileRef}
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "icon_image_url", setUploadingIcon)}
                    />
                    <Button variant="outline" size="sm" onClick={() => iconFileRef.current?.click()} disabled={uploadingIcon} className="border-border">
                      {uploadingIcon ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <UploadIcon className="h-3 w-3 mr-1" />}
                      Upload
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Custom icon overrides built-in.</p>
                </div>
              </div>
            </div>

            {/* Card background */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card background</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Preset</Label>
                  <Select value={form.card_bg_preset} onValueChange={(v) => setForm((f) => ({ ...f, card_bg_preset: v }))}>
                    <SelectTrigger className="mt-1 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {BG_PRESETS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.card_bg_preset === "custom" && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Custom color (hex)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={form.card_bg_color || "#ffffff"}
                        onChange={(e) => setForm((f) => ({ ...f, card_bg_color: e.target.value }))}
                        className="h-9 w-12 rounded border border-border bg-secondary cursor-pointer"
                      />
                      <Input
                        value={form.card_bg_color || ""}
                        onChange={(e) => setForm((f) => ({ ...f, card_bg_color: e.target.value || null }))}
                        placeholder="#FFF3E0"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Background image (optional)</Label>
                <div className="flex items-center gap-2 mt-1">
                  {form.card_bg_image_url && (
                    <div className="relative w-14 h-10 rounded-md overflow-hidden bg-secondary shrink-0">
                      <img src={form.card_bg_image_url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, card_bg_image_url: null }))}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={bgFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "card_bg_image_url", setUploadingBg)}
                  />
                  <Button variant="outline" size="sm" onClick={() => bgFileRef.current?.click()} disabled={uploadingBg} className="border-border">
                    {uploadingBg ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <UploadIcon className="h-3 w-3 mr-1" />}
                    Upload background
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Accent color (icon chip + glow)</Label>
                <Select value={form.accent} onValueChange={(v) => setForm((f) => ({ ...f, accent: v }))}>
                  <SelectTrigger className="mt-1 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {ACCENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ background: opt.swatch }} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Call to action</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Style</Label>
                  <Select value={form.cta_style} onValueChange={(v) => setForm((f) => ({ ...f, cta_style: v }))}>
                    <SelectTrigger className="mt-1 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="link">Underline link</SelectItem>
                      <SelectItem value="button">Filled button</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={form.cta_label}
                    onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Link</Label>
                  <Input
                    value={form.cta_link}
                    onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))}
                    placeholder="#contact or https://…"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-border pt-4">
              <Label className="text-xs text-muted-foreground">Features (optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="Add a feature…"
                  className="bg-secondary border-border"
                />
                <Button variant="outline" size="sm" onClick={addFeature} className="border-border shrink-0">
                  Add
                </Button>
              </div>
              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.features.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-secondary text-foreground px-2 py-1 rounded-md"
                    >
                      {f}
                      <button onClick={() => removeFeature(i)} className="hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServicesEditor;
