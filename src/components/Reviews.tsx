import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/I18nContext';
import gsap from 'gsap';
import AnimatedHeading from './AnimatedHeading';

const reviewData = [
  {
    name: 'Josh L.',
    location: 'Reviewed 5/2/2026',
    text: 'These guys are my go-to for granite, always high quality, and incredible attention to detail to make sure things are done properly.',
    rating: 5,
    projectKey: 'reviews.r1_project',
  },
  {
    name: 'Pedro C.',
    location: 'Reviewed 5/1/2026',
    text: 'Good job my house.',
    rating: 5,
    projectKey: 'reviews.r2_project',
  },
  {
    name: 'Amy Scanlon',
    location: 'Customer review',
    text: 'At-home estimate within days of inquiry and installation within a week. They were friendly, professional, and the job came out beautiful.',
    rating: 5,
    projectKey: 'reviews.r3_project',
  },
];

const stats = [
  { end: 20, suffix: '+', labelKey: 'reviews.stat_years' },
  { end: 56, suffix: '',  labelKey: 'reviews.stat_reviews' },
  { end: 7,  suffix: '',  labelKey: 'reviews.stat_payments' },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(count)].map((_, i) => (
        <Star key={i} size={14} className="fill-[#EF4444] text-[#EF4444]" />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, inView] = useInView(0.15);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    stats.forEach(({ end, suffix }, i) => {
      const el = counterRefs.current[i];
      if (!el) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: end,
        duration: 1.8,
        ease: 'power3.out',
        delay: 0.1 * i,
        onUpdate() {
          el.textContent = Math.round(obj.val) + suffix;
        },
      });
    });
  }, [inView]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => goTo((current - 1 + reviewData.length) % reviewData.length);
  const next = () => goTo((current + 1) % reviewData.length);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section id="reviews" className="py-24 bg-[#B91C1C] relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

      <div className="max-w-5xl mx-auto px-5 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <motion.div
            ref={ref as React.RefObject<HTMLDivElement>}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/85 text-xs tracking-[0.3em] font-sans uppercase mb-4">
              {t('reviews.label')}
            </p>
            <AnimatedHeading
              text={t('reviews.heading')}
              inView={inView}
              delay={0.2}
              className="font-serif text-3xl lg:text-4xl text-white font-medium"
            />
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-white/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="h-px w-12 bg-white/50" />
            </div>
          </motion.div>
        </div>

        <div className="relative overflow-hidden min-h-[260px]">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="bg-white border border-white/20 rounded-lg p-8 lg:p-12 shadow-xl"
            >
              <Quote size={32} className="text-[#B91C1C]/35 mb-6" />
              <p className="font-serif text-xl lg:text-2xl text-[#171717] leading-relaxed mb-8 italic">
                "{reviewData[current].text}"
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <StarRating count={reviewData[current].rating} />
                  <p className="text-[#171717] font-sans font-semibold mt-2">{reviewData[current].name}</p>
                  <p className="text-[#5F5F5F] text-sm font-sans">{reviewData[current].location}</p>
                </div>
                <div className="sm:text-right">
                  <span className="inline-block border border-[#B91C1C]/30 text-[#B91C1C] text-xs tracking-wider font-sans px-4 py-2 rounded-full">
                    {t(reviewData[current].projectKey)}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-white/40 hover:border-white text-white/75 hover:text-white flex items-center justify-center transition-all duration-200"
            aria-label="Previous review"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {reviewData.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Show review ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/35 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-white/40 hover:border-white text-white/75 hover:text-white flex items-center justify-center transition-all duration-200"
            aria-label="Next review"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10"
        >
          {stats.map(({ end, suffix, labelKey }, i) => (
            <div key={labelKey} className="text-center">
              <p className="font-serif text-3xl lg:text-4xl text-white font-medium">
                <span ref={(el) => { counterRefs.current[i] = el; }}>
                  0{suffix}
                </span>
              </p>
              <p className="text-white/75 text-xs font-sans tracking-wide mt-1 uppercase">
                {t(labelKey)}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
