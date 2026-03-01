import { Beaker, Pill, Scale, Clock, AlertTriangle, Syringe, Sparkles, ShieldCheck, Zap, Layers } from "lucide-react";

const items = [
  { icon: Beaker, title: "Terapia IV con NAD+", desc: "Protocolo completo de infusión intravenosa con dosis y frecuencias" },
  { icon: Pill, title: "Recuperación y rehabilitación", desc: "Protocolos post-lesión y recuperación de lesiones con péptidos" },
  { icon: ShieldCheck, title: "Prevención y longevidad articular", desc: "Estrategias para protección articular a largo plazo" },
  { icon: Zap, title: "Regeneración celular completa", desc: "Protocolo corporal con BPC-157, TB-500 y GHK-Cu" },
  { icon: Scale, title: "Control de peso con tirzepatida", desc: "Quema de grasa, supresión del apetito y dosis escalonadas" },
  { icon: Sparkles, title: "Terapia peptídica 'Glow'", desc: "Antiarrugas, restauración de colágeno y rejuvenecimiento cutáneo" },
  { icon: AlertTriangle, title: "Efectos secundarios", desc: "Estrategias de prevención, identificación y manejo de reacciones" },
  { icon: Syringe, title: "Preparación y reconstitución", desc: "Técnicas de inyección, seguridad y almacenamiento" },
  { icon: Layers, title: "Sinergias de péptidos", desc: "Combinaciones óptimas para maximizar resultados clínicos" },
  { icon: Clock, title: "Dosis y ciclos clínicos", desc: "Esquemas de dosificación precisos con tiempos y frecuencias" },
];

const ManualContents = () => {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground font-display">
            Qué incluye el manual
          </h2>
          <p className="mt-3 text-muted-foreground font-body">
            21 páginas de contenido clínico práctico listo para implementar en tu consulta o clínica.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground font-display">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManualContents;
