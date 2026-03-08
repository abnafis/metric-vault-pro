import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, Search, Filter } from "lucide-react";
import { format } from "date-fns";

type AuditRequest = {
  id: string;
  name: string;
  email: string;
  website_url: string;
  platforms: string;
  problem_description: string;
  monthly_ad_spend: string | null;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = ["new", "contacted", "in_progress", "completed", "archived"] as const;

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  archived: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

export default function AdminAuditRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditRequest | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notes, setNotes] = useState("");

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("audit_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data as AuditRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("audit_requests")
      .update({ status, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      fetchRequests();
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("audit_requests")
      .update({ admin_notes: notes, updated_at: new Date().toISOString() } as any)
      .eq("id", selected.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Notes saved" });
      fetchRequests();
      setSelected((s) => s ? { ...s, admin_notes: notes } : null);
    }
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase.from("audit_requests").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request deleted" });
      fetchRequests();
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.website_url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Requests</h1>
        <p className="text-muted-foreground text-sm">Manage free tracking audit submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`rounded-lg border p-3 text-center transition-all ${
              statusFilter === s ? "ring-2 ring-primary" : ""
            } bg-card`}
          >
            <p className="text-2xl font-bold text-foreground">{counts[s] || 0}</p>
            <p className="text-xs text-muted-foreground capitalize">{statusLabels[s]}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Website</TableHead>
              <TableHead className="hidden lg:table-cell">Platforms</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No audit requests found</TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-sm">{r.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{r.website_url}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm max-w-[150px] truncate">{r.platforms}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[r.status] || ""}>
                      {statusLabels[r.status] || r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setSelected(r); setNotes(r.admin_notes); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRequest(r.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Audit Request — {selected.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: selected.name },
                    { label: "Email", value: selected.email },
                    { label: "Website", value: selected.website_url },
                    { label: "Platforms", value: selected.platforms },
                    { label: "Monthly Ad Spend", value: selected.monthly_ad_spend || "Not provided" },
                    { label: "Submitted", value: format(new Date(selected.created_at), "PPpp") },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-muted-foreground font-medium mb-1">{f.label}</p>
                      <p className="text-sm text-foreground">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Problem Description</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap rounded-lg bg-secondary p-3">
                    {selected.problem_description || "No description provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={selected.status === s ? "default" : "outline"}
                        onClick={() => updateStatus(selected.id, s)}
                        className="capitalize"
                      >
                        {statusLabels[s]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Admin Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this lead..."
                    rows={4}
                  />
                  <Button size="sm" className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
