'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Shield, ChevronRight, AlertTriangle,
  FileText, MapPin, Phone, Clock, Activity, Eye,
  TrendingUp, Zap, Network, CheckCircle, XCircle, AlertCircle,
  Mail, Bell, RefreshCw, Sparkles, CheckCircle2, Send
} from 'lucide-react';
import { DEMO_REPEAT_OFFENDERS, DEMO_FIRS, DEMO_TRAIL } from '@/lib/demo-data';
import { getSuspectMedia } from '@/lib/suspect-media';

// Slug → display name: "ramesh-kumar" → "Ramesh Kumar"
function slugToName(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Risk level helper
function getRiskLevel(score) {
  if (score >= 85) return { label: 'CRITICAL', color: 'text-critical-500', bg: 'bg-critical-500/10', border: 'border-critical-500/30' };
  if (score >= 65) return { label: 'HIGH', color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/30' };
  if (score >= 40) return { label: 'MEDIUM', color: 'text-phosphor-500', bg: 'bg-phosphor-500/10', border: 'border-phosphor-500/30' };
  return { label: 'LOW', color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/30' };
}

// Status helpers
function getStatusBadge(status) {
  switch (status) {
    case 'ACTIVE_WATCHLIST':
      return { label: 'Active Watchlist', color: 'text-warn-500', bg: 'bg-warn-500/10', border: 'border-warn-500/30', icon: AlertCircle };
    case 'ABSCONDING':
      return { label: 'Absconding', color: 'text-critical-500', bg: 'bg-critical-500/10', border: 'border-critical-500/30', icon: XCircle };
    case 'UNDER_SURVEILLANCE':
      return { label: 'Under Surveillance', color: 'text-phosphor-500', bg: 'bg-phosphor-500/10', border: 'border-phosphor-500/30', icon: Eye };
    case 'ARRESTED':
      return { label: 'Arrested', color: 'text-success-500', bg: 'bg-success-500/10', border: 'border-success-500/30', icon: CheckCircle };
    default:
      return { label: status, color: 'text-paper-100/50', bg: 'bg-steel-600/30', border: 'border-steel-600/50', icon: AlertCircle };
  }
}

// ─── Timeline events derived from DEMO_TRAIL
const DEMO_TIMELINE = [
  { time: '2026-07-18 14:22', event: 'ANPR sighting at Vijayanagar TTMC', type: 'sighting', camera: 'CAM-BLR-0010' },
  { time: '2026-07-18 14:35', event: 'Spotted on MG Road BATCS Signal Pole 5', type: 'sighting', camera: 'CAM-BLR-0012' },
  { time: '2026-07-18 15:10', event: 'Flagged crossing Hosur Road checkpost', type: 'alert', camera: 'CAM-BLR-0015' },
  { time: '2026-07-17 21:30', event: 'Observed near Silk Board Metro', type: 'sighting', camera: 'CAM-BLR-0009' },
  { time: '2026-07-15 10:05', event: 'Vehicle KA-01-MJ-8821 linked to FIR filed', type: 'fir', fir: 'FIR-2026-BL-4921' },
];

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

  // Find suspect in demo data or default
  const suspectsList = DEMO_REPEAT_OFFENDERS?.suspects || [];
  
  let suspect = suspectsList.find((s) => {
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
    suspect = suspectsList.find((s) => {
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
      status: matchedFir?.status?.toUpperCase() || 'UNDER_INVESTIGATION',
      phone: '+91 98451 44109',
      district_name: matchedFir?.district_name || 'Bengaluru Urban',
      primary_modus_operandi: matchedFir?.description || 'Active person of interest linked to CCTNS law enforcement files.',
      last_known_location: matchedFir?.location_name || 'Bengaluru Urban PS Jurisdiction',
      associated_firs: matchedFir ? [matchedFir.case_number] : ['FIR-2026-BL-9104'],
      known_hangouts: [matchedFir?.location_name || 'Bengaluru Central'],
      known_associates: ['Suresh Naidu (SUS-7104)', 'Ramesh Kumar (SUS-8842)'],
      ipc_sections: ['IPC §323', 'IPC §379', 'IPC §34'],
      anpr_hits: 4,
      camera_sightings: ['CAM-BLR-0010', 'CAM-BLR-0012'],
    };
  }

  // ── Catalyst Interactive States ──────────────────────────────────────────
  const [currentRiskScore, setCurrentRiskScore] = useState(suspect.risk_score || 85);
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
          fir_count: suspect.associated_firs?.length || 4,
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
            fir_count: suspect.associated_firs?.length || 4,
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
          accused_name: `${suspect.name} (${suspect.alias || 'Alias'})`,
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
          desc: `Incident brief sent to vedeshskhatri@gmail.com (ID: ${data.message_id || 'CAT-MAIL-01'})`
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
      // Browser notification if permitted
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

  const risk = getRiskLevel(currentRiskScore);
  const status = getStatusBadge(suspect?.status || 'ACTIVE_WATCHLIST');
  const StatusIcon = status.icon;

  return (
    <div className="min-h-full bg-void-000 flex flex-col">
      {/* ── Page Header ── */}
      <div className="px-6 py-4 border-b border-steel-600/40 bg-steel-700/40 backdrop-blur-sm flex-shrink-0">
        <nav className="flex items-center gap-2 text-xs text-paper-100/40 mb-3">
          <Link href="/dashboard" className="hover:text-paper-100 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/dashboard/suspect" className="hover:text-paper-100 transition-colors">Suspect Roster</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-paper-100/70">{suspect.name}</span>
        </nav>

        <div className="flex items-center gap-4 flex-wrap">
          {(() => {
            const media = getSuspectMedia(suspect);
            return (
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shrink-0 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.mugshot}
                  alt={suspect.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  currentRiskScore >= 75 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`} />
              </div>
            );
          })()}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-paper-100">{suspect.name}</h1>
              {suspect.alias && (
                <span className="text-xs text-paper-100/50 font-mono">alias &quot;{suspect.alias}&quot;</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="font-mono text-xs text-paper-100/40">{suspect.suspect_id}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.color} ${status.bg} ${status.border}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
          </div>

          {/* Risk score & QuickML Re-Score Button */}
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl border ${risk.bg} ${risk.border}`}>
              <span className={`text-2xl font-bold font-mono ${risk.color}`}>{currentRiskScore}</span>
              <span className="text-[9px] uppercase tracking-widest text-paper-100/40 mt-0.5">Risk Score</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${risk.color}`}>{risk.label}</span>
            </div>

            <button
              onClick={handleQuickMlScoring}
              disabled={isScoring}
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {isScoring ? 'Scoring with QuickML...' : 'Re-Score via QuickML'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── LEFT COL: Intelligence Cards ── */}
          <div className="md:col-span-2 space-y-5">

            {/* QuickML & Zia AutoML Real-Time Intelligence Card */}
            {(quickMlData || automlData) && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Catalyst AI Model Evaluation
                  </span>
                  <span className="text-[10px] text-slate-400">QuickML & Zia AutoML Native</span>
                </div>

                {quickMlData && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">QuickML Recidivism Pipeline:</span>
                    <span className="text-emerald-400 font-bold">{quickMlData.risk_score}% Risk (Confidence: {(quickMlData.confidence * 100).toFixed(0)}%)</span>
                  </div>
                )}

                {automlData && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Zia AutoML Escalation Prediction:</span>
                    <span className="text-rose-400 font-bold">{automlData.prediction} (Prob: {(automlData.probability * 100).toFixed(0)}%)</span>
                  </div>
                )}
              </div>
            )}

            {/* Modus Operandi */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-phosphor-500" />
                </div>
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Modus Operandi</h2>
              </div>
              <p className="text-paper-100/80 text-sm leading-relaxed">
                {suspect.primary_modus_operandi}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-steel-700/50 rounded-xl p-3 border border-steel-600/40">
                  <p className="text-[9px] uppercase tracking-widest text-paper-100/30 mb-1">FIRs Linked</p>
                  <p className="text-lg font-bold font-mono text-paper-100">{suspect.associated_firs?.length || 0}</p>
                </div>
                <div className="bg-steel-700/50 rounded-xl p-3 border border-steel-600/40">
                  <p className="text-[9px] uppercase tracking-widest text-paper-100/30 mb-1">Known Locations</p>
                  <p className="text-lg font-bold font-mono text-paper-100">{suspect.known_hangouts?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Associated FIRs */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-warn-500/10 border border-warn-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-warn-500" />
                </div>
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Associated FIRs</h2>
              </div>
              <div className="space-y-3">
                {suspect.associated_firs?.map((firNum, idx) => {
                  const fir = DEMO_FIRS.firs.find(f => f.case_number === firNum);
                  return (
                    <Link
                      key={`${firNum}-${idx}`}
                      href={`/dashboard/fir/${encodeURIComponent(firNum)}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-steel-700/40 border border-steel-600/40 hover:border-phosphor-500/30 hover:bg-phosphor-500/5 transition-all group"
                    >
                      <div>
                        <p className="font-mono text-sm font-bold text-phosphor-500">{firNum}</p>
                        {fir && (
                          <>
                            <p className="text-xs text-paper-100/60 mt-0.5">{fir.crime_type}</p>
                            <p className="text-xs text-paper-100/40 mt-0.5">{fir.police_station} · {fir.date_filed}</p>
                          </>
                        )}
                        {!fir && (
                          <p className="text-xs text-paper-100/40 mt-0.5">Case record on file</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-paper-100/30 group-hover:text-phosphor-500 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Intelligence Timeline */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-phosphor-500" />
                </div>
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Intelligence Timeline</h2>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-steel-600/40" />
                <div className="space-y-4 pl-9">
                  {DEMO_TIMELINE.map((item, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 ${
                        item.type === 'alert'
                          ? 'bg-critical-500/30 border-critical-500'
                          : item.type === 'fir'
                          ? 'bg-warn-500/30 border-warn-500'
                          : 'bg-phosphor-500/30 border-phosphor-500'
                      }`} />
                      <p className="text-[9px] font-mono text-paper-100/30 mb-0.5">{item.time}</p>
                      <p className="text-xs text-paper-100/80">{item.event}</p>
                      {item.camera && (
                        <span className="text-[9px] font-mono text-paper-100/30">{item.camera}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COL: Quick Intel & Multi-Channel Action Buttons ── */}
          <div className="space-y-5">

            {/* Catalyst Dispatch Actions Card */}
            <div className="p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 shadow-md">
              <h2 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                <Send className="w-4 h-4 text-blue-500" />
                Catalyst Intercept Dispatch
              </h2>

              {/* Zia AutoML Incident Prediction */}
              <button
                onClick={handleAutoMlPredict}
                disabled={isAutoMlLoading}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {isAutoMlLoading ? 'Predicting Severity...' : 'Predict Escalation (Zia AutoML)'}
              </button>

              {/* Catalyst Mail Alert Dispatch */}
              <button
                onClick={handleSendMailAlert}
                disabled={mailLoading || mailSent}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  mailSent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                {mailLoading ? 'Sending Catalyst Mail...' : mailSent ? 'SHO Alert Email Sent ✓' : 'Dispatch Red Alert Email (SHO)'}
              </button>

              {/* Catalyst Push Notification */}
              <button
                onClick={handleSendPush}
                disabled={pushLoading || pushSent}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  pushSent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                {pushLoading ? 'Broadcasting Push...' : pushSent ? 'Patrol Push Delivered ✓' : 'Broadcast Intercept Push (Patrol)'}
              </button>
            </div>

            {/* Contact / Bio */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-paper-100 text-sm tracking-wide mb-4">Quick Intel</h2>
              <div className="space-y-3">
                {suspect.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-3.5 h-3.5 text-paper-100/30 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-paper-100/30">Known Contact</p>
                      <p className="font-mono text-xs text-paper-100/80">{suspect.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-3.5 h-3.5 text-paper-100/30 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-paper-100/30">Threat Level</p>
                    <p className={`text-xs font-bold ${risk.color}`}>{risk.label} RISK</p>
                  </div>
                </div>
              </div>

              {/* IPC Sections */}
              {suspect.ipc_sections?.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-[var(--status-critical)]/8 border border-[var(--status-critical)]/20">
                  <p className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">IPC/BNS Charges</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suspect.ipc_sections.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[var(--status-critical)]/15 border border-[var(--status-critical)]/30 text-[var(--status-critical)] text-[10px] font-mono font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Known Hangouts */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-3.5 h-3.5 text-phosphor-500" />
                <h2 className="font-semibold text-paper-100 text-sm tracking-wide">Known Hangouts</h2>
              </div>
              <div className="space-y-2">
                {suspect.known_hangouts?.map((loc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-steel-700/40 border border-steel-600/40">
                    <div className="w-5 h-5 rounded-full bg-phosphor-500/10 border border-phosphor-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-mono font-bold text-phosphor-500">{i + 1}</span>
                    </div>
                    <p className="text-xs text-paper-100/70">{loc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 btn-secondary text-sm w-full justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <Link
                href="/dashboard/network"
                className="flex items-center gap-2 btn-primary text-sm w-full justify-center"
              >
                <Network className="w-4 h-4" />
                View in Network Graph
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* Floating HUD Alert Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-[99999] max-w-md p-4 rounded-2xl bg-slate-900/95 border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-xl text-slate-100 animate-slide-up flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider">{activeToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activeToast.desc}</p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white text-xs font-mono p-1"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
