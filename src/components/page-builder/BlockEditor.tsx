import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Plus, Trash2 } from "lucide-react";
import { BlockData } from "./blockTypes";

interface Props {
  block: BlockData;
  onChange: (content: Record<string, unknown>) => void;
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

export default function BlockEditor({ block, onChange }: Props) {
  const c = block.content as Record<string, any>;
  const set = (key: string, val: unknown) => onChange({ ...c, [key]: val });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${block.page_id}/${block.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("page-builder").upload(path, file);
    if (!error) {
      const { data: pub } = supabase.storage.from("page-builder").getPublicUrl(path);
      set("url", pub.publicUrl);
    }
    setUploading(false);
  };

  switch (block.block_type) {
    case "text":
      return (
        <div className="space-y-3">
          <Field label="Heading" value={c.heading ?? ""} onChange={(v) => set("heading", v)} />
          <Field label="Subheading" value={c.subheading ?? ""} onChange={(v) => set("subheading", v)} />
          <Field label="Paragraph" value={c.paragraph ?? ""} onChange={(v) => set("paragraph", v)} multiline />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Alignment</Label>
            <Select value={c.alignment ?? "left"} onValueChange={(v) => set("alignment", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Image</Label>
            {c.url && <img src={c.url} alt={c.alt ?? ""} className="max-h-32 rounded-md object-cover" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-3 w-3 mr-1" />{uploading ? "Uploading…" : "Upload Image"}
            </Button>
          </div>
          <Field label="Caption" value={c.caption ?? ""} onChange={(v) => set("caption", v)} />
          <Field label="Alt Text" value={c.alt ?? ""} onChange={(v) => set("alt", v)} />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Size</Label>
            <Select value={c.size ?? "full"} onValueChange={(v) => set("size", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3">
          <Field label="Heading" value={c.heading ?? ""} onChange={(v) => set("heading", v)} />
          <Field label="Description" value={c.description ?? ""} onChange={(v) => set("description", v)} multiline />
          <Field label="Button Text" value={c.button_text ?? ""} onChange={(v) => set("button_text", v)} />
          <Field label="Button Link" value={c.button_link ?? ""} onChange={(v) => set("button_link", v)} />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Background Style</Label>
            <Select value={c.bg_style ?? "gradient"} onValueChange={(v) => set("bg_style", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "testimonial":
      return (
        <div className="space-y-3">
          <Field label="Client Name" value={c.name ?? ""} onChange={(v) => set("name", v)} />
          <Field label="Role / Company" value={c.role ?? ""} onChange={(v) => set("role", v)} />
          <Field label="Testimonial" value={c.text ?? ""} onChange={(v) => set("text", v)} multiline />
          <Field label="Avatar URL" value={c.avatar_url ?? ""} onChange={(v) => set("avatar_url", v)} />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Rating (1-5)</Label>
            <Input type="number" min={1} max={5} value={c.rating ?? 5} onChange={(e) => set("rating", Number(e.target.value))} className="text-sm" />
          </div>
        </div>
      );

    case "service_cards": {
      const cards = (c.cards ?? []) as any[];
      const updateCard = (i: number, key: string, val: string) => {
        const next = [...cards];
        next[i] = { ...next[i], [key]: val };
        set("cards", next);
      };
      return (
        <div className="space-y-4">
          {cards.map((card: any, i: number) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Card {i + 1}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => set("cards", cards.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Field label="Icon" value={card.icon ?? ""} onChange={(v) => updateCard(i, "icon", v)} />
              <Field label="Title" value={card.title ?? ""} onChange={(v) => updateCard(i, "title", v)} />
              <Field label="Description" value={card.description ?? ""} onChange={(v) => updateCard(i, "description", v)} multiline />
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => set("cards", [...cards, { icon: "Settings", title: "", description: "" }])}>
            <Plus className="h-3 w-3 mr-1" />Add Card
          </Button>
        </div>
      );
    }

    case "metrics": {
      const items = (c.items ?? []) as any[];
      const updateItem = (i: number, key: string, val: string) => {
        const next = [...items];
        next[i] = { ...next[i], [key]: val };
        set("items", next);
      };
      return (
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Metric {i + 1}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => set("items", items.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Field label="Icon" value={item.icon ?? ""} onChange={(v) => updateItem(i, "icon", v)} />
              <Field label="Title" value={item.title ?? ""} onChange={(v) => updateItem(i, "title", v)} />
              <Field label="Value" value={item.value ?? ""} onChange={(v) => updateItem(i, "value", v)} />
              <Field label="Description" value={item.description ?? ""} onChange={(v) => updateItem(i, "description", v)} />
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => set("items", [...items, { icon: "BarChart3", title: "", value: "0", description: "" }])}>
            <Plus className="h-3 w-3 mr-1" />Add Metric
          </Button>
        </div>
      );
    }

    case "code":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">HTML / Embed Code</Label>
            <Textarea value={c.html ?? ""} onChange={(e) => set("html", e.target.value)} className="font-mono text-xs min-h-[120px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Custom CSS</Label>
            <Textarea value={c.css ?? ""} onChange={(e) => set("css", e.target.value)} className="font-mono text-xs min-h-[80px]" />
          </div>
        </div>
      );

    default:
      return <p className="text-sm text-muted-foreground">Unknown block type.</p>;
  }
}
