import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const inputClass =
  'w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm font-sans text-[#171717] placeholder-[#737373] focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition-all duration-200';

const selectClass =
  'w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm font-sans text-[#171717] focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition-all duration-200 appearance-none cursor-pointer';

export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      project_type: String(formData.get('project_type') || '').trim(),
      stone_type: String(formData.get('stone_type') || '').trim(),
      measurements: String(formData.get('measurements') || '').trim(),
      timeline: String(formData.get('timeline') || '').trim(),
      comments: String(formData.get('comments') || '').trim(),
      photo_names: selectedFiles.map((file) => file.name),
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from('estimate_requests').insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError('We could not send your request right now. Please call (774) 433-2580.');
      return;
    }

    const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: { lead: payload },
    });

    if (whatsappError) {
      console.warn('WhatsApp notification failed:', whatsappError.message);
    }

    const { error: emailError } = await supabase.functions.invoke('send-email-notification', {
      body: { lead: payload },
    });

    if (emailError) {
      console.warn('Email notification failed:', emailError.message);
    }

    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="bg-white rounded-lg shadow-2xl p-7 lg:p-8 w-full max-w-[480px] mx-auto lg:mx-0 border border-[#E5E7EB]"
    >
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <CheckCircle size={52} className="text-[#B91C1C] mb-5" />
          <h3 className="font-serif text-2xl text-[#171717] mb-3">Thank You!</h3>
          <p className="text-[#5F5F5F] font-sans text-sm leading-relaxed">
            We appreciate you contacting us. One of our colleagues will get back in touch soon.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px flex-1 bg-[#B91C1C]/30" />
              <span className="text-[#B91C1C] text-[10px] tracking-[0.2em] font-sans font-medium uppercase">Free Estimate</span>
              <div className="h-px flex-1 bg-[#B91C1C]/30" />
            </div>
            <h2 className="font-serif text-xl text-[#171717] text-center mt-2">Request Your FREE Estimate</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input required name="name" type="text" placeholder="Name" className={inputClass} />
              <input required name="phone" type="tel" placeholder="Phone" className={inputClass} />
            </div>
            <input required name="email" type="email" placeholder="Email" className={inputClass} />
            <input name="address" type="text" placeholder="Address or City" className={inputClass} />

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select required name="project_type" className={selectClass} defaultValue="">
                  <option value="" disabled>Project Type</option>
                  <option>Kitchen Countertop</option>
                  <option>Bathroom Vanity</option>
                  <option>Outdoor Kitchen</option>
                  <option>Fireplace or Firepit</option>
                  <option>Remnant Countertop</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">v</div>
              </div>
              <div className="relative">
                <select required name="stone_type" className={selectClass} defaultValue="">
                  <option value="" disabled>Stone Type</option>
                  <option>Granite</option>
                  <option>Quartz</option>
                  <option>Marble</option>
                  <option>Quartzite</option>
                  <option>Porcelain</option>
                  <option>Not Sure Yet</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">v</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input name="measurements" type="text" placeholder="Measurements" className={inputClass} />
              <div className="relative">
                <select name="timeline" className={selectClass} defaultValue="">
                  <option value="" disabled>Timeline</option>
                  <option>ASAP</option>
                  <option>Within 30 Days</option>
                  <option>1-3 Months</option>
                  <option>Just Researching</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">v</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-[#E5E7EB] hover:border-[#B91C1C] rounded-lg px-4 py-3 text-sm font-sans text-[#737373] hover:text-[#B91C1C] flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Upload size={15} />
              {fileName || 'Upload Project Photos (optional)'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedFiles(files);
                setFileName(files.length > 1 ? `${files.length} files selected` : files[0]?.name || '');
              }}
            />

            <textarea
              name="comments"
              rows={3}
              placeholder="Tell us about your project..."
              className={`${inputClass} resize-none`}
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-xs font-sans text-[#B91C1C]">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#171717] hover:bg-[#B91C1C] disabled:bg-[#737373] disabled:cursor-not-allowed text-white font-sans font-semibold text-sm tracking-widest py-4 rounded-lg transition-all duration-300 mt-1"
            >
              {submitting ? 'SENDING...' : 'GET MY FREE ESTIMATE'}
            </motion.button>

            <p className="text-center text-[11px] text-[#737373] font-sans">
              Or call St. Joseph Granite at (774) 433-2580.
            </p>
          </form>
        </>
      )}
    </motion.div>
  );
}
