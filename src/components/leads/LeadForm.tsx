import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Send } from "lucide-react";
import {
  professionOptions,
  practiceTypeOptions,
  roleOptions,
  patientsPerMonthOptions,
  interestOptions,
  mainIntentOptions,
} from "@/data/lead-form-options";
import { calculateLeadScore, isNonProfessionalEmail } from "@/lib/lead-scoring";

const leadSchema = z.object({
  full_name: z.string().trim().min(2, "Nombre requerido").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(7, "Teléfono requerido").max(20),
  city: z.string().trim().min(2, "Ciudad requerida").max(100),
  country: z.string().trim().min(2, "País requerido").max(100),
  profession: z.string().min(1, "Selecciona tu profesión"),
  specialty: z.string().max(100).optional(),
  practice_type: z.string().min(1, "Selecciona el tipo de práctica"),
  clinic_name: z.string().max(150).optional(),
  role: z.string().min(1, "Selecciona tu rol"),
  patients_per_month: z.string().min(1, "Selecciona un rango"),
  offers_peptides: z.boolean(),
  uses_glp1: z.boolean(),
  interests: z.array(z.string()).min(1, "Selecciona al menos un área de interés"),
  main_intent: z.string().min(1, "Selecciona tu intención principal"),
  consent: z.literal(true, { errorMap: () => ({ message: "Debes aceptar para continuar" }) }),
});

type LeadFormValues = z.infer<typeof leadSchema>;

const LeadForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      profession: "",
      specialty: "",
      practice_type: "",
      clinic_name: "",
      role: "",
      patients_per_month: "",
      offers_peptides: false,
      uses_glp1: false,
      interests: [],
      main_intent: "",
      consent: undefined as unknown as true,
    },
  });

  const watchEmail = form.watch("email");
  const watchClinicName = form.watch("clinic_name");

  // Check email warning
  const checkEmailWarning = (email: string) => {
    if (email && isNonProfessionalEmail(email) && !watchClinicName?.trim()) {
      setEmailWarning(true);
    } else {
      setEmailWarning(false);
    }
  };

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      const { score, classification } = calculateLeadScore({
        practice_type: data.practice_type,
        role: data.role,
        patients_per_month: data.patients_per_month,
        offers_peptides: data.offers_peptides,
        uses_glp1: data.uses_glp1,
        main_intent: data.main_intent,
        interests: data.interests,
        clinic_name: data.clinic_name,
        email: data.email,
      });

      // TODO: When Cloud is enabled, call edge function here
      console.log("Lead submitted:", { ...data, score, classification });

      navigate("/manual-confirmacion");
    } catch {
      console.error("Error submitting lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="formulario" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-6">
        <Card className="mx-auto max-w-2xl shadow-card-hover border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display text-foreground">
              Obtén tu manual gratuito
            </CardTitle>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Completa el formulario y descarga el manual de inmediato.
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal info */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-body mb-4">
                    Información de contacto
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="full_name" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="font-body">Nombre completo *</FormLabel>
                        <FormControl><Input placeholder="Dr. Juan Pérez" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Email profesional *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="juan@clinica.com"
                            {...field}
                            onChange={(e) => { field.onChange(e); checkEmailWarning(e.target.value); }}
                          />
                        </FormControl>
                        {emailWarning && (
                          <div className="flex items-center gap-1.5 text-xs text-gold">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Te recomendamos usar un email profesional o completar el nombre de tu clínica.</span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Teléfono / WhatsApp *</FormLabel>
                        <FormControl><Input placeholder="+52 81 1234 5678" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Ciudad *</FormLabel>
                        <FormControl><Input placeholder="Monterrey" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">País *</FormLabel>
                        <FormControl><Input placeholder="México" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Separator />

                {/* Professional profile */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-body mb-4">
                    Perfil profesional
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="profession" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Profesión *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {professionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="specialty" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Especialidad</FormLabel>
                        <FormControl><Input placeholder="Ej: Dermatología" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="practice_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Tipo de práctica *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {practiceTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="clinic_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Nombre de la clínica</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre del centro"
                            {...field}
                            onChange={(e) => { field.onChange(e); checkEmailWarning(watchEmail); }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Tu rol *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {roleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="patients_per_month" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-body">Pacientes por mes *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {patientsPerMonthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Separator />

                {/* Clinical experience */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-body mb-4">
                    Experiencia clínica
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="offers_peptides" render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-body text-sm font-normal cursor-pointer">
                          Actualmente ofrezco terapias con péptidos
                        </FormLabel>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="uses_glp1" render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-body text-sm font-normal cursor-pointer">
                          Actualmente uso GLP-1 o tirzepatida
                        </FormLabel>
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Separator />

                {/* Interests */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-body mb-4">
                    Áreas de interés
                  </h3>
                  <FormField control={form.control} name="interests" render={() => (
                    <FormItem>
                      <div className="flex flex-wrap gap-3">
                        {interestOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0 rounded-full border border-border px-4 py-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      if (checked) field.onChange([...field.value, option.value]);
                                      else field.onChange(field.value?.filter((v: string) => v !== option.value));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-body text-sm font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                {/* Intent */}
                <FormField control={form.control} name="main_intent" render={({ field }) => (
                  <FormItem>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-body mb-2">
                      Intención principal
                    </h3>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="¿Qué buscas lograr?" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {mainIntentOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <Separator />

                {/* Consent */}
                <FormField control={form.control} name="consent" render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-border bg-muted/30 p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                    </FormControl>
                    <div>
                      <FormLabel className="font-body text-sm font-normal cursor-pointer">
                        Acepto ser contactado con información profesional, capacitación y oportunidades relacionadas con mi práctica. *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold font-body shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Descargar manual gratuito
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LeadForm;
