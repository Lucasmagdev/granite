import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/I18nContext';
import AnimatedHeading from './AnimatedHeading';

const imagesSrc = [
  { src: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',  categoryKey: 'gallery.kitchen',    span: 'col-span-2 lg:col-span-2 lg:row-span-2' },
  { src: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600',  categoryKey: 'gallery.quartz',     span: '' },
  { src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',  categoryKey: 'gallery.outdoor',    span: '' },
  { src: 'https://images.pexels.com/photos/279648/pexels-photo-279648.jpeg?auto=compress&cs=tinysrgb&w=600',   categoryKey: 'gallery.granite',    span: '' },
  { src: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=600', categoryKey: 'gallery.bathroom',   span: '' },
  { src: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600', categoryKey: 'gallery.edging',     span: '' },
  { src: 'https://images.pexels.com/photos/3214064/pexels-photo-3214064.jpeg?auto=compress&cs=tinysrgb&w=600', categoryKey: 'gallery.fireplaces', span: '' },
];

export default function Gallery() {
  const { t } = useI18n();
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="projects" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            ref={ref as React.RefObject<HTMLDivElement>}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#B91C1C] text-xs tracking-[0.3em] font-sans uppercase mb-4">
              {t('gallery.label')}
            </p>
            <AnimatedHeading
              text={t('gallery.heading')}
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

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] lg:auto-rows-[220px] gap-3">
          {imagesSrc.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`relative overflow-hidden rounded-lg cursor-pointer ${img.span}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <motion.img
                src={img.src}
                alt={t(img.categoryKey)}
                className="w-full h-full object-cover"
                animate={{ scale: hovered === i ? 1.07 : 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t from-[#111111]/82 via-[#111111]/20 to-transparent flex items-end p-5 transition-opacity duration-300 opacity-100 lg:opacity-0 ${hovered === i ? 'lg:opacity-100' : ''}`}
              >
                <div>
                  <div className="h-px w-8 bg-[#EF4444] mb-2" />
                  <p className="text-white font-serif text-base font-medium">{t(img.categoryKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
