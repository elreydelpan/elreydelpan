import { Navbar } from "@/components/Navbar";
import { Hero } from "@/sections/Hero";
import { FeaturedSection } from "@/sections/FeaturedSection";
import { CatalogSection } from "@/sections/CatalogSection";
import { PriceListSection } from "@/sections/PriceListSection";
import { AboutSection } from "@/sections/AboutSection";
import { ContactSection } from "@/sections/ContactSection";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export default function Home() {
  return (
    <div className="min-h-screen bg-carbon">
      <Navbar />
      <main>
        <Hero />
        <FeaturedSection />
        <CatalogSection />
        <PriceListSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
