import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function MobileSticky() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToForm = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }, 700);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          >
            <div className="bg-[#B91C1C] border-t border-white/20 px-4 py-3 flex gap-3 safe-bottom">
              <a
                href="tel:+17744332580"
                className="flex-1 flex items-center justify-center gap-2 border border-white/20 text-white text-sm font-sans font-medium py-3 rounded-lg"
              >
                <Phone size={14} />
                {t('mobile.call')}
              </a>
              <button
                onClick={scrollToForm}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-[#B91C1C] text-sm font-sans font-semibold py-3 rounded-lg"
              >
                {t('mobile.estimate')}
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.a
            href="tel:+17744332580"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-4 z-50 lg:hidden w-12 h-12 rounded-full bg-[#B91C1C] shadow-lg flex items-center justify-center"
            aria-label={t('mobile.aria_call')}
          >
            <Phone size={18} className="text-white" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
