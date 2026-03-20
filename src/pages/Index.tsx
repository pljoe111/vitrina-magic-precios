import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBanner from "@/components/TrustBanner";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CatalogGate, { useCatalogAccess } from "@/components/CatalogGate";

const Index = () => {
  const { hasAccess, checking, setHasAccess } = useCatalogAccess();

  if (checking) return null;

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustBanner />
      <ProductGrid />
      <Footer />
      {!hasAccess && <CatalogGate onAccessGranted={() => setHasAccess(true)} />}
    </main>
  );
};

export default Index;
