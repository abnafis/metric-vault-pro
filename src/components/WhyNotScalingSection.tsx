import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import { useSectionHeader } from "@/hooks/useSectionHeader";

interface Feature { id: string; label: string; visible: boolean; }

const WhyNotScalingSection = () => {
  const [items, setItems] = useState<Feature[]>([]);

  useEffect(() => {
    supabase.from("why_features").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems((data as Feature[]).filter((f) => f.visible !== false));
    });
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Why your ads aren't scaling</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Stop guessing. Start tracking every conversion.
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((f) => (
            <div
              key={f.id}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNotScalingSection;
