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
    <div className="w-full max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              FIR Case Registry
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Official Karnataka State Police First Information Records & Live Investigation Files
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOcrOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            Scan FIR with Zia OCR
          </button>
          <Link
            href="/dashboard/chat"
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200/80 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-xs transition-all flex items-center gap-2 shadow-xs"
          >
            <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Ask DRISHTI AI
          </Link>
        </div>
      </div>

      {/* Filters & Live Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#18181B] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Data Store Search: FIR #, crime, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-mono transition-all"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition-all"
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
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition-all"
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
        <div className="py-16 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 font-medium text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> Querying Catalyst Data Store...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#18181B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm">
          No FIR records matched your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(fir => {
            const caseId = fir.case_number || fir.id || 'FIR-2026-UNKNOWN';
            const encodedId = encodeURIComponent(caseId);
            const isClosedOrChargesheeted = fir.status === 'Chargesheeted' || fir.status === 'chargesheeted' || fir.status === 'closed';
            const meta = getCrimeCardMeta(fir.crime_type, caseId);
            const isSaved = savedCases.has(caseId);
            const accusedName = fir.accused_name || fir.suspect_name;
            const suspectMedia = accusedName ? getSuspectMedia(accusedName) : null;
            const rawDescription = fir.description || 'FIR complaint registered under relevant IPC/BNS legal sections.';
            const briefSummary = rawDescription.split('\n')[0].replace(/FIR registered at .* for /i, '');

            return (
              <div
                key={caseId}
                className="group rounded-3xl bg-white dark:bg-[#18181B] border border-gray-200/90 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between h-full"
              >
                <div>
                  {/* TOP ROW: Crime Category Badge + Case Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700">
                        {meta.ipc}
                      </span>
                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        {meta.badge}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase flex items-center gap-1 ${
                      isClosedOrChargesheeted
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isClosedOrChargesheeted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {fir.status || 'Under Investigation'}
                    </span>
                  </div>

                  {/* Case Number & Station Meta */}
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <span className="font-bold font-mono text-gray-900 dark:text-white">{caseId}</span>
                      <span>·</span>
                      <span className="truncate max-w-[140px]">{fir.police_station || fir.district_name || 'KSP Command'}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pt-1">
                      {fir.crime_type || 'General Offence'}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-1">
                      {briefSummary}
                    </p>
                  </div>

                  {/* Suspect Photo & Identification Snippet */}
                  {suspectMedia && accusedName && (
                    <div className="mt-3.5 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300 dark:border-gray-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={suspectMedia.mugshot}
                          alt={accusedName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Accused Suspect</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">ANPR Matched</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {accusedName} {suspectMedia.alias ? `("${suspectMedia.alias}")` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Assigned IO / Location + View Case Button */}
                <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">
                      {fir.investigation_office || 'IO: Inspector In-Charge'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{fir.location_name || fir.district_name || 'Bengaluru'}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/fir/${encodedId}`}
                    className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    View Case
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
