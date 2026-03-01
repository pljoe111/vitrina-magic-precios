import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:shadow-card-hover opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {product.badge && (
        <div className={`absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-xs font-semibold tracking-wide font-body ${
          product.badge === "Más Vendido"
            ? "bg-primary text-primary-foreground"
            : "bg-gold text-gold-foreground"
        }`}>
          {product.badge}
        </div>
      )}

      <div className="relative flex items-center justify-center bg-muted/50 p-8 transition-all duration-500 group-hover:bg-accent/50">
        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="mb-1 text-xs font-medium uppercase tracking-widest text-primary font-body">
          {product.category}
        </span>
        <h3 className="mb-1 text-xl font-semibold text-foreground font-display">
          {product.name}
        </h3>
        <p className="mb-1 text-xs text-muted-foreground font-body italic">
          {product.subtitle}
        </p>
        <p className="mb-4 mt-2 flex-1 text-sm leading-relaxed text-muted-foreground font-body">
          {product.description}
        </p>

        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-body">Desde</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground font-body">
                  MX${product.pricePerMg}
                </span>
                <span className="text-sm text-muted-foreground font-body">/mg</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-body">
              {product.totalMg} mg por vial
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
