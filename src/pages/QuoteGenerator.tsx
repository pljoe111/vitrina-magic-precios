import { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QuoteEditor from "@/components/quote/QuoteEditor";
import QuotePreview from "@/components/quote/QuotePreview";
import { QuoteData, defaultConditions, defaultGuarantee, defaultTitle, generateId } from "@/components/quote/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const initialData: QuoteData = {
  clientName: "",
  title: defaultTitle.es,
  validityDate: undefined,
  catalog: [
    {
      id: generateId(),
      name: "Tirzepatide",
      variants: [
        { id: generateId(), mg: 30, price: 1061 },
        { id: generateId(), mg: 60, price: 2122 },
        { id: generateId(), mg: 120, price: 4243 },
      ],
    },
  ],
  currentOrder: { productId: "", variantId: "", quantity: 1, pricePerVial: 0 },
  proposals: [],
  conditions: defaultConditions.es,
  guarantee: defaultGuarantee.es,
  lang: "es",
};

type SavedQuote = { id: string; client_name: string; title: string; updated_at: string };

const QuoteGenerator = () => {
  const [data, setData] = useState<QuoteData>(initialData);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const fetchSavedQuotes = useCallback(async () => {
    const { data: rows } = await supabase
      .from("quotes")
      .select("id, client_name, title, updated_at")
      .order("updated_at", { ascending: false });
    if (rows) setSavedQuotes(rows);
  }, []);

  useEffect(() => { fetchSavedQuotes(); }, [fetchSavedQuotes]);

  const handleSaveCloud = useCallback(async () => {
    const payload = { client_name: data.clientName, title: data.title, data: data as any };
    if (currentQuoteId) {
      await supabase.from("quotes").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", currentQuoteId);
    } else {
      const { data: row } = await supabase.from("quotes").insert(payload).select("id").single();
      if (row) setCurrentQuoteId(row.id);
    }
    await fetchSavedQuotes();
    toast({ title: "✓", description: data.lang === "es" ? "Cotización guardada" : "Quote saved" });
  }, [data, currentQuoteId, fetchSavedQuotes]);

  const handleLoadQuote = useCallback(async (id: string) => {
    const { data: row } = await supabase.from("quotes").select("id, data").eq("id", id).single();
    if (row) {
      const loaded = row.data as any as QuoteData;
      if (loaded.validityDate) loaded.validityDate = new Date(loaded.validityDate);
      if (!loaded.title) loaded.title = defaultTitle[loaded.lang || "es"];
      setData(loaded);
      setCurrentQuoteId(row.id);
      toast({ title: "✓", description: data.lang === "es" ? "Cotización cargada" : "Quote loaded" });
    }
  }, [data.lang]);

  const handleNewQuote = useCallback(() => {
    setData(initialData);
    setCurrentQuoteId(null);
  }, []);

  const handleDeleteQuote = useCallback(async (id: string) => {
    await supabase.from("quotes").delete().eq("id", id);
    if (currentQuoteId === id) { setCurrentQuoteId(null); setData(initialData); }
    await fetchSavedQuotes();
    toast({ title: "✓", description: data.lang === "es" ? "Cotización eliminada" : "Quote deleted" });
  }, [currentQuoteId, fetchSavedQuotes, data.lang]);

  const capture = useCallback(async () => {
    if (!previewRef.current) return null;
    return html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  }, []);

  const handleExportPdf = useCallback(async () => {
    const canvas = await capture();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
    pdf.save(`cotizacion-${data.clientName || "alchem"}.pdf`);
  }, [capture, data.clientName]);

  const handleExportJpg = useCallback(async () => {
    const canvas = await capture();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cotizacion-${data.clientName || "alchem"}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [capture, data.clientName]);

  const handleCopyImage = useCallback(async () => {
    const canvas = await capture();
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast({ title: "✓", description: "Imagen copiada al portapapeles" });
      }, "image/png");
    } catch {
      toast({ title: "Error", description: "No se pudo copiar la imagen", variant: "destructive" });
    }
  }, [capture]);

  const handleExportJson = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `cotizacion-${data.clientName || "alchem"}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, [data]);

  const handleImportJson = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as QuoteData;
        if (imported.validityDate) imported.validityDate = new Date(imported.validityDate);
        setData(imported);
        toast({ title: "✓", description: "Cotización importada" });
      } catch {
        toast({ title: "Error", description: "Archivo JSON inválido", variant: "destructive" });
      }
    };
    input.click();
  }, []);

  const handlePrint = useCallback(async () => {
    const canvas = await capture();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Cotización</title>
      <style>body{margin:0;display:flex;justify-content:center;}img{width:100%;max-width:210mm;}@media print{body{margin:0;}img{width:100%;max-width:none;}}</style>
      </head><body><img src="${imgData}" /></body></html>
    `);
    win.document.close();
    win.onload = () => { win.print(); win.close(); };
  }, [capture]);

  return (
    <div className="admin-selectable h-screen flex bg-muted/30">
      {/* Editor */}
      <div className="w-[420px] min-w-[360px] border-r border-border bg-background overflow-y-auto">
        <QuoteEditor
          data={data}
          onChange={setData}
          onExportPdf={handleExportPdf}
          onExportJpg={handleExportJpg}
          onCopyImage={handleCopyImage}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onPrint={handlePrint}
          onSaveCloud={handleSaveCloud}
          onLoadQuote={handleLoadQuote}
          onNewQuote={handleNewQuote}
          onDeleteQuote={handleDeleteQuote}
          savedQuotes={savedQuotes}
          currentQuoteId={currentQuoteId}
        />
      </div>
      {/* Preview */}
      <div className="flex-1 overflow-auto p-6">
        <QuotePreview ref={previewRef} data={data} />
      </div>
    </div>
  );
};

export default QuoteGenerator;
