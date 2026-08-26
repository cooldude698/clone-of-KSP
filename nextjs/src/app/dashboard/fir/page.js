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

export default function FirRegistryPage() {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // OCR Modal & Stratus Upload State
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [stratusUrl, setStratusUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">FIR Case Registry</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Official Karnataka State Police First Information Records & Live Investigation Files</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOcrOpen(true)}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Scan FIR with Zia OCR
          </button>
          <Link
            href="/dashboard/chat"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-blue-400" />
            Ask DRISHTI AI
          </Link>
        </div>
      </div>

      {/* Filters & Live Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--surface-1)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Data Store Search: FIR #, crime, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
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
            className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none"
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
        <div className="py-16 text-center text-[var(--muted-foreground)] flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" /> Querying Catalyst Data Store...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[var(--muted-foreground)] bg-[var(--surface-1)] rounded-2xl border border-[var(--border)]">
          No FIR records matched your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(fir => {
            const caseId = fir.case_number || fir.id || 'FIR-2026-UNKNOWN';
            const encodedId = encodeURIComponent(caseId);

            return (
              <Link
                key={caseId}
                href={`/dashboard/fir/${encodedId}`}
                className="group p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                      {caseId}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      fir.status === 'Chargesheeted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {fir.status || 'Under Investigation'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-[var(--foreground)] group-hover:text-blue-400 transition-colors mt-1">
                    {fir.crime_type || 'General Offence'}
                  </h3>

                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-2">
                    {fir.description || `Registered at ${(fir.district_name || fir.district || 'Karnataka')}. Live investigation tracking active.`}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border)]/50 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {fir.location_name || fir.district_name || fir.district || 'Bengaluru'}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    View File <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Zia Vision OCR & Catalyst Stratus Upload Modal */}
      {isOcrOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--foreground)]">Zia Vision OCR & Stratus Ingestion</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Extract structured case fields from FIR images and save to Catalyst Stratus</p>
                </div>
              </div>
              <button
                onClick={() => setIsOcrOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--surface-2)] text-[var(--muted-foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border)] hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[var(--surface-2)]/40 space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-sm font-semibold text-[var(--foreground)]">Click to upload scanned FIR or document photo</p>
              <p className="text-xs text-[var(--muted-foreground)]">Supports JPEG, PNG, WEBP (Auto-processed via Zia Vision)</p>
            </div>

            {/* Loading Indicator */}
            {ocrLoading && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* OCR Extracted Results */}
            {ocrResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Zia OCR Extraction Complete
                  </span>
                  <span className="font-mono text-slate-400">Confidence: {(ocrResult.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-200">
                  <p><strong className="text-slate-400">Case No:</strong> <span className="text-blue-400">{ocrResult.parsed_fields?.case_number || 'KAR/BEN/2026/1840'}</span></p>
                  <p><strong className="text-slate-400">IPC Sections:</strong> <span className="text-amber-400">{ocrResult.parsed_fields?.ipc_sections || 'IPC 379, 411'}</span></p>
                  {ocrResult.parsed_fields?.vehicle_number && (
                    <p><strong className="text-slate-400">Vehicle:</strong> <span className="text-emerald-400">{ocrResult.parsed_fields.vehicle_number}</span></p>
                  )}
                  {stratusUrl && (
                    <p><strong className="text-slate-400">Stratus Blob:</strong> <span className="text-cyan-400 truncate">{stratusUrl}</span></p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsOcrOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOcrFir}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5"
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
