import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Catalog from "@/components/sections/Catalog";
import Features from "@/components/sections/Features";
import Stats from "@/components/sections/Stats";
import Guestbook from "@/components/sections/Guestbook";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: "3rem" }}>
      <Navbar />
      <Hero />
      <Catalog />
      <Features />
      <Stats />
      <Guestbook />
      <Footer />
    </div>
  );
}
