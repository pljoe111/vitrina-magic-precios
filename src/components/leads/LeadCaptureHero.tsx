import { BookOpen, Award, Shield } from "lucide-react";
import manualCover from "@/assets/manual-cover.png";

const LeadCaptureHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_70%)]" />

      <div className="container relative mx-auto px-6 py-16 lg:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold font-body mb-4 animate-fade-in">
              Exclusivo para profesionales del sector salud
            </span>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl font-display animate-fade-up">
              Manual Profesional de Protocolos{" "}
              <span className="text-primary">NAD+, Péptidos</span> y Terapias Metabólicas
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground font-body animate-fade-up" style={{ animationDelay: "100ms" }}>
              21 páginas de protocolos clínicos, dosis, ciclos y guías de administración para implementar en tu práctica profesional.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 shadow-card">
                <span className="text-sm text-muted-foreground font-body line-through">$500 MXN</span>
                <span className="text-lg font-bold text-primary font-display">GRATIS</span>
              </div>
              <a
                href="#formulario"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 font-body shadow-lg shadow-primary/20"
              >
                <BookOpen className="h-4 w-4" />
                Descargar ahora
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-body lg:justify-start animate-fade-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>21 páginas</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Uso profesional</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Acceso inmediato</span>
              </div>
            </div>
          </div>

          {/* Manual cover mockup */}
          <div className="relative flex-shrink-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              {/* Shadow/glow behind */}
              <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-2xl" />
              <img
                src={manualCover}
                alt="Portada del Manual Profesional de Protocolos ALCHEM"
                className="relative w-64 rounded-lg shadow-2xl ring-1 ring-border sm:w-72 lg:w-80"
              />
              {/* Badge overlay */}
              <div className="absolute -bottom-3 -right-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg font-body">
                PDF Gratuito
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureHero;
