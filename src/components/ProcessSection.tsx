import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}

const MOCK_VARIANTS = [
  // Tracking panel
  (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
        <span className="text-xs font-medium">GA4 Property</span>
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
        <span className="text-xs font-medium">Google Tag Manager</span>
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
        <span className="text-xs font-medium">Server-side Endpoint</span>
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
  ),
  // Code block
  (
    <pre className="text-[10px] leading-relaxed rounded-md bg-zinc-950 text-zinc-100 p-3 overflow-hidden">
      <code>{`dataLayer.push({
  event: 'purchase',
  ecommerce: {
    value: 129.99,
    currency: 'USD',
    items: [...]
  }
});`}</code>
    </pre>
  ),
  // Report card
  (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Conversions</p>
          <p className="text-2xl font-bold">1,284</p>
        </div>
        <span className="text-xs font-medium text-green-600">+38%</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {[40, 55, 45, 70, 62, 85, 92].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-primary/80" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  ),
];

const ProcessSection = () => {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    supabase.from("process_steps").select("*").order("sort_order").then(({ data }) => {
      if (data) setSteps(data as Step[]);
    });
  }, []);

  if (!steps.length) return null;

  return (
    <section id="process" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Process</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            A clear path from audit to accurate data.
          </h2>
        </div>
        <div className="space-y-8">
          {steps.map((step, i) => {
            const Icon = ((Icons as unknown as Record<string, LucideIcon>)[step.icon] || Icons.Settings) as LucideIcon;
            const mock = MOCK_VARIANTS[i % MOCK_VARIANTS.length];
            const reverse = i % 2 === 1;
            return (
              <div
                key={step.id}
                className={`grid md:grid-cols-2 gap-6 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                    <Icon className="h-3.5 w-3.5" />
                    Step {i + 1}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  {mock}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
