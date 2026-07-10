import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";

interface Metric {
  id?: string;
  value: string;
  label: string;
  sort_order: number;
  visible: boolean;
}

export default function AdminMetricsEditor() {
  const { toast } = useToast();
  const [items, setItems] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("hero_metrics").select("*").order("sort_order");
    if (data) setItems(data as Metric[]);
    setLoading(false);
  };

  const add = () => setItems([...items, { value: "", label: "", sort_order: items.length, visible: true }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Metric, val: any) => {
    const arr = [...items]; arr[i] = { ...arr[i], [field]: val }; setItems(arr);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const arr = [...items]; [arr[i], arr[j]] = [arr[j], arr[i]]; setItems(arr);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("hero_metrics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const inserts = items.map((it, i) => ({ value: it.value, label: it.label, sort_order: i, visible: it.visible }));
    if (inserts.length) {
      const { error } = await supabase.from("hero_metrics").insert(inserts);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    toast({ title: "Saved", description: "Metrics updated." });
    setSaving(false); load();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metrics Strip</h1>
          <p className="text-sm text-muted-foreground mt-1">Big-number stats shown on the homepage (e.g. 300%, 4:1).</p>
        </div>
        <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save All"}</Button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Value</Label>
                    <Input value={it.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="300%" />
                  </div>
                  <div>
                    <Label className="text-xs">Label</Label>
                    <Input value={it.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Ad revenue" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={it.visible} onCheckedChange={(v) => update(i, "visible", v)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={add} className="w-full border-dashed"><Plus className="mr-2 h-4 w-4" /> Add Metric</Button>
    </div>
  );
}
