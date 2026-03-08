import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CustomScript {
  id: string;
  script_type: string;
  code: string;
  placement: string;
  page_path: string | null;
}

export default function ScriptInjector() {
  const location = useLocation();
  const [scripts, setScripts] = useState<CustomScript[]>([]);

  useEffect(() => {
    const fetchScripts = async () => {
      const { data } = await supabase
        .from("custom_scripts")
        .select("id, script_type, code, placement, page_path")
        .eq("enabled", true);
      if (data) setScripts(data as CustomScript[]);
    };
    fetchScripts();
  }, []);

  useEffect(() => {
    if (scripts.length === 0) return;

    const injectedElements: HTMLElement[] = [];

    scripts.forEach((s) => {
      // Page-specific check
      if (s.placement === "page_specific" && s.page_path) {
        if (!location.pathname.startsWith(s.page_path)) return;
      }

      if (s.script_type === "css") {
        const style = document.createElement("style");
        style.setAttribute("data-custom-script", s.id);
        style.textContent = s.code;
        document.head.appendChild(style);
        injectedElements.push(style);
      } else if (s.script_type === "json") {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-custom-script", s.id);
        script.textContent = s.code;
        document.head.appendChild(script);
        injectedElements.push(script);
      } else if (s.script_type === "html") {
        const container = document.createElement("div");
        container.setAttribute("data-custom-script", s.id);
        container.innerHTML = s.code;
        // Extract and execute any script tags within the HTML
        const scriptTags = container.querySelectorAll("script");
        const target = s.placement === "head" ? document.head : document.body;

        if (scriptTags.length > 0) {
          scriptTags.forEach((tag) => {
            const newScript = document.createElement("script");
            if (tag.src) {
              newScript.src = tag.src;
              newScript.async = true;
            } else {
              newScript.textContent = tag.textContent;
            }
            newScript.setAttribute("data-custom-script", s.id);
            target.appendChild(newScript);
            injectedElements.push(newScript);
          });
          // Also append non-script HTML
          container.querySelectorAll("script").forEach((t) => t.remove());
          if (container.innerHTML.trim()) {
            target.appendChild(container);
            injectedElements.push(container);
          }
        } else {
          target.appendChild(container);
          injectedElements.push(container);
        }
      } else {
        // JavaScript
        const script = document.createElement("script");
        script.setAttribute("data-custom-script", s.id);
        script.textContent = s.code;
        const target =
          s.placement === "head" ? document.head : document.body;
        target.appendChild(script);
        injectedElements.push(script);
      }
    });

    return () => {
      injectedElements.forEach((el) => el.remove());
    };
  }, [scripts, location.pathname]);

  return null;
}
