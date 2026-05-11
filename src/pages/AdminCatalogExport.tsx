import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { ArrowLeft, FileDown, Images, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminCatalogExport = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const renderNode = async (node: HTMLElement) => {
    return await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (doc) => {
        // Neutralize fade-in animation so cards render at full opacity
        doc.querySelectorAll<HTMLElement>(".opacity-0").forEach((el) => {
          el.style.opacity = "1";
          el.style.animation = "none";
        });
      },
    });
  };

  const exportPDF = async () => {
    if (!gridRef.current) return;
    setBusy("pdf");
    try {
      const canvas = await renderNode(gridRef.current);

      // A4 dimensions in mm
      const pdfW = 210;
      const pdfH = 297;
      const marginMm = 8;
      const contentW = pdfW - marginMm * 2;
      const contentH = pdfH - marginMm * 2;

      // Convert content area to source pixels (proportional to canvas width)
      const pxPerMm = canvas.width / contentW;
      const pageHeightPx = contentH * pxPerMm;

      const pdf = new jsPDF("p", "mm", "a4");

      let renderedPx = 0;
      let pageIdx = 0;
      while (renderedPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

        // Create a canvas for this page slice
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const ctx = pageCanvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, renderedPx, canvas.width, sliceHeightPx,
          0, 0, canvas.width, sliceHeightPx
        );

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
        const sliceHmm = sliceHeightPx / pxPerMm;

        if (pageIdx > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", marginMm, marginMm, contentW, sliceHmm, undefined, "FAST");

        renderedPx += sliceHeightPx;
        pageIdx++;
      }

      // Open print preview in a new tab instead of forcing download
      const blobUrl = pdf.output("bloburl");
      const win = window.open(blobUrl, "_blank");
      if (win) {
        win.addEventListener("load", () => {
          try { win.focus(); win.print(); } catch {}
        });
      } else {
        pdf.save("catalogo-alchem.pdf");
      }
      toast({ title: "PDF listo", description: "Abriendo vista previa de impresión" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const exportAllPNGs = async () => {
    setBusy("png-all");
    try {
      const zip = new JSZip();
      for (const p of products) {
        const node = cardRefs.current[p.id];
        if (!node) continue;
        const canvas = await renderNode(node);
        const blob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b!), "image/png")
        );
        zip.file(`${slug(p.name)}.png`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalogo-alchem-png.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PNGs descargados" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const copySingle = async (id: string) => {
    const node = cardRefs.current[id];
    if (!node) return;
    setBusy(`copy-${id}`);
    try {
      const canvas = await renderNode(node);
      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast({ title: "Imagen copiada al portapapeles" });
    } catch (e: any) {
      toast({
        title: "No se pudo copiar",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const downloadSingle = async (id: string, name: string) => {
    const node = cardRefs.current[id];
    if (!node) return;
    setBusy(`dl-${id}`);
    try {
      const canvas = await renderNode(node);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug(name)}.png`;
      a.click();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/alchem-admin">
                <ArrowLeft className="h-4 w-4 mr-2" /> Admin
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Exportar catálogo
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportPDF} disabled={!!busy}>
              {busy === "pdf" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Exportar PDF
            </Button>
            <Button onClick={exportAllPNGs} disabled={!!busy} variant="outline">
              {busy === "png-all" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Images className="h-4 w-4 mr-2" />
              )}
              Descargar PNGs (.zip)
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Vista previa del catálogo. Pasa el cursor sobre una tarjeta para
          copiarla o descargarla individualmente.
        </p>

        <Card className="p-6 bg-background overflow-auto">
          {/* Fixed A4-portrait content width for predictable print layout */}
          <div
            ref={gridRef}
            className="grid grid-cols-2 gap-4 bg-white mx-auto p-2"
            style={{ width: "733px" }}
          >
            {products.map((product, i) => (
              <div
                key={product.id}
                ref={(el) => (cardRefs.current[product.id] = el)}
                className="relative group"
              >
                <ProductCard product={product} index={i} />
                <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 shadow-md"
                    title="Copiar PNG"
                    onClick={(e) => {
                      e.stopPropagation();
                      copySingle(product.id);
                    }}
                    disabled={!!busy}
                  >
                    {busy === `copy-${product.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 shadow-md"
                    title="Descargar PNG"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingle(product.id, product.name);
                    }}
                    disabled={!!busy}
                  >
                    {busy === `dl-${product.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminCatalogExport;
