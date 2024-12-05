import { Box } from "@chakra-ui/react";
import Header from "../components/Landingpage/Header";
import Hero from "../components/Landingpage/Hero";
import Features from "../components/Landingpage/Features";
import About from "../components/Landingpage/About";
import Reviews from "../components/Landingpage/Reviews";
import CTA from "../components/Landingpage/CTA";
import Footer from "../components/Landingpage/Footer";

export default function Home() {
  return (
    <Box width="100%" maxW="100vw" overflowX="hidden">
      <Header />
      <Box pt="80px"> 
        <Hero />
        <Features />
        <About />
        <Reviews />
        <CTA />
        <Footer />
      </Box>
    </Box>
  );
}
