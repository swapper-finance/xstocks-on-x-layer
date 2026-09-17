import CtaSection from "@/components/sections/CtaSection";
import HeroSection from "@/components/sections/HeroSection";
import IntegrateSection from "@/components/sections/IntegrateSection";
import RoutingSection from "@/components/sections/RoutingSection";
import SourcesSection from "@/components/sections/SourcesSection";
import StocksSection from "@/components/sections/StocksSection";

const HomePage = () => (
  <>
    <HeroSection />
    <StocksSection />
    <SourcesSection />
    <RoutingSection />
    <IntegrateSection />
    <CtaSection />
  </>
);

export default HomePage;
