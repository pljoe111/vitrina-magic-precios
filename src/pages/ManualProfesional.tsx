import LeadCaptureHero from "@/components/leads/LeadCaptureHero";
import ManualContents from "@/components/leads/ManualContents";
import TargetAudience from "@/components/leads/TargetAudience";
import LeadForm from "@/components/leads/LeadForm";
import LegalDisclaimer from "@/components/leads/LegalDisclaimer";
import Footer from "@/components/Footer";

const ManualProfesional = () => {
  return (
    <div className="min-h-screen bg-background">
      <LeadCaptureHero />
      <ManualContents />
      <TargetAudience />
      <LeadForm />
      <LegalDisclaimer />
      <Footer />
    </div>
  );
};

export default ManualProfesional;
