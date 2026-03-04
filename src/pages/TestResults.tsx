import { useState, useMemo } from "react";
import { testResults, type TestResult } from "@/data/test-results";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink, FileText, ShieldCheck, FlaskConical, Search, ArrowLeft, ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MAX_VISIBLE = 20;

const TestResults = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TestResult | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? testResults.filter(
          (r) =>
            r.lotNumber.toLowerCase().includes(q) ||
            r.batchNumber.toLowerCase().includes(q) ||
            r.productName.toLowerCase().includes(q)
        )
      : testResults;
    return list.slice(0, MAX_VISIBLE);
  }, [search]);

  // ─── Detail view ───
  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <Button
              variant="ghost"
              size="sm"
              className="font-body gap-2 mb-6"
              onClick={() => setSelected(null)}
            >
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
                      <CardTitle className="text-xl font-display">
                        {selected.productName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-body mt-0.5">
                        Lote: {selected.lotNumber}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="self-start sm:self-auto border-primary/30 text-primary font-body"
                  >
                    Pureza: {selected.purity}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <MetricCard label="Pureza" value={`${selected.purity}%`} />
                  <MetricCard label="Potencia" value={selected.potency} />
                  <MetricCard label="Esterilidad" value={selected.sterility} />
                  <MetricCard label="Endotoxinas" value={selected.endotoxins} />
                </div>

                {/* Details table */}
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
                      <TableCell className="font-body">{selected.batchNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-body font-medium">Fecha de Prueba</TableCell>
                      <TableCell className="font-body">
                        {new Date(selected.testDate).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-body font-medium">Fecha de Expiración</TableCell>
                      <TableCell className="font-body">{selected.expDate}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-body font-medium">Contaminantes</TableCell>
                      <TableCell className="font-body">{selected.contaminants}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Certificates & Lab */}
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {selected.certificates.map((cert, i) => (
                    <a key={i} href={cert.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="font-body gap-2">
                        <FileText className="h-4 w-4" />
                        {cert.label}
                      </Button>
                    </a>
                  ))}
                  <a href={selected.labPartnerUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="font-body gap-2 text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      Ver laboratorio
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Embedded PDF */}
            {selected.certificates.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold font-display mb-4">
                  Certificado de Análisis
                </h2>
                <div className="rounded-lg border border-border overflow-hidden bg-muted/10">
                  <iframe
                    src={selected.certificates[0].link}
                    title={`CoA - ${selected.productName}`}
                    className="w-full h-[700px]"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ─── List view ───
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
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

      {/* Search + Table */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Search bar */}
          <div className="relative mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por lote, batch o producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 font-body"
            />
          </div>

          {/* Results table */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FlaskConical className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-body">
                No se encontraron resultados para "{search}"
              </p>
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
                    <TableHead className="font-body text-center hidden sm:table-cell">
                      Esterilidad
                    </TableHead>
                    <TableHead className="font-body w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(r)}
                    >
                      <TableCell className="font-body font-medium">{r.productName}</TableCell>
                      <TableCell className="font-body text-muted-foreground text-sm">
                        {r.lotNumber}
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground text-sm hidden sm:table-cell">
                        {new Date(r.testDate).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary font-body"
                        >
                          {r.purity}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge
                          variant={r.sterility === "Pass" ? "default" : "destructive"}
                          className="font-body"
                        >
                          {r.sterility}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          <p className="text-xs text-muted-foreground font-body text-center mt-4">
            Mostrando los últimos {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* QA Process */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display text-center mb-10">
            Nuestro Proceso de <span className="text-primary">Control de Calidad</span>
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground font-body">
                Analizado Antes del Envío
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                Cada lote se somete a pruebas internas rigurosas de pureza, potencia, esterilidad y endotoxinas antes de ser enviado. Ningún producto sale sin pasar nuestros estándares de calidad.
              </p>
            </div>

            <div className="space-y-2">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground font-body">
                Verificación por Terceros
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                Además de las pruebas internas, laboratorios independientes verifican nuestros resultados de pureza y potencia, proporcionando una capa adicional de confianza para nuestros clientes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground font-body">
                ¿Qué significa "Reporte Pendiente"?
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                Este estado indica que estamos esperando resultados de laboratorios externos. El producto ya pasó nuestras pruebas internas — algunos laboratorios simplemente tardan más, pero esto no afecta la calidad del producto.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
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
