import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { professionOptions, practiceTypeOptions } from "@/data/lead-form-options";
import { calculateLeadScore, isNonProfessionalEmail } from "@/lib/lead-scoring";

const STORAGE_KEY = "alchem_catalog_access";

interface StoredAccess {
  code: string;
  expiresAt: string;
}

export function useCatalogAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredAccess = JSON.parse(stored);
        if (new Date(parsed.expiresAt) > new Date()) {
          setHasAccess(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setChecking(false);
  }, []);

  return { hasAccess, checking, setHasAccess };
}

const catalogLeadSchema = z.object({
  full_name: z.string().trim().min(2, "Nombre requerido").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(7, "Teléfono requerido").max(20),
  whatsapp: z.string().trim().min(7, "WhatsApp requerido").max(20),
  city: z.string().trim().min(2, "Ciudad requerida").max(100),
  country: z.string().trim().min(2, "País requerido").max(100),
  profession: z.string().min(1, "Selecciona tu profesión"),
  practice_type: z.string().min(1, "Selecciona el tipo de práctica"),
  clinic_name: z.string().max(150).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Debes aceptar para continuar" }) }),
});

type CatalogLeadValues = z.infer<typeof catalogLeadSchema>;

interface CatalogGateProps {
  onAccessGranted: () => void;
}

type GateMode = "choose" | "code" | "lead";

const CatalogGate = ({ onAccessGranted }: CatalogGateProps) => {
  const [mode, setMode] = useState<GateMode>("choose");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<CatalogLeadValues>({
    resolver: zodResolver(catalogLeadSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      whatsapp: "",
      city: "",
      country: "",
      profession: "",
      practice_type: "",
      clinic_name: "",
      consent: undefined as unknown as true,
    },
  });

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("code, expires_at")
        .eq("code", code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ code: data.code, expiresAt: data.expires_at })
        );
        onAccessGranted();
      } else {
        toast({
          title: "Código inválido",
          description: "El código ingresado no existe o ha expirado.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo verificar el código. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (data: CatalogLeadValues) => {
    setLoading(true);
    try {
      const { score, classification } = calculateLeadScore({
        practice_type: data.practice_type,
        role: "propietario",
        patients_per_month: "50-100",
        offers_peptides: false,
        uses_glp1: false,
        main_intent: "encontrar_proveedores",
        interests: ["proveedores_insumos"],
        clinic_name: data.clinic_name,
        email: data.email,
      });

      const { error } = await supabase.from("leads").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        city: data.city,
        country: data.country,
        profession: data.profession,
        practice_type: data.practice_type,
        clinic_name: data.clinic_name || null,
        role: "propietario",
        patients_per_month: "50-100",
        main_intent: "encontrar_proveedores",
        interests: ["proveedores_insumos"],
        consent: data.consent,
        lead_score: score,
        lead_classification: classification,
      });

      if (error) throw error;

      // Send email notification (fire and forget)
      supabase.functions.invoke("send-lead-notification", {
        body: {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp,
          city: data.city,
          country: data.country,
          profession: data.profession,
          clinic_name: data.clinic_name,
          lead_score: score,
          lead_classification: classification,
        },
      }).catch(console.error);

      // Grant 30-day access
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ code: "LEAD_ACCESS", expiresAt: expiresAt.toISOString() })
      );

      toast({
        title: "¡Acceso concedido!",
        description: "Ya puedes ver el catálogo completo. Nos pondremos en contacto contigo pronto.",
      });

      onAccessGranted();
    } catch (err) {
      console.error("Error submitting catalog lead:", err);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
      <div className="absolute inset-0 backdrop-blur-xl bg-background/60" />

      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-[0_16px_64px_-16px_hsl(200_25%_10%/0.18)]">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-center text-2xl font-bold text-foreground font-display leading-[1.1]">
            Catálogo Exclusivo
          </h2>

          {/* === CHOOSE MODE === */}
          {mode === "choose" && (
            <>
              <p className="mt-3 text-center text-sm text-muted-foreground font-body leading-relaxed">
                Elige cómo acceder a nuestro catálogo completo de péptidos y precios.
              </p>
              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => setMode("code")}
                  variant="outline"
                  className="w-full h-12 text-sm font-semibold font-body justify-between"
                >
                  Tengo un código de acceso
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setMode("lead")}
                  className="w-full h-12 text-sm font-semibold font-body justify-between"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Solicitar acceso
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-body">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Catálogo exclusivo para profesionales de salud</span>
              </div>
            </>
          )}

          {/* === CODE MODE === */}
          {mode === "code" && (
            <>
              <p className="mt-3 text-center text-sm text-muted-foreground font-body leading-relaxed">
                Ingresa tu código de acceso.
              </p>
              <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO DE ACCESO"
                  className="h-12 text-center font-mono text-lg tracking-[0.2em] uppercase placeholder:text-xs placeholder:tracking-widest placeholder:font-sans"
                  maxLength={20}
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-semibold font-body"
                  disabled={loading || !code.trim()}
                >
                  {loading ? "Verificando..." : (
                    <>Acceder al catálogo <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </form>
              <button
                onClick={() => setMode("choose")}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                ← Volver
              </button>
            </>
          )}

          {/* === LEAD FORM MODE === */}
          {mode === "lead" && (
            <>
              <p className="mt-3 text-center text-sm text-muted-foreground font-body leading-relaxed">
                Completa tus datos para obtener acceso inmediato al catálogo.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLeadSubmit)} className="mt-6 space-y-4">
                  <FormField control={form.control} name="full_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body text-xs">Nombre completo *</FormLabel>
                      <FormControl><Input placeholder="Dr. Juan Pérez" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid gap-3 grid-cols-2">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="font-body text-xs">Email profesional *</FormLabel>
                        <FormControl><Input type="email" placeholder="juan@clinica.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs">Teléfono *</FormLabel>
                        <FormControl><Input placeholder="+52 81 1234 5678" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs">WhatsApp *</FormLabel>
                        <FormControl><Input placeholder="+52 81 1234 5678" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs">Ciudad *</FormLabel>
                        <FormControl><Input placeholder="Monterrey" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs">País *</FormLabel>
                        <FormControl><Input placeholder="México" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <FormField control={form.control} name="profession" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs">Profesión *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {professionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="practice_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body text-xs">Tipo de práctica *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {practiceTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="clinic_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body text-xs">Nombre de la clínica</FormLabel>
                      <FormControl><Input placeholder="Nombre del centro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="consent" render={({ field }) => (
                    <FormItem className="flex items-start gap-2.5 space-y-0 rounded-lg border border-border bg-muted/30 p-3">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                      </FormControl>
                      <FormLabel className="font-body text-xs font-normal cursor-pointer leading-relaxed">
                        Acepto ser contactado con información profesional y oportunidades relacionadas con mi práctica. *
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold font-body"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Obtener acceso al catálogo
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              <button
                onClick={() => setMode("choose")}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                ← Volver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogGate;
