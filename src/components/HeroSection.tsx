import { products } from "@/data/products";
import tirzepatideImg from "@/assets/tirzepatide.png";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  const featured = products[0]; // Tirzepatide

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_70%)]" />
      
      <div className="container relative mx-auto px-6 py-20 lg:py-28">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3 opacity-0 animate-fade-in">
          <img src={logo} alt="Alchem Certified Pure" className="h-14 w-14" />
          <div>
            <p className="text-lg font-bold text-foreground font-display tracking-wide">ALCHEM</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">Certified Pure</p>
          </div>
        </div>

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
                href="https://wa.me/528117963113?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20sus%20p%C3%A9ptidos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 font-body shadow-lg shadow-primary/20"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Contactar por WhatsApp
              </a>
              <a
                href="#productos"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline font-body"
              >
                Ver Catálogo →
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
                      {featured.name} — desde MX${featured.pricePerMg}/mg
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
