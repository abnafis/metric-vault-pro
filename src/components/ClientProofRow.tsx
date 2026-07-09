import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const defaultAvatars = [
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=47",
  "https://i.pravatar.cc/80?img=58",
];

const ClientProofRow = () => {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [label, setLabel] = useState<string>("250+ Happy clients");

  useEffect(() => {
    supabase
      .from("hero_content")
      .select("social_proof_avatars,social_proof_label")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (!data) return;
        if (Array.isArray(data.social_proof_avatars) && data.social_proof_avatars.length) {
          setAvatars(data.social_proof_avatars);
        }
        if (data.social_proof_label) setLabel(data.social_proof_label);
      });
  }, []);

  const display = avatars.length ? avatars : defaultAvatars;

  return (
    <section className="pb-8">
      <div className="section-container flex items-center justify-center gap-4">
        <div className="flex -space-x-3">
          {display.slice(0, 4).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-background bg-muted"
            />
          ))}
        </div>
        <div>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            ))}
          </div>
          <div className="text-sm font-semibold text-foreground mt-0.5">{label}</div>
        </div>
      </div>
    </section>
  );
};

export default ClientProofRow;
