import { Beaker, Pill, Scale, Clock, AlertTriangle, Syringe } from "lucide-react";

const items = [
  { icon: Beaker, title: "Protocolos NAD+ IV", desc: "Dosis, dilución, velocidad de infusión y frecuencia de sesiones" },
  { icon: Pill, title: "Protocolos con péptidos", desc: "BPC-157, TB-500, GHK-Cu: indicaciones, reconstitución y ciclos" },
  { icon: Scale, title: "Terapia con tirzepatida", desc: "Protocolo escalonado para control de peso con dosis clínicas" },
  { icon: Clock, title: "Dosis y ciclos clínicos", desc: "Esquemas de dosificación precisos con tiempos y frecuencias" },
  { icon: AlertTriangle, title: "Manejo de efectos secundarios", desc: "Prevención, identificación y respuesta a reacciones adversas" },
  { icon: Syringe, title: "Preparación y administración", desc: "Reconstitución, almacenamiento y técnicas de aplicación" },
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
            Contenido clínico práctico listo para implementar en tu consulta o clínica.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground font-display">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManualContents;
