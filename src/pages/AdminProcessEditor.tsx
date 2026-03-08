import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  id?: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}

const ICON_OPTIONS = [
  "Search", "Layers", "Target", "Server", "CheckCircle2", "BarChart3",
  "Settings", "Code", "Shield", "Zap", "Globe", "Database",
];

export default function AdminProcessEditor() {
  const { toast } = useToast();
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSteps(); }, []);

  const fetchSteps = async () => {
    const { data } = await supabase
      .from("process_steps")
      .select("*")
      .order("sort_order");
    if (data) setSteps(data as Step[]);
    setLoading(false);
  };

  const addStep = () => {
    setSteps([...steps, { title: "", description: "", icon: "Settings", sort_order: steps.length }]);
  };

  const removeStep = (i: number) => {
    setSteps(steps.filter((_, idx) => idx !== i));
  };

  const updateStep = (i: number, field: keyof Step, val: string) => {
    const updated = [...steps];
    updated[i] = { ...updated[i], [field]: val };
    setSteps(updated);
  };

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const arr = [...steps];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSteps(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    // Delete existing
    await supabase.from("process_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert all with correct sort_order
    const inserts = steps.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: s.icon,
      sort_order: i,
    }));

    if (inserts.length > 0) {
      const { error } = await supabase.from("process_steps").insert(inserts);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    toast({ title: "Saved", description: "Process steps updated." });
    setSaving(false);
    fetchSteps();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Process Steps</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit the Implementation Workflow section on the homepage.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save All"}
        </Button>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div key={i} layout>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Icon</Label>
                      <select
                        value={step.icon}
                        onChange={(e) => updateStep(i, "icon", e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Title</Label>
                      <Input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder="Step title" />
                    </div>
                    <div className="md:col-span-3">
                      <Label className="text-xs">Description</Label>
                      <Textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={2} placeholder="Step description" />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeStep(i)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button variant="outline" onClick={addStep} className="w-full border-dashed">
        <Plus className="mr-2 h-4 w-4" /> Add Step
      </Button>
    </div>
  );
}
