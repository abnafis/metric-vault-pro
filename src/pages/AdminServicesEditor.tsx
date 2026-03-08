import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  Settings,
  Tag,
  Target,
  Server,
  Plug,
  Bug,
  BarChart3,
  Code,
  Database,
  Globe,
  Shield,
  Zap,
  Search,
  Layout,
  Monitor,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, Reorder } from "framer-motion";

const ICON_OPTIONS = [
  { value: "Settings", label: "Settings", icon: Settings },
  { value: "Tag", label: "Tag", icon: Tag },
  { value: "Target", label: "Target", icon: Target },
  { value: "Server", label: "Server", icon: Server },
  { value: "Plug", label: "Plug", icon: Plug },
  { value: "Bug", label: "Bug", icon: Bug },
  { value: "BarChart3", label: "Chart", icon: BarChart3 },
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
}

const emptyService = (): Omit<Service, "id" | "sort_order"> => ({
  title: "",
  description: "",
  icon: "Settings",
  features: [],
});

const AdminServicesEditor = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService());
  const [featureInput, setFeatureInput] = useState("");
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setServices((data as Service[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyService());
    setFeatureInput("");
    setDialogOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, icon: s.icon, features: s.features || [] });
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

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Title and description are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("services")
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Service updated" });
    } else {
      const { error } = await supabase
        .from("services")
        .insert({ ...form, sort_order: services.length });
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Service created" });
    }

    setSaving(false);
    setDialogOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Service deleted" });
      fetch();
    }
  };

  const handleReorder = async (newOrder: Service[]) => {
    setServices(newOrder);
    // Persist sort order
    const updates = newOrder.map((s, i) =>
      supabase.from("services").update({ sort_order: i }).eq("id", s.id)
    );
    await Promise.all(updates);
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
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{s.title}</p>
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
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
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

            <div>
              <Label className="text-xs text-muted-foreground">Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
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
