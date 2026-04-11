import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  funnel_id: string;
  step_id: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export default function AdminFunnelLeads() {
  const { funnelId } = useParams<{ funnelId: string }>();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [funnelName, setFunnelName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!funnelId) return;
    const [funnelRes, leadsRes] = await Promise.all([
      supabase.from("funnels").select("name").eq("id", funnelId).single(),
      supabase.from("funnel_leads").select("*").eq("funnel_id", funnelId).order("created_at", { ascending: false }),
    ]);
    setFunnelName(funnelRes.data?.name ?? "");
    setLeads((leadsRes.data as Lead[]) ?? []);
    setLoading(false);
  }, [funnelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("funnel_leads").delete().eq("id", id);
    toast({ title: "Lead deleted" });
    fetchData();
  };

  const allKeys = Array.from(
    new Set(leads.flatMap((l) => Object.keys(l.data)))
  );

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Date", ...allKeys];
    const rows = leads.map((l) => [
      format(new Date(l.created_at), "yyyy-MM-dd HH:mm"),
      ...allKeys.map((k) => String(l.data[k] ?? "")),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${funnelName || "leads"}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <h1 className="text-2xl font-bold text-foreground">{funnelName} — Leads</h1>
            <p className="text-muted-foreground text-sm">{leads.length} submission{leads.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {leads.length > 0 && (
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        )}
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leads submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {allKeys.map((k) => (
                  <TableHead key={k} className="capitalize">{k.replace(/_/g, " ")}</TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(l.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  {allKeys.map((k) => (
                    <TableCell key={k} className="text-sm">{String(l.data[k] ?? "")}</TableCell>
                  ))}
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteLead(l.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
