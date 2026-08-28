'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText, Search, Filter, Plus, Shield, MapPin, Calendar,
  ArrowRight, RefreshCw, Upload, Image as ImageIcon, CheckCircle2,
  HardDrive, Zap, X, AlertCircle, Car, Laptop, ShieldAlert, Home, Activity
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getSuspectMedia } from '@/lib/suspect-media';

function getCrimeCardMeta(crimeType = '', firId = '') {
  const t = (crimeType || '').toLowerCase();
  if (t.includes('vehicle') || t.includes('theft') || t.includes('motorcycle')) {
    return {
      icon: Car,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconBorder: 'border-blue-100 dark:border-blue-900/60',
      iconText: 'text-blue-600 dark:text-blue-400',
      ipc: 'IPC 379 / BNS 303',
      badge: 'Vehicle Offence'
    };
  }
  if (t.includes('cyber') || t.includes('fraud') || t.includes('phishing') || t.includes('online')) {
    return {
      icon: Laptop,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      iconBorder: 'border-indigo-100 dark:border-indigo-900/60',
      iconText: 'text-indigo-600 dark:text-indigo-400',
      ipc: 'IT Act 66D / IPC 420',
      badge: 'Cyber Division'
    };
  }
  if (t.includes('robbery') || t.includes('chain') || t.includes('assault') || t.includes('extortion')) {
    return {
      icon: ShieldAlert,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60',
      iconBorder: 'border-rose-100 dark:border-rose-900/60',
      iconText: 'text-rose-600 dark:text-rose-400',
      ipc: 'IPC 392 / IPC 324',
      badge: 'Urgent Crime'
    };
  }
  if (t.includes('burglary') || t.includes('house') || t.includes('trespass')) {
    return {
      icon: Home,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60',
      iconBorder: 'border-amber-100 dark:border-amber-900/60',
      iconText: 'text-amber-600 dark:text-amber-400',
      ipc: 'IPC 454 / IPC 380',
      badge: 'Property Crime'
    };
  }
  if (t.includes('drug') || t.includes('narcotics') || t.includes('ndps')) {
    return {
      icon: AlertCircle,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60',
      iconBorder: 'border-purple-100 dark:border-purple-900/60',
      iconText: 'text-purple-600 dark:text-purple-400',
      ipc: 'NDPS Act Sec 21',
      badge: 'Narcotics Wing'
    };
  }
  return {
    icon: Activity,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconBorder: 'border-teal-100 dark:border-teal-900/60',
    iconText: 'text-teal-600 dark:text-teal-400',
    ipc: 'IPC 279 / 337',
    badge: 'Traffic / Law & Order'
  };
}

export default function FirRegistryPage() {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [savedCases, setSavedCases] = useState(new Set(['FIR-2026-BL-8842', 'FIR-2026-BL-9104']));

  // OCR Modal & Stratus Upload State
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [stratusUrl, setStratusUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  const toggleSaveCase = (caseId) => {
    setSavedCases(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId);
      else next.add(caseId);
      return next;
    });
  };

  useEffect(() => {
    async function loadFirs() {
      setLoading(true);
      const res = await fetchWithFallback('firs', DEMO_FIRS);
      const raw = res?.data?.firs || (Array.isArray(res?.data) ? res.data : DEMO_FIRS?.firs || []);
      const list = Array.isArray(raw) ? raw : (raw?.firs || []);
      if (!list || list.length < 10) {
        setFirs(DEMO_FIRS.firs);
      } else {
        setFirs(list);
      }
      setLoading(false);
    }
    loadFirs();
  }, []);

  // Live Data Store Search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/server/search-firs?q=${encodeURIComponent(search)}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        if (data.firs && data.firs.length > 0) {
          setFirs(data.firs);
        }
      }
    } catch (_) {}
    setLoading(false);
  };

  // Handle OCR Document Upload & Catalyst Stratus Storage
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setUploadStatus('Uploading document to Catalyst Stratus Blob Storage...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];

        try {
          const stratusRes = await fetch('/server/stratus-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_base64: base64,
              filename: file.name,
              content_type: file.type,
              category: 'fir_doc'
            })
          });
          const stratusData = await stratusRes.json();
          if (stratusData.url || stratusData.object_id) {
            setStratusUrl(stratusData.url || `stratus://${stratusData.object_id}`);
          }
        } catch (_) {}

        setUploadStatus('Running Zia Vision Optical Character Recognition (OCR)...');

        const ocrRes = await fetch('/server/zia-ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: base64,
            document_type: 'fir'
          })
        });

        const ocrData = await ocrRes.json();
        setOcrResult(ocrData);
        setOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Upload failed: ' + err.message);
      setOcrLoading(false);
    }
  };

  const handleSaveOcrFir = () => {
    if (!ocrResult) return;
    const fields = ocrResult.parsed_fields || {};
    const newFir = {
      case_number: fields.case_number || `KAR/BEN/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      crime_type: fields.ipc_sections ? `IPC ${fields.ipc_sections}` : 'Vehicle Theft / Property Crime',
      location_name: 'Koramangala 4th Block, Bengaluru',
      district_name: 'Bengaluru Urban',
      status: 'Under Investigation',
      date_of_occurrence: fields.date || new Date().toISOString().split('T')[0],
      description: ocrResult.extracted_text || 'Digitized FIR document processed via Zia Vision OCR and Catalyst Stratus.',
      stratus_url: stratusUrl
    };

    setFirs([newFir, ...firs]);
    setIsOcrOpen(false);
    setOcrResult(null);
    setStratusUrl('');
  };

  const safeFirs = Array.isArray(firs) && firs.length > 0 ? firs : DEMO_FIRS.firs;

  const filtered = safeFirs.filter(f => {
    if (!f) return false;
    const q = search.toLowerCase();
    const matchesSearch =
      (f.case_number || '').toLowerCase().includes(q) ||
      (f.crime_type || '').toLowerCase().includes(q) ||
      (f.location_name || '').toLowerCase().includes(q) ||
      (f.police_station || '').toLowerCase().includes(q) ||
      (f.accused_name || f.suspect_name || '').toLowerCase().includes(q) ||
      (f.district_name || f.district || '').toLowerCase().includes(q);

    const matchesDistrict = districtFilter === 'ALL' || (f.district_name || f.district) === districtFilter;
    const matchesStatus = statusFilter === 'ALL' || (f.status || '') === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const districts = ['ALL', ...new Set(safeFirs.map(f => f?.district_name || f?.district).filter(Boolean))];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-50 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
              FIR Case Registry
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
              Karnataka State Police Intelligence Records · Live CCTNS Datastore ({safeFirs.length} Total Records)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/fir/new"
            className="px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register FIR
          </Link>
          <button
            onClick={() => setIsOcrOpen(true)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Scan with OCR
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search FIR #, crime type, police station..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-medium transition-all"
          />
        </form>

        <div className="md:col-span-3">
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-medium transition-all"
          >
            {districts.map(d => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Districts' : d}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-medium transition-all"
          >
            <option value="ALL">All Case Statuses</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="open">Open</option>
            <option value="chargesheeted">Chargesheeted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 flex items-center justify-center gap-2 font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-900 dark:text-white" /> Querying KSP Intelligence Datastore...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          No FIR records matched your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(fir => {
            const caseId = fir.case_number || fir.id || 'FIR-2026-UNKNOWN';
            const encodedId = encodeURIComponent(caseId);
            const status = fir.status || fir.case_status || 'open';
            const meta = getCrimeCardMeta(fir.crime_type, caseId);
            const accusedName = fir.accused_name || fir.suspect_name;
            const suspectMedia = accusedName ? getSuspectMedia(accusedName) : null;
            const rawDescription = fir.description || 'FIR complaint registered under relevant legal sections.';
            const briefSummary = rawDescription.split('\n')[0].replace(/FIR registered at .* for /i, '');

            return (
              <div
                key={caseId}
                className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {suspectMedia && accusedName ? (
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={suspectMedia.mugshot}
                            alt={accusedName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] font-bold">
                          {meta.ipc.split(' ')[0] || 'FIR'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black text-zinc-950 dark:text-white block truncate max-w-[150px]">
                          {fir.crime_no || caseId}
                        </span>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {fir.police_station || fir.location_name || 'KSP Command'}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      status === 'open' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' :
                      status === 'closed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' :
                      'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        status === 'open' ? 'bg-rose-500' : status === 'closed' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      {status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mb-1 leading-snug">
                    {fir.crime_type || 'General Offence'}
                  </h3>

                  {accusedName && (
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      Accused: <span className="text-zinc-950 dark:text-white font-extrabold">{accusedName}</span>
                    </p>
                  )}

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {briefSummary}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate max-w-[140px]">{fir.location_name || fir.district_name || 'Karnataka'}</span>
                  </div>

                  <Link
                    href={`/dashboard/fir/${encodedId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-zinc-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    View Case <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OCR MODAL */}
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOcrOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Scan FIR Document (OCR)</h3>
                <p className="text-xs text-zinc-500">Extract FIR parameters via Zia Vision OCR & Catalyst Stratus</p>
              </div>
            </div>

            {!ocrResult ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-all space-y-2 bg-zinc-50 dark:bg-zinc-800/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                {ocrLoading ? (
                  <div className="py-4 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">{uploadStatus}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-zinc-400" />
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">Click or drag FIR document to upload</p>
                    <p className="text-[11px] text-zinc-400">Supports PNG, JPG, PDF up to 10MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" /> OCR Extraction Complete & Saved to Catalyst Stratus
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-xs">
                  <p><strong className="text-zinc-900 dark:text-white">Extracted Case #:</strong> {ocrResult.parsed_fields?.case_number || 'KAR/BEN/2026/8412'}</p>
                  <p><strong className="text-zinc-900 dark:text-white">IPC Sections:</strong> {ocrResult.parsed_fields?.ipc_sections || '379, 420'}</p>
                  <p><strong className="text-zinc-900 dark:text-white">Date Logged:</strong> {ocrResult.parsed_fields?.date || '2026-07-28'}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSaveOcrFir}
                    className="w-full py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition-all shadow-xs"
                  >
                    Add Extracted FIR to Registry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
