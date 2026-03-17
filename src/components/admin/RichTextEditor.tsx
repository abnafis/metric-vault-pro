import { useState, useRef, useCallback } from "react";
import {
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3,
  Code, Link as LinkIcon, Image as ImageIcon, Quote, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Start writing…" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!content);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setIsEmpty(!html || html === "<br>");
    onChange(html);
  }, [onChange]);

  const setLink = useCallback(() => {
    const url = window.prompt("URL");
    if (url) exec("createLink", url);
  }, [exec]);

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const ext = file.name.split(".").pop();
      const path = `inline/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file);
      if (error) return;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      exec("insertImage", data.publicUrl);
    };
    input.click();
  }, [exec]);

  const Btn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <Button type="button" variant="ghost" size="sm" title={title} onClick={onClick}
      className="h-8 w-8 p-0">
      {children}
    </Button>
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap gap-0.5 border-b border-border p-1 bg-muted/30">
        <Btn title="Bold" onClick={() => exec("bold")}><Bold className="h-4 w-4" /></Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><Italic className="h-4 w-4" /></Btn>
        <Btn title="H1" onClick={() => exec("formatBlock", "h1")}><Heading1 className="h-4 w-4" /></Btn>
        <Btn title="H2" onClick={() => exec("formatBlock", "h2")}><Heading2 className="h-4 w-4" /></Btn>
        <Btn title="H3" onClick={() => exec("formatBlock", "h3")}><Heading3 className="h-4 w-4" /></Btn>
        <Btn title="Bullet List" onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></Btn>
        <Btn title="Ordered List" onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")}><Quote className="h-4 w-4" /></Btn>
        <Btn title="Code Block" onClick={() => exec("formatBlock", "pre")}><Code className="h-4 w-4" /></Btn>
        <Btn title="Horizontal Rule" onClick={() => exec("insertHorizontalRule")}><Minus className="h-4 w-4" /></Btn>
        <Btn title="Link" onClick={setLink}><LinkIcon className="h-4 w-4" /></Btn>
        <Btn title="Image" onClick={addImage}><ImageIcon className="h-4 w-4" /></Btn>
      </div>
      <div className="relative">
        {isEmpty && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">{placeholder}</div>
        )}
        <div
          ref={editorRef}
          contentEditable
          className={cn("prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none")}
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
