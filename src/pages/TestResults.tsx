import { testResults } from "@/data/test-results";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, ShieldCheck, FlaskConical } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TestResults = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/30 py-20">
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
            Cada lote es analizado por laboratorios independientes certificados. Aquí puedes consultar y descargar los certificados de análisis (CoA).
          </p>
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-8">
            {testResults.map((result) => (
              <Card key={result.id} className="overflow-hidden border-border/60 shadow-card">
                <CardHeader className="bg-muted/30 border-b border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2.5">
                        <FlaskConical className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-display">{result.productName}</CardTitle>
                        <p className="text-sm text-muted-foreground font-body mt-0.5">
                          Lote: {result.lotNumber}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="self-start sm:self-auto border-primary/30 text-primary font-body"
                    >
                      Pureza: {result.purity}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Key metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <MetricCard label="Pureza" value={`${result.purity}%`} />
                    <MetricCard label="Potencia" value={result.potency} />
                    <MetricCard label="Esterilidad" value={result.sterility} />
                    <MetricCard label="Endotoxinas" value={result.endotoxins} />
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
                        <TableCell className="font-body">{result.batchNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-body font-medium">Fecha de Prueba</TableCell>
                        <TableCell className="font-body">
                          {new Date(result.testDate).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-body font-medium">Fecha de Expiración</TableCell>
                        <TableCell className="font-body">{result.expDate}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-body font-medium">Contaminantes</TableCell>
                        <TableCell className="font-body">{result.contaminants}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* Certificates & Lab */}
                  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {result.certificates.map((cert, i) => (
                      <a key={i} href={cert.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="font-body gap-2">
                          <FileText className="h-4 w-4" />
                          {cert.label}
                        </Button>
                      </a>
                    ))}
                    <a href={result.labPartnerUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="font-body gap-2 text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        Ver laboratorio
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
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
