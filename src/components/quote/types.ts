export interface SizeVariant {
  id: string;
  mg: number;
  price: number | null; // null = N/A
}

export interface CatalogProduct {
  id: string;
  name: string;
  variants: SizeVariant[];
}

export interface CurrentOrder {
  productId: string;
  variantId: string;
  quantity: number;
  pricePerVial: number;
}

export interface Proposal {
  id: string;
  name: string;
  variantId: string;
  quantity: number;
  pricePerVial: number;
}

export interface QuoteData {
  clientName: string;
  title: string;
  validityDate: Date | undefined;
  catalog: CatalogProduct[];
  currentOrder: CurrentOrder;
  proposals: Proposal[];
  conditions: string;
  guarantee: string;
  lang: "es" | "en";
}

export const defaultTitle = {
  es: "Cotización Farmacéutica",
  en: "Pharmaceutical Quote",
};

export const defaultConditions = {
  es: `• Precios expresados en MX$ (pesos mexicanos), IVA incluido.\n• Cotización válida por el período indicado.\n• Envío gratuito en pedidos superiores a MX$10,000.\n• Pago mediante transferencia bancaria o tarjeta.\n• Entrega estimada: 3-5 días hábiles después de confirmación de pago.`,
  en: `• Prices in MX$ (Mexican pesos), tax included.\n• Quote valid for the indicated period.\n• Free shipping on orders over MX$10,000.\n• Payment via bank transfer or credit card.\n• Estimated delivery: 3-5 business days after payment confirmation.`,
};

export const defaultGuarantee = {
  es: `Todos los péptidos Alchem son fabricados bajo estrictos estándares GMP con pureza ≥98% verificada por HPLC y espectrometría de masas. Cada lote incluye Certificado de Análisis (CoA) emitido por laboratorio independiente acreditado.`,
  en: `All Alchem peptides are manufactured under strict GMP standards with ≥98% purity verified by HPLC and mass spectrometry. Each batch includes a Certificate of Analysis (CoA) issued by an accredited independent laboratory.`,
};

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
