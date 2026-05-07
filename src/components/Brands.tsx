import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/I18nContext';

const brands = [
  { name: 'Cambria',      taglineKey: 'brands.tag_american_quartz' },
  { name: 'Silestone',    taglineKey: 'brands.tag_by_cosentino' },
  { name: 'Caesarstone',  taglineKey: 'brands.tag_premium_quartz' },
  { name: 'MSI',          taglineKey: 'brands.tag_natural_stone' },
  { name: 'HanStone',     taglineKey: 'brands.tag_quartz_surfaces' },
  { name: 'Spectrum',     taglineKey: 'brands.tag_stone_surfaces' },
  { name: 'Infinity',     taglineKey: 'brands.tag_premium_porcelain' },
];

export default function Brands() {
  const { t } = useI18n();
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
          {t('brands.heading')}
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
                {t(brand.taglineKey)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
