import Navbar from './Navbar';
import Hero from './Hero';
import Brands from './Brands';
import WhyChooseUs from './WhyChooseUs';
import Gallery from './Gallery';
import Reviews from './Reviews';
import ServiceArea from './ServiceArea';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import MobileSticky from './MobileSticky';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pb-[68px] lg:pb-0">
        <Hero />
        <Brands />
        <WhyChooseUs />
        <Gallery />
        <Reviews />
        <ServiceArea />
        <FinalCTA />
        <Footer />
      </main>
      <MobileSticky />
    </>
  );
}
