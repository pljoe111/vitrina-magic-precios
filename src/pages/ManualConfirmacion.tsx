import { CheckCircle, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "@/components/Footer";

const ManualConfirmacion = () => {
  const [searchParams] = useSearchParams();
  const downloadUrl = searchParams.get("url");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <Card className="mx-auto max-w-lg shadow-card-hover border-primary/20 text-center">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="mx-auto mb-6 inline-flex rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground font-display">
              ¡Tu manual está listo!
            </h1>
            <p className="mt-3 text-muted-foreground font-body">
              Gracias por registrarte. Tu manual profesional de protocolos está disponible para descarga.
            </p>

            {downloadUrl ? (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="mt-6 w-full font-body">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar manual (PDF)
                </Button>
              </a>
            ) : (
              <a
                href="https://wa.me/528131082689?text=Hola%2C%20acabo%20de%20registrarme%20para%20el%20manual%20profesional.%20%C2%BFPodr%C3%ADan%20enviarlo%3F"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="mt-6 w-full font-body">
                  <Download className="h-4 w-4 mr-2" />
                  Solicitar manual por WhatsApp
                </Button>
              </a>
            )}

            <p className="mt-4 text-xs text-muted-foreground font-body">
              También recibirás el enlace de descarga en tu correo electrónico.
            </p>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-sm text-muted-foreground font-body mb-3">
                ¿Listo para explorar nuestros productos?
              </p>
              <Link to="/catalogo">
                <Button variant="outline" className="font-body">
                  Ver catálogo de productos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ManualConfirmacion;
