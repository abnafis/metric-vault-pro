import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, ExternalLink, Copy, Filter as FilterIcon, Users,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Funnel {
  id: string;
  name: string;
  slug: string;
  status: string;
  redirect_url: string;
  created_at: string;
}

export default function AdminFunnels() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFunnel, setEditFunnel] = useState<Partial<Funnel> | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchFunnels(); }, []);

  const fetchFunnels = async () => {
    const { data } = await supabase
      .from("funnels")
      .select("*")
      .order("created_at", { ascending: false });
    setFunnels((data as Funnel[]) ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditFunnel({ name: "", slug: "", redirect_url: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (f: Funnel) => {
    setEditFunnel({ ...f });
    setDialogOpen(true);
  };

  const saveFunnel = async () => {
    if (!editFunnel?.name || !editFunnel?.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    const slug = editFunnel.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    if (editFunnel.id) {
      const { error } = await supabase
        .from("funnels")
        .update({ name: editFunnel.name, slug, redirect_url: editFunnel.redirect_url ?? "", status: editFunnel.status ?? "draft" })
        .eq("id", editFunnel.id);
      if (error) { toast({ title: "Error saving", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase
        .from("funnels")
        .insert({ name: editFunnel.name, slug, redirect_url: editFunnel.redirect_url ?? "", status: editFunnel.status ?? "draft" });
      if (error) { toast({ title: "Error creating", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Funnel saved" });
    setDialogOpen(false);
    fetchFunnels();
  };

  const deleteFunnel = async (id: string) => {
    if (!confirm("Delete this funnel and all its steps/leads?")) return;
    await supabase.from("funnels").delete().eq("id", id);
    toast({ title: "Funnel deleted" });
    fetchFunnels();
  };

  const toggleStatus = async (f: Funnel) => {
    const newStatus = f.status === "published" ? "draft" : "published";
    await supabase.from("funnels").update({ status: newStatus }).eq("id", f.id);
    fetchFunnels();
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: url });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Funnels</h1>
          <p className="text-muted-foreground text-sm">Create and manage lead capture funnels</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Funnel</Button>
      </div>

      {funnels.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FilterIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No funnels yet. Create your first funnel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {funnels.map((f) => (
            <Card key={f.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <FilterIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">/f/{f.slug}</p>
                  </div>
                  <Badge
                    variant={f.status === "published" ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(f)}
                  >
                    {f.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/funnels/${f.id}`)}>
                    <Pencil className="h-3 w-3 mr-1" />Edit Steps
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/funnels/${f.id}/leads`)}>
                    <Users className="h-3 w-3 mr-1" />Leads
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(f)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyLink(f.slug)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/f/${f.slug}`} target="_blank"><ExternalLink className="h-3 w-3" /></a>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteFunnel(f.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editFunnel?.id ? "Edit Funnel" : "Create New Funnel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Funnel Name</Label>
              <Input value={editFunnel?.name ?? ""} onChange={(e) => setEditFunnel((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>URL Slug</Label>
              <Input value={editFunnel?.slug ?? ""} onChange={(e) => setEditFunnel((p) => ({ ...p, slug: e.target.value }))} placeholder="my-funnel" />
              <p className="text-xs text-muted-foreground">Shareable link: {window.location.origin}/f/{editFunnel?.slug || "my-funnel"}</p>
            </div>
            <div className="space-y-1">
              <Label>Final Redirect URL</Label>
              <Input value={editFunnel?.redirect_url ?? ""} onChange={(e) => setEditFunnel((p) => ({ ...p, redirect_url: e.target.value }))} placeholder="https://example.com" />
              <p className="text-xs text-muted-foreground">Where the user goes after the thank you page</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveFunnel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
