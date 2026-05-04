import { motion } from 'framer-motion';
import { BadgeDollarSign, Gem, Ruler, MapPin } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const features = [
  {
    icon: BadgeDollarSign,
    title: 'Free Estimates',
    description:
      'Start your kitchen, bath, outdoor kitchen, or fireplace project with a clear estimate and practical guidance.',
  },
  {
    icon: Gem,
    title: 'Large Stone Selection',
    description:
      'Granite, quartz, marble, quartzite, porcelain, remnants, stainless steel sinks, and premium brand options.',
  },
  {
    icon: Ruler,
    title: 'Custom Edging',
    description:
      'Choose simple or detailed edge profiles cut for the exact countertop material and style of your home.',
  },
  {
    icon: MapPin,
    title: 'Family-Owned Service',
    description:
      'Visit the showroom at 10 Mill St in Bellingham to view current materials, remnants, and sale colors.',
  },
];

export default function WhyChooseUs() {
  const [ref, inView] = useInView(0.15);

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
              The St. Joseph Difference
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#171717] font-medium">
              Countertops, Fireplaces, Remnants &amp; More
            </h2>
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
