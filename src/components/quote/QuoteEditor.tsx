import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Languages, Copy, Download, Upload, Save, FilePlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QuoteData,
  CatalogProduct,
  SizeVariant,
  Proposal,
  generateId,
  defaultConditions,
  defaultGuarantee,
  defaultTitle,
} from "./types";

type SavedQuote = { id: string; client_name: string; title: string; updated_at: string };

interface QuoteEditorProps {
  data: QuoteData;
  onChange: (data: QuoteData) => void;
  onExportPdf: () => void;
  onExportJpg: () => void;
  onCopyImage: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onPrint: () => void;
  onSaveCloud: () => void;
  onLoadQuote: (id: string) => void;
  onNewQuote: () => void;
  onDeleteQuote: (id: string) => void;
  savedQuotes: SavedQuote[];
  currentQuoteId: string | null;
}

const QuoteEditor = ({ data, onChange, onExportPdf, onExportJpg, onCopyImage, onExportJson, onImportJson, onPrint, onSaveCloud, onLoadQuote, onNewQuote, onDeleteQuote, savedQuotes, currentQuoteId }: QuoteEditorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const update = (partial: Partial<QuoteData>) => onChange({ ...data, ...partial });
  const t = data.lang === "es"
    ? { client: "Cliente", validity: "Válido hasta", catalog: "Catálogo de Productos", productName: "Nombre del producto", addProduct: "Agregar producto", size: "Tamaño (mg)", price: "Precio / vial", addSize: "Agregar tamaño", currentOrder: "Pedido Actual", product: "Producto", vialSize: "Tamaño vial", qty: "Cantidad", priceVial: "Precio/vial", proposals: "Propuestas", proposalName: "Nombre propuesta", addProposal: "Agregar propuesta", conditions: "Condiciones", guarantee: "Garantía de Calidad", exportPdf: "Exportar PDF", exportJpg: "Exportar JPG", print: "Imprimir", lang: "Idioma", na: "N/A", selectProduct: "Seleccionar producto", selectSize: "Seleccionar tamaño" }
    : { client: "Client", validity: "Valid until", catalog: "Product Catalog", productName: "Product name", addProduct: "Add product", size: "Size (mg)", price: "Price / vial", addSize: "Add size", currentOrder: "Current Order", product: "Product", vialSize: "Vial size", qty: "Quantity", priceVial: "Price/vial", proposals: "Proposals", proposalName: "Proposal name", addProposal: "Add proposal", conditions: "Conditions", guarantee: "Quality Guarantee", exportPdf: "Export PDF", exportJpg: "Export JPG", print: "Print", lang: "Language", na: "N/A", selectProduct: "Select product", selectSize: "Select size" };

  const selectedProduct = data.catalog.find((p) => p.id === data.currentOrder.productId);

  // Catalog helpers
  const addProduct = () => {
    update({
      catalog: [...data.catalog, { id: generateId(), name: "", variants: [{ id: generateId(), mg: 0, price: null }] }],
    });
  };

  const updateProduct = (id: string, partial: Partial<CatalogProduct>) => {
    update({ catalog: data.catalog.map((p) => (p.id === id ? { ...p, ...partial } : p)) });
  };

  const removeProduct = (id: string) => {
    update({ catalog: data.catalog.filter((p) => p.id !== id) });
  };

  const addVariant = (productId: string) => {
    update({
      catalog: data.catalog.map((p) =>
        p.id === productId ? { ...p, variants: [...p.variants, { id: generateId(), mg: 0, price: null }] } : p
      ),
    });
  };

  const updateVariant = (productId: string, variantId: string, partial: Partial<SizeVariant>) => {
    update({
      catalog: data.catalog.map((p) =>
        p.id === productId
          ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, ...partial } : v)) }
          : p
      ),
    });
  };

  const removeVariant = (productId: string, variantId: string) => {
    update({
      catalog: data.catalog.map((p) =>
        p.id === productId ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) } : p
      ),
    });
  };

  // Proposal helpers
  const addProposal = () => {
    update({
      proposals: [...data.proposals, { id: generateId(), name: "", variantId: "", quantity: 1, pricePerVial: 0 }],
    });
  };

  const updateProposal = (id: string, partial: Partial<Proposal>) => {
    update({ proposals: data.proposals.map((p) => (p.id === id ? { ...p, ...partial } : p)) });
  };

  const removeProposal = (id: string) => {
    update({ proposals: data.proposals.filter((p) => p.id !== id) });
  };

  const allVariants = selectedProduct?.variants || [];

  const filteredQuotes = savedQuotes.filter(q => !searchQuery || q.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || q.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-5 p-5 overflow-y-auto h-full">
      {/* Top bar: language + new/save */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => {
            const newLang = data.lang === "es" ? "en" : "es";
            update({
              lang: newLang,
              title: data.title === defaultTitle[data.lang] ? defaultTitle[newLang] : data.title,
              conditions: data.conditions === defaultConditions[data.lang] ? defaultConditions[newLang] : data.conditions,
              guarantee: data.guarantee === defaultGuarantee[data.lang] ? defaultGuarantee[newLang] : data.guarantee,
            });
          }}
        >
          <Languages className="h-3.5 w-3.5 mr-1" />
          {data.lang === "es" ? "EN" : "ES"}
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" className="text-xs" onClick={onNewQuote}>
          <FilePlus className="h-3.5 w-3.5 mr-1" /> {data.lang === "es" ? "Nuevo" : "New"}
        </Button>
        <Button size="sm" className="text-xs rounded-full" onClick={onSaveCloud}>
          <Save className="h-3.5 w-3.5 mr-1" /> {data.lang === "es" ? "Guardar" : "Save"}
        </Button>
      </div>

      {/* Saved quotes browser */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9 rounded-full bg-muted/50 border-0 focus-visible:ring-1 text-sm"
            placeholder={data.lang === "es" ? "Buscar cotizaciones guardadas..." : "Search saved quotes..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredQuotes.length > 0 && (
          <div className="max-h-36 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
            {filteredQuotes.map(q => (
              <div
                key={q.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-muted/60",
                  currentQuoteId === q.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
                onClick={() => onLoadQuote(q.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate text-xs">{q.client_name || q.title || "Sin nombre"}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(q.updated_at).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteQuote(q.id); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client + validity + title */}
      <Card className="p-4 space-y-3">
        <div className="space-y-2">
          <Label>{data.lang === "es" ? "Título del documento" : "Document title"}</Label>
          <Input value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder={defaultTitle[data.lang]} />
        </div>
        <div className="space-y-2">
          <Label>{t.client}</Label>
          <Input value={data.clientName} onChange={(e) => update({ clientName: e.target.value })} placeholder="Dr. García" />
        </div>
        <div className="space-y-2">
          <Label>{t.validity}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !data.validityDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.validityDate ? format(data.validityDate, "dd/MM/yyyy") : t.validity}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={data.validityDate} onSelect={(d) => update({ validityDate: d })} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Catalog */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t.catalog}</h3>
          <Button size="sm" variant="outline" onClick={addProduct}>
            <Plus className="h-4 w-4 mr-1" /> {t.addProduct}
          </Button>
        </div>
        {data.catalog.map((product) => (
          <div key={product.id} className="border rounded-md p-3 space-y-3">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder={t.productName}
                value={product.name}
                onChange={(e) => updateProduct(product.id, { name: e.target.value })}
              />
              <Button size="icon" variant="ghost" onClick={() => removeProduct(product.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {product.variants.map((v) => (
              <div key={v.id} className="flex gap-2 items-center pl-4">
                <Input
                  type="number"
                  className="w-24"
                  placeholder={t.size}
                  value={v.mg || ""}
                  onChange={(e) => updateVariant(product.id, v.id, { mg: Number(e.target.value) })}
                />
                <span className="text-xs text-muted-foreground">mg</span>
                <Input
                  type="number"
                  className="w-28"
                  placeholder={t.price}
                  value={v.price ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateVariant(product.id, v.id, { price: val === "" ? null : Number(val) });
                  }}
                />
                <span className="text-xs text-muted-foreground">MX$</span>
                <Button size="icon" variant="ghost" onClick={() => removeVariant(product.id, v.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="ghost" className="ml-4" onClick={() => addVariant(product.id)}>
              <Plus className="h-3 w-3 mr-1" /> {t.addSize}
            </Button>
          </div>
        ))}
      </Card>

      {/* Current Order */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground">{t.currentOrder}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t.product}</Label>
            <Select
              value={data.currentOrder.productId}
              onValueChange={(v) => update({ currentOrder: { ...data.currentOrder, productId: v, variantId: "" } })}
            >
              <SelectTrigger><SelectValue placeholder={t.selectProduct} /></SelectTrigger>
              <SelectContent>
                {data.catalog.filter((p) => p.name).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.vialSize}</Label>
            <Select
              value={data.currentOrder.variantId}
              onValueChange={(v) => update({ currentOrder: { ...data.currentOrder, variantId: v } })}
            >
              <SelectTrigger><SelectValue placeholder={t.selectSize} /></SelectTrigger>
              <SelectContent>
                {allVariants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.mg} mg</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.qty}</Label>
            <Input
              type="number"
              min={1}
              value={data.currentOrder.quantity || ""}
              onChange={(e) => update({ currentOrder: { ...data.currentOrder, quantity: Number(e.target.value) } })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.priceVial}</Label>
            <Input
              type="number"
              value={data.currentOrder.pricePerVial || ""}
              onChange={(e) => update({ currentOrder: { ...data.currentOrder, pricePerVial: Number(e.target.value) } })}
            />
          </div>
        </div>
      </Card>

      {/* Proposals */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t.proposals}</h3>
          <Button size="sm" variant="outline" onClick={addProposal}>
            <Plus className="h-4 w-4 mr-1" /> {t.addProposal}
          </Button>
        </div>
        {data.proposals.map((prop) => (
          <div key={prop.id} className="border rounded-md p-3 space-y-3">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder={t.proposalName}
                value={prop.name}
                onChange={(e) => updateProposal(prop.id, { name: e.target.value })}
              />
              <Button size="icon" variant="ghost" onClick={() => removeProposal(prop.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t.vialSize}</Label>
                <Select value={prop.variantId} onValueChange={(v) => updateProposal(prop.id, { variantId: v })}>
                  <SelectTrigger><SelectValue placeholder={t.selectSize} /></SelectTrigger>
                  <SelectContent>
                    {allVariants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.mg} mg</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t.qty}</Label>
                <Input
                  type="number"
                  min={1}
                  value={prop.quantity || ""}
                  onChange={(e) => updateProposal(prop.id, { quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t.priceVial}</Label>
                <Input
                  type="number"
                  value={prop.pricePerVial || ""}
                  onChange={(e) => updateProposal(prop.id, { pricePerVial: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Conditions + Guarantee */}
      <Card className="p-4 space-y-3">
        <div className="space-y-2">
          <Label>{t.conditions}</Label>
          <Textarea rows={5} value={data.conditions} onChange={(e) => update({ conditions: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{t.guarantee}</Label>
          <Textarea rows={4} value={data.guarantee} onChange={(e) => update({ guarantee: e.target.value })} />
        </div>
      </Card>

      {/* Export toolbar */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{data.lang === "es" ? "Exportar" : "Export"}</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={onExportPdf} size="sm" className="text-xs">{t.exportPdf}</Button>
          <Button onClick={onExportJpg} size="sm" variant="secondary" className="text-xs">{t.exportJpg}</Button>
          <Button onClick={onPrint} size="sm" variant="secondary" className="text-xs">{t.print}</Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={onCopyImage} size="sm" variant="outline" className="text-xs">
            <Copy className="h-3.5 w-3.5 mr-1" /> {data.lang === "es" ? "Copiar" : "Copy"}
          </Button>
          <Button onClick={onExportJson} size="sm" variant="outline" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" /> JSON
          </Button>
          <Button onClick={onImportJson} size="sm" variant="outline" className="text-xs">
            <Upload className="h-3.5 w-3.5 mr-1" /> {data.lang === "es" ? "Importar" : "Import"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuoteEditor;
