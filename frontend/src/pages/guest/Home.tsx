import BenefitSection from "@/components/guest/home/BenefitSection";
import HeroSection from "@/components/guest/home/HeroSection";
import ProductSection from "@/components/guest/home/ProductSection";
import { Box } from "@mui/material";


export default function Home() {

    return (
        <Box>
            {/* Hero Section */}
            <section id="home">
                <HeroSection />
            </section>

            {/* Featured Products Section */}
            <section id="products">
                <ProductSection />
            </section>

            {/* About/Benefits Section */}
            <section className="bg-slate-50 text-black py-24" id="benfits">
                <BenefitSection />
            </section>

        </Box>
    );
}
