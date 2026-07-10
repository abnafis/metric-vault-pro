import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";

interface Logo {
  id?: string;
  image_url: string;
  alt: string;
  sort_order: number;
  visible: boolean;
}

export default function AdminPartnerLogosEditor() {
  const { toast } = useToast();
  const [items, setItems] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from("partner_logos").select("*").order("sort_order");
    if (data) setItems(data.map((r: any) => ({ ...r, alt: r.alt ?? "" })) as Logo[]);
    setLoading(false);
  };

  const add = () => setItems([...items, { image_url: "", alt: "", sort_order: items.length, visible: true }]);
  const remove = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Logo, val: any) => {
    const arr = [...items]; arr[i] = { ...arr[i], [field]: val }; setItems(arr);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    const arr = [...items]; [arr[i], arr[j]] = [arr[j], arr[i]]; setItems(arr);
  };

  const uploadFile = async (i: number, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("platform-logos").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data } = supabase.storage.from("platform-logos").getPublicUrl(path);
    update(i, "image_url", data.publicUrl);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("partner_logos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const inserts = items
      .filter((it) => it.image_url)
      .map((it, i) => ({ image_url: it.image_url, alt: it.alt, sort_order: i, visible: it.visible }));
    if (inserts.length) {
      const { error } = await supabase.from("partner_logos").insert(inserts);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    toast({ title: "Saved", description: "Partner logos updated." });
    setSaving(false); load();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Logos</h1>
          <p className="text-sm text-muted-foreground mt-1">Logos shown in the marquee under the hero.</p>
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
                <div className="h-16 w-24 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {it.image_url ? <img src={it.image_url} alt={it.alt} className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-foreground">No image</span>}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Image URL</Label>
                    <Input value={it.image_url} onChange={(e) => update(i, "image_url", e.target.value)} placeholder="https://…" />
                  </div>
                  <div>
                    <Label className="text-xs">Alt text</Label>
                    <Input value={it.alt} onChange={(e) => update(i, "alt", e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(i, e.target.files[0])} />
                  </div>
                </div>
                <Switch checked={it.visible} onCheckedChange={(v) => update(i, "visible", v)} />
                <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={add} className="w-full border-dashed"><Plus className="mr-2 h-4 w-4" /> Add Logo</Button>
    </div>
  );
}
