import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, GripVertical, ArrowLeft, Save, Eye, EyeOff,
  Type, FileText, CheckCircle, ChevronUp, ChevronDown,
} from "lucide-react";

interface FunnelStep {
  id: string;
  funnel_id: string;
  step_type: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
}

const STEP_TYPES = [
  { value: "form", label: "Form", icon: Type, description: "Collect lead info" },
  { value: "content", label: "Content", icon: FileText, description: "Text/media block" },
  { value: "thank_you", label: "Thank You", icon: CheckCircle, description: "Confirmation page" },
];

const defaultContent = (type: string): Record<string, unknown> => {
  switch (type) {
    case "form":
      return {
        heading: "Get Started",
        description: "Fill in your details below.",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
        ],
        button_text: "Submit",
      };
    case "content":
      return { heading: "Welcome", body: "Add your content here.", image_url: "" };
    case "thank_you":
      return {
        heading: "Thank You!",
        message: "We've received your information.",
        show_redirect: true,
        redirect_text: "Continue →",
      };
    default:
      return {};
  }
};

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

function FormFieldEditor({ fields, onChange }: { fields: FormField[]; onChange: (f: FormField[]) => void }) {
  const addField = () => onChange([...fields, { name: `field_${fields.length}`, label: "", type: "text", required: false }]);
  const removeField = (i: number) => onChange(fields.filter((_, idx) => idx !== i));
  const updateField = (i: number, key: string, value: unknown) => {
    const updated = [...fields];
    (updated[i] as unknown as Record<string, unknown>)[key] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Form Fields</Label>
      {fields.map((f, i) => (
        <div key={i} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={f.label} onChange={(e) => updateField(i, "label", e.target.value)} placeholder="Field label" />
            </div>
            <div>
              <Label className="text-xs">Name (key)</Label>
              <Input value={f.name} onChange={(e) => updateField(i, "name", e.target.value)} placeholder="field_name" />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={f.type} onValueChange={(v) => updateField(i, "type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="tel">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, "required", e.target.checked)} />
                Required
              </label>
            </div>
            {f.type === "select" && (
              <div className="col-span-2">
                <Label className="text-xs">Options (comma-separated)</Label>
                <Input
                  value={(f.options || []).join(", ")}
                  onChange={(e) => updateField(i, "options", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
          </div>
          <Button size="sm" variant="ghost" className="text-destructive mt-4" onClick={() => removeField(i)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addField}>
        <Plus className="h-3 w-3 mr-1" />Add Field
      </Button>
    </div>
  );
}

export default function AdminFunnelEditor() {
  const { funnelId } = useParams<{ funnelId: string }>();
  const navigate = useNavigate();
  const [funnelName, setFunnelName] = useState("");
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!funnelId) return;
    const [funnelRes, stepsRes] = await Promise.all([
      supabase.from("funnels").select("name").eq("id", funnelId).single(),
      supabase.from("funnel_steps").select("*").eq("funnel_id", funnelId).order("sort_order"),
    ]);
    setFunnelName(funnelRes.data?.name ?? "");
    setSteps((stepsRes.data as FunnelStep[]) ?? []);
    setLoading(false);
  }, [funnelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addStep = async (type: string) => {
    if (!funnelId) return;
    const { error } = await supabase.from("funnel_steps").insert({
      funnel_id: funnelId,
      step_type: type,
      title: (defaultContent(type).heading as string) || "New Step",
      content: defaultContent(type) as unknown as Record<string, never>,
      sort_order: steps.length,
    } as never);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    fetchData();
  };

  const updateStep = async (id: string, updates: Partial<FunnelStep>) => {
    await supabase.from("funnel_steps").update(updates as never).eq("id", id);
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStep = async (id: string) => {
    if (!confirm("Delete this step?")) return;
    await supabase.from("funnel_steps").delete().eq("id", id);
    fetchData();
  };

  const moveStep = async (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setSteps(reordered);
    await Promise.all(
      reordered.map((s, i) => supabase.from("funnel_steps").update({ sort_order: i }).eq("id", s.id))
    );
  };

  const updateContent = (id: string, key: string, value: unknown) => {
    const step = steps.find((s) => s.id === id);
    if (!step) return;
    const updated = { ...step.content, [key]: value };
    updateStep(id, { content: updated });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/funnels")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{funnelName}</h1>
            <p className="text-muted-foreground text-sm">{steps.length} step{steps.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STEP_TYPES.map((t) => (
          <Button key={t.value} variant="outline" size="sm" onClick={() => addStep(t.value)}>
            <t.icon className="h-3 w-3 mr-1" />Add {t.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const typeInfo = STEP_TYPES.find((t) => t.value === step.step_type);
          const content = step.content as Record<string, unknown>;

          return (
            <Card key={step.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Step {idx + 1}</Badge>
                    <Badge variant="secondary">{typeInfo?.label ?? step.step_type}</Badge>
                    <Input
                      className="h-7 text-sm font-medium w-48"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => moveStep(idx, idx - 1)} disabled={idx === 0}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveStep(idx, idx + 1)} disabled={idx === steps.length - 1}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteStep(step.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {step.step_type === "form" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Heading</Label>
                        <Input value={(content.heading as string) ?? ""} onChange={(e) => updateContent(step.id, "heading", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Button Text</Label>
                        <Input value={(content.button_text as string) ?? ""} onChange={(e) => updateContent(step.id, "button_text", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Textarea value={(content.description as string) ?? ""} onChange={(e) => updateContent(step.id, "description", e.target.value)} />
                    </div>
                    <FormFieldEditor
                      fields={(content.fields as FormField[]) ?? []}
                      onChange={(fields) => updateContent(step.id, "fields", fields)}
                    />
                  </>
                )}

                {step.step_type === "content" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Heading</Label>
                      <Input value={(content.heading as string) ?? ""} onChange={(e) => updateContent(step.id, "heading", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Body</Label>
                      <Textarea rows={5} value={(content.body as string) ?? ""} onChange={(e) => updateContent(step.id, "body", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Image URL (optional)</Label>
                      <Input value={(content.image_url as string) ?? ""} onChange={(e) => updateContent(step.id, "image_url", e.target.value)} />
                    </div>
                  </>
                )}

                {step.step_type === "thank_you" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Heading</Label>
                      <Input value={(content.heading as string) ?? ""} onChange={(e) => updateContent(step.id, "heading", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Message</Label>
                      <Textarea value={(content.message as string) ?? ""} onChange={(e) => updateContent(step.id, "message", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Redirect Button Text</Label>
                        <Input value={(content.redirect_text as string) ?? ""} onChange={(e) => updateContent(step.id, "redirect_text", e.target.value)} />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!content.show_redirect}
                            onChange={(e) => updateContent(step.id, "show_redirect", e.target.checked)}
                          />
                          Show redirect button
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
