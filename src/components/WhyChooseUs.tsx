import { motion } from 'framer-motion';
import { BadgeDollarSign, Gem, Ruler, MapPin } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/I18nContext';
import AnimatedHeading from './AnimatedHeading';

export default function WhyChooseUs() {
  const { t } = useI18n();
  const [ref, inView] = useInView(0.15);

  const features = [
    { icon: BadgeDollarSign, title: t('why.f1_title'), description: t('why.f1_desc') },
    { icon: Gem,             title: t('why.f2_title'), description: t('why.f2_desc') },
    { icon: Ruler,           title: t('why.f3_title'), description: t('why.f3_desc') },
    { icon: MapPin,          title: t('why.f4_title'), description: t('why.f4_desc') },
  ];

  return (
    <section id="services" className="py-24 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            ref={ref as React.RefObject<HTMLDivElement>}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#B91C1C] text-xs tracking-[0.3em] font-sans uppercase mb-4">
              {t('why.label')}
            </p>
            <AnimatedHeading
              text={t('why.heading')}
              inView={inView}
              delay={0.2}
              className="font-serif text-3xl lg:text-4xl text-[#171717] font-medium"
            />
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-[#B91C1C]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
              <div className="h-px w-12 bg-[#B91C1C]" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              className="group bg-white rounded-lg p-7 border border-[#E5E7EB] hover:border-[#B91C1C]/45 hover:shadow-xl transition-all duration-300 cursor-default"
            >
              <div className="w-12 h-12 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center mb-5 group-hover:bg-[#B91C1C]/20 transition-colors duration-300">
                <f.icon size={22} className="text-[#B91C1C]" />
              </div>
              <h3 className="font-serif text-lg text-[#171717] font-medium mb-3">{f.title}</h3>
              <p className="text-[#5F5F5F] text-sm font-sans leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
