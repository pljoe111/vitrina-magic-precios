import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { productPricing } from "@/data/pricing";
import { MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPrice = (price: number) =>
  `MX$${price.toLocaleString("es-MX")}`;

const ProductDetailModal = ({
  product,
  open,
  onOpenChange,
}: ProductDetailModalProps) => {
  if (!product) return null;

  const pricing = productPricing.find((p) => p.productId === product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] rounded-xl sm:rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="h-20 w-20 object-contain rounded-lg bg-muted/50 p-2"
            />
            <div>
              <DialogTitle className="text-2xl font-display">
                {product.name}
              </DialogTitle>
              <DialogDescription className="mt-1 font-body">
                {product.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Pricing Table */}
        {pricing && (
          <div className="mt-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary font-body">
              Precios por presentación
            </h3>

            {/* Mobile: card layout */}
            <div className="space-y-3 sm:hidden">
              {pricing.tiers.map((tier) => {
                const discount = Math.round(
                  ((tier.priceVial - tier.priceMayoreoN2) / tier.priceVial) * 100
                );
                return (
                  <div key={tier.totalMg} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-body font-semibold text-foreground text-base">{tier.totalMg} mg</span>
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        -{discount}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-body">
                      <div>
                        <p className="text-muted-foreground text-xs">Por vial</p>
                        <p className="text-foreground">{formatPrice(tier.priceVial)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Mayoreo N1</p>
                        <p className="text-foreground">{formatPrice(tier.priceMayoreoN1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Mayoreo N2</p>
                        <p className="font-semibold text-foreground">{formatPrice(tier.priceMayoreoN2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-body font-semibold text-foreground">
                      Presentación
                    </TableHead>
                    <TableHead className="font-body font-semibold text-foreground text-right">
                      Precio por vial
                    </TableHead>
                    <TableHead className="font-body font-semibold text-foreground text-right">
                      Mayoreo N1
                    </TableHead>
                    <TableHead className="font-body font-semibold text-foreground text-right">
                      Mayoreo N2
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing.tiers.map((tier) => {
                    const discount = Math.round(
                      ((tier.priceVial - tier.priceMayoreoN2) / tier.priceVial) * 100
                    );
                    return (
                      <TableRow key={tier.totalMg}>
                        <TableCell className="font-body font-medium">
                          {tier.totalMg} mg
                        </TableCell>
                        <TableCell className="font-body text-right text-muted-foreground">
                          {formatPrice(tier.priceVial)}
                        </TableCell>
                        <TableCell className="font-body text-right text-muted-foreground">
                          {formatPrice(tier.priceMayoreoN1)}
                        </TableCell>
                        <TableCell className="font-body text-right">
                          <span className="font-semibold text-foreground">
                            {formatPrice(tier.priceMayoreoN2)}
                          </span>
                          <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            -{discount}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Conditions */}
        <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-primary font-body">
            Condiciones de descuento
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground font-body">
            <li>
              <span className="font-medium text-foreground">Mayoreo N1:</span>{" "}
              compras desde MX$43,000
            </li>
            <li>
              <span className="font-medium text-foreground">Mayoreo N2:</span>{" "}
              compras desde MX$96,000
            </li>
            <li>Precios en MXN • Inventario sujeto a disponibilidad por lote</li>
            <li>Precios especiales para clínicas y distribuidores</li>
          </ul>
        </div>

        {/* Quality guarantee */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm font-body">
            <p className="font-medium text-foreground">Garantía de calidad</p>
            <p className="mt-1 text-muted-foreground">
              Cada lote es analizado internamente y verificado por laboratorios
              independientes.{" "}
              <Link
                to="/test-results"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Ver resultados <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1 gap-2 rounded-full" size="lg">
            <a
              href={`https://wa.me/528117963113?text=${encodeURIComponent(
                `Hola, me interesa cotizar ${product.name}. ¿Podrían darme más información?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" />
              Cotizar por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" className="flex-1 gap-2 rounded-full" size="lg">
            <a
              href={`https://wa.me/528131082689?text=${encodeURIComponent(
                `Hola, me interesa hacer un pedido de ${product.name}. ¿Cuál es la disponibilidad?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5" />
              Pedidos y cotizaciones
            </a>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body">
          Envíos 24–72 h • Disponibilidad inmediata • info@alchem.is
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
