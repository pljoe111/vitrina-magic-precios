import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  ExternalLink, FileText, ShieldCheck, FlaskConical, Search, ArrowLeft, ChevronRight, Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Batch {
  id: string;
  product_id: string;
  product_name: string;
  batch_number: string;
  lot_number: string;
  test_date: string | null;
  exp_date: string | null;
  purity: number | null;
  potency: string | null;
  contaminants: string | null;
  sterility: string | null;
  endotoxins: string | null;
  coa_url: string | null;
  coa_label: string | null;
  lab_partner_url: string | null;
  status: string;
  created_at?: string;
}

const MAX_VISIBLE = 50;

const translate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const map: Record<string, string> = {
    "None detected": "No detectado",
    "Not detected": "No detectado",
    "None Detected": "No detectado",
    "Pass": "Aprobado",
    "PASS": "Aprobado",
    "Fail": "No aprobado",
    "FAIL": "No aprobado",
    "Pending": "Pendiente",
    "pending": "Pendiente",
    "N/A": "N/D",
  };
  return map[value.trim()] ?? value;
};
const isPass = (v: string | null | undefined) =>
  !!v && ["pass", "aprobado"].includes(v.trim().toLowerCase());

const TestResults = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Batch | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPending, setShowPending] = useState(false);
  const [pendingModal, setPendingModal] = useState(false);
  const [signedCoaUrl, setSignedCoaUrl] = useState<string | null>(null);

  useEffect(() => {
    setSignedCoaUrl(null);
    if (!selected?.coa_url) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("admin-manage-codes", {
          body: { action: "sign_coa", path: selected.coa_url },
        });
        if (error) throw error;
        if (!cancelled && data?.signedUrl) setSignedCoaUrl(data.signedUrl);
      } catch (e) {
        console.error("sign_coa failed", e);
      }
    })();
    return () => { cancelled = true; };
  }, [selected?.id, selected?.coa_url]);

  const PENDING_ACK_KEY = "alchem.pendingAckAt";
  const shouldShowModal = () => {
    try {
      const v = localStorage.getItem(PENDING_ACK_KEY);
      if (v === "never") return false;
      if (!v) return true;
      const ts = Number(v);
      if (!Number.isFinite(ts)) return true;
      return Date.now() - ts > 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  };

  const handleTogglePending = () => {
    if (showPending) {
      setShowPending(false);
      return;
    }
    if (shouldShowModal()) {
      setPendingModal(true);
    } else {
      setShowPending(true);
    }
  };

  const ackContinue = () => {
    try { localStorage.setItem(PENDING_ACK_KEY, String(Date.now())); } catch {}
    setPendingModal(false);
    setShowPending(true);
  };

  const ackNever = () => {
    try { localStorage.setItem(PENDING_ACK_KEY, "never"); } catch {}
    setPendingModal(false);
    setShowPending(true);
  };


  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("test_batches")
        .select("*")
        .neq("status", "disabled")
        .order("created_at", { ascending: false });
      // Pending batches first (newest analysis cycle), then published by test_date
      const sorted = ((data as Batch[]) || []).slice().sort((a, b) => {
        const aPending = a.status === "pending" || !a.coa_url;
        const bPending = b.status === "pending" || !b.coa_url;
        if (aPending !== bPending) return aPending ? -1 : 1;
        if (aPending) return (b.created_at ?? "").localeCompare(a.created_at ?? "");
        return (b.test_date ?? "").localeCompare(a.test_date ?? "");
      });
      setBatches(sorted);
      setLoading(false);
    })();
  }, []);

  const pendingCount = useMemo(
    () => batches.filter((r) => r.status === "pending" || !r.coa_url).length,
    [batches]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = showPending
      ? batches
      : batches.filter((r) => !(r.status === "pending" || !r.coa_url));
    const list = q
      ? base.filter(
          (r) =>
            r.lot_number.toLowerCase().includes(q) ||
            r.batch_number.toLowerCase().includes(q) ||
            r.product_name.toLowerCase().includes(q)
        )
      : base;
    return list.slice(0, MAX_VISIBLE);
  }, [search, batches, showPending]);


  if (selected) {
    const isPending = selected.status === "pending" || !selected.coa_url;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <Button variant="ghost" size="sm" className="font-body gap-2 mb-6" onClick={() => setSelected(null)}>
              <ArrowLeft className="h-4 w-4" />
              Volver a resultados
            </Button>

            <Card className="overflow-hidden border-border/60 shadow-card">
              <CardHeader className="bg-muted/30 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-display">{selected.product_name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-body mt-0.5">
                        Lote: {selected.lot_number}
                      </p>
                    </div>
                  </div>
                  {isPending ? (
                    <Badge variant="secondary" className="self-start sm:self-auto font-body gap-1">
                      <Clock className="h-3 w-3" /> Reporte Pendiente
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="self-start sm:self-auto border-primary/30 text-primary font-body">
                      Pureza: {selected.purity}%
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {!isPending && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <MetricCard label="Pureza" value={`${selected.purity}%`} />
                    <MetricCard label="Potencia" value={selected.potency || "—"} />
                    <MetricCard label="Esterilidad" value={translate(selected.sterility)} />
                    <MetricCard label="Endotoxinas" value={translate(selected.endotoxins)} />
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body">Campo</TableHead>
                      <TableHead className="font-body">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-body font-medium">Batch</TableCell>
                      <TableCell className="font-body">{selected.batch_number}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-body font-medium">Fecha de Prueba</TableCell>
                      <TableCell className="font-body">
                        {selected.test_date
                          ? new Date(selected.test_date).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
                          : "Pendiente"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-body font-medium">Fecha de Expiración</TableCell>
                      <TableCell className="font-body">{selected.exp_date || "—"}</TableCell>
                    </TableRow>
                    {!isPending && (
                      <TableRow>
                        <TableCell className="font-body font-medium">Contaminantes</TableCell>
                        <TableCell className="font-body">{translate(selected.contaminants)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {!isPending && (
                  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {selected.coa_url && signedCoaUrl && (
                      <a href={signedCoaUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="font-body gap-2">
                          <FileText className="h-4 w-4" />
                          {selected.coa_label || "Certificado"}
                        </Button>
                      </a>
                    )}
                    {selected.lab_partner_url && (
                      <a href={selected.lab_partner_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="font-body gap-2 text-muted-foreground">
                          <ExternalLink className="h-4 w-4" /> Ver laboratorio
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {!isPending && selected.coa_url && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold font-display mb-4">Certificado de Análisis</h2>
                <div className="rounded-lg border border-border overflow-hidden bg-muted/10">
                  {signedCoaUrl ? (
                    <iframe src={signedCoaUrl} title={`CoA - ${selected.product_name}`} className="w-full h-[700px]" />
                  ) : (
                    <div className="h-[700px] flex items-center justify-center text-sm text-muted-foreground font-body">
                      Cargando certificado…
                    </div>
                  )}
                </div>
              </div>
            )}

            {isPending && (
              <Card className="mt-8 border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-base font-bold font-body mb-1">Reporte de laboratorio pendiente</h3>
                      <p className="text-sm text-muted-foreground font-body">
                        Este lote ya pasó nuestras pruebas internas de pureza, potencia, esterilidad y endotoxinas. Estamos esperando los resultados del laboratorio externo independiente. El certificado se publicará aquí en cuanto esté disponible.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/30 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary font-body">
              Transparencia Total
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl font-display">
            Resultados de <span className="text-primary">Laboratorio</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-body">
            Cada lote es analizado por laboratorios independientes certificados.
            Busca por número de lote para consultar y descargar los certificados de análisis (CoA).
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-8 max-w-md mx-auto flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por lote, batch o producto…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 font-body" />
            </div>
            {pendingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="font-body gap-2 self-center rounded-full"
                onClick={handleTogglePending}
              >
                <Clock className="h-3.5 w-3.5" />
                {showPending
                  ? `Ocultar pendientes (${pendingCount})`
                  : `Mostrar pendientes (${pendingCount})`}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground font-body">Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FlaskConical className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-body">No se encontraron resultados {search && `para "${search}"`}</p>
            </div>
          ) : (
            <Card className="overflow-hidden border-border/60 shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body">Producto</TableHead>
                    <TableHead className="font-body">Lote</TableHead>
                    <TableHead className="font-body hidden sm:table-cell">Fecha</TableHead>
                    <TableHead className="font-body text-center">Pureza</TableHead>
                    <TableHead className="font-body text-center hidden sm:table-cell">Esterilidad</TableHead>
                    <TableHead className="font-body w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const pending = r.status === "pending" || !r.coa_url;
                    return (
                      <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                        <TableCell className="font-body font-medium">{r.product_name}</TableCell>
                        <TableCell className="font-body text-muted-foreground text-sm">{r.lot_number}</TableCell>
                        <TableCell className="font-body text-muted-foreground text-sm hidden sm:table-cell">
                          {r.test_date ? new Date(r.test_date).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {pending ? (
                            <Badge variant="secondary" className="font-body gap-1"><Clock className="h-3 w-3" />Pendiente</Badge>
                          ) : (
                            <Badge variant="outline" className="border-primary/30 text-primary font-body">{r.purity}%</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {pending ? (
                            <span className="text-muted-foreground text-xs font-body">—</span>
                          ) : (
                            <Badge variant={isPass(r.sterility) ? "default" : "destructive"} className="font-body">{translate(r.sterility)}</Badge>
                          )}
                        </TableCell>
                        <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          <p className="text-xs text-muted-foreground font-body text-center mt-4">
            Mostrando los últimos {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display text-center mb-10">
            Nuestro Proceso de <span className="text-primary">Control de Calidad</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3"><ShieldCheck className="h-5 w-5 text-primary" /></div>
              <h3 className="text-base font-bold text-foreground font-body">Analizado Antes del Envío</h3>
              <p className="text-sm text-muted-foreground font-body">Cada lote se somete a pruebas internas rigurosas de pureza, potencia, esterilidad y endotoxinas antes de ser enviado. Ningún producto sale sin pasar nuestros estándares de calidad.</p>
            </div>
            <div className="space-y-2">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3"><FlaskConical className="h-5 w-5 text-primary" /></div>
              <h3 className="text-base font-bold text-foreground font-body">Verificación por Terceros</h3>
              <p className="text-sm text-muted-foreground font-body">Además de las pruebas internas, laboratorios independientes verifican nuestros resultados de pureza y potencia, proporcionando una capa adicional de confianza para nuestros clientes.</p>
            </div>
            <div className="space-y-2">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3"><FileText className="h-5 w-5 text-primary" /></div>
              <h3 className="text-base font-bold text-foreground font-body">¿Qué significa "Reporte Pendiente"?</h3>
              <p className="text-sm text-muted-foreground font-body">Este estado indica que estamos esperando resultados de laboratorios externos. El producto ya pasó nuestras pruebas internas — algunos laboratorios simplemente tardan más, pero esto no afecta la calidad del producto.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={pendingModal} onOpenChange={setPendingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="rounded-full bg-primary/10 p-2.5 w-fit mb-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">¿Qué significa "Reporte Pendiente"?</DialogTitle>
            <DialogDescription className="font-body text-sm leading-relaxed pt-2">
              Estos lotes <strong>ya pasaron nuestras pruebas internas</strong> de pureza, potencia, esterilidad y endotoxinas. Estamos esperando el certificado del laboratorio independiente externo, que se publicará aquí en cuanto esté disponible.
              <br /><br />
              No afecta la calidad del producto — algunos laboratorios simplemente tardan más en emitir el reporte final.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
            <Button onClick={ackContinue} className="rounded-full w-full font-body">
              Continuar
            </Button>
            <Button onClick={ackNever} variant="ghost" size="sm" className="w-full font-body text-muted-foreground">
              No volver a mostrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
    <p className="text-xs text-muted-foreground font-body mb-1">{label}</p>
    <p className="text-sm font-semibold text-foreground font-body">{value}</p>
  </div>
);

export default TestResults;
