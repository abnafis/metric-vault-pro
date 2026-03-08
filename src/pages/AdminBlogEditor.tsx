import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Search, X } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Category { id: string; name: string; slug: string; sort_order: number; }
interface BlogPost {
  id?: string; title: string; slug: string; content: string; excerpt: string;
  featured_image_url: string | null; author_name: string; category_id: string | null;
  tags: string[]; status: string; featured: boolean; publish_date: string | null;
  meta_title: string; meta_description: string; og_image_url: string | null;
  read_time_minutes: number;
}

const emptyPost = (): BlogPost => ({
  title: "", slug: "", content: "", excerpt: "", featured_image_url: null,
  author_name: "Admin", category_id: null, tags: [], status: "draft",
  featured: false, publish_date: null, meta_title: "", meta_description: "",
  og_image_url: null, read_time_minutes: 0,
});

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function estimateReadTime(html: string) { const text = html.replace(/<[^>]*>/g, ""); return Math.max(1, Math.ceil(text.split(/\s+/).length / 200)); }

export default function AdminBlogEditor() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<(BlogPost & { id: string })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPost>(emptyPost());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [tagInput, setTagInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Category management
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [editCatId, setEditCatId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_categories").select("*").order("sort_order"),
    ]);
    if (p) setPosts(p as any);
    if (c) setCategories(c as any);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditId(null); setForm(emptyPost()); setDialogOpen(true); };
  const openEdit = (post: BlogPost & { id: string }) => { setEditId(post.id); setForm({ ...post }); setDialogOpen(true); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "featured_image_url" | "og_image_url") => {
    const file = e.target.files?.[0]; if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `${field === "featured_image_url" ? "featured" : "og"}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    setForm(f => ({ ...f, [field]: data.publicUrl }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };

  const handleSave = async (asStatus?: string) => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    const readTime = form.read_time_minutes || estimateReadTime(form.content);
    const status = asStatus || form.status;
    const publishDate = status === "published" && !form.publish_date ? new Date().toISOString() : form.publish_date;
    const payload = { ...form, slug, read_time_minutes: readTime, status, publish_date: publishDate, updated_at: new Date().toISOString() };
    delete (payload as any).id;

    const { error } = editId
      ? await supabase.from("blog_posts").update(payload).eq("id", editId)
      : await supabase.from("blog_posts").insert(payload);

    setSaving(false);
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Post updated" : "Post created" });
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    fetchAll();
  };

  // Category CRUD
  const saveCat = async () => {
    if (!catForm.name.trim()) return;
    const slug = catForm.slug || slugify(catForm.name);
    const { error } = editCatId
      ? await supabase.from("blog_categories").update({ name: catForm.name, slug }).eq("id", editCatId)
      : await supabase.from("blog_categories").insert({ name: catForm.name, slug, sort_order: categories.length });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    toast({ title: editCatId ? "Category updated" : "Category added" });
    setCatDialogOpen(false);
    fetchAll();
  };
  const deleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("blog_categories").delete().eq("id", id);
    fetchAll();
  };

  const filtered = posts.filter(p => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getCatName = (id: string | null) => categories.find(c => c.id === id)?.name || "—";

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground text-sm">{posts.length} posts total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setCatForm({ name: "", slug: "" }); setEditCatId(null); setCatDialogOpen(true); }}>
            Categories
          </Button>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Post</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No posts found</TableCell></TableRow>
            )}
            {filtered.map(post => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium line-clamp-1">{post.title}</span>
                    {post.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{post.author_name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{getCatName(post.category_id)}</TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : post.status === "scheduled" ? "secondary" : "outline"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                  {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setForm({ ...post }); setPreviewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(post)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Post Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="content" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">Media & Meta</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input maxLength={200} value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) })); }} />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea maxLength={300} rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
                <p className="text-xs text-muted-foreground">{form.excerpt.length}/300</p>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor content={form.content} onChange={html => setForm(f => ({ ...f, content: html, read_time_minutes: estimateReadTime(html) }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input maxLength={100} value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category_id || "none"} onValueChange={v => setForm(f => ({ ...f, category_id: v === "none" ? null : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Read Time (min)</Label>
                  <Input type="number" min={1} value={form.read_time_minutes} onChange={e => setForm(f => ({ ...f, read_time_minutes: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag…" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.tags.map(t => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} />
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Publishing */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Publish Date</Label>
                  <Input type="datetime-local" value={form.publish_date ? new Date(form.publish_date).toISOString().slice(0, 16) : ""} onChange={e => setForm(f => ({ ...f, publish_date: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
                  <Label>Featured Post</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, "featured_image_url")} />
                {form.featured_image_url && <img src={form.featured_image_url} alt="" className="h-40 w-full object-cover rounded-lg mt-2" />}
              </div>
              <div className="space-y-2">
                <Label>Open Graph Image</Label>
                <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, "og_image_url")} />
                {form.og_image_url && <img src={form.og_image_url} alt="" className="h-32 w-full object-cover rounded-lg mt-2" />}
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input maxLength={60} value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} />
                <p className="text-xs text-muted-foreground">{form.meta_title.length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea maxLength={160} rows={3} value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} />
                <p className="text-xs text-muted-foreground">{form.meta_description.length}/160</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="secondary" disabled={saving} onClick={() => handleSave("draft")}>Save Draft</Button>
            {form.publish_date && new Date(form.publish_date) > new Date() ? (
              <Button disabled={saving} onClick={() => handleSave("scheduled")}>Schedule</Button>
            ) : (
              <Button disabled={saving} onClick={() => handleSave("published")}>Publish</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {form.featured_image_url && <img src={form.featured_image_url} alt="" className="w-full h-48 object-cover rounded-lg" />}
            <h1 className="text-2xl font-bold">{form.title || "Untitled"}</h1>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <span>{form.author_name}</span>
              <span>·</span>
              <span>{form.read_time_minutes} min read</span>
              {form.category_id && <><span>·</span><span>{getCatName(form.category_id)}</span></>}
            </div>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.content }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="font-medium">{c.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditCatId(c.id); setCatForm({ name: c.name, slug: c.slug }); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteCat(c.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <Label>{editCatId ? "Edit Category" : "Add Category"}</Label>
              <div className="flex gap-2">
                <Input value={catForm.name} onChange={e => setCatForm({ name: e.target.value, slug: slugify(e.target.value) })} placeholder="Category name" />
                <Button onClick={saveCat}>{editCatId ? "Update" : "Add"}</Button>
              </div>
              {editCatId && <Button variant="ghost" size="sm" onClick={() => { setEditCatId(null); setCatForm({ name: "", slug: "" }); }}>Cancel edit</Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
