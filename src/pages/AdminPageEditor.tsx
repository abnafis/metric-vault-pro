import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Plus, GripVertical, Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { BLOCK_TYPES, BlockData, BlockType, defaultContent } from "@/components/page-builder/blockTypes";
import BlockEditor from "@/components/page-builder/BlockEditor";
import BlockRenderer from "@/components/page-builder/BlockRenderer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as Icons from "lucide-react";

export default function AdminPageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [pageTitle, setPageTitle] = useState("");
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (pageId) fetchData();
  }, [pageId]);

  const fetchData = async () => {
    const [{ data: page }, { data: blockRows }] = await Promise.all([
      supabase.from("pages").select("*").eq("id", pageId!).single(),
      supabase.from("page_blocks").select("*").eq("page_id", pageId!).order("sort_order"),
    ]);
    if (page) setPageTitle((page as any).title);
    setBlocks((blockRows as BlockData[]) ?? []);
    setLoading(false);
  };

  const addBlock = async (type: BlockType) => {
    const newBlock = {
      page_id: pageId!,
      block_type: type,
      content: defaultContent[type],
      sort_order: blocks.length,
      visible: true,
    };
    const { data, error } = await supabase.from("page_blocks").insert(newBlock as any).select().single();
    if (error) { toast({ title: "Error adding block", variant: "destructive" }); return; }
    setBlocks((prev) => [...prev, data as BlockData]);
    setExpandedBlock((data as BlockData).id);
  };

  const updateBlock = (id: string, content: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const toggleVisibility = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("page_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Block deleted" });
  };

  const duplicateBlock = async (block: BlockData) => {
    const newBlock = {
      page_id: pageId!,
      block_type: block.block_type,
      content: block.content,
      sort_order: blocks.length,
      visible: block.visible,
    };
    const { data } = await supabase.from("page_blocks").insert(newBlock as any).select().single();
    if (data) setBlocks((prev) => [...prev, data as BlockData]);
  };

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBlocks(next.map((b, i) => ({ ...b, sort_order: i })));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (dragIdx !== null && dragIdx !== targetIdx) moveBlock(dragIdx, targetIdx);
    setDragIdx(null);
  };

  const saveAll = async () => {
    setSaving(true);
    const promises = blocks.map((b, i) =>
      supabase.from("page_blocks").update({ content: b.content as any, sort_order: i, visible: b.visible }).eq("id", b.id)
    );
    await Promise.all(promises);
    setSaving(false);
    toast({ title: "All blocks saved!" });
  };

  const getBlockIcon = (type: string) => {
    const bt = BLOCK_TYPES.find((t) => t.type === type);
    if (!bt) return Icons.FileText;
    return (Icons as any)[bt.icon] || Icons.FileText;
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/pages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground">{blocks.length} block(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
            <Eye className="h-3 w-3 mr-1" />{preview ? "Editor" : "Preview"}
          </Button>
          <Button onClick={saveAll} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving…" : "Save All"}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          {blocks.filter((b) => b.visible).map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
          {blocks.filter((b) => b.visible).length === 0 && (
            <p className="text-center text-muted-foreground py-20">No visible blocks</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {blocks.map((block, idx) => {
              const Icon = getBlockIcon(block.block_type);
              const isExpanded = expandedBlock === block.id;
              return (
                <Card
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className={`transition-all ${dragIdx === idx ? "opacity-50" : ""} ${!block.visible ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-0">
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/30"
                      onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground flex-1 capitalize">
                        {BLOCK_TYPES.find((t) => t.type === block.block_type)?.label ?? block.block_type}
                      </span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(idx, idx - 1)} disabled={idx === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveBlock(idx, idx + 1)} disabled={idx === blocks.length - 1}>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleVisibility(block.id)}>
                          {block.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicateBlock(block)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteBlock(block.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-4">
                        <BlockEditor block={block} onChange={(content) => updateBlock(block.id, content)} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" />Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {BLOCK_TYPES.map((bt) => {
                const Icon = (Icons as any)[bt.icon] || Icons.FileText;
                return (
                  <DropdownMenuItem key={bt.type} onClick={() => addBlock(bt.type)}>
                    <Icon className="h-4 w-4 mr-2" />{bt.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
