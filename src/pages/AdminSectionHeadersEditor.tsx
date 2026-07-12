import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

interface Row {
  id: string;
  slug: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
}

const LABELS: Record<string, string> = {
  why_not_scaling: "Why Not Scaling",
  metrics: "Metrics Strip",
  faqs: "FAQ Section",
  process: "Process Section",
  logo_marquee: "Logo Marquee",
  client_proof: "Client Proof Row",
};

export default function AdminSectionHeadersEditor() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("section_headers" as any).select("*").order("slug");
      if (data) setRows(data as unknown as Row[]);
      setLoading(false);
    })();
  }, []);

  const update = (i: number, field: keyof Row, val: string) => {
    const arr = [...rows];
    (arr[i] as any)[field] = val;
    setRows(arr);
  };

  const save = async (row: Row) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("section_headers" as any)
      .update({
        eyebrow: row.eyebrow,
        title: row.title,
        subtitle: row.subtitle,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved", description: `${LABELS[row.slug] ?? row.slug} updated.` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Section Headers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit the eyebrow, title and subtitle shown above each homepage section.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row, i) => (
          <Card key={row.id} className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">{LABELS[row.slug] ?? row.slug}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Eyebrow</Label>
                <Input
                  value={row.eyebrow ?? ""}
                  onChange={(e) => update(i, "eyebrow", e.target.value)}
                  placeholder="Small label above the title"
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Textarea
                  rows={2}
                  value={row.title ?? ""}
                  onChange={(e) => update(i, "title", e.target.value)}
                  placeholder="Main section heading"
                />
              </div>
              <div>
                <Label className="text-xs">Subtitle</Label>
                <Textarea
                  rows={2}
                  value={row.subtitle ?? ""}
                  onChange={(e) => update(i, "subtitle", e.target.value)}
                  placeholder="Optional supporting line under the title"
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => save(row)} disabled={savingId === row.id}>
                  {savingId === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
