import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import manualCover from "@/assets/manual-cover.png";
import { z } from "zod";
import { Loader2, ArrowRight, ArrowLeft, MessageCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateLeadScore } from "@/lib/lead-scoring";
import {
  professionOptions,
  practiceTypeOptions,
  mainIntentOptions,
} from "@/data/lead-form-options";

const phoneRegex = /^[+\d\s()-]{7,20}$/;

const schema = z.object({
  full_name: z.string().trim().min(2, "Nombre requerido").max(100),
  phone: z.string().trim().regex(phoneRegex, "Teléfono inválido"),
  email: z.string().trim().email("Email inválido").max(255),
  profession: z.string().min(1),
  practice_type: z.string().min(1),
  main_intent: z.array(z.string()).min(1, "Selecciona al menos una opción"),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Tu nombre", "WhatsApp", "Email", "Profesión", "Práctica", "Objetivo"] as const;

const LeadQuick = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    full_name: "",
    phone: "",
    email: "",
    profession: "",
    practice_type: "",
    main_intent: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [freeUntil, setFreeUntil] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    let mounted = true;
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "free_manual_until")
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        const v = (data as any)?.value;
        if (v && typeof v === "string") {
          const d = new Date(v);
          if (!isNaN(d.getTime())) setFreeUntil(d);
        }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!freeUntil) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [freeUntil]);

  const isFree = !!freeUntil && freeUntil.getTime() > now.getTime();
  const remainingMs = freeUntil ? Math.max(0, freeUntil.getTime() - now.getTime()) : 0;
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setError(null);
  };

  const toggleIntent = (value: string) => {
    setData((d) => {
      const exists = d.main_intent.includes(value);
      return {
        ...d,
        main_intent: exists ? d.main_intent.filter((x) => x !== value) : [...d.main_intent, value],
      };
    });
    setError(null);
  };

  const validateStep = (): boolean => {
    const fields: (keyof FormData)[] = ["full_name", "phone", "email", "profession", "practice_type", "main_intent"];
    const k = fields[step];
    const partial = { ...data };
    const result = schema.shape[k].safeParse(partial[k]);
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Campo inválido");
      return false;
    }
    return true;
  };

  const checkWhatsApp = async (): Promise<boolean> => {
    setValidating(true);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("validate-whatsapp", {
        body: { phone: data.phone },
      });
      if (fnErr) throw fnErr;
      return !!res?.valid;
    } catch (e) {
      console.error("WA validation failed", e);
      return true; // fail-open
    } finally {
      setValidating(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // After WhatsApp step → check validity
    if (step === 1) {
      const valid = await checkWhatsApp();
      if (!valid) {
        setWaModalOpen(true);
        return;
      }
    }

    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  };

  const submit = async () => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Revisa los datos");
      return;
    }
    setSubmitting(true);
    try {
      const { score, classification } = calculateLeadScore({
        practice_type: data.practice_type,
        role: "propietario",
        patients_per_month: "0-50",
        offers_peptides: false,
        uses_glp1: false,
        main_intent: data.main_intent[0] ?? "",
        interests: [],
        email: data.email,
      });

      const { error: insErr } = await supabase.from("leads").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.phone,
        city: "no_especificado",
        country: "México",
        profession: data.profession,
        practice_type: data.practice_type,
        role: "no_especificado",
        patients_per_month: "no_especificado",
        offers_peptides: false,
        uses_glp1: false,
        interests: [],
        main_intent: data.main_intent.join(","),
        consent: true,
        lead_score: score,
        lead_classification: classification,
      });
      if (insErr) throw insErr;

      // Fire-and-forget notification
      supabase.functions
        .invoke("send-lead-notification", {
          body: {
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            whatsapp: data.phone,
            city: "—",
            country: "México",
            profession: data.profession,
            lead_score: score,
            lead_classification: classification,
          },
        })
        .catch(() => {});

      navigate(`/manual-confirmacion?url=${encodeURIComponent("/Manual-Clinico-Protocolos-ALCHEM-2026.pdf")}`);
    } catch (e) {
      console.error(e);
      toast.error("Hubo un problema al enviar tus datos. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmNonWhatsApp = () => {
    setWaModalOpen(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-5 pt-6 pb-3 flex items-center justify-between">
          <img src={logo} alt="ALCHEM" className="h-8 w-auto" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">
            Edición 2026
          </span>
        </header>

        <main className="flex-1 px-5 pb-6 pt-2 flex flex-col">
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center text-center">
            <div className="text-[11px] uppercase tracking-widest text-primary font-body font-semibold mb-3">
              Manual Clínico · PDF
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.1] mb-3">
              Protocolos de Péptidos para tu Práctica
            </h1>

            {/* Price */}
            <div className="flex items-end justify-center gap-3 mb-2">
              {isFree && (
                <span className="font-body text-base text-muted-foreground line-through decoration-2">
                  MX$500
                </span>
              )}
              <span className="font-display text-3xl text-primary leading-none">
                {isFree ? "GRATIS" : "MX$500"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground font-body mb-5 max-w-sm">
              21 páginas con dosificación, reconstitución y protocolos clínicos basados en evidencia.
            </p>

            {/* Countdown */}
            {isFree && (
              <div className="mb-5 w-full max-w-xs mx-auto">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-body mb-1.5">
                  Promoción gratis termina en
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { v: days, l: "días" },
                    { v: hours, l: "hrs" },
                    { v: minutes, l: "min" },
                    { v: seconds, l: "seg" },
                  ].map((c, i) => (
                    <div key={i} className="rounded-lg border border-primary/30 bg-primary/5 py-2">
                      <div className="font-display text-xl text-primary leading-none">
                        {String(c.v).padStart(2, "0")}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
                        {c.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <div className="relative w-full max-w-[280px] mx-auto mb-6">
              <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" aria-hidden />
              <img
                src={manualCover}
                alt="Portada del Manual Clínico de Protocolos ALCHEM 2026"
                className="relative w-full h-auto rounded-lg shadow-2xl border border-border"
              />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                PDF
              </div>
            </div>

            <ul className="text-left text-sm font-body text-foreground/80 space-y-1.5 mb-2">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Dosificación clínica detallada</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Protocolos para GLP-1, BPC-157, NAD+ y más</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Solo para profesionales de la salud</li>
            </ul>
          </div>
        </main>

        <footer className="sticky bottom-0 px-5 pb-6 pt-3 bg-background border-t border-border/50">
          <div className="max-w-md mx-auto">
            <Button
              size="lg"
              onClick={() => setStarted(true)}
              className="h-14 rounded-full w-full text-base font-semibold"
            >
              Descargar manual gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-[11px] text-muted-foreground font-body text-center mt-2">
              Toma 30 segundos · 6 preguntas rápidas
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <img src={logo} alt="ALCHEM" className="h-8 w-auto" />
        <div className="text-xs text-muted-foreground font-body">
          Paso {step + 1}/{STEPS.length}
        </div>
      </header>

      {/* Progress */}
      <div className="px-5">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* PDF Carrot — persistent preview of the reward */}
      <div className="px-5 pt-5">
        <div className="max-w-md mx-auto flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="relative shrink-0">
            <div className="h-16 w-12 rounded-sm bg-white border border-border shadow-sm flex flex-col items-center justify-center overflow-hidden">
              <div className="font-display text-[8px] text-primary leading-tight text-center px-1">
                ALCHEM
              </div>
              <div className="mt-1 space-y-[2px] w-full px-1">
                <div className="h-[2px] bg-muted-foreground/30 rounded-full" />
                <div className="h-[2px] bg-muted-foreground/30 rounded-full w-3/4" />
                <div className="h-[2px] bg-muted-foreground/30 rounded-full" />
                <div className="h-[2px] bg-muted-foreground/30 rounded-full w-2/3" />
              </div>
            </div>
            <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              PDF
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-primary font-body font-semibold">
              Tu descarga al finalizar
            </div>
            <div className="font-display text-sm text-foreground leading-tight truncate">
              Manual Clínico de Protocolos
            </div>
            <div className="text-[11px] text-muted-foreground font-body">
              21 páginas · PDF gratuito
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-5 pt-6 pb-6 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <h1 className="font-display text-2xl sm:text-3xl text-foreground leading-tight mb-1">
            {step === 0 && "¿Cómo te llamas?"}
            {step === 1 && "¿Tu WhatsApp?"}
            {step === 2 && "¿Tu email?"}
            {step === 3 && "¿Tu profesión?"}
            {step === 4 && "¿Tipo de práctica?"}
            {step === 5 && "¿Qué buscas lograr?"}
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-8">
            {step === 1
              ? "Te contactamos por WhatsApp con tu manual y catálogo."
              : "Solo tomará unos segundos."}
          </p>

          <div className="space-y-3">
            {step === 0 && (
              <>
                <Label htmlFor="name" className="sr-only">Nombre</Label>
                <Input
                  id="name"
                  autoFocus
                  inputMode="text"
                  autoComplete="name"
                  placeholder="Dr. Juan Pérez"
                  value={data.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  className="h-14 text-base rounded-lg"
                />
              </>
            )}

            {step === 1 && (
              <>
                <Label htmlFor="phone" className="sr-only">WhatsApp</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    id="phone"
                    autoFocus
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+52 81 1234 5678"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="h-14 pl-12 text-base rounded-lg"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  autoFocus
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="juan@clinica.com"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="h-14 text-base rounded-lg"
                />
              </>
            )}

            {step === 3 && (
              <Select value={data.profession} onValueChange={(v) => update("profession", v)}>
                <SelectTrigger className="h-14 text-base rounded-lg">
                  <SelectValue placeholder="Selecciona tu profesión" />
                </SelectTrigger>
                <SelectContent>
                  {professionOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="py-3 text-base">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {step === 4 && (
              <div className="grid gap-2">
                {practiceTypeOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => update("practice_type", o.value)}
                    className={`w-full text-left px-4 py-4 rounded-lg border transition-all ${
                      data.practice_type === o.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-body text-base">{o.label}</span>
                      {data.practice_type === o.value && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground font-body -mt-4 mb-1">
                  Selecciona todas las que apliquen.
                </p>
                {mainIntentOptions.map((o) => {
                  const selected = data.main_intent.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleIntent(o.value)}
                      className={`w-full text-left px-4 py-4 rounded-lg border transition-all ${
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-body text-base">{o.label}</span>
                        {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Sticky footer CTA */}
      <footer className="sticky bottom-0 px-5 pb-6 pt-3 bg-background border-t border-border/50">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="h-14 rounded-full px-5"
              disabled={submitting || validating}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleNext}
            disabled={submitting || validating}
            className="h-14 rounded-full flex-1 text-base font-semibold"
          >
            {validating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando…
              </>
            ) : submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando…
              </>
            ) : step === STEPS.length - 1 ? (
              <>Enviar</>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </footer>

      {/* Non-WhatsApp confirmation modal */}
      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold" />
              Número sin WhatsApp
            </DialogTitle>
            <DialogDescription className="font-body text-sm pt-2">
              No detectamos WhatsApp activo en{" "}
              <span className="font-semibold text-foreground">{data.phone}</span>. Te contactamos
              principalmente por ese medio.
              <br />
              <br />
              ¿Quieres continuar con este número de todos modos?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setWaModalOpen(false)}
              className="rounded-full"
            >
              Corregir número
            </Button>
            <Button onClick={confirmNonWhatsApp} className="rounded-full">
              Continuar igual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadQuick;
