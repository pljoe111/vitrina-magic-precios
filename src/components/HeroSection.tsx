import { products } from "@/data/products";
import tirzepatideImg from "@/assets/tirzepatide.png";

const HeroSection = () => {
  const featured = products[0]; // Tirzepatide

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_70%)]" />
      
      <div className="container relative mx-auto px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div className="max-w-xl opacity-0 animate-fade-up">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary font-body mb-6">
              Catálogo de Péptidos
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl font-display">
              Ciencia de{" "}
              <span className="text-primary">vanguardia</span>{" "}
              en péptidos liofilizados
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground font-body">
              Péptidos de grado investigación con los más altos estándares de pureza y calidad. 
              Tecnología liofilizada para máxima estabilidad y potencia.
            </p>

            <div className="mt-10 flex items-center gap-6">
              <a
                href="#productos"
                className="inline-flex items-center rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 font-body shadow-lg shadow-primary/20"
              >
                Ver Catálogo Completo
              </a>
              <a
                href="#featured"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline font-body"
              >
                Producto Destacado →
              </a>
            </div>
          </div>

          {/* Featured product */}
          <div className="relative flex justify-center opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 blur-3xl" />
              <img
                src={tirzepatideImg}
                alt="Tirzepatide - Producto destacado"
                className="relative z-10 h-[400px] w-auto object-contain drop-shadow-2xl lg:h-[480px]"
              />
              <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-4 rounded-xl border border-border bg-card/90 p-4 shadow-card backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-body">#1 en Ventas</p>
                    <p className="text-sm font-bold text-foreground font-body">
                      {featured.name} — desde ${featured.pricePerMg}/mg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
