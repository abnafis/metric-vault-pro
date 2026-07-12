import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSectionHeader } from "@/hooks/useSectionHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const header = useSectionHeader("faqs", {
    eyebrow: "FAQs",
    title: "Questions you may Ask",
    subtitle: "Any queries you have",
  });

  useEffect(() => {
    supabase
      .from("faqs" as any)
      .select("id,question,answer")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data }: any) => {
        if (Array.isArray(data)) setFaqs(data);
      });
  }, []);

  if (!faqs.length) return null;

  return (
    <section id="faqs" className="py-24">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-14">
          {header.eyebrow && <p className="text-sm text-muted-foreground mb-3">{header.eyebrow}</p>}
          {header.title && (
            <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground">
              {header.title}
            </h2>
          )}
          {header.subtitle && <p className="text-muted-foreground mt-3">{header.subtitle}</p>}
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="rounded-2xl border border-border bg-card px-6 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold hover:no-underline py-5">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
