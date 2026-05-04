import { motion } from 'framer-motion';
import { Star, Zap, Diamond, FileText, Phone } from 'lucide-react';
import LeadForm from './LeadForm';

const badges = [
  { icon: Star, label: '56 Ratings & Reviews' },
  { icon: Star, label: 'Over 20 Years' },
  { icon: Zap, label: 'Exceptional Prices' },
  { icon: Diamond, label: 'Huge Countertop Selection' },
  { icon: FileText, label: 'Free Estimates' },
];

export default function Hero() {
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/90 via-[#7F1D1D]/78 to-[#B91C1C]/48" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-white max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-10 bg-[#B91C1C]" />
              <span className="text-white text-xs tracking-[0.3em] font-sans font-medium uppercase">
                Bellingham, Massachusetts
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl lg:text-5xl xl:text-[3.4rem] leading-[1.15] font-medium mb-6"
            >
              St. Joseph Granite Countertops{' '}
              <em className="text-white not-italic">Made for Real Homes</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-base lg:text-lg text-white/70 leading-relaxed mb-8"
            >
              Custom granite, quartz, marble, quartzite, and porcelain surfaces
              for kitchens, bathrooms, outdoor kitchens, fireplaces, and firepits.
              Free estimates, exceptional prices, and over 20 years of experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-8 inline-flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm"
            >
              <span>10 Mill St, Bellingham, MA 02019</span>
              <span className="hidden sm:inline h-4 w-px bg-white/25" />
              <span>Open - Closes 5:00 pm</span>
            </motion.div>

            {/* Trust Badges */}
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

            {/* CTA Buttons */}
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
                Get Free Estimate
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

            {/* Social proof */}
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
                  Local, family-owned stone specialists
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Lead Form */}
          <div className="w-full lg:w-auto lg:min-w-[460px]">
            <LeadForm />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFFFFF] to-transparent" />
    </section>
  );
}
