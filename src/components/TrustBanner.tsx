import { Shield, FlaskConical, Snowflake } from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Pureza certificada",
    description: "Verificada por HPLC y espectrometría de masas en cada lote de producción.",
  },
  {
    icon: Snowflake,
    title: "Liofilizado",
    description:
      "Proceso de secado que preserva la estructura molecular y mejora la estabilidad durante el envío y almacenamiento.",
  },
  {
    icon: Shield,
    title: "Calidad Certificada",
    description: "Certificado de análisis disponible. Cumplimiento con estándares GMP de manufactura.",
  },
];

const TrustBanner = () => {
  return (
    <section className="border-y border-border bg-muted/40 py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-body">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground font-body">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
