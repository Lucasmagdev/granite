import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Star } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/I18nContext';
import AnimatedHeading from './AnimatedHeading';

export default function ServiceArea() {
  const { t } = useI18n();
  const [ref, inView] = useInView(0.1);

  const hours = [
    { dayKey: 'service.mon_fri', timeKey: 'service.time_weekday' },
    { dayKey: 'service.sat',     timeKey: 'service.time_sat' },
    { dayKey: 'service.sun',     timeKey: 'service.closed' },
  ];

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, #171717 39px, #171717 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, #171717 39px, #171717 40px)`,
        }}
      />

      <div className="max-w-6xl mx-auto px-5 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <motion.div
            ref={ref as React.RefObject<HTMLDivElement>}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#B91C1C] text-xs tracking-[0.3em] font-sans uppercase mb-4">
              {t('service.label')}
            </p>
            <AnimatedHeading
              text={t('service.heading')}
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="bg-white rounded-lg p-7 border border-[#E5E7EB] shadow-sm"
          >
            <div className="flex items-start gap-4 mb-7">
              <div className="w-11 h-11 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-[#B91C1C]" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#171717] font-medium">St. Joseph Granite</h3>
                <p className="text-[#5F5F5F] text-sm font-sans mt-1">10 Mill St</p>
                <p className="text-[#5F5F5F] text-sm font-sans">Bellingham, MA 02019</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=10+Mill+St+Bellingham+MA+02019"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-[#B91C1C] hover:text-[#7F1D1D] text-sm font-sans font-semibold mt-3"
                >
                  {t('service.directions')}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-7 pt-7 border-t border-[#E5E7EB]">
              <div className="w-11 h-11 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-[#B91C1C]" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#171717] font-medium">{t('service.contact_title')}</h3>
                <a
                  href="tel:+17744332580"
                  className="text-[#B91C1C] hover:text-[#7F1D1D] text-sm font-sans font-semibold mt-1 inline-flex"
                >
                  {t('service.contact_phone')}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-7 border-t border-[#E5E7EB]">
              <div className="w-11 h-11 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center shrink-0">
                <Star size={18} className="text-[#B91C1C]" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#171717] font-medium">{t('service.feedback_title')}</h3>
                <p className="text-[#5F5F5F] text-sm font-sans mt-1">{t('service.feedback_count')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="bg-[#B91C1C] rounded-lg p-7 text-white shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/75 text-xs tracking-[0.25em] font-sans uppercase">{t('service.hours_label')}</p>
                <h3 className="font-serif text-2xl font-medium">{t('service.hours_status')}</h3>
              </div>
            </div>

            <ul className="divide-y divide-white/15">
              {hours.map(({ dayKey, timeKey }) => (
                <li key={dayKey} className="flex items-center justify-between gap-4 py-4">
                  <span className="font-sans text-sm text-white/75">{t(dayKey)}</span>
                  <span className="font-sans text-sm font-semibold text-white">{t(timeKey)}</span>
                </li>
              ))}
            </ul>

            <p className="text-white/65 text-xs font-sans leading-relaxed mt-6">
              {t('service.showroom_desc')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
