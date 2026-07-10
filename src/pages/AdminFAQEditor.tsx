import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  sort_order: number;
  visible: boolean;
}

export default function AdminFAQEditor() {
  const { toast } = useToast();
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("faqs").select("*").order("sort_order");
    if (data) setItems(data as FAQ[]);
    setLoading(false);
  };

  const add = () => setItems([...items, { question: "", answer: "", sort_order: items.length, visible: true }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof FAQ, val: any) => {
    const arr = [...items]; arr[i] = { ...arr[i], [field]: val }; setItems(arr);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const arr = [...items]; [arr[i], arr[j]] = [arr[j], arr[i]]; setItems(arr);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const inserts = items.map((it, i) => ({
      question: it.question, answer: it.answer, sort_order: i, visible: it.visible,
    }));
    if (inserts.length) {
      const { error } = await supabase.from("faqs").insert(inserts);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    toast({ title: "Saved", description: "FAQs updated." });
    setSaving(false); load();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FAQs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the FAQ accordion on the homepage.</p>
        </div>
        <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save All"}</Button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Visible</Label>
                  <Switch checked={it.visible} onCheckedChange={(v) => update(i, "visible", v)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div>
                <Label className="text-xs">Question</Label>
                <Input value={it.question} onChange={(e) => update(i, "question", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Answer</Label>
                <Textarea rows={3} value={it.answer} onChange={(e) => update(i, "answer", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={add} className="w-full border-dashed"><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
    </div>
  );
}
