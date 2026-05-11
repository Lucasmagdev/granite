import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { MagneticButton } from './MagneticButton';

const navSections = [
  { id: 'home',     key: 'nav.home' },
  { id: 'services', key: 'nav.services' },
  { id: 'projects', key: 'nav.projects' },
  { id: 'reviews',  key: 'nav.reviews' },
  { id: 'contact',  key: 'nav.contact' },
] as const;

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white transition-all duration-500 ${
          scrolled ? 'shadow-lg shadow-black/10' : 'shadow-sm shadow-black/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[76px] flex items-center justify-between gap-8">
          <button
            onClick={() => scrollTo('home')}
            className="group flex min-w-[150px] items-center"
            aria-label="St. Joseph Granite home"
          >
            <img
              src="/st-joseph-logo-clean.png"
              alt="St. Joseph Granite, Inc."
              className="h-11 w-[150px] object-contain object-left transition duration-300 group-hover:scale-[1.02] sm:h-12 sm:w-[168px]"
            />
          </button>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-9">
            {navSections.map(({ id, key }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-[#4B5563] hover:text-[#B91C1C] text-[13px] tracking-wide font-sans font-semibold transition-colors duration-200"
              >
                {t(key)}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+17744989863"
              className="flex items-center gap-2 text-[#52525B] hover:text-[#B91C1C] text-sm font-sans transition-colors duration-200"
            >
              <Phone size={14} />
              (774) 498-9863
            </a>
            <MagneticButton
              onClick={() => scrollTo('contact')}
              className="bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-sans font-semibold px-5 py-2.5 rounded-md shadow-sm shadow-[#B91C1C]/20 transition-colors duration-200 tracking-wide"
            >
              {t('nav.cta')}
            </MagneticButton>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-[#171717] p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-[#B91C1C] flex flex-col pt-20 px-8"
          >
            <nav className="flex flex-col gap-6 mt-6">
              {navSections.map(({ id, key }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-white/85 hover:text-white text-2xl font-serif text-left transition-colors duration-200"
                >
                  {t(key)}
                </button>
              ))}
            </nav>
            <div className="mt-10 flex flex-col gap-4">
              <a
                href="tel:+17744989863"
                className="flex items-center justify-center gap-2 border border-white/20 text-white py-3 rounded text-base font-sans"
              >
                <Phone size={16} />
                (774) 498-9863
              </a>
              <button
                onClick={() => scrollTo('contact')}
                className="bg-white text-[#B91C1C] py-3 rounded text-base font-sans font-semibold"
              >
                {t('nav.cta')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
