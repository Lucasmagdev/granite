import { motion } from 'framer-motion';
import { Star, Zap, Diamond, FileText, Phone } from 'lucide-react';
import LeadForm from './LeadForm';
import { useI18n } from '../i18n/I18nContext';

export default function Hero() {
  const { t } = useI18n();

  const badges = [
    { icon: Star,     label: t('hero.badge_reviews') },
    { icon: Star,     label: t('hero.badge_years') },
    { icon: Zap,      label: t('hero.badge_prices') },
    { icon: Diamond,  label: t('hero.badge_selection') },
    { icon: FileText, label: t('hero.badge_estimates') },
  ];

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center"
      style={{
        backgroundImage:
          'url(https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/90 via-[#7F1D1D]/78 to-[#B91C1C]/48" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-white max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-10 bg-[#B91C1C]" />
              <span className="text-white text-xs tracking-[0.3em] font-sans font-medium uppercase">
                {t('hero.location')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl lg:text-5xl xl:text-[3.4rem] leading-[1.15] font-medium mb-6"
            >
              {t('hero.heading_main')}{' '}
              <em className="text-white not-italic">{t('hero.heading_em')}</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-base lg:text-lg text-white/70 leading-relaxed mb-8"
            >
              {t('hero.desc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-8 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm"
            >
              <span>{t('hero.address')}</span>
              <span className="hidden sm:inline h-4 w-px bg-white/25" />
              <span>{t('hero.hours')}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              {badges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-2 backdrop-blur-sm"
                >
                  <Icon size={13} className="text-[#EF4444]" />
                  <span className="text-white/85 text-xs font-sans tracking-wide">{label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToContact}
                className="bg-[#B91C1C] hover:bg-[#7F1D1D] text-white font-sans font-semibold text-sm tracking-wider px-8 py-4 rounded transition-all duration-200"
              >
                {t('hero.cta')}
              </motion.button>
              <motion.a
                href="tel:+17744332580"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 border border-white/30 hover:border-white text-white font-sans font-medium text-sm px-7 py-4 rounded transition-all duration-200"
              >
                <Phone size={15} />
                (774) 433-2580
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EF4444] to-[#7F1D1D] border-2 border-[#111111] flex items-center justify-center text-white text-[10px] font-sans font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-[#EF4444] text-[#EF4444]" />
                  ))}
                </div>
                <p className="text-white/60 text-[11px] font-sans">
                  {t('hero.social_proof')}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[460px]">
            <LeadForm />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFFFFF] to-transparent" />
    </section>
  );
}
