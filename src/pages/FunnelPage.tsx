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

      if (!funnelData) { setNotFound(true); setLoading(false); return; }
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleRedirect = () => {
    if (funnel.redirect_url) {
      window.location.href = funnel.redirect_url;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        {steps.length > 1 && (
          <div className="flex gap-1 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        {/* Form step */}
        {step.step_type === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {content.heading && (
              <h1 className="text-3xl font-bold text-foreground">{content.heading as string}</h1>
            )}
            {content.description && (
              <p className="text-muted-foreground">{content.description as string}</p>
            )}

            <div className="space-y-4">
              {((content.fields as FormField[]) ?? []).map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={formData[field.name] ?? ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      required={field.required}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={formData[field.name] ?? ""}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, [field.name]: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.name] ?? ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {(content.button_text as string) || "Submit"}
            </Button>
          </form>
        )}

        {/* Content step */}
        {step.step_type === "content" && (
          <div className="space-y-6">
            {content.image_url && (
              <img src={content.image_url as string} alt="" className="w-full rounded-lg" />
            )}
            {content.heading && (
              <h1 className="text-3xl font-bold text-foreground">{content.heading as string}</h1>
            )}
            {content.body && (
              <p className="text-muted-foreground whitespace-pre-wrap">{content.body as string}</p>
            )}
            <Button onClick={goNext} className="w-full" size="lg">
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Thank you step */}
        {step.step_type === "thank_you" && (
          <div className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            {content.heading && (
              <h1 className="text-3xl font-bold text-foreground">{content.heading as string}</h1>
            )}
            {content.message && (
              <p className="text-muted-foreground">{content.message as string}</p>
            )}
            {content.show_redirect && funnel.redirect_url && (
              <Button onClick={handleRedirect} size="lg" className="w-full">
                {(content.redirect_text as string) || "Continue →"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
