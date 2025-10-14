import Header from "@/components/navigation/Header";
import HomeSection from "@/components/sections/HomeSection";
import DjSection from "@/components/sections/DjSection";
import LineupSection from "@/components/sections/LineupSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <>
      <Header />
      <main className="relative w-full overflow-hidden bg-apex-background">
        <HomeSection />
        <DjSection />
        <LineupSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
