import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "./NotFound";

interface Funnel {
  id: string;
  name: string;
  slug: string;
  status: string;
  redirect_url: string;
}

interface FunnelStep {
  id: string;
  step_type: string;
  title: string;
  content: Record<string, unknown>;
  sort_order: number;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function FunnelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFunnel = async () => {
      const { data: funnelData } = await supabase
        .from("funnels")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!funnelData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setFunnel(funnelData as Funnel);

      const { data: stepsData } = await supabase
        .from("funnel_steps")
        .select("*")
        .eq("funnel_id", funnelData.id)
        .order("sort_order");

      setSteps((stepsData as FunnelStep[]) ?? []);
      setLoading(false);
    };
    fetchFunnel();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !funnel || steps.length === 0) return <NotFound />;

  const step = steps[currentStep];
  const content = step.content as Record<string, unknown>;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("funnel_leads").insert({
      funnel_id: funnel.id,
      step_id: step.id,
      data: formData,
    });

    if (error) {
      toast({ title: "Error submitting", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    goNext();
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleRedirect = () => {
    if (funnel.redirect_url) window.location.href = funnel.redirect_url;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial-glow pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {funnel.name}
          </p>
        </div>

        {/* Progress */}
        {steps.length > 1 && (
          <div className="flex items-center gap-2 mb-10">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {String(currentStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
            <div className="flex gap-1 flex-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-px flex-1 transition-all duration-500 ${
                    i <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="border border-border rounded-2xl p-8 sm:p-10 bg-card/30 backdrop-blur-xl"
          >
            {/* Form step */}
            {step.step_type === "form" && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {content.heading && (
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                    {content.heading as string}
                  </h1>
                )}
                {content.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {content.description as string}
                  </p>
                )}

                <div className="space-y-4 pt-2">
                  {((content.fields as FormField[]) ?? []).map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={formData[field.name] ?? ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                          }
                          required={field.required}
                          className="bg-background border-border"
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={formData[field.name] ?? ""}
                          onValueChange={(v) =>
                            setFormData((prev) => ({ ...prev, [field.name]: v }))
                          }
                        >
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options ?? []).map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          value={formData[field.name] ?? ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                          }
                          required={field.required}
                          className="bg-background border-border h-11"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {(content.button_text as string) || "Continue"}
                </Button>
              </form>
            )}

            {/* Content step */}
            {step.step_type === "content" && (
              <div className="space-y-6">
                {content.image_url && (
                  <img
                    src={content.image_url as string}
                    alt=""
                    className="w-full rounded-xl border border-border"
                  />
                )}
                {content.heading && (
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                    {content.heading as string}
                  </h1>
                )}
                {content.body && (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {content.body as string}
                  </p>
                )}
                <Button
                  onClick={goNext}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Thank you step */}
            {step.step_type === "thank_you" && (
              <div className="text-center space-y-6 py-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                {content.heading && (
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                    {content.heading as string}
                  </h1>
                )}
                {content.message && (
                  <p className="text-muted-foreground leading-relaxed">
                    {content.message as string}
                  </p>
                )}
                {content.show_redirect && funnel.redirect_url && (
                  <Button
                    onClick={handleRedirect}
                    className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {(content.redirect_text as string) || "Continue"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
