import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Logo {
  id: string;
  image_url: string;
  alt: string;
}

const fallbackLogos: Logo[] = [
  { id: "1", image_url: "", alt: "Scalix AI" },
  { id: "2", image_url: "", alt: "AdRock" },
  { id: "3", image_url: "", alt: "Stape" },
  { id: "4", image_url: "", alt: "Whop" },
  { id: "5", image_url: "", alt: "Cluely" },
  { id: "6", image_url: "", alt: "Profitable Sites" },
];

const LogoMarquee = () => {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    supabase
      .from("partner_logos" as any)
      .select("id,image_url,alt")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data }: any) => {
        if (Array.isArray(data) && data.length) setLogos(data);
      });
  }, []);

  const list = logos.length ? logos : fallbackLogos;
  const doubled = [...list, ...list];

  return (
    <section className="py-12 border-y border-border">
      <div className="marquee">
        <div className="marquee-track">
          {doubled.map((l, i) => (
            <div
              key={`${l.id}-${i}`}
              className="flex items-center justify-center h-12 min-w-[160px] text-muted-foreground/70"
            >
              {l.image_url ? (
                <img src={l.image_url} alt={l.alt} className="max-h-8 object-contain opacity-70" />
              ) : (
                <span className="text-xl font-bold tracking-tight">{l.alt}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
