'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText, Search, Filter, Plus, Shield, MapPin, Calendar,
  ArrowRight, RefreshCw, Upload, Image as ImageIcon, CheckCircle2,
  HardDrive, Zap, X, AlertCircle
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getSuspectMedia } from '@/lib/suspect-media';

// Crime icons & color scheme mapping for stylish modern cards
import {
  Car, Laptop, ShieldAlert, Home, Activity, Bookmark
} from 'lucide-react';

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
      setFirs(list);
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
      const res = await fetch(`/server/search-firs?q=${encodeURIComponent(search)}&limit=30`);
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

        // 1. Upload to Catalyst Stratus (Cap #8)
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

        // 2. Extract Fields via Zia Vision OCR (Cap #14)
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

  // Save new FIR extracted via OCR into active list
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

  const safeFirs = Array.isArray(firs) ? firs : [];

  const filtered = safeFirs.filter(f => {
    if (!f) return false;
    const q = search.toLowerCase();
    const matchesSearch =
      (f.case_number || '').toLowerCase().includes(q) ||
      (f.crime_type || '').toLowerCase().includes(q) ||
      (f.location_name || '').toLowerCase().includes(q) ||
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
              Karnataka State Police Intelligence Records · Live CCTNS Datastore
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/fir/new"
            className="px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register FIR
          </Link>
          <button
            onClick={() => setIsOcrOpen(true)}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <ImageIcon className="w-4 h-4" />
            Scan with OCR
          </button>
          <Link
            href="/dashboard/chat"
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-900 dark:hover:border-zinc-100 font-bold text-xs transition-all flex items-center gap-2 shadow-xs"
          >
            <Shield className="w-4 h-4 text-zinc-900 dark:text-white" />
            Ask DRISHTI AI
          </Link>
        </div>
      </div>

      {/* Filters & Live Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search FIR #, crime type, police station..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-mono transition-all"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-medium transition-all"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-50 font-medium transition-all"
          >
            <option value="ALL">All Case Statuses</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="FIR Registered">FIR Registered</option>
            <option value="Chargesheeted">Chargesheeted</option>
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
            const isClosedOrChargesheeted = fir.status === 'Chargesheeted' || fir.status === 'chargesheeted' || fir.status === 'closed';
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
                  {/* TOP ROW: Header with Portrait/Icon, Case ID, and Minimal Status */}
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
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[150px] font-mono">
                          {fir.police_station || fir.district_name || 'KSP Station'}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${isClosedOrChargesheeted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {fir.case_category || fir.status || 'Under Investigation'}
                    </span>
                  </div>

                  {/* MIDDLE: Crime Title, Accused Name, and Brief Summary */}
                  <div className="space-y-1.5 my-3">
                    <h3 className="font-extrabold text-base text-zinc-950 dark:text-white tracking-tight">
                      {fir.crime_type || 'General Offence'}
                    </h3>
                    
                    {accusedName && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        Accused: <span className="font-bold text-zinc-950 dark:text-white">{accusedName}</span>
                        {suspectMedia?.alias ? <span className="text-zinc-400 font-normal"> ({suspectMedia.alias})</span> : ''}
                      </p>
                    )}

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {briefSummary}
                    </p>
                  </div>
                </div>

                {/* BOTTOM ROW: Clean Location & Action Link */}
                <div className="pt-3.5 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{fir.location_name || fir.district_name || 'Bengaluru'}</span>
                  </div>

                  <Link
                    href={`/dashboard/fir/${encodedId}`}
                    className="text-xs font-black text-zinc-950 dark:text-white hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Case <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zia Vision OCR & Catalyst Stratus Upload Modal */}
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Zia Vision OCR & Stratus Ingestion</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Extract structured case fields from FIR images and save to Catalyst Stratus</p>
                </div>
              </div>
              <button
                onClick={() => setIsOcrOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-2xl p-7 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-900/40 space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">Click to upload scanned FIR or document photo</p>
              <p className="text-xs text-gray-400">Supports JPEG, PNG, WEBP (Auto-processed via Zia Vision)</p>
            </div>

            {/* Loading Indicator */}
            {ocrLoading && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-mono flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* OCR Extracted Results */}
            {ocrResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Zia OCR Extraction Complete
                  </span>
                  <span className="font-mono text-gray-400">Confidence: {(ocrResult.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 font-mono text-xs space-y-2 text-gray-800 dark:text-gray-200">
                  <p><strong className="text-gray-400">Case No:</strong> <span className="text-blue-600 dark:text-blue-400 font-bold">{ocrResult.parsed_fields?.case_number || 'KAR/BEN/2026/1840'}</span></p>
                  <p><strong className="text-gray-400">IPC Sections:</strong> <span className="text-amber-600 dark:text-amber-400 font-bold">{ocrResult.parsed_fields?.ipc_sections || 'IPC 379, 411'}</span></p>
                  {ocrResult.parsed_fields?.vehicle_number && (
                    <p><strong className="text-gray-400">Vehicle:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ocrResult.parsed_fields.vehicle_number}</span></p>
                  )}
                  {stratusUrl && (
                    <p><strong className="text-gray-400">Stratus Blob:</strong> <span className="text-cyan-600 dark:text-cyan-400 truncate">{stratusUrl}</span></p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsOcrOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOcrFir}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Save Digitized Case
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
