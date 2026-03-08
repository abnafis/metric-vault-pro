import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, BarChart3, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Stat {
  icon: string;
  value: string;
  label: string;
}

interface AboutData {
  id: string;
  section_title: string;
  section_title_highlight: string;
  profile_title: string;
  profile_description: string;
  certifications: string[];
  stats: Stat[];
}

const AdminAboutEditor = () => {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: row } = await supabase
      .from("about_content" as any)
      .select("*")
      .limit(1)
      .single();
    if (row) {
      const r = row as any;
      setData({
        id: r.id,
        section_title: r.section_title,
        section_title_highlight: r.section_title_highlight,
        profile_title: r.profile_title,
        profile_description: r.profile_description,
        certifications: r.certifications as string[],
        stats: r.stats as Stat[],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("about_content" as any)
      .update({
        section_title: data.section_title.slice(0, 50),
        section_title_highlight: data.section_title_highlight.slice(0, 50),
        profile_title: data.profile_title.slice(0, 100),
        profile_description: data.profile_description.slice(0, 800),
        certifications: data.certifications,
        stats: data.stats,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "About section updated." });
    }
  };

  const addCert = () => {
    if (!data || data.certifications.length >= 8) return;
    setData({ ...data, certifications: [...data.certifications, ""] });
  };
  const removeCert = (i: number) => {
    if (!data) return;
    setData({ ...data, certifications: data.certifications.filter((_, idx) => idx !== i) });
  };
  const updateCert = (i: number, val: string) => {
    if (!data) return;
    const certs = [...data.certifications];
    certs[i] = val.slice(0, 80);
    setData({ ...data, certifications: certs });
  };

  const addStat = () => {
    if (!data || data.stats.length >= 6) return;
    setData({ ...data, stats: [...data.stats, { icon: "BarChart3", value: "", label: "" }] });
  };
  const removeStat = (i: number) => {
    if (!data) return;
    setData({ ...data, stats: data.stats.filter((_, idx) => idx !== i) });
  };
  const updateStat = (i: number, field: keyof Stat, val: string) => {
    if (!data) return;
    const stats = [...data.stats];
    stats[i] = { ...stats[i], [field]: val.slice(0, 50) };
    setData({ ...data, stats });
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!data) return <div className="p-8 text-muted-foreground">No about content found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">About Section</h1>
          <p className="text-sm text-muted-foreground">Edit the about / specialist profile section</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Title</Label>
              <Input
                value={data.profile_title}
                maxLength={100}
                onChange={(e) => setData({ ...data, profile_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.profile_description}
                maxLength={800}
                rows={6}
                onChange={(e) => setData({ ...data, profile_description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{data.profile_description.length}/800</p>
            </div>
          </CardContent>
        </Card>

        {/* Section Heading */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Section Heading</CardTitle>
            <CardDescription>Displays as "Title <span className="text-primary">Highlight</span>"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={data.section_title}
                maxLength={50}
                onChange={(e) => setData({ ...data, section_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Highlighted Text</Label>
              <Input
                value={data.section_title_highlight}
                maxLength={50}
                onChange={(e) => setData({ ...data, section_title_highlight: e.target.value })}
              />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <p className="text-lg font-bold text-foreground">
                {data.section_title}{" "}
                <span className="gradient-text">{data.section_title_highlight}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Certifications
            </CardTitle>
            <CardDescription>Bullet points shown on the profile card (max 8)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.certifications.map((cert, i) => (
              <motion.div key={i} layout className="flex items-center gap-2">
                <Input
                  value={cert}
                  maxLength={80}
                  placeholder="e.g. GA4 & GTM certified expert"
                  onChange={(e) => updateCert(i, e.target.value)}
                />
                <Button size="icon" variant="ghost" onClick={() => removeCert(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
            ))}
            <Button variant="outline" size="sm" onClick={addCert} disabled={data.certifications.length >= 8}>
              <Plus className="mr-1 h-3 w-3" /> Add Certification
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
            <CardDescription>Key numbers displayed beside the profile (max 6)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.stats.map((stat, i) => (
              <motion.div key={i} layout className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-secondary/30">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={stat.value}
                    maxLength={20}
                    placeholder="100+"
                    onChange={(e) => updateStat(i, "value", e.target.value)}
                  />
                  <Input
                    value={stat.label}
                    maxLength={50}
                    placeholder="Tracking Setups"
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                  />
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeStat(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
            ))}
            <Button variant="outline" size="sm" onClick={addStat} disabled={data.stats.length >= 6}>
              <Plus className="mr-1 h-3 w-3" /> Add Stat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAboutEditor;
