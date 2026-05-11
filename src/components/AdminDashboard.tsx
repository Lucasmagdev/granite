import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AlertCircle,
  Award,
  BarChart2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Globe,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Send,
  Smartphone,
  Star,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
type InterestLevel = '1' | '2' | '3';
type InterestFilter = 'all' | InterestLevel | 'none';
type ActiveTab = 'clientes' | 'formularios' | 'analytics';

type PageView = {
  id: string;
  created_at: string;
  page: string | null;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  language: string | null;
  screen_width: number | null;
  country: string | null;
  city: string | null;
  session_id: string | null;
};

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  project_type: string;
  stone_type: string;
  measurements: string | null;
  timeline: string | null;
  comments: string | null;
  photo_names: string[] | null;
  contacted: boolean | null;
  contacted_at: string | null;
  status: LeadStatus | null;
  notes: string | null;
  interest_level: InterestLevel | null;
};

type Toast = { id: number; message: string; type: 'success' | 'error' | 'warning' };

const emptyLead = {
  name: '', phone: '', email: '', address: '',
  project_type: 'Kitchen Countertop', stone_type: 'Granite',
  measurements: '', timeline: 'ASAP', comments: '', notes: '',
};

const defaultBulkMessage = [
  'Hi {nome}, this is St. Joseph Granite.',
  '',
  'We are reaching out about your {projeto} project with {pedra}.',
  '',
  'If you have any questions or want to move forward, call us at (774) 498-9863.',
].join('\n');

const statusConfig: Record<LeadStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  new:       { label: 'Novo',       bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400' },
  contacted: { label: 'Contatado',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400' },
  quoted:    { label: 'Orçado',     bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-400' },
  won:       { label: 'Ganho',      bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-400' },
  lost:      { label: 'Perdido',    bg: 'bg-gray-100',  text: 'text-gray-500',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const interestConfig: Record<InterestLevel, { label: string; emoji: string; activeBg: string; activeText: string; activeBorder: string; cardTint: string; cardRing: string; avatarBg: string; avatarText: string }> = {
  '1': { label: 'Nivel 1', emoji: '1', activeBg: 'bg-blue-100', activeText: 'text-blue-700', activeBorder: 'border-blue-300', cardTint: 'bg-blue-50/50 border-blue-200', cardRing: 'ring-blue-200', avatarBg: 'bg-blue-100', avatarText: 'text-blue-700' },
  '2': { label: 'Nivel 2', emoji: '2', activeBg: 'bg-amber-100', activeText: 'text-amber-700', activeBorder: 'border-amber-300', cardTint: 'bg-amber-50/50 border-amber-200', cardRing: 'ring-amber-200', avatarBg: 'bg-amber-100', avatarText: 'text-amber-700' },
  '3': { label: 'Nivel 3', emoji: '3', activeBg: 'bg-red-100', activeText: 'text-red-700', activeBorder: 'border-red-300', cardTint: 'bg-red-50/55 border-red-200', cardRing: 'ring-red-200', avatarBg: 'bg-red-100', avatarText: 'text-red-700' },
};

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#171717] outline-none transition focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/10';
const adminLoginEmail = 'admin@stjosephgranite.local';
const adminLoginUsername = 'admingranite';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJhXNxUndu5IkR_FceUespc40';

function buildCompletionMessage(lead: Lead) {
  return [
    `Hi ${lead.name}! 🎉`,
    '',
    `Your ${lead.project_type} project with St. Joseph Granite is now complete!`,
    '',
    'We truly appreciate your trust. If you love the result, a quick Google review would mean the world to us:',
    '',
    `⭐ ${GOOGLE_REVIEW_URL}`,
    '',
    '📞 (774) 498-9863',
    '',
    'Thank you for choosing St. Joseph Granite!',
  ].join('\n');
}

function normalizeWhatsAppNumber(phone?: string | null) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeInterestLevel(value?: string | null): InterestLevel | null {
  if (value === '1' || value === '2' || value === '3') return value;
  if (value === 'cold') return '1';
  if (value === 'warm') return '2';
  if (value === 'hot') return '3';
  return null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const normalizedLogin = username.trim().toLowerCase();
    const email = normalizedLogin === adminLoginUsername ? adminLoginEmail : username.trim();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError('E-mail ou senha inválidos.');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#7F1D1D] to-[#B91C1C] px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <Award size={32} className="text-white" />
          </div>
          <h1 className="font-serif text-4xl text-white">St. Joseph Granite</h1>
          <p className="text-white/60 mt-2 text-sm">Painel Administrativo</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/30">
          <div className="space-y-3">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required type="text" placeholder="Usuario" className={`${inputClass} pl-9`} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <input required type="password" placeholder="Senha" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#B91C1C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7F1D1D] disabled:opacity-50 transition">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
    </span>
  );
}

function InterestBadge({ level }: { level: InterestLevel }) {
  const cfg = interestConfig[level];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function ToastList({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-xl text-sm font-medium ${t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-[#B91C1C] text-white' : 'bg-amber-500 text-white'}`}>
          <span className="shrink-0 mt-0.5">{t.type === 'success' ? <CheckCircle size={15} /> : t.type === 'error' ? <AlertCircle size={15} /> : <Clock size={15} />}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-75 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function CompletionModal({ lead, onConfirm, onCancel, loading }: { lead: Lead; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><Award size={22} /></div>
          <div>
            <h3 className="font-semibold text-[#171717]">Marcar Projeto como Concluído</h3>
            <p className="text-xs text-gray-400">O cliente será notificado via WhatsApp e e-mail</p>
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Notificações para {lead.name}</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100"><MessageCircle size={13} className="text-emerald-600" /></div>
              WhatsApp → <span className="font-semibold">{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-100"><Mail size={13} className="text-blue-600" /></div>
              E-mail → <span className="font-semibold">{lead.email}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Enviando...</> : <><Award size={14} /> Confirmar e Enviar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template system ─────────────────────────────────────────────────────────

type MessageTemplate = {
  id: string;
  name: string;
  message: string;
  subject: string;
  isCustom?: boolean;
};

const TEMPLATES_KEY = 'st_joseph_msg_templates';

const BUILTIN_TEMPLATES: MessageTemplate[] = [
  {
    id: 'followup',
    name: '📞 Follow-up',
    message: 'Hi {nome}! This is St. Joseph Granite.\n\nWe wanted to follow up on your {projeto} project with {pedra}. Are you still interested? We\'d love to help!\n\n📞 (774) 498-9863',
    subject: 'Following up on your {projeto} project — St. Joseph Granite',
  },
  {
    id: 'quote',
    name: '📋 Orçamento Pronto',
    message: 'Hi {nome}! Your quote for the {projeto} project with {pedra} is ready.\n\nContact us to review the details and move forward.\n\n📞 (774) 498-9863',
    subject: 'Your {projeto} quote is ready — St. Joseph Granite',
  },
  {
    id: 'promo',
    name: '🎉 Promoção',
    message: 'Hi {nome}! 🎉 Special offer this week at St. Joseph Granite.\n\nContact us about your {projeto} project with {pedra} and ask about our current deals!\n\n📞 (774) 498-9863',
    subject: 'Special offer — St. Joseph Granite',
  },
  {
    id: 'reminder',
    name: '🔔 Lembrete',
    message: 'Hi {nome}, a quick reminder from St. Joseph Granite.\n\nYour {projeto} project with {pedra} is waiting — whenever you\'re ready, just give us a call!\n\n📞 (774) 498-9863',
    subject: 'Reminder about your {projeto} project',
  },
];

function loadCustomTemplates(): MessageTemplate[] {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]'); }
  catch { return []; }
}

function persistCustomTemplates(templates: MessageTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

function applyVars(text: string, lead: Pick<Lead, 'name' | 'project_type' | 'stone_type'>) {
  return text
    .replace(/{nome}/g, lead.name)
    .replace(/{projeto}/g, lead.project_type)
    .replace(/{pedra}/g, lead.stone_type);
}

// ─── WhatsApp Preview ────────────────────────────────────────────────────────

function WhatsAppPreview({ message, lead }: { message: string; lead: Pick<Lead, 'name' | 'project_type' | 'stone_type'> }) {
  const rendered = applyVars(message, lead);
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return (
    <div className="h-full flex flex-col bg-[#ECE5DD] rounded-xl overflow-hidden border border-gray-200 min-h-0">
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">SJ</div>
        <div>
          <p className="text-white text-sm font-semibold">St. Joseph Granite</p>
          <p className="text-white/70 text-xs">Business Account</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex justify-start">
          <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">{rendered}</p>
            <p className="text-right text-[10px] text-gray-400 mt-1">{time} ✓✓</p>
          </div>
        </div>
      </div>
      <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2 shrink-0">
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-gray-400">Type a message</div>
        <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center">
          <Send size={13} className="text-white ml-0.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Email Preview ───────────────────────────────────────────────────────────

function EmailPreview({ message, subject, lead }: { message: string; subject: string; lead: Pick<Lead, 'name' | 'email' | 'project_type' | 'stone_type'> }) {
  const renderedMsg = applyVars(message, lead);
  const renderedSubj = applyVars(subject, lead);
  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 min-h-0">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 space-y-1 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 w-14 shrink-0">De:</span>
          <span className="text-gray-700 font-medium truncate">St. Joseph Granite &lt;info@stjosephgranite.com&gt;</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 w-14 shrink-0">Para:</span>
          <span className="text-gray-700 truncate">{lead.name} &lt;{lead.email}&gt;</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 w-14 shrink-0">Assunto:</span>
          <span className="text-gray-800 font-semibold truncate">{renderedSubj || '(sem assunto)'}</span>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4 pb-4 border-b border-gray-100">
            <p className="text-[#B91C1C] font-serif text-lg font-bold">St. Joseph Granite</p>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{renderedMsg}</p>
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            <p>St. Joseph Granite | (774) 498-9863</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BulkMessageModal (wizard) ───────────────────────────────────────────────

const MOCK_LEAD = {
  name: 'João Silva', email: 'joao@exemplo.com',
  project_type: 'Kitchen Countertop', stone_type: 'Granite',
} as Lead;

function BulkMessageModal({
  selectedLeads, onClose, onSendWhatsApp, onSendEmail, loading,
  message, setMessage, subject, setSubject,
}: {
  selectedLeads: Lead[];
  onClose: () => void;
  onSendWhatsApp: () => void;
  onSendEmail: () => void;
  loading: boolean;
  message: string;
  setMessage: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
}) {
  const [step, setStep] = useState<'templates' | 'compose'>('templates');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [customTemplates, setCustomTemplates] = useState<MessageTemplate[]>(loadCustomTemplates);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const previewLead = selectedLeads[0] ?? MOCK_LEAD;
  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];

  function pickTemplate(tpl: MessageTemplate) {
    setMessage(tpl.message);
    setSubject(tpl.subject);
    setStep('compose');
  }

  function saveCurrentTemplate() {
    if (!saveName.trim()) return;
    const newTpl: MessageTemplate = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      message,
      subject,
      isCustom: true,
    };
    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    persistCustomTemplates(updated);
    setSaveName('');
    setShowSaveInput(false);
  }

  function deleteCustomTemplate(id: string) {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    persistCustomTemplates(updated);
  }

  const ChannelToggle = ({ compact }: { compact?: boolean }) => (
    <div className={`flex gap-2 p-1 bg-gray-100 rounded-xl ${compact ? 'mb-4' : 'mb-5'}`}>
      <button
        onClick={() => setChannel('whatsapp')}
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-semibold transition ${channel === 'whatsapp' ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <MessageCircle size={compact ? 13 : 15} /> WhatsApp
      </button>
      <button
        onClick={() => setChannel('email')}
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-semibold transition ${channel === 'email' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <Mail size={compact ? 13 : 15} /> E-mail
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className={`w-full ${step === 'compose' ? 'max-w-4xl' : 'max-w-lg'} rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-200`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 'compose' && (
              <button onClick={() => setStep('templates')} disabled={loading} className="text-white/70 hover:text-white transition mr-1">
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="font-semibold text-white">
                {step === 'templates' ? 'Escolher Template' : 'Editar & Prévia'}
              </h3>
              <p className="text-xs text-white/70 mt-0.5">{selectedLeads.length} cliente{selectedLeads.length !== 1 ? 's' : ''} selecionado{selectedLeads.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        {/* Step 1: Template picker */}
        {step === 'templates' && (
          <div className="p-6">
            <ChannelToggle />

            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">Templates</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Blank */}
              <button
                onClick={() => { setMessage(defaultBulkMessage); setSubject('Message from St. Joseph Granite'); setStep('compose'); }}
                className="rounded-xl border-2 border-dashed border-gray-200 p-3 text-left hover:border-[#B91C1C]/40 hover:bg-red-50/30 transition group"
              >
                <p className="text-sm font-semibold text-gray-500 group-hover:text-[#B91C1C]">✏️ Mensagem livre</p>
                <p className="text-xs text-gray-400 mt-0.5">Começar do zero</p>
              </button>

              {allTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => pickTemplate(tpl)}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-left hover:border-[#B91C1C]/40 hover:bg-red-50/30 transition group relative"
                >
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-[#B91C1C] pr-5">{tpl.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{tpl.message.slice(0, 70)}...</p>
                  {tpl.isCustom && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(tpl.id); }}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"
                    >
                      <X size={12} />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Compose + Preview */}
        {step === 'compose' && (
          <div className="flex" style={{ height: '540px' }}>

            {/* Left: Editor */}
            <div className="w-1/2 p-5 border-r border-gray-100 flex flex-col overflow-auto">
              <ChannelToggle compact />

              {/* Recipients */}
              <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-2.5 shrink-0">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1.5">Destinatários</p>
                <div className="flex flex-wrap gap-1">
                  {selectedLeads.slice(0, 5).map((l) => (
                    <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-700">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#B91C1C]/10 text-[#B91C1C] text-[8px] font-bold flex items-center justify-center">{initials(l.name)}</span>
                      {l.name.split(' ')[0]}
                    </span>
                  ))}
                  {selectedLeads.length > 5 && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">+{selectedLeads.length - 5}</span>}
                </div>
              </div>

              {/* Subject (email only) */}
              {channel === 'email' && (
                <div className="mb-3 shrink-0">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-1 block">Assunto</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="Assunto do e-mail" />
                </div>
              )}

              {/* Message textarea */}
              <div className="flex-1 flex flex-col min-h-0 mb-2">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-1 block shrink-0">Mensagem</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass} resize-none flex-1 min-h-0`}
                  placeholder="Olá {nome}..."
                />
              </div>
              <p className="text-xs text-gray-400 mb-3 shrink-0">Vars: <code className="bg-gray-100 px-1 rounded">{'{nome}'}</code> <code className="bg-gray-100 px-1 rounded">{'{projeto}'}</code> <code className="bg-gray-100 px-1 rounded">{'{pedra}'}</code></p>

              {/* Save template */}
              <div className="mb-3 shrink-0">
                {!showSaveInput ? (
                  <button onClick={() => setShowSaveInput(true)} className="text-xs text-gray-400 hover:text-[#B91C1C] flex items-center gap-1 transition">
                    <Save size={11} /> Salvar como template
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentTemplate(); if (e.key === 'Escape') setShowSaveInput(false); }}
                      placeholder="Nome do template..."
                      className={`${inputClass} text-xs py-1.5`}
                    />
                    <button onClick={saveCurrentTemplate} disabled={!saveName.trim()} className="rounded-xl bg-[#B91C1C] px-3 text-white hover:bg-[#7F1D1D] disabled:opacity-50 transition">
                      <Save size={12} />
                    </button>
                    <button onClick={() => setShowSaveInput(false)} className="rounded-xl border border-gray-200 px-2 text-gray-500 hover:bg-gray-50 transition">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Send */}
              <button
                onClick={channel === 'whatsapp' ? onSendWhatsApp : onSendEmail}
                disabled={loading || !message.trim()}
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 ${channel === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading
                  ? <><RefreshCw size={14} className="animate-spin" /> Enviando...</>
                  : <><Send size={14} /> Enviar para {selectedLeads.length} cliente{selectedLeads.length !== 1 ? 's' : ''}</>}
              </button>
            </div>

            {/* Right: Preview */}
            <div className="w-1/2 p-5 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <Eye size={13} className="text-gray-400" />
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                  Prévia — {previewLead.name.split(' ')[0]}
                </p>
              </div>
              <div className="flex-1 min-h-0">
                {channel === 'whatsapp'
                  ? <WhatsAppPreview message={message} lead={previewLead} />
                  : <EmailPreview message={message} subject={subject} lead={previewLead} />}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// ─── Lead Card (Formulários tab) ─────────────────────────────────────────────

function LeadCard({
  lead, selected, onSelect, onInterest, onNoteBlur, onDelete, onComplete,
}: {
  lead: Lead;
  selected: boolean;
  onSelect: () => void;
  onInterest: (level: InterestLevel | null) => void;
  onNoteBlur: (notes: string) => void;
  onDelete: () => void;
  onComplete: () => void;
}) {
  const [notes, setNotes] = useState(lead.notes || '');
  const leadStatus = (lead.status || (lead.contacted ? 'contacted' : 'new')) as LeadStatus;
  const isWon = leadStatus === 'won';

  const interestStyle = lead.interest_level ? interestConfig[lead.interest_level] : null;

  return (
    <div className={`rounded-2xl border shadow-sm flex flex-col transition-all overflow-hidden ${
      isWon
        ? 'bg-emerald-50/75 border-emerald-200 ring-2 ring-emerald-200'
        : selected
          ? 'bg-white border-[#B91C1C] ring-2 ring-[#B91C1C]/20'
          : interestStyle
            ? `${interestStyle.cardTint} ${interestStyle.cardRing}`
            : 'bg-white border-gray-100 hover:border-gray-200'
    }`}>
      {isWon && (
        <div className="bg-emerald-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
          Projeto Concluido
        </div>
      )}
      {/* Card header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 shrink-0 rounded-2xl grid place-items-center text-sm font-bold ${
              isWon
                ? 'bg-emerald-100 text-emerald-700'
                : interestStyle
                  ? `${interestStyle.avatarBg} ${interestStyle.avatarText}`
                  : 'bg-[#B91C1C]/10 text-[#B91C1C]'
            }`}>
              {initials(lead.name)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#171717] text-sm leading-tight truncate">{lead.name}</p>
              <div className="mt-1">
                <StatusBadge status={leadStatus} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lead.interest_level && <InterestBadge level={lead.interest_level} />}
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              className="h-4 w-4 rounded border-gray-300 text-[#B91C1C] accent-[#B91C1C] cursor-pointer"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#B91C1C] transition">
            <Phone size={11} className="text-gray-400 shrink-0" /> {lead.phone}
          </a>
          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#B91C1C] transition">
            <Mail size={11} className="text-gray-400 shrink-0" /> <span className="truncate">{lead.email}</span>
          </a>
          {lead.address && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={11} className="text-gray-400 shrink-0" /> {lead.address}
            </div>
          )}
        </div>
      </div>

      {/* Project */}
      <div className="mx-4 mb-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
        <p className="text-xs font-semibold text-gray-700">{lead.project_type}</p>
        <p className="text-xs text-gray-400 mt-0.5">{lead.stone_type}{lead.timeline ? ` · ${lead.timeline}` : ''}</p>
      </div>

      {/* Interest level */}
      <div className="px-4 mb-3">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">Nível de interesse</p>
        <div className="flex gap-1.5">
          {(Object.entries(interestConfig) as [InterestLevel, typeof interestConfig[InterestLevel]][]).map(([level, cfg]) => {
            const active = lead.interest_level === level;
            return (
              <button
                key={level}
                onClick={() => onInterest(active ? null : level)}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-xs font-semibold transition ${
                  active
                    ? `${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder}`
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="px-4 mb-3">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5 flex items-center gap-1">
          <FileText size={10} /> Observações
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => onNoteBlur(e.target.value)}
          rows={2}
          placeholder="Anotações sobre este cliente..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-[#171717] outline-none transition focus:border-[#B91C1C] focus:bg-white resize-none"
        />
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <a
            href={`https://wa.me/${normalizeWhatsAppNumber(lead.phone)}`}
            target="_blank" rel="noreferrer"
            title="Abrir WhatsApp"
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition"
          >
            <MessageCircle size={14} />
          </a>
          <a
            href={`mailto:${lead.email}`}
            title="Enviar e-mail"
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
          >
            <Mail size={14} />
          </a>
          {!isWon && (
            <button
              onClick={onComplete}
              title="Marcar como concluído"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition"
            >
              <Award size={14} />
            </button>
          )}
          {isWon && (
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-500">
              <CheckCircle size={14} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={10} /> {formatDate(lead.created_at)}
          </p>
          <button
            onClick={onDelete}
            title="Excluir cliente"
            className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-red-50 hover:text-[#B91C1C] hover:border-red-200 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────

function parseReferrerLabel(referrer: string | null): string {
  if (!referrer) return 'Direto';
  try {
    const host = new URL(referrer).hostname.replace('www.', '');
    if (host.includes('google')) return 'Google';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('facebook') || host.includes('fb.')) return 'Facebook';
    if (host.includes('whatsapp')) return 'WhatsApp';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('tiktok')) return 'TikTok';
    return host;
  } catch {
    return 'Direto';
  }
}

function groupBy<T>(arr: T[], key: (item: T) => string): { label: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const item of arr) {
    const k = key(item) || 'Desconhecido';
    map[k] = (map[k] || 0) + 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-gray-600 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-gray-700">{count}</span>
    </div>
  );
}

function AnalyticsTab({ views, loading, onRefresh }: { views: PageView[]; loading: boolean; onRefresh: () => void }) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

  const today = views.filter((v) => new Date(v.created_at).getTime() >= todayStart).length;
  const thisWeek = views.filter((v) => new Date(v.created_at).getTime() >= weekStart).length;
  const thisMonth = views.length;
  const uniqueVisitors = new Set(views.map((v) => v.session_id).filter(Boolean)).size;

  const sources = groupBy(views, (v) => parseReferrerLabel(v.referrer));
  const devices = groupBy(views, (v) => v.device || 'Desconhecido');
  const browsers = groupBy(views, (v) => v.browser || 'Desconhecido');
  const cities = groupBy(views.filter((v) => v.city), (v) => v.city!).slice(0, 6);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 p-16 text-center text-gray-400 text-sm shadow-sm">
        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gray-300" />
        Carregando analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visitas hoje', value: today, Icon: TrendingUp, color: 'text-[#B91C1C]', bg: 'bg-red-100' },
          { label: 'Últimos 7 dias', value: thisWeek, Icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Últimos 30 dias', value: thisMonth, Icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Visitantes únicos', value: uniqueVisitors, Icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">{label}</p>
              <div className={`grid h-8 w-8 place-items-center rounded-lg ${bg}`}><Icon size={15} className={color} /></div>
            </div>
            <p className="font-serif text-4xl text-[#171717]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sources */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[#171717]">Origem do tráfego</h3>
            <Globe size={15} className="text-gray-300" />
          </div>
          {sources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sem dados ainda</p>
          ) : (
            <div className="space-y-3">
              {sources.slice(0, 6).map((s) => (
                <BarRow key={s.label} label={s.label} count={s.count} total={thisMonth} color="bg-[#B91C1C]" />
              ))}
            </div>
          )}
        </div>

        {/* Devices + Browsers */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-lg text-[#171717]">Dispositivos</h3>
              <Smartphone size={15} className="text-gray-300" />
            </div>
            {devices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">Sem dados</p>
            ) : (
              <div className="space-y-3">
                {devices.map((d) => (
                  <BarRow key={d.label} label={d.label} count={d.count} total={thisMonth} color="bg-violet-500" />
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Navegadores</h4>
            {browsers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">Sem dados</p>
            ) : (
              <div className="space-y-3">
                {browsers.slice(0, 4).map((b) => (
                  <BarRow key={b.label} label={b.label} count={b.count} total={thisMonth} color="bg-blue-400" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cities */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-[#171717]">Top cidades</h3>
            <MapPin size={15} className="text-gray-300" />
          </div>
          {cities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sem dados de localização ainda</p>
          ) : (
            <div className="space-y-3">
              {cities.map((c, i) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <BarRow label={c.label} count={c.count} total={thisMonth} color="bg-emerald-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent visits */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#171717]">Visitas recentes</h3>
          <button onClick={onRefresh} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw size={11} /> Atualizar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Quando</th>
                <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Origem</th>
                <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Dispositivo</th>
                <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Navegador</th>
                <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Cidade</th>
                <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">País</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {views.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">Nenhuma visita registrada nos últimos 30 dias.</td></tr>
              ) : views.slice(0, 20).map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(v.created_at)}</td>
                  <td className="px-5 py-3 text-xs text-gray-700 font-medium">{parseReferrerLabel(v.referrer)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      {v.device === 'Mobile' ? <Smartphone size={11} /> : <Monitor size={11} />}
                      {v.device || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{v.browser || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{v.city || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{v.country || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);

  // Clientes tab
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState(emptyLead);
  const [showNewLead, setShowNewLead] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [instanceStatus, setInstanceStatus] = useState('checking');
  const [completingLead, setCompletingLead] = useState<Lead | null>(null);

  // Formulários tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('clientes');
  const [interestFilter, setInterestFilter] = useState<InterestFilter>('all');

  // Analytics tab
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMessage, setBulkMessage] = useState(defaultBulkMessage);
  const [bulkSubject, setBulkSubject] = useState('Mensagem da St. Joseph Granite');

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  };
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthChecked(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('estimate_requests').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (error) { addToast('Não foi possível carregar os clientes.', 'error'); return; }
    setLeads(((data || []) as Lead[]).map((lead) => ({
      ...lead,
      interest_level: normalizeInterestLevel(lead.interest_level),
    })));
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });
    setAnalyticsLoading(false);
    if (data) setPageViews(data as PageView[]);
  };

  const fetchEvolutionStatus = async () => {
    const { data, error } = await supabase.functions.invoke('evolution-instance-status');
    setInstanceStatus(error ? 'unavailable' : data?.connectionStatus || 'unknown');
  };

  const fetchQrCode = async () => {
    setQrCode('');
    const { data, error } = await supabase.functions.invoke('evolution-connect-qr');
    if (error) { addToast('Não foi possível carregar o QR Code.', 'error'); return; }
    setQrCode(data?.base64 || '');
    await fetchEvolutionStatus();
  };

  useEffect(() => {
    if (!session) return;
    fetchLeads();
    fetchEvolutionStatus();
  }, [session]);

  useEffect(() => {
    if (activeTab === 'analytics' && session) fetchAnalytics();
  }, [activeTab, session]);

  const filteredLeads = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const status = lead.status || (lead.contacted ? 'contacted' : 'new');
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch = !normalized || [lead.name, lead.phone, lead.email, lead.address, lead.project_type, lead.stone_type]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(normalized));
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const filteredFormLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (interestFilter === 'all') return true;
      if (interestFilter === 'none') return !lead.interest_level;
      return lead.interest_level === interestFilter;
    });
  }, [leads, interestFilter]);

  const visibleSelectionLeads = useMemo(
    () => (activeTab === 'clientes' ? filteredLeads : filteredFormLeads),
    [activeTab, filteredLeads, filteredFormLeads],
  );

  const stats = useMemo(() => ({
    total: leads.length,
    newCount: leads.filter((l) => !l.contacted && (!l.status || l.status === 'new')).length,
    contacted: leads.filter((l) => l.contacted || l.status === 'contacted').length,
    won: leads.filter((l) => l.status === 'won').length,
  }), [leads]);

  const selectedLeads = useMemo(() => leads.filter((l) => selectedIds.has(l.id)), [leads, selectedIds]);

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setSaving(true);
    const { error } = await supabase.from('estimate_requests').update(updates).eq('id', id);
    setSaving(false);
    if (error) { addToast('Não foi possível atualizar o cliente.', 'error'); return; }
    setLeads((items) => items.map((l) => (l.id === id ? { ...l, ...updates, interest_level: normalizeInterestLevel(String(updates.interest_level ?? l.interest_level ?? '')) } : l)));
    setSelectedLead((l) => (l?.id === id ? { ...l, ...updates, interest_level: normalizeInterestLevel(String(updates.interest_level ?? l.interest_level ?? '')) } : l));
  };

  const deleteLead = async (lead: Lead) => {
    if (!window.confirm(`Excluir ${lead.name}?`)) return;
    const { error } = await supabase.from('estimate_requests').delete().eq('id', lead.id);
    if (error) { addToast('Não foi possível excluir o cliente.', 'error'); return; }
    setLeads((items) => items.filter((i) => i.id !== lead.id));
    if (selectedLead?.id === lead.id) setSelectedLead(null);
    setSelectedIds((ids) => { const n = new Set(ids); n.delete(lead.id); return n; });
  };

  const createLead = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase.from('estimate_requests')
      .insert({ ...newLead, contacted: false, status: 'new', photo_names: [] }).select().single();
    setSaving(false);
    if (error) { addToast('Não foi possível adicionar o cliente.', 'error'); return; }
    setLeads((items) => [{ ...(data as Lead), interest_level: normalizeInterestLevel((data as Lead).interest_level) }, ...items]);
    setNewLead(emptyLead);
    setShowNewLead(false);
    addToast('Cliente adicionado com sucesso.', 'success');
  };

  const confirmMarkCompleted = async () => {
    if (!completingLead) return;
    const lead = completingLead;
    setCompleting(true);
    await updateLead(lead.id, { status: 'won', contacted: true, contacted_at: lead.contacted_at || new Date().toISOString() });
    const clientPhone = normalizeWhatsAppNumber(lead.phone);
    const [waResult, emailResult] = await Promise.allSettled([
      supabase.functions.invoke('send-whatsapp-notification', { body: { lead, to: clientPhone, message: buildCompletionMessage(lead) } }),
      supabase.functions.invoke('send-email-notification', { body: { lead, type: 'completion' } }),
    ]);
    setCompleting(false);
    setCompletingLead(null);
    const waOk = waResult.status === 'fulfilled' && !waResult.value?.error;
    const emailOk = emailResult.status === 'fulfilled' && !emailResult.value?.error;
    if (waOk && emailOk) addToast(`Projeto concluído! WhatsApp e e-mail enviados para ${lead.name}.`, 'success');
    else if (waOk || emailOk) addToast(`Status atualizado. ${waOk ? 'WhatsApp' : 'E-mail'} enviado. Verifique o outro canal.`, 'warning');
    else addToast('Status atualizado, mas notificações falharam.', 'error');
  };

  const sendBulkWhatsApp = async () => {
    const targets = selectedLeads.filter((lead) => normalizeWhatsAppNumber(lead.phone));
    if (!targets.length) {
      addToast('Nenhum cliente selecionado tem telefone válido para WhatsApp.', 'warning');
      return;
    }

    setBulkSending(true);
    let ok = 0, fail = 0;
    const okIds: string[] = [];

    for (const lead of targets) {
      const msg = applyVars(bulkMessage, lead);
      const clientPhone = normalizeWhatsAppNumber(lead.phone);
      const { error } = await supabase.functions.invoke('send-whatsapp-notification', { body: { lead, to: clientPhone, message: msg } });
      if (error) {
        fail++;
      } else {
        ok++;
        okIds.push(lead.id);
      }
      await wait(350);
    }

    if (okIds.length) {
      const contactedAt = new Date().toISOString();
      await supabase.from('estimate_requests').update({ contacted: true, contacted_at: contactedAt }).in('id', okIds);
      setLeads((items) => items.map((lead) => (
        okIds.includes(lead.id) ? { ...lead, contacted: true, contacted_at: contactedAt } : lead
      )));
    }

    setBulkSending(false);
    setShowBulkModal(false);
    setSelectedIds(new Set());
    setBulkMessage(defaultBulkMessage);
    const skipped = selectedLeads.length - targets.length;
    addToast(`WhatsApp Evolution: ${ok} enviado${ok !== 1 ? 's' : ''}${fail > 0 ? `, ${fail} falha${fail !== 1 ? 's' : ''}` : ''}${skipped > 0 ? `, ${skipped} sem telefone vÃ¡lido` : ''}.`, fail > 0 || skipped > 0 ? 'warning' : 'success');
  };

  const sendBulkEmail = async () => {
    const targets = selectedLeads.filter((l) => l.email);
    setBulkSending(true);
    let ok = 0, fail = 0;
    for (const lead of targets) {
      const msg = applyVars(bulkMessage, lead);
      const { error } = await supabase.functions.invoke('send-email-notification', {
        body: { lead, type: 'custom', subject: bulkSubject, message: msg },
      });
      if (error) fail++; else ok++;
    }
    setBulkSending(false);
    setShowBulkModal(false);
    setSelectedIds(new Set());
    setBulkMessage(defaultBulkMessage);
    addToast(`E-mail: ${ok} enviado${ok !== 1 ? 's' : ''}${fail > 0 ? `, ${fail} falha${fail !== 1 ? 's' : ''}` : ''}.`, fail > 0 ? 'warning' : 'success');
  };

  const toggleSelectAll = () => {
    const visibleIds = visibleSelectionLeads.map((l) => l.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    setSelectedIds((ids) => {
      const next = new Set(ids);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  if (!authChecked) return <div className="min-h-screen grid place-items-center text-gray-400 text-sm">Carregando...</div>;
  if (!session) return <AdminLogin />;

  const interestFilterOptions: { value: InterestFilter; label: string; emoji?: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: '1', label: 'Nivel 1', emoji: '1' },
    { value: '2', label: 'Nivel 2', emoji: '2' },
    { value: '3', label: 'Nivel 3', emoji: '3' },
    { value: 'none', label: 'Sem classificação' },
  ];

  return (
    <>
      <ToastList toasts={toasts} dismiss={dismissToast} />

      {completingLead && (
        <CompletionModal lead={completingLead} onConfirm={confirmMarkCompleted} onCancel={() => setCompletingLead(null)} loading={completing} />
      )}

      {showBulkModal && selectedLeads.length > 0 && (
        <BulkMessageModal
          selectedLeads={selectedLeads}
          onClose={() => setShowBulkModal(false)}
          onSendWhatsApp={sendBulkWhatsApp}
          onSendEmail={sendBulkEmail}
          loading={bulkSending}
          message={bulkMessage} setMessage={setBulkMessage}
          subject={bulkSubject} setSubject={setBulkSubject}
        />
      )}

      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#7F1D1D] to-[#B91C1C]">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden sm:grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <Award size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-white/50">Painel Administrativo</p>
                <h1 className="font-serif text-2xl text-white">St. Joseph Granite</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/" className="rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">Ver Site</a>
              <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition">
                <LogOut size={15} /> Sair
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total de Clientes', value: stats.total, Icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' },
              { label: 'Novos Leads', value: stats.newCount, Icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Contatados', value: stats.contacted, Icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
              { label: 'Projetos Ganhos', value: stats.won, Icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            ].map(({ label, value, Icon, color, bg }) => (
              <div key={label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">{label}</p>
                  <div className={`grid h-8 w-8 place-items-center rounded-lg ${bg}`}><Icon size={15} className={color} /></div>
                </div>
                <p className="font-serif text-4xl text-[#171717]">{value}</p>
              </div>
            ))}
          </section>

          {/* Tab navigation */}
          <div className="flex gap-1 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 w-fit">
            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'clientes' ? 'bg-[#B91C1C] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users size={15} /> Clientes
            </button>
            <button
              onClick={() => setActiveTab('formularios')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'formularios' ? 'bg-[#B91C1C] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={15} /> Formulários
              {leads.filter((l) => !l.interest_level).length > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${activeTab === 'formularios' ? 'bg-white/20' : 'bg-[#B91C1C]/10 text-[#B91C1C]'}`}>
                  {leads.filter((l) => !l.interest_level).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === 'analytics' ? 'bg-[#B91C1C] text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart2 size={15} /> Analytics
            </button>
          </div>

          {/* ── Tab: Clientes ── */}
          {activeTab === 'clientes' && (
            <section className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl text-[#171717]">Clientes</h2>
                    <p className="text-sm text-gray-400">{filteredLeads.length} de {leads.length} exibidos</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/10 w-full sm:w-44" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#B91C1C] bg-white">
                      <option value="all">Todos os Status</option>
                      {Object.entries(statusConfig).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                    </select>
                    <button onClick={() => setShowNewLead((v) => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1D1D] transition">
                      <Plus size={15} /> Adicionar Cliente
                    </button>
                  </div>
                </div>

                {showNewLead && (
                  <form onSubmit={createLead} className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-gray-100 bg-blue-50/40 p-5">
                    <input required className={inputClass} placeholder="Nome *" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} />
                    <input required className={inputClass} placeholder="Telefone *" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
                    <input required className={inputClass} placeholder="E-mail *" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                    <input className={inputClass} placeholder="Endereço ou Cidade" value={newLead.address} onChange={(e) => setNewLead({ ...newLead, address: e.target.value })} />
                    <input className={inputClass} placeholder="Tipo de Projeto" value={newLead.project_type} onChange={(e) => setNewLead({ ...newLead, project_type: e.target.value })} />
                    <input className={inputClass} placeholder="Tipo de Pedra" value={newLead.stone_type} onChange={(e) => setNewLead({ ...newLead, stone_type: e.target.value })} />
                    <textarea className={`${inputClass} md:col-span-2 resize-none`} rows={2} placeholder="Observações" value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} />
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowNewLead(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
                      <button disabled={saving} className="rounded-xl bg-[#171717] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar Cliente'}</button>
                    </div>
                  </form>
                )}

                <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filteredLeads.length > 0 && filteredLeads.every((lead) => selectedIds.has(lead.id))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 accent-[#B91C1C] cursor-pointer"
                    />
                    Selecionar clientes exibidos
                  </label>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      <MessageCircle size={14} />
                      Enviar WhatsApp/E-mail ({selectedIds.size})
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Sel.</th>
                        <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Cliente</th>
                        <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Projeto</th>
                        <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Interesse</th>
                        <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                        <th className="px-5 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Data</th>
                        <th className="px-5 py-3 text-right text-xs uppercase tracking-widest text-gray-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">Carregando clientes...</td></tr>
                      ) : filteredLeads.length === 0 ? (
                        <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">Nenhum cliente encontrado.</td></tr>
                      ) : filteredLeads.map((lead) => {
                        const leadStatus = (lead.status || (lead.contacted ? 'contacted' : 'new')) as LeadStatus;
                        const isWon = leadStatus === 'won';
                        return (
                          <tr key={lead.id} className={`hover:bg-gray-50/70 transition-colors ${selectedLead?.id === lead.id ? 'bg-red-50/20 border-l-2 border-l-[#B91C1C]' : ''}`}>
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(lead.id)}
                                onChange={() => {
                                  setSelectedIds((ids) => {
                                    const next = new Set(ids);
                                    if (next.has(lead.id)) next.delete(lead.id); else next.add(lead.id);
                                    return next;
                                  });
                                }}
                                className="h-4 w-4 rounded border-gray-300 accent-[#B91C1C] cursor-pointer"
                              />
                            </td>
                            <td className="px-5 py-4">
                              <button onClick={() => setSelectedLead(lead)} className="flex items-center gap-3 text-left">
                                <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center text-xs font-bold ${isWon ? 'bg-emerald-100 text-emerald-700' : 'bg-[#B91C1C]/10 text-[#B91C1C]'}`}>{initials(lead.name)}</div>
                                <div>
                                  <p className="font-semibold text-[#171717] text-sm leading-tight">{lead.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{lead.email}</p>
                                </div>
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-gray-700">{lead.project_type}</p>
                              <p className="text-xs text-gray-400">{lead.stone_type}</p>
                            </td>
                            <td className="px-5 py-4">
                              {lead.interest_level ? <InterestBadge level={lead.interest_level} /> : <span className="text-xs text-gray-300">—</span>}
                            </td>
                            <td className="px-5 py-4">
                              <select value={leadStatus} onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })} className={`rounded-full border px-2.5 py-1 text-xs font-semibold cursor-pointer outline-none appearance-none ${statusConfig[leadStatus].bg} ${statusConfig[leadStatus].text} ${statusConfig[leadStatus].border}`}>
                                {Object.entries(statusConfig).map(([v, cfg]) => <option key={v} value={v}>{cfg.label}</option>)}
                              </select>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1.5">
                                {!isWon ? (
                                  <button onClick={() => setCompletingLead(lead)} title="Marcar como concluído" className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition"><Award size={14} /></button>
                                ) : (
                                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-500"><CheckCircle size={14} /></span>
                                )}
                                <a href={`https://wa.me/${normalizeWhatsAppNumber(lead.phone)}`} target="_blank" rel="noreferrer" title="Abrir WhatsApp" className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-[#171717] transition"><MessageCircle size={14} /></a>
                                <button onClick={() => deleteLead(lead)} title="Excluir cliente" className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-red-50 hover:text-[#B91C1C] hover:border-red-200 transition"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-5">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="font-serif text-xl text-[#171717]">Detalhes do Cliente</h2>
                  </div>
                  {selectedLead ? (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 shrink-0 rounded-2xl grid place-items-center text-lg font-bold ${
                          selectedLead.status === 'won'
                            ? 'bg-emerald-100 text-emerald-700'
                            : selectedLead.interest_level
                              ? `${interestConfig[selectedLead.interest_level].avatarBg} ${interestConfig[selectedLead.interest_level].avatarText}`
                              : 'bg-[#B91C1C]/10 text-[#B91C1C]'
                        }`}>{initials(selectedLead.name)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#171717] text-base truncate">{selectedLead.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <StatusBadge status={(selectedLead.status || (selectedLead.contacted ? 'contacted' : 'new')) as LeadStatus} />
                            {selectedLead.interest_level && <InterestBadge level={selectedLead.interest_level} />}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm hover:bg-gray-100 transition group">
                          <Phone size={14} className="text-gray-400 shrink-0 group-hover:text-[#B91C1C]" /><span className="text-[#171717] font-medium">{selectedLead.phone}</span>
                        </a>
                        <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm hover:bg-gray-100 transition group">
                          <Mail size={14} className="text-gray-400 shrink-0 group-hover:text-[#B91C1C]" /><span className="text-[#171717] font-medium truncate">{selectedLead.email}</span>
                        </a>
                        {selectedLead.address && (
                          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm">
                            <MapPin size={14} className="text-gray-400 shrink-0" /><span className="text-[#171717]">{selectedLead.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        {([['Projeto', selectedLead.project_type], ['Pedra', selectedLead.stone_type], ['Medidas', selectedLead.measurements], ['Prazo', selectedLead.timeline]] as [string, string | null][]).filter(([, v]) => v).map(([label, value]) => (
                          <div key={label} className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                            <p className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{label}</p>
                            <p className="text-sm text-[#171717] font-medium">{value}</p>
                          </div>
                        ))}
                      </div>
                      {selectedLead.comments && (
                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                          <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest mb-1">Comentários</p>
                          <p className="text-sm text-amber-900">{selectedLead.comments}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2 flex items-center gap-1.5"><FileText size={11} /> Notas Internas</p>
                        <textarea value={selectedLead.notes || ''} onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })} onBlur={(e) => updateLead(selectedLead.id, { notes: e.target.value })} rows={3} placeholder="Adicionar notas privadas..." className={`${inputClass} resize-none`} />
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-gray-400"><Calendar size={11} /> Enviado em {formatDate(selectedLead.created_at)}</p>
                      {selectedLead.status !== 'won' ? (
                        <button onClick={() => setCompletingLead(selectedLead)} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
                          <Award size={16} /> Marcar Projeto como Concluído
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-semibold">
                          <CheckCircle size={16} /> Projeto concluído
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center">
                        <UserRound size={28} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">Selecione um cliente para ver os detalhes</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="font-serif text-xl text-[#171717]">WhatsApp</h2>
                      <p className="text-xs text-gray-400 mt-0.5">st-joseph-granite</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${instanceStatus === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-[#B91C1C] border-red-200'}`}>{instanceStatus}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={fetchEvolutionStatus} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"><RefreshCw size={12} /> Atualizar</button>
                    <button onClick={fetchQrCode} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B91C1C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#7F1D1D] transition"><QrCode size={12} /> Ver QR</button>
                  </div>
                  {qrCode && (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                      <img src={qrCode} alt="WhatsApp QR Code" className="mx-auto w-full max-w-[240px]" />
                      <p className="mt-2 text-xs text-gray-400">WhatsApp › Dispositivos conectados › Conectar dispositivo</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-[#7F1D1D] to-[#B91C1C] p-5 text-white">
                  <div className="flex items-center gap-2 mb-2"><Clock size={13} className="text-white/60" /><p className="text-xs uppercase tracking-widest text-white/60 font-medium">Lembrete Diário</p></div>
                  <p className="text-sm text-white/85 leading-relaxed">Entre em contato com cada novo lead antes do fim do dia útil para a melhor taxa de conversão.</p>
                </div>
              </aside>
            </section>
          )}

          {/* ── Tab: Analytics ── */}
          {activeTab === 'analytics' && (
            <AnalyticsTab views={pageViews} loading={analyticsLoading} onRefresh={fetchAnalytics} />
          )}

          {/* ── Tab: Formulários ── */}
          {activeTab === 'formularios' && (
            <section>
              {/* Filter bar + selection toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-5">
                <div className="flex flex-wrap gap-2">
                  {interestFilterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setInterestFilter(opt.value)}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${interestFilter === opt.value ? 'bg-[#B91C1C] text-white border-[#B91C1C]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                      {opt.emoji && <span className="mr-1">{opt.emoji}</span>}{opt.label}
                      {opt.value !== 'all' && (
                        <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${interestFilter === opt.value ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                          {opt.value === 'none' ? leads.filter((l) => !l.interest_level).length : leads.filter((l) => l.interest_level === opt.value).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filteredFormLeads.length > 0 && filteredFormLeads.every((lead) => selectedIds.has(lead.id))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 accent-[#B91C1C] cursor-pointer"
                    />
                    Selecionar todos
                  </label>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1D1D] transition"
                    >
                      <Send size={14} />
                      Enviar mensagem ({selectedIds.size})
                    </button>
                  )}
                </div>
              </div>

              {/* Cards grid */}
              {loading ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400 text-sm">Carregando clientes...</div>
              ) : filteredFormLeads.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                  <FileText size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Nenhum cliente encontrado neste filtro.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFormLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      selected={selectedIds.has(lead.id)}
                      onSelect={() => {
                        setSelectedIds((ids) => {
                          const n = new Set(ids);
                          if (n.has(lead.id)) n.delete(lead.id); else n.add(lead.id);
                          return n;
                        });
                      }}
                      onInterest={(level) => updateLead(lead.id, { interest_level: level })}
                      onNoteBlur={(notes) => updateLead(lead.id, { notes })}
                      onDelete={() => deleteLead(lead)}
                      onComplete={() => setCompletingLead(lead)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}


