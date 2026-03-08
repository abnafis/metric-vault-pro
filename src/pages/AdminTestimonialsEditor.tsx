import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Loader2, Save, Upload, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PLATFORMS = ["Fiverr", "LinkedIn", "Upwork", "Direct Client"];

const platformColors: Record<string, string> = {
  Fiverr: "bg-[hsl(var(--chart-green))]/15 text-[hsl(var(--chart-green))]",
  LinkedIn: "bg-primary/15 text-primary",
  Upwork: "bg-[hsl(var(--chart-green))]/15 text-[hsl(var(--chart-green))]",
  "Direct Client": "bg-accent/15 text-accent",
};

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar_url: string | null;
  rating: number;
  platform: string;
  sort_order: number;
}

const emptyForm = () => ({
  name: "",
  role: "",
  text: "",
  avatar_url: null as string | null,
  rating: 5,
  platform: "Direct Client",
});

const AdminTestimonialsEditor = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm());
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems((data as Testimonial[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role,
      text: t.text,
      avatar_url: t.avatar_url,
      rating: t.rating,
      platform: t.platform,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("testimonial-avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("testimonial-avatars").getPublicUrl(path);
      setForm((f) => ({ ...f, avatar_url: urlData.publicUrl }));
      toast({ title: "Avatar uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim() || !form.text.trim()) {
      toast({ title: "Name, role, and text are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      text: form.text.trim(),
      avatar_url: form.avatar_url || null,
      rating: form.rating,
      platform: form.platform,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Testimonial updated" });
    } else {
      const { error } = await supabase.from("testimonials").insert({ ...payload, sort_order: items.length });
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Testimonial added" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Testimonial deleted" }); fetchAll(); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage client testimonials and reviews.</p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Testimonial
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No testimonials yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">{t.name[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                </div>
              </div>

              {/* Rating + Platform */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-3 h-3 ${si < t.rating ? "text-[hsl(var(--chart-orange))] fill-[hsl(var(--chart-orange))]" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${platformColors[t.platform] ?? "bg-secondary text-muted-foreground"}`}>
                  {t.platform}
                </span>
              </div>

              {/* Text — clamped to prevent layout break */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1">"{t.text}"</p>

              {/* Actions */}
              <div className="flex gap-1 pt-1 border-t border-border/30">
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(t)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Client Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role / Company *</Label>
                <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="mt-1 bg-secondary border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Testimonial Text *</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                className="mt-1 bg-secondary border-border min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{form.text.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
                  <SelectTrigger className="mt-1 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Rating</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: r }))}
                      className="p-0.5"
                    >
                      <Star className={`w-5 h-5 transition-colors ${r <= form.rating ? "text-[hsl(var(--chart-orange))] fill-[hsl(var(--chart-orange))]" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <Label className="text-xs text-muted-foreground">Avatar</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex items-center gap-3 mt-1">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-border">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                  {uploading ? "Uploading…" : "Upload Avatar"}
                </Button>
                {form.avatar_url && (
                  <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, avatar_url: null }))} className="text-destructive">Remove</Button>
                )}
              </div>
              {form.avatar_url && (
                <img src={form.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full object-cover mt-2 border border-border" />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="border-border">Cancel</Button>
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

export default AdminTestimonialsEditor;
