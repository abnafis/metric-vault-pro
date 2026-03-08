import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Search, Image as ImageIcon } from "lucide-react";

const BUCKETS = ["hero-images", "case-studies", "platform-logos", "testimonial-avatars", "blog-images", "page-builder"];

interface FileItem {
  name: string;
  bucket: string;
  url: string;
  created_at: string;
}

export default function AdminMediaLibrary() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const allFiles: FileItem[] = [];
    for (const b of BUCKETS) {
      const { data } = await supabase.storage.from(b).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (data) {
        for (const f of data) {
          if (f.name === ".emptyFolderPlaceholder") continue;
          const { data: urlData } = supabase.storage.from(b).getPublicUrl(f.name);
          allFiles.push({ name: f.name, bucket: b, url: urlData.publicUrl, created_at: f.created_at || "" });
        }
      }
      // Also check subdirectories
      const { data: folders } = await supabase.storage.from(b).list("", { limit: 50 });
      if (folders) {
        for (const folder of folders) {
          if (folder.id === null) {
            // It's a folder
            const { data: subFiles } = await supabase.storage.from(b).list(folder.name, { limit: 200 });
            if (subFiles) {
              for (const f of subFiles) {
                if (f.name === ".emptyFolderPlaceholder") continue;
                const path = `${folder.name}/${f.name}`;
                const { data: urlData } = supabase.storage.from(b).getPublicUrl(path);
                allFiles.push({ name: path, bucket: b, url: urlData.publicUrl, created_at: f.created_at || "" });
              }
            }
          }
        }
      }
    }
    setFiles(allFiles);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetBucket = bucket === "all" ? "page-builder" : bucket;
    setUploading(true);
    const path = `uploads/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(targetBucket).upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Uploaded", description: file.name });
      fetchFiles();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    const { error } = await supabase.storage.from(item.bucket).remove([item.name]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      setFiles(files.filter(f => !(f.bucket === item.bucket && f.name === item.name)));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "URL copied to clipboard." });
  };

  const filtered = files.filter(f => {
    if (bucket !== "all" && f.bucket !== bucket) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} files across all storage buckets.</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.svg,.pdf" />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search files…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={bucket} onValueChange={setBucket}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buckets</SelectItem>
            {BUCKETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-center py-12">Loading files…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p>No files found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((f, i) => (
            <div key={`${f.bucket}-${f.name}-${i}`} className="glass-card group relative overflow-hidden">
              <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                <img src={f.url} alt={f.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="p-2">
                <p className="text-xs text-foreground truncate" title={f.name}>{f.name.split("/").pop()}</p>
                <p className="text-[10px] text-muted-foreground">{f.bucket}</p>
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => copyUrl(f.url)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(f)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
