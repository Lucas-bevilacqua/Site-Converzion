import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ProcessSection } from "@/components/ProcessSection";
import { CasesSection } from "@/components/CasesSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <BenefitsSection />
      <ProcessSection />
      <CasesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;