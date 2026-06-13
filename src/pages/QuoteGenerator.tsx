import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QuoteEditor from "@/components/quote/QuoteEditor";
import QuotePreview from "@/components/quote/QuotePreview";
import { QuoteData, defaultConditions, defaultGuarantee, defaultTitle, generateId } from "@/components/quote/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

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
  const [params] = useSearchParams();
  const [username, setUsername] = useState(params.get("u") || "");
  const [password, setPassword] = useState(params.get("p") || "");
  const [authed, setAuthed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [data, setData] = useState<QuoteData>(initialData);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const apiCall = useCallback(
    async (action: string, p: Record<string, unknown> = {}) => {
      const { data, error } = await supabase.functions.invoke("admin-manage-codes", {
        body: { action, username, password, ...p },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    [username, password]
  );

  const fetchSavedQuotes = useCallback(async () => {
    try {
      const res = await apiCall("list_quotes");
      setSavedQuotes(res.quotes || []);
    } catch {
      /* ignore */
    }
  }, [apiCall]);

  const handleLogin = useCallback(async () => {
    setLoginLoading(true);
    try {
      await apiCall("login");
      setAuthed(true);
      const res = await apiCall("list_quotes");
      setSavedQuotes(res.quotes || []);
    } catch {
      toast({ title: "Credenciales incorrectas", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (username && password && !authed) handleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveCloud = useCallback(async () => {
    try {
      const res = await apiCall("upsert_quote", {
        id: currentQuoteId,
        client_name: data.clientName,
        title: data.title,
        data,
      });
      if (res?.id) setCurrentQuoteId(res.id);
      await fetchSavedQuotes();
      toast({ title: "✓", description: data.lang === "es" ? "Cotización guardada" : "Quote saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [apiCall, data, currentQuoteId, fetchSavedQuotes]);

  const handleLoadQuote = useCallback(async (id: string) => {
    try {
      const res = await apiCall("get_quote", { id });
      const row = res.quote;
      if (row) {
        const loaded = row.data as QuoteData;
        if (loaded.validityDate) loaded.validityDate = new Date(loaded.validityDate);
        if (!loaded.title) loaded.title = defaultTitle[loaded.lang || "es"];
        setData(loaded);
        setCurrentQuoteId(row.id);
        toast({ title: "✓", description: data.lang === "es" ? "Cotización cargada" : "Quote loaded" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [apiCall, data.lang]);

  const handleNewQuote = useCallback(() => {
    setData(initialData);
    setCurrentQuoteId(null);
  }, []);

  const handleDeleteQuote = useCallback(async (id: string) => {
    try {
      await apiCall("delete_quote", { id });
      if (currentQuoteId === id) { setCurrentQuoteId(null); setData(initialData); }
      await fetchSavedQuotes();
      toast({ title: "✓", description: data.lang === "es" ? "Cotización eliminada" : "Quote deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [apiCall, currentQuoteId, fetchSavedQuotes, data.lang]);

  const capture = useCallback(async () => {
    if (!previewRef.current) return null;
    await document.fonts.ready;

    const el = previewRef.current;
    const width = Math.ceil(el.scrollWidth);
    const height = Math.ceil(el.scrollHeight);

    return html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      width,
      height,
      scrollX: 0,
      scrollY: 0,
      removeContainer: true,
    });
  }, []);

  const handleExportPdf = useCallback(async () => {
    const canvas = await capture();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`cotizacion-${data.clientName || "alchem"}.pdf`);
  }, [capture, data.clientName]);

  const handleExportJpg = useCallback(async () => {
    const canvas = await capture();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cotizacion-${data.clientName || "alchem"}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 1);
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

  if (!authed) {
    return (
      <div className="admin-selectable min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-foreground">Admin · Cotizador</h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? "Verificando..." : "Entrar"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
