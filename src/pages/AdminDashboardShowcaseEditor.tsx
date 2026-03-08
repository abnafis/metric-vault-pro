import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";

interface Metric { label: string; value: string; change: string; }

interface ShowcaseData {
  id: string;
  section_label: string;
  heading: string;
  heading_highlight: string;
  description: string;
  metrics: Metric[];
}

export default function AdminDashboardShowcaseEditor() {
  const { toast } = useToast();
  const [data, setData] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: rows } = await supabase
      .from("dashboard_showcase")
      .select("*")
      .limit(1);
    if (rows && rows.length > 0) {
      const r = rows[0] as any;
      setData({
        id: r.id,
        section_label: r.section_label,
        heading: r.heading,
        heading_highlight: r.heading_highlight,
        description: r.description,
        metrics: r.metrics as Metric[],
      });
    } else {
      // Create default row
      const { data: inserted } = await supabase
        .from("dashboard_showcase")
        .insert({})
        .select()
        .single();
      if (inserted) {
        const r = inserted as any;
        setData({
          id: r.id,
          section_label: r.section_label,
          heading: r.heading,
          heading_highlight: r.heading_highlight,
          description: r.description,
          metrics: r.metrics as Metric[],
        });
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("dashboard_showcase")
      .update({
        section_label: data.section_label,
        heading: data.heading,
        heading_highlight: data.heading_highlight,
        description: data.description,
        metrics: data.metrics as any,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Dashboard showcase updated." });
    }
  };

  const updateMetric = (i: number, field: keyof Metric, val: string) => {
    if (!data) return;
    const metrics = [...data.metrics];
    metrics[i] = { ...metrics[i], [field]: val };
    setData({ ...data, metrics });
  };

  const addMetric = () => {
    if (!data || data.metrics.length >= 8) return;
    setData({ ...data, metrics: [...data.metrics, { label: "", value: "", change: "" }] });
  };

  const removeMetric = (i: number) => {
    if (!data) return;
    setData({ ...data, metrics: data.metrics.filter((_, idx) => idx !== i) });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No data found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Showcase</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit the analytics dashboard section on the homepage.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Section Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Section Label</Label>
              <Input value={data.section_label} onChange={(e) => setData({ ...data, section_label: e.target.value })} />
            </div>
            <div>
              <Label>Heading Highlight</Label>
              <Input value={data.heading_highlight} onChange={(e) => setData({ ...data, heading_highlight: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Heading</Label>
            <Input value={data.heading} onChange={(e) => setData({ ...data, heading: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Top Metrics</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.metrics.map((m, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end">
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={m.label} onChange={(e) => updateMetric(i, "label", e.target.value)} placeholder="Total Revenue" />
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <Input value={m.value} onChange={(e) => updateMetric(i, "value", e.target.value)} placeholder="$482K" />
              </div>
              <div>
                <Label className="text-xs">Change</Label>
                <Input value={m.change} onChange={(e) => updateMetric(i, "change", e.target.value)} placeholder="+12.4%" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeMetric(i)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addMetric} size="sm" className="border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add Metric
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
