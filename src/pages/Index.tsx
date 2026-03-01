import HeroSection from "@/components/HeroSection";
import TrustBanner from "@/components/TrustBanner";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TrustBanner />
      <ProductGrid />
      <Footer />
    </main>
  );
};

export default Index;
