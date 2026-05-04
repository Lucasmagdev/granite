import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  CheckCircle,
  Clock,
  LogOut,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

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
};

const emptyLead = {
  name: '',
  phone: '',
  email: '',
  address: '',
  project_type: 'Kitchen Countertop',
  stone_type: 'Granite',
  measurements: '',
  timeline: 'ASAP',
  comments: '',
  notes: '',
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#171717] outline-none transition focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/15';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (loginError) {
      setError('Invalid email or password.');
    }
  };

  return (
    <main className="min-h-screen bg-[#B91C1C] px-5 py-10 flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <p className="text-[#B91C1C] text-xs tracking-[0.3em] uppercase mb-3">Admin Access</p>
        <h1 className="font-serif text-3xl text-[#171717] mb-2">St. Joseph Granite</h1>
        <p className="text-sm text-[#5F5F5F] mb-7">
          Sign in to manage estimate requests, clients, and WhatsApp connection status.
        </p>

        <div className="space-y-3">
          <input
            required
            type="email"
            placeholder="Email"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Password"
            className={inputClass}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#B91C1C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7F1D1D] disabled:bg-gray-400"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState(emptyLead);
  const [showNewLead, setShowNewLead] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [instanceStatus, setInstanceStatus] = useState('checking');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('estimate_requests')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (fetchError) {
      setError('Could not load clients. Check the admin RLS policies in Supabase.');
      return;
    }

    setLeads((data || []) as Lead[]);
  };

  const fetchEvolutionStatus = async () => {
    const { data, error: statusError } = await supabase.functions.invoke('evolution-instance-status');
    if (statusError) {
      setInstanceStatus('unavailable');
      return;
    }
    setInstanceStatus(data?.connectionStatus || 'unknown');
  };

  const fetchQrCode = async () => {
    setQrCode('');
    const { data, error: qrError } = await supabase.functions.invoke('evolution-connect-qr');
    if (qrError) {
      setError('Could not load WhatsApp QR Code.');
      return;
    }
    setQrCode(data?.base64 || '');
    await fetchEvolutionStatus();
  };

  useEffect(() => {
    if (!session) return;
    fetchLeads();
    fetchEvolutionStatus();
  }, [session]);

  const filteredLeads = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const status = lead.status || (lead.contacted ? 'contacted' : 'new');
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch =
        !normalized ||
        [lead.name, lead.phone, lead.email, lead.address, lead.project_type, lead.stone_type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const stats = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter((lead) => lead.contacted || lead.status === 'contacted').length;
    const newCount = leads.filter((lead) => !lead.contacted && (!lead.status || lead.status === 'new')).length;
    const won = leads.filter((lead) => lead.status === 'won').length;
    return { total, contacted, newCount, won };
  }, [leads]);

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setSaving(true);
    const { error: updateError } = await supabase.from('estimate_requests').update(updates).eq('id', id);
    setSaving(false);

    if (updateError) {
      setError('Could not update this client.');
      return;
    }

    setLeads((items) => items.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)));
    setSelectedLead((lead) => (lead?.id === id ? { ...lead, ...updates } : lead));
  };

  const markContacted = async (lead: Lead) => {
    await updateLead(lead.id, {
      contacted: true,
      contacted_at: new Date().toISOString(),
      status: 'contacted',
    });
  };

  const deleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(`Delete ${lead.name}?`);
    if (!confirmed) return;

    const { error: deleteError } = await supabase.from('estimate_requests').delete().eq('id', lead.id);
    if (deleteError) {
      setError('Could not delete this client.');
      return;
    }

    setLeads((items) => items.filter((item) => item.id !== lead.id));
    if (selectedLead?.id === lead.id) setSelectedLead(null);
  };

  const createLead = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...newLead,
      contacted: false,
      status: 'new',
      photo_names: [],
    };

    const { data, error: createError } = await supabase
      .from('estimate_requests')
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (createError) {
      setError('Could not add this client.');
      return;
    }

    setLeads((items) => [data as Lead, ...items]);
    setNewLead(emptyLead);
    setShowNewLead(false);
  };

  if (!authChecked) {
    return <div className="min-h-screen grid place-items-center text-[#5F5F5F]">Loading admin...</div>;
  }

  if (!session) return <AdminLogin />;

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-[#B91C1C] text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-white/70">Admin Dashboard</p>
            <h1 className="font-serif text-3xl">St. Joseph Granite</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold hover:bg-white/10">
              View Site
            </a>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#B91C1C]"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-[#B91C1C]">
            {error}
            <button onClick={() => setError('')} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Clients', value: stats.total },
            { label: 'New Leads', value: stats.newCount },
            { label: 'Contacted', value: stats.contacted },
            { label: 'Won Projects', value: stats.won },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#737373]">{stat.label}</p>
              <p className="mt-2 font-serif text-3xl text-[#171717]">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#171717]">Clients & Estimate Requests</h2>
                <p className="text-sm text-[#5F5F5F]">Track every form submission and manual client.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search clients"
                    className="rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#B91C1C]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | LeadStatus)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#B91C1C]"
                >
                  <option value="all">All Status</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewLead((value) => !value)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7F1D1D]"
                >
                  <Plus size={16} />
                  Add Client
                </button>
              </div>
            </div>

            {showNewLead && (
              <form onSubmit={createLead} className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-gray-200 bg-gray-50 p-5">
                <input required className={inputClass} placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} />
                <input required className={inputClass} placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
                <input required className={inputClass} placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                <input className={inputClass} placeholder="Address or City" value={newLead.address} onChange={(e) => setNewLead({ ...newLead, address: e.target.value })} />
                <input className={inputClass} placeholder="Project Type" value={newLead.project_type} onChange={(e) => setNewLead({ ...newLead, project_type: e.target.value })} />
                <input className={inputClass} placeholder="Stone Type" value={newLead.stone_type} onChange={(e) => setNewLead({ ...newLead, stone_type: e.target.value })} />
                <textarea className={`${inputClass} md:col-span-2 resize-none`} rows={3} placeholder="Notes" value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} />
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowNewLead(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold">
                    Cancel
                  </button>
                  <button disabled={saving} className="rounded-lg bg-[#171717] px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-400">
                    Save Client
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-[0.15em] text-[#737373]">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Submitted</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-[#737373]">Loading clients...</td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-[#737373]">No clients found.</td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const leadStatus = lead.status || (lead.contacted ? 'contacted' : 'new');
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <button onClick={() => setSelectedLead(lead)} className="text-left">
                              <span className="font-semibold text-[#171717]">{lead.name}</span>
                              <span className="block text-xs text-[#737373]">{lead.phone} · {lead.email}</span>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#5F5F5F]">
                            {lead.project_type}
                            <span className="block text-xs text-[#737373]">{lead.stone_type}</span>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={leadStatus}
                              onChange={(event) => updateLead(lead.id, { status: event.target.value as LeadStatus })}
                              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-[#171717]"
                            >
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-4 text-sm text-[#737373]">{formatDate(lead.created_at)}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => markContacted(lead)} className="rounded-lg border border-gray-200 p-2 text-[#B91C1C]" aria-label="Mark contacted">
                                <CheckCircle size={16} />
                              </button>
                              <a href={`https://wa.me/1${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-200 p-2 text-[#171717]" aria-label="Open WhatsApp">
                                <MessageCircle size={16} />
                              </a>
                              <button onClick={() => deleteLead(lead)} className="rounded-lg border border-gray-200 p-2 text-[#B91C1C]" aria-label="Delete client">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl">WhatsApp Instance</h2>
                  <p className="text-sm text-[#5F5F5F]">st-joseph-granite</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  instanceStatus === 'open' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-[#B91C1C]'
                }`}>
                  {instanceStatus}
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={fetchEvolutionStatus} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold">
                  <RefreshCw size={15} />
                  Refresh
                </button>
                <button onClick={fetchQrCode} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white">
                  <QrCode size={15} />
                  Show QR
                </button>
              </div>

              {qrCode && (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                  <img src={qrCode} alt="WhatsApp QR Code" className="mx-auto w-full max-w-[280px]" />
                  <p className="mt-3 text-xs text-[#5F5F5F]">WhatsApp &gt; Linked devices &gt; Link a device.</p>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-serif text-2xl">Client Details</h2>
              {selectedLead ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#B91C1C]/10 text-[#B91C1C]">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedLead.name}</p>
                      <p className="text-xs text-[#737373]">{selectedLead.email}</p>
                    </div>
                  </div>
                  {[
                    ['Phone', selectedLead.phone],
                    ['Address', selectedLead.address],
                    ['Project', selectedLead.project_type],
                    ['Stone', selectedLead.stone_type],
                    ['Measurements', selectedLead.measurements],
                    ['Timeline', selectedLead.timeline],
                    ['Comments', selectedLead.comments],
                    ['Contacted', selectedLead.contacted ? `Yes, ${formatDate(selectedLead.contacted_at)}` : 'No'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-t border-gray-100 pt-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-[#737373]">{label}</p>
                      <p className="mt-1 text-sm text-[#171717]">{value || '-'}</p>
                    </div>
                  ))}
                  <textarea
                    value={selectedLead.notes || ''}
                    onChange={(event) => setSelectedLead({ ...selectedLead, notes: event.target.value })}
                    onBlur={(event) => updateLead(selectedLead.id, { notes: event.target.value })}
                    rows={4}
                    placeholder="Internal notes"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              ) : (
                <div className="mt-5 rounded-lg bg-gray-50 p-5 text-sm text-[#5F5F5F]">
                  Select a client from the table to see details and add internal notes.
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-serif text-2xl">Today</h2>
              <div className="mt-4 flex items-center gap-3 text-sm text-[#5F5F5F]">
                <Clock size={16} className="text-[#B91C1C]" />
                Follow up with every new lead before the end of the business day.
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
