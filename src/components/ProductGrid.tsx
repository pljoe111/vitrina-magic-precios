import { useState } from "react";
import { products, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section id="productos" className="bg-background py-20">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-body">
            Nuestros Productos
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl font-display">
            Catálogo completo de péptidos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground font-body">
            Cada péptido es liofilizado bajo estrictos protocolos de manufactura, garantizando 
            pureza, potencia y estabilidad óptimas para investigación.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </section>
  );
};

export default ProductGrid;
