import { Shield, FileText, Users, Lock } from "lucide-react";

const items = [
  { icon: FileText, text: "Material de uso exclusivamente profesional." },
  { icon: Users, text: "No dirigido al público general." },
  { icon: Shield, text: "Contenido con fines educativos e informativos." },
  { icon: Lock, text: "Los datos serán utilizados únicamente para comunicación profesional." },
];

const LegalDisclaimer = () => {
  return (
    <section className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-foreground font-display">
            Aviso importante
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-body">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegalDisclaimer;
