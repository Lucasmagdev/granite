import { Phone, MapPin, CreditCard, Languages } from 'lucide-react';

const services = [
  'Kitchen Countertops',
  'Bathroom Vanities',
  'Outdoor Kitchens',
  'Indoor & Outdoor Fireplaces',
  'Custom Firepits',
  'Custom Edging',
  'Remnant Countertops',
  'Stainless Steel Sinks',
];

const payments = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Cash', 'Check', 'Zelle'];

export default function Footer() {
  return (
    <footer className="bg-[#B91C1C] text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          <div className="lg:col-span-1">
            <div className="mb-5">
              <p className="text-white text-[10px] tracking-[0.35em] font-sans font-medium uppercase">ST. JOSEPH</p>
              <p className="text-white text-xl tracking-[0.2em] font-serif font-semibold">GRANITE</p>
            </div>
            <p className="text-white/55 text-sm font-sans leading-relaxed mb-6">
              Local, family-owned stone specialists offering granite, quartz, marble, quartzite,
              porcelain, remnants, countertops, and custom fireplace work.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+17744332580"
                className="flex items-center gap-3 text-white/75 hover:text-white text-sm font-sans transition-colors duration-200"
              >
                <Phone size={14} className="text-white" />
                (774) 433-2580
              </a>
              <div className="flex items-start gap-3 text-white/65 text-sm font-sans">
                <MapPin size={14} className="text-white shrink-0 mt-0.5" />
                <span>10 Mill St, Bellingham, MA 02019</span>
              </div>
              <div className="flex items-start gap-3 text-white/65 text-sm font-sans">
                <Languages size={14} className="text-white shrink-0 mt-0.5" />
                <span>English and Spanish available</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-sans font-semibold tracking-wider uppercase mb-5">
              Services
            </h4>
            <ul className="flex flex-col gap-2.5">
              {services.map((s) => (
                <li key={s}>
                  <button className="text-white/70 hover:text-white text-sm font-sans transition-colors duration-200 text-left">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-sans font-semibold tracking-wider uppercase mb-5">
              Visit Us
            </h4>
            <p className="text-white/65 text-sm font-sans leading-relaxed">
              10 Mill St<br />
              Bellingham, MA 02019
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=10+Mill+St+Bellingham+MA+02019"
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-white hover:text-white/80 text-sm font-sans font-semibold mt-4"
            >
              Get Directions
            </a>
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-white/35 text-xs font-sans leading-relaxed">
                One showroom location for current slabs, remnants, and sale colors.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-sans font-semibold tracking-wider uppercase mb-5">
              Showroom Hours
            </h4>
            <ul className="flex flex-col gap-2 mb-7">
              {[
                { day: 'Monday-Friday', time: '9:00 AM-5:00 PM' },
                { day: 'Saturday', time: '9:00 AM-2:00 PM' },
                { day: 'Sunday', time: 'Closed' },
              ].map(({ day, time }) => (
                <li key={day} className="flex flex-col">
                  <span className="text-white/65 text-xs font-sans">{day}</span>
                  <span className="text-white/45 text-xs font-sans">{time}</span>
                </li>
              ))}
            </ul>

            <h4 className="text-white text-xs font-sans font-semibold tracking-wider uppercase mb-3">
              Payment Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {payments.map((payment) => (
                <span
                  key={payment}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/55"
                >
                  <CreditCard size={11} className="text-white" />
                  {payment}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/35 text-xs font-sans">
            &copy; {new Date().getFullYear()} St. Joseph Granite. All rights reserved.
          </p>
          <p className="text-white/35 text-xs font-sans">
            We help make your dreams come true.
          </p>
        </div>
      </div>
    </footer>
  );
}
