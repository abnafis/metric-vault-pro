import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, Reorder } from "framer-motion";

interface Platform {
  id: string;
  name: string;
  logo_url: string;
  link: string | null;
  sort_order: number;
}

const AdminPlatformsEditor = () => {
  const [items, setItems] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems((data as Platform[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setLink("");
    setLogoUrl("");
    setDialogOpen(true);
  };

  const openEdit = (p: Platform) => {
    setEditing(p);
    setName(p.name);
    setLink(p.link || "");
    setLogoUrl(p.logo_url);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `platform-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("platform-logos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("platform-logos").getPublicUrl(path);
      setLogoUrl(urlData.publicUrl);
      toast({ title: "Logo uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !logoUrl.trim()) {
      toast({ title: "Name and logo are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      logo_url: logoUrl,
      link: link.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from("platforms").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Platform updated" });
    } else {
      const { error } = await supabase.from("platforms").insert({ ...payload, sort_order: items.length });
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Platform added" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("platforms").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Platform deleted" }); fetchAll(); }
  };

  const handleReorder = async (newOrder: Platform[]) => {
    setItems(newOrder);
    const updates = newOrder.map((p, i) =>
      supabase.from("platforms").update({ sort_order: i }).eq("id", p.id)
    );
    await Promise.all(updates);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platforms</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage trusted platform logos. Drag to reorder.</p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Platform
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No platforms yet.</div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
          {items.map((p) => (
            <Reorder.Item
              key={p.id}
              value={p}
              className="glass-card p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                <img src={p.logo_url} alt={p.name} className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                {p.link && <p className="text-xs text-muted-foreground truncate">{p.link}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Edit Platform" : "Add Platform"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Platform Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Link (optional)</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Logo *</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex items-center gap-3 mt-1">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-border">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                  {uploading ? "Uploading…" : "Upload Logo"}
                </Button>
              </div>
              {logoUrl && (
                <div className="mt-3 glass-card p-4 flex items-center justify-center">
                  <img src={logoUrl} alt="Logo preview" className="max-h-16 object-contain" />
                </div>
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

export default AdminPlatformsEditor;
