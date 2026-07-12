import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SectionHeader {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
}

export function useSectionHeader(slug: string, fallback: SectionHeader) {
  const [header, setHeader] = useState<SectionHeader>(fallback);

  useEffect(() => {
    supabase
      .from("section_headers" as any)
      .select("eyebrow,title,subtitle")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setHeader({
            eyebrow: data.eyebrow ?? fallback.eyebrow,
            title: data.title ?? fallback.title,
            subtitle: data.subtitle ?? fallback.subtitle,
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return header;
}
