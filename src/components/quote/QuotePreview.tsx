import { forwardRef } from "react";
import logo from "@/assets/logo.png";
import { QuoteData } from "./types";
import { format } from "date-fns";

interface QuotePreviewProps {
  data: QuoteData;
}

const fmt = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(({ data }, ref) => {
  const { lang } = data;
  const t = lang === "es"
    ? { title: "Cotización Farmacéutica", validUntil: "Válido hasta", priceTable: "Lista de Precios", size: "Tamaño", priceVial: "Precio / Vial", na: "N/A", analysis: "Análisis Comparativo", current: "Actual", proposed: "Propuesta", vials: "Viales", vialSize: "Tamaño vial", totalMg: "Total mg", totalCost: "Costo total", unitCost: "Costo/mg", savings: "Ahorro", sameMg: "Mismo contenido total", lowerUnit: "Menor costo unitario", moreMgLessCost: "Más producto, menor costo", summary: "Resumen de beneficios", conditions: "Condiciones", guarantee: "Garantía de Calidad", confidential: "CONFIDENCIAL — Este documento contiene información comercial privilegiada destinada exclusivamente al destinatario indicado.", noProduct: "Sin producto seleccionado" }
    : { title: "Pharmaceutical Quote", validUntil: "Valid until", priceTable: "Price List", size: "Size", priceVial: "Price / Vial", na: "N/A", analysis: "Comparative Analysis", current: "Current", proposed: "Proposal", vials: "Vials", vialSize: "Vial size", totalMg: "Total mg", totalCost: "Total cost", unitCost: "Cost/mg", savings: "Savings", sameMg: "Same total content", lowerUnit: "Lower unit cost", moreMgLessCost: "More product, lower cost", summary: "Benefit summary", conditions: "Conditions", guarantee: "Quality Guarantee", confidential: "CONFIDENTIAL — This document contains privileged commercial information intended exclusively for the indicated recipient.", noProduct: "No product selected" };

  const selectedProduct = data.catalog.find((p) => p.id === data.currentOrder.productId);
  const currentVariant = selectedProduct?.variants.find((v) => v.id === data.currentOrder.variantId);

  const currentTotalMg = currentVariant ? currentVariant.mg * data.currentOrder.quantity : 0;
  const currentTotalCost = data.currentOrder.pricePerVial * data.currentOrder.quantity;
  const currentUnitCost = currentTotalMg > 0 ? currentTotalCost / currentTotalMg : 0;

  return (
    <div ref={ref} className="bg-white text-gray-900 w-[210mm] min-h-[297mm] mx-auto shadow-lg" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", lineHeight: "1.5" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4 flex items-center justify-between border-b-2" style={{ borderColor: "#2a9d8f" }}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="Alchem" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "#2a9d8f" }}>ALCHEM</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Certified Pure Peptides</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{data.title || t.title}</p>
          {data.clientName && <p className="text-gray-600">{data.clientName}</p>}
          {data.validityDate && (
            <p className="text-gray-500 text-[10px]">{t.validUntil}: {format(data.validityDate, "dd/MM/yyyy")}</p>
          )}
        </div>
      </div>

      <div className="px-10 py-6 space-y-6">
        {/* Price Table */}
        {selectedProduct && selectedProduct.variants.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: "#2a9d8f" }}>
              {t.priceTable} — {selectedProduct.name}
            </h2>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ backgroundColor: "#f0faf8" }}>
                  <th className="text-left py-2 px-3 font-semibold border-b" style={{ borderColor: "#d1e8e4" }}>{t.size}</th>
                  <th className="text-right py-2 px-3 font-semibold border-b" style={{ borderColor: "#d1e8e4" }}>{t.priceVial}</th>
                </tr>
              </thead>
              <tbody>
                {selectedProduct.variants.map((v) => (
                  <tr key={v.id} className="border-b" style={{ borderColor: "#eee" }}>
                    <td className="py-2 px-3">{v.mg} mg</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {v.price !== null ? `MX$ ${fmt(v.price)}` : t.na}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Proposal Cards */}
        {data.proposals.filter((p) => p.variantId).map((prop) => {
          const propVariant = selectedProduct?.variants.find((v) => v.id === prop.variantId);
          if (!propVariant) return null;

          const propTotalMg = propVariant.mg * prop.quantity;
          const propTotalCost = prop.pricePerVial * prop.quantity;
          const propUnitCost = propTotalMg > 0 ? propTotalCost / propTotalMg : 0;
          const savingsAmount = currentTotalCost - propTotalCost;
          const sameMg = propTotalMg === currentTotalMg && currentTotalMg > 0;
          const lowerUnit = propUnitCost < currentUnitCost && currentUnitCost > 0 && propUnitCost > 0;
          const moreMgLessCost = propTotalMg > currentTotalMg && propTotalCost < currentTotalCost && currentTotalMg > 0;
          const summaryItems = [
            sameMg ? `✓ ${t.sameMg}` : null,
            lowerUnit ? `✓ ${t.lowerUnit}` : null,
            moreMgLessCost ? `✓ ${t.moreMgLessCost}` : null,
            savingsAmount > 0 ? `${t.savings}: MX$ ${fmt(savingsAmount)}` : null,
          ].filter((item): item is string => Boolean(item));

          return (
            <div key={prop.id} className="border rounded-lg" style={{ borderColor: "#d1e8e4" }}>
              <div className="py-2 px-4 font-bold text-white text-xs uppercase tracking-wider" style={{ backgroundColor: "#2a9d8f" }}>
                {t.analysis}: {prop.name || t.proposed}
              </div>
              <div className="grid grid-cols-2">
                {/* Current column */}
                <div className="p-4 border-r" style={{ borderColor: "#eee", backgroundColor: "#fafafa" }}>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">{t.current}</p>
                  <div className="space-y-1 text-[11px]">
                    <Row label={t.vials} value={String(data.currentOrder.quantity)} />
                    <Row label={t.vialSize} value={currentVariant ? `${currentVariant.mg} mg` : "—"} />
                    <Row label={t.priceVial} value={`MX$ ${fmt(data.currentOrder.pricePerVial)}`} />
                    <Row label={t.totalMg} value={`${currentTotalMg.toLocaleString()} mg`} />
                    <Row label={t.totalCost} value={`MX$ ${fmt(currentTotalCost)}`} bold />
                    <Row label={t.unitCost} value={`MX$ ${fmt(currentUnitCost)}`} />
                  </div>
                </div>
                {/* Proposed column */}
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "#2a9d8f" }}>{t.proposed}</p>
                  <div className="space-y-1 text-[11px]">
                    <Row label={t.vials} value={String(prop.quantity)} />
                    <Row label={t.vialSize} value={`${propVariant.mg} mg`} />
                    <Row label={t.priceVial} value={`MX$ ${fmt(prop.pricePerVial)}`} />
                    <Row label={t.totalMg} value={`${propTotalMg.toLocaleString()} mg`} />
                    <Row label={t.totalCost} value={`MX$ ${fmt(propTotalCost)}`} bold />
                    <Row label={t.unitCost} value={`MX$ ${fmt(propUnitCost)}`} />
                  </div>
                </div>
              </div>
              {summaryItems.length > 0 && (
                <div className="px-4 py-3 border-t" style={{ borderColor: "#eee" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">{t.summary}</p>
                  <div className="space-y-1 text-[11px] text-gray-700">
                    {summaryItems.map((item, idx) => (
                      <p
                        key={`${prop.id}-summary-${idx}`}
                        className={item.startsWith(t.savings) ? "font-bold text-gray-900 leading-5" : "leading-5"}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Conditions + Guarantee */}
        {(data.conditions || data.guarantee) && (
          <div className="grid grid-cols-2 gap-6 text-[10px] text-gray-600">
            {data.conditions && (
              <div>
                <h3 className="font-bold uppercase text-[9px] tracking-wider mb-1" style={{ color: "#2a9d8f" }}>{t.conditions}</h3>
                <p className="whitespace-pre-line leading-relaxed">{data.conditions}</p>
              </div>
            )}
            {data.guarantee && (
              <div>
                <h3 className="font-bold uppercase text-[9px] tracking-wider mb-1" style={{ color: "#2a9d8f" }}>{t.guarantee}</h3>
                <p className="whitespace-pre-line leading-relaxed">{data.guarantee}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confidentiality bar */}
      <div className="mx-10 mt-4 py-2 px-4 text-center text-[8px] text-gray-400 border-t" style={{ borderColor: "#d1e8e4" }}>
        {t.confidential}
      </div>
    </div>
  );
});

QuotePreview.displayName = "QuotePreview";

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-bold text-gray-900" : "text-gray-800"}>{value}</span>
    </div>
  );
}

export default QuotePreview;
