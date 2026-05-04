import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';

const brands = [
  { name: 'Cambria', tagline: 'American Quartz' },
  { name: 'Silestone', tagline: 'by Cosentino' },
  { name: 'Caesarstone', tagline: 'Premium Quartz' },
  { name: 'MSI', tagline: 'Natural Stone' },
  { name: 'HanStone', tagline: 'Quartz Surfaces' },
  { name: 'Spectrum', tagline: 'Stone Surfaces' },
  { name: 'Infinity', tagline: 'Premium Porcelain' },
];

export default function Brands() {
  const [ref, inView] = useInView(0.2);

  return (
    <section className="bg-[#FFFFFF] py-14 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.p
          ref={ref as React.RefObject<HTMLParagraphElement>}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center text-[#5F5F5F] text-xs tracking-[0.25em] font-sans uppercase mb-8"
        >
          Premium Stone, Quartz &amp; Porcelain Brand Options
        </motion.p>
        <div className="flex flex-wrap justify-center items-center gap-10 lg:gap-16">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center group"
            >
              <span className="font-serif text-xl font-semibold text-[#171717] group-hover:text-[#B91C1C] transition-colors duration-200">
                {brand.name}
              </span>
              <span className="text-[#5F5F5F] text-[10px] tracking-[0.15em] font-sans uppercase mt-0.5">
                {brand.tagline}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
