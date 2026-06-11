import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

type ExtraField = { key: string; label: string; placeholder?: string };

interface Props {
  table: "case_studies_meta" | "testimonials_meta" | "blog_section_meta";
  title?: string;
  description?: string;
  extraFields?: ExtraField[]; // e.g. subtitle, view_all_text
}

interface MetaRow {
  id: string;
  eyebrow: string | null;
  title: string | null;
  title_highlight: string | null;
  title_suffix: string | null;
  [k: string]: any;
}

export default function SectionHeaderEditor({
  table,
  title = "Section Header",
  description = "Customize this section's headline shown on the homepage.",
  extraFields = [],
}: Props) {
  const { toast } = useToast();
  const [data, setData] = useState<MetaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase.from(table as any).select("*").limit(1).maybeSingle();
      if (row) setData(row as MetaRow);
      setLoading(false);
    })();
  }, [table]);

  const update = (k: string, v: string) => data && setData({ ...data, [k]: v });

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const payload: any = {
      eyebrow: data.eyebrow,
      title: data.title,
      title_highlight: data.title_highlight,
      title_suffix: data.title_suffix,
      updated_at: new Date().toISOString(),
    };
    extraFields.forEach((f) => (payload[f.key] = data[f.key] ?? null));
    const { error } = await supabase.from(table as any).update(payload).eq("id", data.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: "Section header updated." });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-6 text-sm text-muted-foreground">No header row found.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Eyebrow</Label>
            <Input value={data.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} placeholder="— Work" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input value={data.title ?? ""} onChange={(e) => update("title", e.target.value)} placeholder="Selected" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Highlighted Word</Label>
            <Input value={data.title_highlight ?? ""} onChange={(e) => update("title_highlight", e.target.value)} placeholder="case studies" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Title Suffix</Label>
            <Input value={data.title_suffix ?? ""} onChange={(e) => update("title_suffix", e.target.value)} placeholder="that move the needle." />
          </div>
        </div>
        {extraFields.map((f) => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <Input value={data[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
