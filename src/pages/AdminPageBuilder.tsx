import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, FileText, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Page {
  id: string;
  title: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  status: string;
  sort_order: number;
  created_at: string;
}

export default function AdminPageBuilder() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPage, setEditPage] = useState<Partial<Page> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data } = await supabase
      .from("pages")
      .select("*")
      .order("sort_order", { ascending: true });
    setPages((data as Page[]) ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditPage({ title: "", slug: "", seo_title: "", seo_description: "", status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (page: Page) => {
    setEditPage({ ...page });
    setDialogOpen(true);
  };

  const savePage = async () => {
    if (!editPage?.title || !editPage?.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    const slug = editPage.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    if (editPage.id) {
      const { error } = await supabase
        .from("pages")
        .update({ title: editPage.title, slug, seo_title: editPage.seo_title ?? "", seo_description: editPage.seo_description ?? "", status: editPage.status ?? "draft" })
        .eq("id", editPage.id);
      if (error) { toast({ title: "Error saving", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase
        .from("pages")
        .insert({ title: editPage.title, slug, seo_title: editPage.seo_title ?? "", seo_description: editPage.seo_description ?? "", status: editPage.status ?? "draft" });
      if (error) { toast({ title: "Error creating", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Page saved" });
    setDialogOpen(false);
    fetchPages();
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page and all its blocks?")) return;
    await supabase.from("pages").delete().eq("id", id);
    toast({ title: "Page deleted" });
    fetchPages();
  };

  const toggleStatus = async (page: Page) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    await supabase.from("pages").update({ status: newStatus }).eq("id", page.id);
    fetchPages();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
          <p className="text-muted-foreground text-sm">Create and manage custom pages</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Page</Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pages yet. Create your first page.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{page.title}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                  <Badge
                    variant={page.status === "published" ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(page)}
                  >
                    {page.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/pages/${page.id}`)}>
                    <Pencil className="h-3 w-3 mr-1" />Edit Blocks
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(page)}>
                    <FileText className="h-3 w-3 mr-1" />Settings
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/p/${page.slug}`} target="_blank"><ExternalLink className="h-3 w-3" /></a>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePage(page.id)}>
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
            <DialogTitle>{editPage?.id ? "Edit Page Settings" : "Create New Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Page Title</Label>
              <Input value={editPage?.title ?? ""} onChange={(e) => setEditPage((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>URL Slug</Label>
              <Input value={editPage?.slug ?? ""} onChange={(e) => setEditPage((p) => ({ ...p, slug: e.target.value }))} placeholder="my-page" />
            </div>
            <div className="space-y-1">
              <Label>SEO Title</Label>
              <Input value={editPage?.seo_title ?? ""} onChange={(e) => setEditPage((p) => ({ ...p, seo_title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>SEO Description</Label>
              <Textarea value={editPage?.seo_description ?? ""} onChange={(e) => setEditPage((p) => ({ ...p, seo_description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
