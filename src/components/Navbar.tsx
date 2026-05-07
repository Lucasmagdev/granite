import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#B91C1C]/97 backdrop-blur-md shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">
          <button
            onClick={() => scrollTo('home')}
            className="flex items-center gap-2 group"
          >
            <span className="text-white font-serif text-[10px] tracking-[0.35em] font-medium uppercase leading-none">
              ST. JOSEPH
              <br />
              <span className="text-white text-[15px] tracking-[0.25em] font-semibold">GRANITE</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navSections.map(({ id, key }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-white/85 hover:text-white text-sm tracking-wide font-sans font-medium transition-colors duration-200"
              >
                {t(key)}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+17744332580"
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-sans transition-colors duration-200"
            >
              <Phone size={14} />
              (774) 433-2580
            </a>
            <button
              onClick={() => scrollTo('contact')}
              className="bg-white hover:bg-[#F3F4F6] text-[#B91C1C] text-sm font-sans font-semibold px-5 py-2.5 rounded transition-all duration-200 tracking-wide"
            >
              {t('nav.cta')}
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-1"
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
                href="tel:+17744332580"
                className="flex items-center justify-center gap-2 border border-white/20 text-white py-3 rounded text-base font-sans"
              >
                <Phone size={16} />
                (774) 433-2580
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
