'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Shield, ChevronRight, AlertTriangle,
  FileText, MapPin, Phone, Clock, Activity, Eye,
  TrendingUp, Zap, Network, CheckCircle, XCircle, AlertCircle,
  Mail, Bell, RefreshCw, Sparkles, CheckCircle2, Send, Car,
  ShieldAlert, Camera, Fingerprint, Radio, Gavel, FileCheck, Copy, Check
} from 'lucide-react';
import { DEMO_REPEAT_OFFENDERS, DEMO_FIRS, DEMO_TRAIL } from '@/lib/demo-data';
import { getSuspectMedia } from '@/lib/suspect-media';

// Slug → display name: "ramesh-kumar" → "Ramesh Kumar"
function slugToName(slug) {
  if (!slug) return 'Ramesh Kumar';
  return slug
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function nameToSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Format status
function formatStatus(status = '') {
  const s = String(status).trim().replace(/_/g, ' ');
  if (!s) return 'Active Surveillance';
  if (/abscond/i.test(s)) return 'Absconding Warrant';
  if (/watchlist/i.test(s)) return 'Active Surveillance';
  if (/arrest|custody/i.test(s)) return 'In Police Custody';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SuspectProfilePage() {
  const params = useParams();
  const router = useRouter();

  const rawSlug = params?.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : 'ramesh-kumar';
  let slug = 'ramesh-kumar';
  try {
    slug = decodeURIComponent(rawSlug || 'ramesh-kumar');
  } catch (_) {
    slug = rawSlug || 'ramesh-kumar';
  }

  const name = slugToName(slug || 'ramesh-kumar');

  // Load custom suspects from localStorage if present
  const [customSuspects, setCustomSuspects] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_suspects');
      if (stored) setCustomSuspects(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // Find suspect in demo data + custom suspects
  const allSuspects = [...(DEMO_REPEAT_OFFENDERS?.suspects || []), ...customSuspects];
  
  let suspect = allSuspects.find((s) => {
    if (!s || !s.name) return false;
    const sSlug = nameToSlug(s.name);
    const querySlugLower = slug.toLowerCase();
    const queryNameLower = name.toLowerCase();
    return (
      s.suspect_id?.toLowerCase() === querySlugLower ||
      sSlug === querySlugLower ||
      s.name.toLowerCase() === queryNameLower
    );
  });

  if (!suspect) {
    suspect = allSuspects.find((s) => {
      if (!s || !s.name) return false;
      const sSlug = nameToSlug(s.name);
      const querySlugLower = slug.toLowerCase();
      const queryParts = querySlugLower.split(/[-_\s]+/);
      const targetParts = sSlug.split(/[-_\s]+/);

      if (queryParts.length >= 2 && targetParts.length >= 2) {
        return queryParts[0] === targetParts[0] && queryParts[1] === targetParts[1];
      }
      return false;
    });
  }

  if (!suspect) {
    const displayName = slugToName(slug);
    const firsList = DEMO_FIRS?.firs || [];
    const matchedFir = firsList.find((f) => f && f.accused_name && f.accused_name.toLowerCase().includes(displayName.toLowerCase()));

    suspect = {
      suspect_id: `SUS-${Math.floor(7000 + Math.random() * 2000)}`,
      name: displayName,
      alias: matchedFir?.accused_alias || `${displayName.split(' ')[0]} Operative`,
      age: 34,
      gender: 'Male',
      risk_score: matchedFir?.risk_score || matchedFir?.accused_risk || 78,
      status: matchedFir?.status?.toUpperCase() || 'ACTIVE_WATCHLIST',
      phone: '+91 98451 44109',
      district_name: matchedFir?.district_name || 'Bengaluru Urban',
      primary_modus_operandi: matchedFir?.description || 'Active person of interest linked to CCTNS law enforcement files. Utilizes secondary vehicle transit and localized safe houses across sector boundaries.',
      last_known_location: matchedFir?.location_name || 'Bengaluru Urban PS Jurisdiction',
      associated_firs: matchedFir ? [matchedFir.case_number] : ['FIR-2026-BL-4921', 'FIR-2026-BL-1104'],
      known_hangouts: [matchedFir?.location_name || 'Silk Board Junction Parking Bay', 'Madiwala Market Complex', 'Electronic City Toll Plaza'],
      known_associates: ['Suresh Naidu (SUS-7104)', 'Anand Shinde (SUS-9012)'],
      ipc_sections: ['IPC § 379', 'BNS § 303(2)', 'IPC § 34', 'IPC § 411'],
      anpr_hits: 6,
      camera_sightings: ['CAM-BLR-0045 (Silk Board TTMC)', 'CAM-BLR-0012 (MG Road)', 'CAM-WF-0082 (ITPB Pole)'],
    };
  }

  const media = getSuspectMedia(suspect);
  const [currentRiskScore, setCurrentRiskScore] = useState(suspect.risk_score || suspect.risk || 88);
  const [quickMlData, setQuickMlData] = useState(null);
  const [isScoring, setIsScoring] = useState(false);

  const [automlData, setAutomlData] = useState(null);
  const [isAutoMlLoading, setIsAutoMlLoading] = useState(false);

  const [mailSent, setMailSent] = useState(false);
  const [mailLoading, setMailLoading] = useState(false);

  const [pushSent, setPushSent] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const [activeToast, setActiveToast] = useState(null);

  const showToast = (toastData) => {
    setActiveToast(toastData);
    setTimeout(() => {
      setActiveToast(prev => (prev?.id === toastData.id ? null : prev));
    }, 6000);
  };

  // 1. Re-Score with QuickML (Cap #12)
  const handleQuickMlScoring = async () => {
    setIsScoring(true);
    try {
      const res = await fetch('/server/ml-risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accused_name: suspect.name,
          fir_count: suspect.associated_firs?.length || 3,
          prior_convictions: 2,
          crime_types: ['theft', 'robbery'],
          district_name: suspect.district_name || 'Bengaluru Urban'
        })
      });
      const data = await res.json();
      if (data.risk_score) {
        setCurrentRiskScore(data.risk_score);
        setQuickMlData(data);
        showToast({
          id: Date.now(),
          type: 'quickml',
          title: 'Catalyst QuickML Evaluated',
          desc: `Recidivism Score: ${data.risk_score}% (Confidence: ${(data.confidence * 100).toFixed(0)}%)`
        });
      }
    } catch (e) {
      alert('QuickML scoring failed: ' + e.message);
    } finally {
      setIsScoring(false);
    }
  };

  // 2. Predict with Zia AutoML (Cap #13)
  const handleAutoMlPredict = async () => {
    setIsAutoMlLoading(true);
    try {
      const res = await fetch('/server/zia-automl-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: {
            fir_count: suspect.associated_firs?.length || 3,
            crime_type_code: 'THEFT',
            district_name: suspect.district_name || 'Bengaluru Urban',
            hour_of_crime: 22
          }
        })
      });
      const data = await res.json();
      setAutomlData(data);
      showToast({
        id: Date.now(),
        type: 'automl',
        title: 'Zia AutoML Forecast Ready',
        desc: `Predicted Category: ${data.prediction} (Probability: ${(data.probability * 100).toFixed(0)}%)`
      });
    } catch (e) {
      alert('Zia AutoML predict failed: ' + e.message);
    } finally {
      setIsAutoMlLoading(false);
    }
  };

  // 3. Dispatch Red Alert Mail (Cap #24)
  const handleSendMailAlert = async () => {
    setMailLoading(true);
    try {
      const res = await fetch('/server/send-alert-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: 'vedeshskhatri@gmail.com',
          officer_name: 'Inspector Anand Rao',
          case_number: suspect.associated_firs?.[0] || 'KAR/2026/URGENT',
          accused_name: `${suspect.name} (${suspect.alias || media.alias || 'Alias'})`,
          risk_score: currentRiskScore
        })
      });
      const data = await res.json();
      if (data.sent) {
        setMailSent(true);
        showToast({
          id: Date.now(),
          type: 'mail',
          title: '📧 Catalyst Mail Dispatched',
          desc: `Incident brief sent to Station SHO (ID: ${data.message_id || 'CAT-MAIL-01'})`
        });
      }
    } catch (e) {
      alert('Mail dispatch failed: ' + e.message);
    } finally {
      setMailLoading(false);
    }
  };

  // 4. Send Push Notification to Patrol (Cap #25)
  const handleSendPush = async () => {
    setPushLoading(true);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          new Notification(`🚨 KSP DRISHTI: ${suspect.name}`, {
            body: `High risk target (${currentRiskScore}%). Intercept notification sent to field units.`,
            icon: '/icon.png'
          });
        }
      }

      const res = await fetch('/server/push-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'PATROL_INTERCEPT_BLR_09',
          title: `🚨 RED ALERT: ${suspect.name}`,
          message: `Suspect flagged with ${currentRiskScore}% recidivism risk. High priority intercept required.`
        })
      });
      const data = await res.json();
      if (data.delivered) {
        setPushSent(true);
        showToast({
          id: Date.now(),
          type: 'push',
          title: '🔔 Catalyst Push Broadcast Delivered',
          desc: `Targeted intercept push sent to Patrol Unit (PATROL_INTERCEPT_BLR_09)`
        });
      }
    } catch (e) {
      alert('Push notification failed: ' + e.message);
    } finally {
      setPushLoading(false);
    }
  };

  const statusFormatted = formatStatus(suspect?.status);
  const isAbsconding = statusFormatted.toLowerCase().includes('abscond');
  const isCustody = statusFormatted.toLowerCase().includes('custody');
  const alias = suspect.alias || media.alias;
  const officialId = suspect.suspect_id || media.cctns_id;

  // Timeline events
  const timelineEvents = [
    { time: 'Today 14:22', event: `ANPR camera trigger on ${media.vehicle}`, camera: media.anpr_camera, type: 'anpr' },
    { time: 'Yesterday 21:30', event: `Mobile cellular tower handover near ${media.last_seen.split(',')[0]}`, camera: 'TOWER-BLR-009', type: 'tower' },
    { time: '3 Days Ago', event: `Linked as primary accused in ${suspect.associated_firs?.[0] || 'FIR-2026-BL-4921'}`, camera: 'CCTNS Registry', type: 'fir' },
    { time: 'Last Week', event: 'Physical surveillance check by Beat Officer #4 (Patrol Unit 09)', camera: 'Beat Check Log', type: 'patrol' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* ─── BREADCRUMB & TOP HEADER ─── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/dashboard/suspect" className="hover:text-slate-900 dark:hover:text-white transition-colors">Suspect Roster</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900 dark:text-white">{suspect.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Identity Snapshot */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 border-slate-300 dark:border-zinc-700 shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.mugshot}
                alt={suspect.name}
                className="w-full h-full object-cover"
              />
              <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                isAbsconding ? 'bg-rose-500 animate-pulse' : isCustody ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {suspect.name}
                </h1>
                {alias && (
                  <span className="text-xs text-slate-500 font-medium font-mono">“{alias}”</span>
                )}
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
                  {officialId}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-slate-500">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  isAbsconding
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50'
                    : isCustody
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50'
                }`}>
                  ● {statusFormatted}
                </span>
                <span>·</span>
                <span>{suspect.district_name || 'Bengaluru Urban'}</span>
                <span>·</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{media.confidence} Biometric Match</span>
              </div>
            </div>
          </div>

          {/* Recidivism Score Box & Re-Score Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-center">
              <span className={`text-2xl font-black font-mono block ${
                currentRiskScore >= 80 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {currentRiskScore}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                {currentRiskScore >= 80 ? 'CRITICAL RISK' : 'ELEVATED RISK'}
              </span>
            </div>

            <button
              onClick={handleQuickMlScoring}
              disabled={isScoring}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isScoring ? 'Scoring...' : 'Re-Score via QuickML'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── DOSSIER MAIN GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Core Criminal Intelligence (8 cols) ── */}
        <div className="lg:col-span-8 space-y-5">
          {/* QuickML / AutoML Forecast Alert Banner */}
          {(quickMlData || automlData) && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2.5 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Catalyst AI Model Evaluation
                </span>
                <span className="text-[10px] text-slate-400">QuickML & Zia AutoML Pipeline</span>
              </div>
              {quickMlData && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">QuickML Recidivism Index:</span>
                  <span className="text-emerald-400 font-bold">{quickMlData.risk_score}% Risk (Confidence: {(quickMlData.confidence * 100).toFixed(0)}%)</span>
                </div>
              )}
              {automlData && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Zia AutoML Prediction:</span>
                  <span className="text-rose-400 font-bold">{automlData.prediction} (Probability: {(automlData.probability * 100).toFixed(0)}%)</span>
                </div>
              )}
            </div>
          )}

          {/* Modus Operandi & Criminal Profile */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Modus Operandi & Offense Mechanics
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {suspect.primary_modus_operandi || 'Specializes in nocturnal vehicle theft, forced ignition bypass, and interstate contraband transport via peripheral toll corridors.'}
            </p>

            {/* Structured MO Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Linked Cases</span>
                <span className="font-black text-sm text-slate-900 dark:text-white font-mono block mt-0.5">{suspect.associated_firs?.length || 3} Charges</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Surveillance Hits</span>
                <span className="font-black text-sm text-indigo-600 dark:text-indigo-400 font-mono block mt-0.5">{suspect.anpr_hits || 6} ANPR Hits</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Operating Vehicle</span>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block mt-0.5">{media.vehicle.split('/')[0]}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Primary Sector</span>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block mt-0.5">{suspect.district_name || 'Bengaluru Urban'}</span>
              </div>
            </div>
          </div>

          {/* Associated FIRs Docket */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Associated Police FIR Cases ({suspect.associated_firs?.length || 3})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">CCTNS Cross-Indexed</span>
            </div>

            <div className="space-y-2">
              {(suspect.associated_firs || ['FIR-2026-BL-4921', 'FIR-2026-BL-1104']).map((firNum, idx) => {
                const fir = DEMO_FIRS.firs.find(f => f.case_number === firNum);
                return (
                  <Link
                    key={`${firNum}-${idx}`}
                    href={`/dashboard/fir/${encodeURIComponent(firNum)}`}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {firNum}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-slate-300">
                          {fir?.crime_type || 'Crimes Against Property'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {fir?.police_station || 'Madiwala Police Station'} · Filed: {fir?.date_filed || '2026-07-15'} · IO: {fir?.io_name || 'Insp. Sharma'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Active Docket
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Intelligence Surveillance Timeline */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Intelligence & Sighting Chronicle
              </h2>
            </div>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-100 dark:border-zinc-800 ml-2">
              {timelineEvents.map((item, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-indigo-600 dark:border-indigo-400" />
                  <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-slate-100 dark:border-zinc-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{item.time}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.camera}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-0.5">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Quick Intel & Intercept Dispatch (4 cols) ── */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4">
          {/* Tactical Catalyst Intercept Dispatch */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <Send className="w-4 h-4 text-indigo-600" />
              Catalyst Intercept Dispatch
            </h2>

            <div className="space-y-2">
              {/* Zia AutoML Incident Prediction */}
              <button
                onClick={handleAutoMlPredict}
                disabled={isAutoMlLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAutoMlLoading ? 'Predicting Severity...' : 'Predict Escalation (Zia AutoML)'}</span>
              </button>

              {/* Catalyst Mail Alert Dispatch */}
              <button
                onClick={handleSendMailAlert}
                disabled={mailLoading || mailSent}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border shadow-2xs ${
                  mailSent
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{mailLoading ? 'Sending Mail...' : mailSent ? 'SHO Alert Email Sent ✓' : 'Dispatch Red Alert Email (SHO)'}</span>
              </button>

              {/* Catalyst Push Notification */}
              <button
                onClick={handleSendPush}
                disabled={pushLoading || pushSent}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border shadow-2xs ${
                  pushSent
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{pushLoading ? 'Broadcasting...' : pushSent ? 'Patrol Intercept Sent ✓' : 'Broadcast Intercept Push (Patrol)'}</span>
              </button>
            </div>
          </div>

          {/* Quick Intelligence & Biometrics */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              Quick Intelligence & Biometrics
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                <span className="text-slate-400 font-medium">Contact Tel:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{suspect.phone || '+91 98451 44109'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                <span className="text-slate-400 font-medium">Flagged Vehicle:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{media.vehicle}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                <span className="text-slate-400 font-medium">Last Camera Hit:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">{media.anpr_camera.split('(')[0]}</span>
              </div>
            </div>

            {/* Applicable IPC / BNS Charges */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicable Statutory Sections</span>
              <div className="flex flex-wrap gap-1.5">
                {(suspect.ipc_sections || ['IPC § 379', 'BNS § 303(2)', 'IPC § 34', 'IPC § 411']).map((sec, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 text-[10px] font-mono font-bold">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Known Hangouts & Sector Coordinates */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <MapPin className="w-4 h-4 text-indigo-500" />
              Known Hangouts & Safe Houses
            </h2>

            <div className="space-y-1.5">
              {(suspect.known_hangouts || [
                'Silk Board Junction Parking Bay 3',
                'Madiwala Central Vegetable Yard',
                'Electronic City Phase 1 Toll Gate'
              ]).map((loc, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-zinc-800">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[9px] shrink-0">
                    {i + 1}
                  </span>
                  <span className="truncate">{loc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="space-y-2">
            <Link
              href="/dashboard/network"
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-2xs"
            >
              <Network className="w-4 h-4" />
              <span>Inspect Syndicate Network Graph</span>
            </Link>

            <button
              onClick={() => router.back()}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Suspect Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-[99999] max-w-md p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl text-white flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono">{activeToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activeToast.desc}</p>
          </div>
          <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-white p-1 text-xs">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
