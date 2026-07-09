import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AnnouncementBar = () => {
  const { settings } = useSiteSettings();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if ((settings as any)?.announcement_text) {
      setText((settings as any).announcement_text);
    } else {
      supabase
        .from("site_settings" as any)
        .select("announcement_text")
        .limit(1)
        .maybeSingle()
        .then(({ data }: any) => {
          if (data?.announcement_text) setText(data.announcement_text);
        });
    }
  }, [settings]);

  if (!text) return null;

  return (
    <div className="announcement-bar w-full text-center text-xs sm:text-sm font-medium py-2 px-4">
      {text}
    </div>
  );
};

export default AnnouncementBar;
