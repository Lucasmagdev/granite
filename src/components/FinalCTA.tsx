import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/I18nContext';
import AnimatedHeading from './AnimatedHeading';
import { MagneticButton, MagneticAnchor } from './MagneticButton';

export default function FinalCTA() {
  const { t } = useI18n();
  const [ref, inView] = useInView(0.2);

  const scrollToContact = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }, 700);
  };

  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-[#7F1D1D]/86" />

      <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 text-center">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-white/85 text-xs tracking-[0.3em] font-sans uppercase mb-5">
            {t('cta.label')}
          </p>
          <AnimatedHeading
            text={t('cta.heading')}
            inView={inView}
            delay={0.2}
            className="font-serif text-3xl lg:text-5xl text-white font-medium leading-[1.2] mb-5"
          />
          <p className="text-white/65 font-sans text-base lg:text-lg leading-relaxed mb-10">
            {t('cta.desc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton
              onClick={scrollToContact}
              className="flex items-center justify-center gap-2 bg-[#B91C1C] hover:bg-[#7F1D1D] text-white font-sans font-semibold text-sm tracking-wider px-9 py-4 rounded transition-colors duration-200"
            >
              {t('cta.estimate')}
              <ArrowRight size={15} />
            </MagneticButton>

            <MagneticAnchor
              href="tel:+17744989863"
              className="flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-sans font-medium text-sm px-9 py-4 rounded transition-colors duration-200"
            >
              {t('cta.call')}
            </MagneticAnchor>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
