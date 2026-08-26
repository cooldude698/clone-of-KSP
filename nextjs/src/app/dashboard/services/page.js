'use client';

import { useState } from 'react';
import {
  Cpu, Database, Sparkles, Send, Bell, Mail, ShieldAlert,
  Search, FileText, Image as ImageIcon, Volume2, Clock, Zap,
  Layers, HardDrive, CheckCircle2, AlertTriangle, RefreshCw,
  ArrowRight, Play, Terminal, Lock, Key, Server
} from 'lucide-react';

const SERVICES = [
  {
    id: 'quickml_rag',
    capNumber: 11,
    title: 'Catalyst QuickML RAG',
    service: 'QuickML LLM Serving & RAG',
    badge: 'LLM & RAG',
    icon: Sparkles,
    color: 'from-blue-600 to-indigo-600',
    description: 'Queries Karnataka Police SOPs, case laws, and live intelligence via GLM-4.7-Flash text-RAG.',
    endpoint: '/server/askDrishtiAI',
    method: 'POST',
    defaultPayload: { question: 'What is the standard operating procedure for vehicle theft at transit hubs?', lang: 'en' }
  },
  {
    id: 'zia_voice',
    capNumber: 15,
    title: 'Zia Audio STT & TTS',
    service: 'Zia Audio Services',
    badge: 'Voice AI',
    icon: Volume2,
    color: 'from-purple-600 to-pink-600',
    description: 'Neural Text-to-Speech synthesis and MediaRecorder-based speech-to-text audio transcription.',
    endpoint: '/server/drishtiVoice',
    method: 'POST',
    defaultPayload: { mode: 'tts', text: 'Vehicle KA-01-MJ-8821 detected at Silk Board junction. Officer alert dispatched.', lang: 'en' }
  },
  {
    id: 'zia_ocr',
    capNumber: 14,
    title: 'Zia Vision OCR',
    service: 'Zia Vision Services',
    badge: 'Vision AI',
    icon: ImageIcon,
    color: 'from-amber-600 to-orange-600',
    description: 'Optical Character Recognition extracting structured metadata from FIRs, vehicle RCs, and suspect IDs.',
    endpoint: '/server/zia-ocr',
    method: 'POST',
    defaultPayload: { image_base64: 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=', document_type: 'fir' }
  },
  {
    id: 'quickml_risk',
    capNumber: 12,
    title: 'QuickML Recidivism Scoring',
    service: 'Catalyst QuickML Pipelines',
    badge: 'No-Code ML',
    icon: Cpu,
    color: 'from-red-600 to-rose-600',
    description: 'Machine learning model assessing recidivism risk scores for repeat offender profiles.',
    endpoint: '/server/ml-risk-score',
    method: 'POST',
    defaultPayload: { accused_name: 'Ramesh Kumar @ Bullet Ramesh', fir_count: 7, prior_convictions: 3, crime_types: ['theft', 'robbery'], district_name: 'Bengaluru Urban' }
  },
  {
    id: 'zia_automl',
    capNumber: 13,
    title: 'Zia AutoML Crime Severity',
    service: 'Zia AutoML',
    badge: 'Automated ML',
    icon: Zap,
    color: 'from-emerald-600 to-teal-600',
    description: 'Predictive classification engine evaluating incident escalation likelihood and severity.',
    endpoint: '/server/zia-automl-predict',
    method: 'POST',
    defaultPayload: { features: { fir_count: 5, crime_type_code: 'VEHICLE_THEFT', district_name: 'Bengaluru Urban', hour_of_crime: 23 } }
  },
  {
    id: 'stratus_storage',
    capNumber: 8,
    title: 'Catalyst Stratus Blob Storage',
    service: 'Catalyst Stratus (S3-style)',
    badge: 'Object Store',
    icon: HardDrive,
    color: 'from-cyan-600 to-blue-600',
    description: 'Object and blob storage for crime scene evidence, suspect mugshots, and encrypted case files.',
    endpoint: '/server/stratus-upload',
    method: 'POST',
    defaultPayload: { file_base64: 'S1NQIERSSVNIVEkgRVZJREVOQ0UgQkxPQg==', filename: 'evidence_scan_blr_0042.dat', category: 'evidence' }
  },
  {
    id: 'catalyst_cache',
    capNumber: 9,
    title: 'Catalyst In-Memory Cache',
    service: 'Catalyst Cache (Segment: drishti_cache)',
    badge: 'Cache',
    icon: Database,
    color: 'from-yellow-600 to-amber-600',
    description: 'Sub-millisecond in-memory cache segment reducing redundant ZCQL database lookups.',
    endpoint: '/server/cache-hotspots?district=Bengaluru%20Urban',
    method: 'GET',
    defaultPayload: null
  },
  {
    id: 'datastore_search',
    capNumber: 10,
    title: 'Data Store Full-Text Search',
    service: 'Catalyst Data Store ZCQL',
    badge: 'Relational Search',
    icon: Search,
    color: 'from-indigo-600 to-violet-600',
    description: 'Multi-column full-text ZCQL queries across case records, locations, and suspect aliases.',
    endpoint: '/server/search-firs?q=theft&limit=5',
    method: 'GET',
    defaultPayload: null
  },
  {
    id: 'circuits_workflow',
    capNumber: 23,
    title: 'Catalyst Circuits Workflow',
    service: 'Catalyst Circuits',
    badge: 'Orchestration',
    icon: Layers,
    color: 'from-fuchsia-600 to-purple-600',
    description: 'Multi-step state machine orchestrating FIR ingestion, recidivism checks, and escalation dispatch.',
    endpoint: '/server/investigation-circuit',
    method: 'POST',
    defaultPayload: { case_number: 'KAR/CIRCUIT/2026/089', fir_data: { accused_name: 'Suresh Naidu', crime_type: 'Highway Robbery' } }
  },
  {
    id: 'signals_bus',
    capNumber: 22,
    title: 'Catalyst Signals Event Bus',
    service: 'Catalyst Signals (Pub/Sub)',
    badge: 'Event Bus',
    icon: Bell,
    color: 'from-rose-600 to-red-600',
    description: 'Cross-service pub/sub event bus broadcasting critical crime and ANPR surveillance alerts.',
    endpoint: '/server/on-alert-broadcast',
    method: 'POST',
    defaultPayload: { case_number: 'KAR/BEN/2026/1840', accused_name: 'Ramesh Kumar', district: 'Bengaluru Urban', severity: 'CRITICAL' }
  },
  {
    id: 'catalyst_mail',
    capNumber: 24,
    title: 'Catalyst Transactional Mail',
    service: 'Catalyst Mail',
    badge: 'Email Dispatch',
    icon: Mail,
    color: 'from-sky-600 to-blue-600',
    description: 'Official KSP intelligence dispatch with letterhead templates sent to Station House Officers.',
    endpoint: '/server/send-alert-mail',
    method: 'POST',
    defaultPayload: { to_email: 'inspector.koramangala@ksp.gov.in', officer_name: 'Inspector Anand Rao', case_number: 'KAR/BEN/2026/1840', accused_name: 'Ramesh Kumar', risk_score: 94 }
  },
  {
    id: 'catalyst_push',
    capNumber: 25,
    title: 'Catalyst Push Notifications',
    service: 'Catalyst Push Notifications',
    badge: 'Mobile Push',
    icon: Bell,
    color: 'from-lime-600 to-green-600',
    description: 'Real-time push alerts delivered to mobile patrol units and interceptor vehicles.',
    endpoint: '/server/push-notify',
    method: 'POST',
    defaultPayload: { user_id: 'PATROL_BLR_09', title: '🚨 ANPR Intercept Alert', message: 'Stolen Pulsar KA-01-MJ-8821 detected 800m ahead.' }
  },
  {
    id: 'catalyst_cron',
    capNumber: 20,
    title: 'Catalyst Scheduled Cron',
    service: 'Catalyst Cron (Schedule: 0 0 * * *)',
    badge: 'Scheduled Jobs',
    icon: Clock,
    color: 'from-slate-600 to-zinc-700',
    description: 'Automated midnight job recalculating district crime indices and updating risk tables.',
    endpoint: '/server/cron-night-recalc',
    method: 'GET',
    defaultPayload: null
  },
  {
    id: 'catalyst_auth',
    capNumber: 17,
    title: 'Catalyst Authentication',
    service: 'Catalyst User Management & Auth',
    badge: 'Security',
    icon: Lock,
    color: 'from-emerald-700 to-teal-800',
    description: 'Validates Catalyst project user credentials, role permissions, and station authorizations.',
    endpoint: '/server/auth-verify',
    method: 'POST',
    defaultPayload: { pin: '2026' }
  }
];

export default function CatalystServicesPage() {
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(SERVICES[0].defaultPayload, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  const handleSelect = (service) => {
    setSelectedService(service);
    setPayloadText(service.defaultPayload ? JSON.stringify(service.defaultPayload, null, 2) : '');
    setResponse(null);
    setExecutionTime(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      let body = null;
      if (selectedService.method === 'POST' && payloadText.trim()) {
        try {
          body = JSON.parse(payloadText);
        } catch (e) {
          alert('Invalid JSON in payload editor: ' + e.message);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(selectedService.endpoint, {
        method: selectedService.method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      const data = await res.json();
      const end = performance.now();
      setExecutionTime(Math.round(end - start));
      setResponse({ status: res.status, ok: res.ok, data });
    } catch (err) {
      const end = performance.now();
      setExecutionTime(Math.round(end - start));
      setResponse({ status: 500, ok: false, data: { error: true, message: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Server className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Zoho Catalyst Intelligence Grid</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% 26/26 Native Catalyst
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">Interactive Testing Console & Live Service Architecture for Karnataka State Police</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Capability List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedService.id === s.id;

            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-[var(--surface-2)] border-blue-500 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-[var(--surface-1)] border-[var(--border)] hover:border-slate-700 hover:bg-[var(--surface-2)]/50'
                }`}
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400">Cap #{s.capNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {s.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--foreground)] truncate">{s.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">{s.service}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Live Interactive Sandbox & Payload Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Selected Service Card */}
          <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Cap #{selectedService.capNumber}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {selectedService.method}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{selectedService.title}</h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1.5">{selectedService.description}</p>
              </div>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Execute Live
                  </>
                )}
              </button>
            </div>

            {/* Endpoint Bar */}
            <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Endpoint: <strong className="text-blue-400">{selectedService.endpoint}</strong></span>
              {executionTime !== null && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {executionTime}ms
                </span>
              )}
            </div>

            {/* Payload Editor (if POST) */}
            {selectedService.method === 'POST' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  JSON Request Payload
                </label>
                <textarea
                  rows={5}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}

            {/* Live Response Viewer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Catalyst Service Response
                </label>
                {response && (
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    response.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    HTTP {response.status}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> Invoking Catalyst Serverless Runtime...
                  </div>
                ) : response ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(response.data, null, 2)}</pre>
                ) : (
                  <div className="py-8 text-center text-slate-600">
                    Click &quot;Execute Live&quot; to test this Catalyst capability against live functions.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
