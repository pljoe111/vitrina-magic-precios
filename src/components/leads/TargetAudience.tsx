import { Stethoscope, Building2, Sparkles, Heart, User } from "lucide-react";

const profiles = [
  { icon: Stethoscope, label: "Médicos generales y especialistas" },
  { icon: Sparkles, label: "Clínicas de medicina estética" },
  { icon: Building2, label: "Medspas y centros de bienestar" },
  { icon: Heart, label: "Centros de wellness y longevidad" },
  { icon: User, label: "Propietarios y directores clínicos" },
];

const TargetAudience = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground font-display">
            ¿Para quién es este manual?
          </h2>
          <p className="mt-3 text-muted-foreground font-body">
            Diseñado específicamente para profesionales que buscan implementar o mejorar terapias avanzadas.
          </p>
        </div>

        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4">
          {profiles.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-card"
            >
              <p.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground font-body">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
