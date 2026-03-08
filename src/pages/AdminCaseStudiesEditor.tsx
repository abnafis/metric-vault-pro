import { useState, useEffect, useCallback, useRef } from "react";
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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Upload,
  TrendingUp,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface Metric {
  label: string;
  value: string;
}

interface CaseStudy {
  id: string;
  title: string;
  problem: string;
  solution: string;
  metrics: Metric[];
  chart_data: { v: number }[];
  image_url: string | null;
  client_name: string | null;
  platform_used: string | null;
  sort_order: number;
}

const emptyForm = () => ({
  title: "",
  problem: "",
  solution: "",
  metrics: [{ label: "", value: "" }] as Metric[],
  chart_data: [] as { v: number }[],
  image_url: null as string | null,
  client_name: "",
  platform_used: "",
});

const AdminCaseStudiesEditor = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [form, setForm] = useState(emptyForm());
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems((data as CaseStudy[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (c: CaseStudy) => {
    setEditing(c);
    setForm({
      title: c.title,
      problem: c.problem,
      solution: c.solution,
      metrics: c.metrics?.length ? c.metrics : [{ label: "", value: "" }],
      chart_data: c.chart_data || [],
      image_url: c.image_url,
      client_name: c.client_name || "",
      platform_used: c.platform_used || "",
    });
    setDialogOpen(true);
  };

  const addMetric = () => setForm((f) => ({ ...f, metrics: [...f.metrics, { label: "", value: "" }] }));
  const removeMetric = (i: number) => setForm((f) => ({ ...f, metrics: f.metrics.filter((_, idx) => idx !== i) }));
  const updateMetric = (i: number, field: "label" | "value", val: string) =>
    setForm((f) => ({ ...f, metrics: f.metrics.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)) }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `case-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("case-studies").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("case-studies").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
      toast({ title: "Image uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.problem.trim() || !form.solution.trim()) {
      toast({ title: "Title, problem, and solution are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const cleanMetrics = form.metrics.filter((m) => m.label.trim() && m.value.trim());
    const payload = {
      title: form.title,
      problem: form.problem,
      solution: form.solution,
      metrics: cleanMetrics,
      chart_data: form.chart_data,
      image_url: form.image_url || null,
      client_name: form.client_name || null,
      platform_used: form.platform_used || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from("case_studies").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Case study updated" });
    } else {
      const { error } = await supabase.from("case_studies").insert({ ...payload, sort_order: items.length });
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Case study created" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("case_studies").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Case study deleted" }); fetchAll(); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Case Studies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your case studies and client results.</p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Case Study
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">No case studies yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 flex flex-col gap-3 group"
            >
              {c.image_url && (
                <img src={c.image_url} alt={c.title} className="rounded-lg border border-border h-32 w-full object-cover" />
              )}
              <h3 className="font-bold text-foreground">{c.title}</h3>
              {c.client_name && <p className="text-xs text-muted-foreground">Client: {c.client_name}</p>}
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="text-[hsl(var(--chart-red))] font-medium">Problem:</span> {c.problem}
              </p>
              <div className="flex gap-2 mt-auto">
                {(c.metrics as Metric[])?.slice(0, 2).map((m) => (
                  <div key={m.label} className="metric-card flex-1 text-center py-2">
                    <p className="text-sm font-bold gradient-text-blue">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => openEdit(c)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Edit Case Study" : "Add Case Study"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 bg-secondary border-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Client Name</Label>
                <Input value={form.client_name || ""} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Platform Used</Label>
                <Input value={form.platform_used || ""} onChange={(e) => setForm((f) => ({ ...f, platform_used: e.target.value }))} className="mt-1 bg-secondary border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Problem *</Label>
              <Textarea value={form.problem} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} className="mt-1 bg-secondary border-border min-h-[80px]" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Solution *</Label>
              <Textarea value={form.solution} onChange={(e) => setForm((f) => ({ ...f, solution: e.target.value }))} className="mt-1 bg-secondary border-border min-h-[80px]" />
            </div>

            {/* Metrics */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Metrics / Results</Label>
                <Button variant="ghost" size="sm" onClick={addMetric} className="h-6 text-xs"><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              <div className="space-y-2">
                {form.metrics.map((m, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Label" value={m.label} onChange={(e) => updateMetric(i, "label", e.target.value)} className="bg-secondary border-border text-sm" />
                    <Input placeholder="Value" value={m.value} onChange={(e) => updateMetric(i, "value", e.target.value)} className="bg-secondary border-border text-sm w-28" />
                    {form.metrics.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeMetric(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div>
              <Label className="text-xs text-muted-foreground">Image</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex items-center gap-3 mt-1">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-border">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
                {form.image_url && (
                  <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, image_url: null }))} className="text-destructive">Remove</Button>
                )}
              </div>
              {form.image_url && <img src={form.image_url} alt="Preview" className="rounded-lg border border-border mt-2 max-h-32 object-cover" />}
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

export default AdminCaseStudiesEditor;
