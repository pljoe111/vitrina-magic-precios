import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "alchem_catalog_access";

interface StoredAccess {
  code: string;
  expiresAt: string;
}

export function useCatalogAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredAccess = JSON.parse(stored);
        if (new Date(parsed.expiresAt) > new Date()) {
          setHasAccess(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setChecking(false);
  }, []);

  return { hasAccess, checking, setHasAccess };
}

interface CatalogGateProps {
  onAccessGranted: () => void;
}

const CatalogGate = ({ onAccessGranted }: CatalogGateProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("code, expires_at")
        .eq("code", code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ code: data.code, expiresAt: data.expires_at })
        );
        onAccessGranted();
      } else {
        toast({
          title: "Código inválido",
          description: "El código ingresado no existe o ha expirado.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo verificar el código. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background — the actual page renders behind this */}
      <div className="absolute inset-0 backdrop-blur-xl bg-background/60" />

      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-[0_16px_64px_-16px_hsl(200_25%_10%/0.18)]">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-center text-2xl font-bold text-foreground font-display leading-[1.1]">
            Catálogo Exclusivo
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground font-body leading-relaxed">
            Ingresa tu código de acceso para ver nuestro catálogo completo de péptidos y precios.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO DE ACCESO"
              className="h-12 text-center font-mono text-lg tracking-[0.2em] uppercase placeholder:text-xs placeholder:tracking-widest placeholder:font-sans"
              maxLength={20}
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold font-body"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                "Verificando..."
              ) : (
                <>
                  Acceder al catálogo
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-body">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Solicita tu código a tu representante Alchem</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogGate;
