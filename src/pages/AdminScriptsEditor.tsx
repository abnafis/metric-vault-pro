import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Code,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileCode,
  Globe,
  LayoutTemplate,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface CustomScript {
  id: string;
  name: string;
  description: string;
  script_type: string;
  code: string;
  placement: string;
  enabled: boolean;
  page_path: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type FormData = Omit<CustomScript, "id" | "created_at" | "updated_at" | "sort_order">;

const emptyForm = (): FormData => ({
  name: "",
  description: "",
  script_type: "javascript",
  code: "",
  placement: "head",
  enabled: false,
  page_path: null,
});

const SCRIPT_TYPES = [
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON-LD" },
];

const PLACEMENTS = [
  { value: "head", label: "Head Section" },
  { value: "body_open", label: "After <body> Opening" },
  { value: "body_close", label: "Before </body> Closing" },
  { value: "page_specific", label: "Specific Page Only" },
  { value: "global", label: "Global Site-wide" },
];

const typeIcon: Record<string, string> = {
  javascript: "JS",
  html: "HTML",
  css: "CSS",
  json: "JSON",
};

const placementLabel = (p: string) =>
  PLACEMENTS.find((x) => x.value === p)?.label ?? p;

const scriptTypeLabel = (t: string) =>
  SCRIPT_TYPES.find((x) => x.value === t)?.label ?? t;

export default function AdminScriptsEditor() {
  const { toast } = useToast();
  const [scripts, setScripts] = useState<CustomScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("custom_scripts")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Error loading scripts", description: error.message, variant: "destructive" });
    } else {
      setScripts((data as CustomScript[]) ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setValidationError(null);
    setDialogOpen(true);
  };

  const openEdit = (s: CustomScript) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description,
      script_type: s.script_type,
      code: s.code,
      placement: s.placement,
      enabled: s.enabled,
      page_path: s.page_path,
    });
    setValidationError(null);
    setDialogOpen(true);
  };

  const validateScript = (): boolean => {
    if (!form.name.trim()) {
      setValidationError("Script name is required.");
      return false;
    }
    if (!form.code.trim()) {
      setValidationError("Script code cannot be empty.");
      return false;
    }
    // Check for duplicate names
    const duplicate = scripts.find(
      (s) => s.name.toLowerCase() === form.name.trim().toLowerCase() && s.id !== editingId
    );
    if (duplicate) {
      setValidationError("A script with this name already exists.");
      return false;
    }
    // Basic safety check for dangerous patterns
    if (form.script_type === "javascript") {
      const dangerous = ["document.write(", "eval("];
      for (const pattern of dangerous) {
        if (form.code.includes(pattern)) {
          setValidationError(
            `Warning: Script contains "${pattern}" which may break page layout. Remove it or proceed carefully.`
          );
          return false;
        }
      }
    }
    setValidationError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateScript()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      script_type: form.script_type,
      code: form.code,
      placement: form.placement,
      enabled: form.enabled,
      page_path: form.placement === "page_specific" ? form.page_path : null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase.from("custom_scripts").update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "Error updating script", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Script updated" });
      }
    } else {
      const { error } = await supabase.from("custom_scripts").insert({
        ...payload,
        sort_order: scripts.length,
      });
      if (error) {
        toast({ title: "Error creating script", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Script created" });
      }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("custom_scripts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting script", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Script deleted" });
      fetchAll();
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("custom_scripts")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error toggling script", description: error.message, variant: "destructive" });
    } else {
      fetchAll();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            Scripts & Custom Code
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tracking scripts, pixels, and custom code snippets
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Script
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Scripts</p>
          <p className="text-2xl font-bold text-foreground">{scripts.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {scripts.filter((s) => s.enabled).length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Disabled</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {scripts.filter((s) => !s.enabled).length}
          </p>
        </div>
      </div>

      {/* Table */}
      {scripts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileCode className="mx-auto h-12 w-12 mb-4 opacity-40" />
          <p>No scripts added yet. Click "Add Script" to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scripts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {typeIcon[s.script_type] ?? s.script_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {placementLabel(s.placement)}
                    {s.placement === "page_specific" && s.page_path && (
                      <span className="block text-xs text-muted-foreground">{s.page_path}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.enabled}
                        onCheckedChange={(v) => handleToggle(s.id, v)}
                      />
                      <span className={`text-xs ${s.enabled ? "text-green-400" : "text-muted-foreground"}`}>
                        {s.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(s.updated_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPreviewCode(s.code);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{s.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the script from your site.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(s.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Code Preview</DialogTitle>
          </DialogHeader>
          <pre className="bg-background border border-border rounded-lg p-4 overflow-auto max-h-[60vh] text-sm font-mono text-foreground whitespace-pre-wrap">
            {previewCode}
          </pre>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Script" : "Add New Script"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {validationError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {validationError}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label>Script Name *</Label>
              <Input
                placeholder="e.g. Google Tag Manager"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of what this script does"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Type & Placement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Script Type</Label>
                <Select
                  value={form.script_type}
                  onValueChange={(v) => setForm({ ...form, script_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCRIPT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Placement</Label>
                <Select
                  value={form.placement}
                  onValueChange={(v) => setForm({ ...form, placement: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Page path for page-specific */}
            {form.placement === "page_specific" && (
              <div className="space-y-2">
                <Label>Page Path</Label>
                <Input
                  placeholder="/blog or /services"
                  value={form.page_path ?? ""}
                  onChange={(e) => setForm({ ...form, page_path: e.target.value })}
                />
              </div>
            )}

            {/* Code Editor */}
            <div className="space-y-2">
              <Label>Script Code *</Label>
              <div className="relative rounded-lg border border-border bg-background overflow-hidden">
                <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 border-b border-border">
                  <span className="text-xs font-mono text-muted-foreground">
                    {scriptTypeLabel(form.script_type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {form.code.split("\n").length} lines
                  </span>
                </div>
                <textarea
                  className="w-full min-h-[250px] bg-background text-foreground font-mono text-sm p-4 resize-y focus:outline-none leading-relaxed"
                  placeholder={`Paste your ${scriptTypeLabel(form.script_type)} code here...`}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-foreground text-sm">Enable Script</p>
                <p className="text-xs text-muted-foreground">
                  Script will be injected into the site when enabled
                </p>
              </div>
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm({ ...form, enabled: v })}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update Script" : "Add Script"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
