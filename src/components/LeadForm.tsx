import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, Mail, Phone, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

const inputClass =
  'w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm font-sans text-[#171717] placeholder-[#737373] focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition-all duration-200';

const selectClass =
  'w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm font-sans text-[#171717] focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition-all duration-200 appearance-none cursor-pointer';

const fieldErrorClass = 'mt-1 text-[11px] font-sans text-[#B91C1C]';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  project_type: string;
  stone_type: string;
  measurements: string;
  timeline: string;
  comments: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: '',
  phone: '',
  email: '',
  address: '',
  project_type: '',
  stone_type: '',
  measurements: '',
  timeline: '',
  comments: '',
};

function phoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatPhone(value: string) {
  const digits = phoneDigits(value).slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validate(values: FormValues) {
  const errors: FieldErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (phoneDigits(values.phone).length !== 10) {
    errors.phone = 'Enter a 10-digit phone number.';
  }

  if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.project_type) {
    errors.project_type = 'Choose a project type.';
  }

  if (!values.stone_type) {
    errors.stone_type = 'Choose a stone type.';
  }

  return errors;
}

export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const progress = useMemo(() => {
    const required = [
      values.name.trim().length >= 2,
      phoneDigits(values.phone).length === 10,
      isValidEmail(values.email),
      Boolean(values.project_type),
      Boolean(values.stone_type),
    ];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [values]);

  const updateValue = (field: keyof FormValues, value: string) => {
    const nextValue = field === 'phone' ? formatPhone(value) : value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate(values);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError('Please review the highlighted fields before sending.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      project_type: values.project_type.trim(),
      stone_type: values.stone_type.trim(),
      measurements: values.measurements.trim(),
      timeline: values.timeline.trim(),
      comments: values.comments.trim(),
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

    setSubmittedName(payload.name);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="bg-white rounded-lg shadow-2xl p-7 lg:p-8 w-full max-w-[480px] mx-auto lg:mx-0 border border-[#E5E7EB]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#B91C1C]/10">
            <CheckCircle size={34} className="text-[#B91C1C]" />
          </div>
          <p className="text-[#B91C1C] text-[10px] tracking-[0.24em] font-sans font-semibold uppercase mb-3">
            Request Received
          </p>
          <h3 className="font-serif text-3xl text-[#171717] mb-3">
            Thank you{submittedName ? `, ${submittedName.split(' ')[0]}` : ''}.
          </h3>
          <p className="text-[#5F5F5F] font-sans text-sm leading-relaxed mb-6">
            We received your estimate request. Our team will review your project details and contact you during business hours.
          </p>

          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
              <Clock size={17} className="text-[#B91C1C]" />
              <div>
                <p className="text-sm font-semibold text-[#171717]">Business hours</p>
                <p className="text-xs text-[#737373]">Mon-Fri 9:00 am - 5:00 pm, Sat 9:00 am - 2:00 pm</p>
              </div>
            </div>
            <a href="tel:7744332580" className="flex items-center gap-3 rounded-lg border border-[#B91C1C]/25 bg-[#B91C1C]/5 px-4 py-3 hover:bg-[#B91C1C]/10 transition">
              <Phone size={17} className="text-[#B91C1C]" />
              <div>
                <p className="text-sm font-semibold text-[#171717]">Need faster help?</p>
                <p className="text-xs text-[#B91C1C]">(774) 433-2580</p>
              </div>
              <ArrowRight size={15} className="ml-auto text-[#B91C1C]" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="bg-white rounded-lg shadow-2xl p-7 lg:p-8 w-full max-w-[480px] mx-auto lg:mx-0 border border-[#E5E7EB]"
    >
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-px flex-1 bg-[#B91C1C]/30" />
          <span className="text-[#B91C1C] text-[10px] tracking-[0.2em] font-sans font-medium uppercase">Free Estimate</span>
          <div className="h-px flex-1 bg-[#B91C1C]/30" />
        </div>
        <h2 className="font-serif text-xl text-[#171717] text-center mt-2">Request Your FREE Estimate</h2>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[11px] font-sans text-[#737373]">
            <span>Form progress</span>
            <span className="font-semibold text-[#B91C1C]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
            <motion.div
              className="h-full rounded-full bg-[#B91C1C]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              required
              name="name"
              type="text"
              placeholder="Name"
              className={`${inputClass} ${fieldErrors.name ? 'border-[#B91C1C]' : ''}`}
              value={values.name}
              onChange={(e) => updateValue('name', e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && <p className={fieldErrorClass}>{fieldErrors.name}</p>}
          </div>
          <div>
            <input
              required
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="Phone"
              className={`${inputClass} ${fieldErrors.phone ? 'border-[#B91C1C]' : ''}`}
              value={values.phone}
              onChange={(e) => updateValue('phone', e.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone && <p className={fieldErrorClass}>{fieldErrors.phone}</p>}
          </div>
        </div>

        <div>
          <input
            required
            name="email"
            type="email"
            placeholder="Email"
            className={`${inputClass} ${fieldErrors.email ? 'border-[#B91C1C]' : ''}`}
            value={values.email}
            onChange={(e) => updateValue('email', e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && <p className={fieldErrorClass}>{fieldErrors.email}</p>}
        </div>

        <input
          name="address"
          type="text"
          placeholder="Address or City"
          className={inputClass}
          value={values.address}
          onChange={(e) => updateValue('address', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="relative">
              <select
                required
                name="project_type"
                className={`${selectClass} ${fieldErrors.project_type ? 'border-[#B91C1C]' : ''}`}
                value={values.project_type}
                onChange={(e) => updateValue('project_type', e.target.value)}
                aria-invalid={Boolean(fieldErrors.project_type)}
              >
                <option value="" disabled>Project Type</option>
                <option>Kitchen Countertop</option>
                <option>Bathroom Vanity</option>
                <option>Outdoor Kitchen</option>
                <option>Fireplace or Firepit</option>
                <option>Remnant Countertop</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">v</div>
            </div>
            {fieldErrors.project_type && <p className={fieldErrorClass}>{fieldErrors.project_type}</p>}
          </div>
          <div>
            <div className="relative">
              <select
                required
                name="stone_type"
                className={`${selectClass} ${fieldErrors.stone_type ? 'border-[#B91C1C]' : ''}`}
                value={values.stone_type}
                onChange={(e) => updateValue('stone_type', e.target.value)}
                aria-invalid={Boolean(fieldErrors.stone_type)}
              >
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
            {fieldErrors.stone_type && <p className={fieldErrorClass}>{fieldErrors.stone_type}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="measurements"
            type="text"
            placeholder="Measurements"
            className={inputClass}
            value={values.measurements}
            onChange={(e) => updateValue('measurements', e.target.value)}
          />
          <div className="relative">
            <select
              name="timeline"
              className={selectClass}
              value={values.timeline}
              onChange={(e) => updateValue('timeline', e.target.value)}
            >
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
          value={values.comments}
          onChange={(e) => updateValue('comments', e.target.value)}
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

        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#737373] font-sans">
          <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#FAFAFA] px-2 py-2">
            <CheckCircle size={12} className="text-[#B91C1C]" /> Free estimates
          </span>
          <a href="tel:7744332580" className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#FAFAFA] px-2 py-2 hover:text-[#B91C1C] transition">
            <Mail size={12} className="text-[#B91C1C]" /> (774) 433-2580
          </a>
        </div>
      </form>
    </motion.div>
  );
}
