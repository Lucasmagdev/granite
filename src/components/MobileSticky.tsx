import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function MobileSticky() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 150);
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
              href="tel:+17744989863"
              className="flex-1 flex flex-col items-center justify-center border border-white/25 text-white py-2.5 rounded-lg"
            >
              <div className="flex items-center gap-1.5">
                <Phone size={13} />
                <span className="text-xs font-sans font-medium">{t('mobile.call')}</span>
              </div>
              <span className="text-[10px] font-sans text-white/75 mt-0.5">(774) 498-9863</span>
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
  );
}
