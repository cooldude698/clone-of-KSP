'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_ANPR_RESULT } from '@/lib/demo-data';
import { speakText } from '@/utils/textToSpeech';
import {
  Camera, WifiOff, Eye, MapPin, Maximize2, X,
  ShieldAlert, Search, AlertTriangle, CheckCircle2, ChevronRight,
  ExternalLink, Zap, Radio, Volume2, ShieldCheck, RefreshCw,
  UserCheck, Layers, Grid, List, Activity, Filter, FileText, Info,
  Pause, Play, Target, User, Scan, Sparkles, Sliders, EyeOff
} from 'lucide-react';

// ─── Clean Audio Engine (Tone Synth + Audio Files) ───────────────────────────
function playSurveillanceSound(type) {
  if (typeof window === 'undefined') return;
  try {
    const audioMap = {
      beep: '/sounds/beep.mp3',
      lock: '/sounds/lock.mp3',
      alert: '/sounds/alert.mp3',
    };

    if (audioMap[type]) {
      const audio = new Audio(audioMap[type]);
      audio.volume = 0.6;
      audio.play().catch(() => playWebAudioSynth(type));
    } else {
      playWebAudioSynth(type);
    }
  } catch (_) {
    playWebAudioSynth(type);
  }
}

function playWebAudioSynth(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'lock') {
      [0, 0.05].forEach((delay, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(1100 + idx * 250, now + delay);
        g.gain.setValueAtTime(0.2, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);
        o.start(now + delay); o.stop(now + delay + 0.04);
      });
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    }
  } catch (e) {
    console.warn('[Surveillance Sound]', e);
  }
}

function speakDrishtiAlert(text) {
  if (!text) return;
  speakText(text, 'en').catch(() => {});
}

// CCTV Video CDN Mapping
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/vedeshskhatri/kspdatathon2026@6b33c15b04de078cc4b0723c051a559d69cd6e64/nextjs/public/videos';

const CAMERA_SPECIFIC_VIDEOS = {
  'CAM-BLR-0010': `${CDN_BASE}/traffic1.mp4`,
  'CAM-BLR-0012': `${CDN_BASE}/people1.mp4`,
  'CAM-BLR-0015': `${CDN_BASE}/traffic2.mp4`,
  'CAM-BLR-0035': `${CDN_BASE}/people3.mp4`,
  'CAM-BLR-0042': `${CDN_BASE}/people2.mp4`,
  'CAM-BLR-0050': `${CDN_BASE}/traffic3.mp4`,
  'CAM-BLR-0055': `${CDN_BASE}/people4.mp4`,
  'CAM-BLR-0060': `${CDN_BASE}/traffic4.mp4`,
};

// Dynamic AI Tracking Timeline Profiles per Camera
// Defines exact time windows (start/end in seconds) and dynamic coordinate interpolation
const DYNAMIC_DETECTION_PROFILES = {
  'CAM-BLR-0055': {
    name: 'Farid Mirza',
    alias: 'Chotta Mirza',
    suspectId: 'SUS-6091',
    riskScore: 92,
    confidence: 95.3,
    type: 'FACE AI',
    tag: 'FARID MIRZA (RED SHIRT)',
    fir: 'FIR-2026-BL-3104',
    ipc: 'IPC §395, §397 (Armed Dacoity)',
    lastSeen: 'KSRTC Majestic Terminal 3 Platform',
    status: 'WANTED / CRITICAL',
    targetCue: 'Pedestrian in Red Shirt with Travel Bag walking left-to-right on platform',
    incidentBriefing: 'Subject Farid Mirza identified walking across KSRTC Majestic Terminal Platform 3 during live biometric sweep. Linked to armed robbery series under FIR-2026-BL-3104.',
    aiRationale: '128-point biometric facial landmarks aligned against KSP wanted database with 95.3% confidence.',
    drishtiSpeech: 'Alert. Biometric match confirmed on Camera BLR 0055. Farid Mirza detected at Majestic Terminal 3.',
    // Active detection window: appears after 1.2s, tracks left to right, disappears at 8.8s
    activeWindow: { start: 1.2, end: 8.8 },
    startBox: { x: 18, y: 30, w: 14, h: 22 },
    endBox:   { x: 44, y: 33, w: 15, h: 23 },
  },
  'CAM-BLR-0012': {
    name: 'Ramesh Kumar',
    alias: 'Bullet Ramesh',
    suspectId: 'SUS-8842',
    riskScore: 94,
    confidence: 96.1,
    type: 'FACE AI',
    tag: 'RAMESH KUMAR (SUSPECT)',
    fir: 'FIR-2024-BLR-0842',
    ipc: 'IPC §379, §392 (Serial Vehicle Theft & Robbery)',
    lastSeen: 'Commercial Street Pedestrian Arcade',
    status: 'WANTED / CRITICAL',
    targetCue: 'Subject in dark jacket walking along pedestrian walkway towards camera',
    incidentBriefing: 'Prime kingpin Ramesh Kumar identified on Commercial Street walkway. Active non-bailable warrant in multiple vehicle theft syndicates.',
    aiRationale: 'Facial vector match confirmed against CCTNS high-risk repeat offender profile (96.1% score).',
    drishtiSpeech: 'Alert. Suspect match confirmed on Camera BLR 0012. Bullet Ramesh at Commercial Street Arcade.',
    activeWindow: { start: 1.0, end: 8.5 },
    startBox: { x: 40, y: 18, w: 13, h: 21 },
    endBox:   { x: 43, y: 22, w: 15, h: 24 },
  },
  'CAM-BLR-0015': {
    name: 'KA-05-NB-1102',
    alias: 'Silver Maruti Suzuki Swift',
    suspectId: 'VEH-1102',
    riskScore: 91,
    confidence: 99.1,
    type: 'ANPR',
    tag: 'KA-05-NB-1102 (STOLEN SWIFT)',
    fir: 'FIR-2026-MYS-0112',
    ipc: 'IPC §379 (Stolen Vehicle Watchlist)',
    lastSeen: 'Chickpet Main Road Traffic Checkpoint',
    status: 'STOLEN VEHICLE HIT',
    targetCue: 'Silver Maruti Swift approaching traffic checkpoint lane',
    incidentBriefing: 'Silver Maruti Swift flagged by optical ANPR sensor entering Chickpet intersection. Vehicle reported stolen from Jayanagar (FIR-2026-MYS-0112).',
    aiRationale: 'Optical Character Recognition (OCR) verified plate number with 99.1% match against KSP Stolen Vehicle Registry.',
    drishtiSpeech: 'ANPR Alert. Stolen vehicle KA 05 NB 1102 detected at Chickpet Checkpoint.',
    activeWindow: { start: 1.5, end: 8.2 },
    startBox: { x: 20, y: 42, w: 26, h: 22 },
    endBox:   { x: 30, y: 45, w: 28, h: 23 },
  },
  'CAM-BLR-0042': {
    name: 'Suresh Naidu',
    alias: 'Snake Naidu',
    suspectId: 'SUS-7104',
    riskScore: 88,
    confidence: 92.8,
    type: 'FACE AI',
    tag: 'SURESH NAIDU (CO-ACCUSED)',
    fir: 'FIR-2026-BL-4921',
    ipc: 'IPC §420, §120B (Extortion & Highway Loot)',
    lastSeen: 'Koramangala 5th Block Portico',
    status: 'CO-ACCUSED HIT',
    targetCue: 'Subject standing near building entrance portico',
    incidentBriefing: 'Co-accused Suresh Naidu spotted at Koramangala portico entrance. Subject associated with active inter-district extortion syndicate.',
    aiRationale: 'Low-light biometric facial classification matched against absconding list (92.8% confidence).',
    drishtiSpeech: 'Alert. Facial hit confirmed on Camera BLR 0042. Suresh Naidu at Koramangala 5th Block.',
    activeWindow: { start: 1.8, end: 9.0 },
    startBox: { x: 26, y: 24, w: 15, h: 24 },
    endBox:   { x: 29, y: 26, w: 16, h: 25 },
  },
  'CAM-BLR-0050': {
    name: 'KA-03-HA-4410',
    alias: 'Dark Blue Honda City',
    suspectId: 'VEH-4410',
    riskScore: 89,
    confidence: 97.6,
    type: 'ANPR',
    tag: 'KA-03-HA-4410 (HONDA CITY)',
    fir: 'FIR-2026-BL-5012',
    ipc: 'IPC §379 (Highway Robbery Watchlist)',
    lastSeen: 'Silk Board Flyover BTP Junction',
    status: 'WATCHLIST HIT',
    targetCue: 'Dark Blue Sedan passing high-speed ANPR camera lane',
    incidentBriefing: 'Dark Blue Honda City flagged passing Silk Board flyover checkpoint. Vehicle linked to active highway crime investigation (FIR-2026-BL-5012).',
    aiRationale: 'High-speed ANPR camera plate recognition hit against active intelligence watchlist (97.6%).',
    drishtiSpeech: 'ANPR Alert. License plate KA 03 HA 4410 detected at Silk Board Flyover.',
    activeWindow: { start: 1.4, end: 8.0 },
    startBox: { x: 30, y: 36, w: 28, h: 22 },
    endBox:   { x: 36, y: 40, w: 30, h: 23 },
  },
  'CAM-BLR-0060': {
    name: 'KA-04-MH-9002',
    alias: 'Commercial Freight Truck',
    suspectId: 'VEH-9002',
    riskScore: 85,
    confidence: 98.9,
    type: 'ANPR',
    tag: 'KA-04-MH-9002 (FREIGHT TRUCK)',
    fir: 'FIR-2026-RUR-0089',
    ipc: 'IPC §379, §411 (Stolen Cargo Transit)',
    lastSeen: 'Nelamangala Expressway Toll (Lane 4)',
    status: 'TOLL INTERCEPT',
    targetCue: 'Commercial truck passing toll collection lane 4',
    incidentBriefing: 'Commercial cargo truck intercepted at Nelamangala Toll Plaza Lane 4. Suspected of transporting contraband cargo across border checkpoint.',
    aiRationale: 'ANPR optical toll scanner matched active vehicle seizure alert (98.9% match).',
    drishtiSpeech: 'ANPR Toll Alert. Commercial truck KA 04 MH 9002 intercepted at Nelamangala Expressway.',
    activeWindow: { start: 1.6, end: 8.6 },
    startBox: { x: 26, y: 28, w: 30, h: 30 },
    endBox:   { x: 32, y: 32, w: 32, h: 32 },
  },
  'CAM-BLR-0010': {
    name: 'KSP HQ Command Stream',
    alias: 'Senior IPS Officer Briefing',
    suspectId: 'HQ-CMD-01',
    riskScore: 0,
    confidence: 99.4,
    type: 'COMMAND',
    tag: 'KSP STATE HQ LIVE STREAM',
    fir: 'COMMAND-HQ',
    ipc: 'Official Press & Intelligence Briefing',
    lastSeen: 'Nrupatunga Road, Bengaluru',
    status: 'COMMAND PASS',
    targetCue: 'Senior IPS Officer Press Briefing',
    incidentBriefing: 'Official Karnataka State Police live headquarters press room feed. Senior officers presenting state-wide surveillance coordination.',
    aiRationale: 'Official authorized command stream pass.',
    drishtiSpeech: 'KSP Headquarters Press Briefing Stream active.',
    activeWindow: { start: 0.5, end: 9.5 },
    startBox: { x: 36, y: 14, w: 24, h: 34 },
    endBox:   { x: 38, y: 16, w: 25, h: 35 },
  },
  'CAM-BLR-0035': {
    name: 'KSP Night Checkpoint',
    alias: 'Outer Ring Road Patrol Sweep',
    suspectId: 'CHECK-ORR-04',
    riskScore: 10,
    confidence: 94.0,
    type: 'CCTV',
    tag: 'PATROL BARRICADE SWEEP',
    fir: 'PATROL-BARRICADE',
    ipc: 'Area Security Check Active',
    lastSeen: 'Outer Ring Road, Bengaluru',
    status: 'AREA SECURED',
    targetCue: 'Night Barricade Vehicle Inspection Checkpoint',
    incidentBriefing: 'Night barricade security checkpoint active on Outer Ring Road corridor. Routine inspection protocol in effect.',
    aiRationale: 'Sector monitoring stream active.',
    drishtiSpeech: 'Barricade inspection active on Outer Ring Road.',
    activeWindow: { start: 1.0, end: 9.0 },
    startBox: { x: 32, y: 36, w: 30, h: 25 },
    endBox:   { x: 35, y: 38, w: 31, h: 26 },
  }
};

const MOCK_CAMERAS = [
  {
    id: 'CAM-BLR-0055',
    name: 'KSRTC Majestic Terminal 3 Platform',
    location: 'Majestic Bus Station, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    fps: 60,
  },
  {
    id: 'CAM-BLR-0012',
    name: 'Commercial Street Pedestrian Arcade',
    location: 'Shivajinagar, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    fps: 60,
  },
  {
    id: 'CAM-BLR-0015',
    name: 'Chickpet Main Road Checkpoint',
    location: 'City Market Zone, Bengaluru',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    fps: 30,
  },
  {
    id: 'CAM-BLR-0010',
    name: 'KSP State HQ Press Room',
    location: 'Nrupatunga Road, Bengaluru',
    camera_type: 'cctv',
    is_active: true,
    has_anpr: false,
    has_face_recog: true,
    fps: 30,
  },
  {
    id: 'CAM-BLR-0035',
    name: 'KSP Night Barricade Checkpost',
    location: 'Outer Ring Road, Bengaluru',
    camera_type: 'cctv',
    is_active: true,
    has_anpr: false,
    has_face_recog: false,
    fps: 30,
  },
  {
    id: 'CAM-BLR-0042',
    name: 'Koramangala Executive Portico',
    location: '5th Block, Koramangala, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    fps: 60,
  },
  {
    id: 'CAM-BLR-0050',
    name: 'Silk Board Flyover BTP Junction',
    location: 'Silk Board, Outer Ring Road, Bengaluru',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    fps: 30,
  },
  {
    id: 'CAM-BLR-0060',
    name: 'Nelamangala Toll Plaza (Lane 4)',
    location: 'NH-48 Nelamangala Toll, Bengaluru Rural',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    fps: 30,
  },
  {
    id: 'CAM-BLR-0002',
    name: 'Banaswadi Sub-Division Gate 1',
    location: 'Banaswadi, Bengaluru',
    camera_type: 'cctv',
    is_active: false,
    has_anpr: false,
    has_face_recog: false,
    fps: 0,
  },
];

const INITIAL_EVENTS = [
  { time: '14:34:12', cam: 'CAM-BLR-0055', type: 'FACE AI', severity: 'critical', desc: 'Farid Mirza (SUS-6091) · KSRTC Majestic Terminal 3 · Spotted in Red Shirt · Conf: 95.3%' },
  { time: '14:32:07', cam: 'CAM-BLR-0012', type: 'FACE AI', severity: 'critical', desc: 'Ramesh Kumar (SUS-8842) · Commercial Street Pedestrian Arcade · Match Conf: 96.1%' },
  { time: '14:30:22', cam: 'CAM-BLR-0050', type: 'ANPR',    severity: 'warn',     desc: 'KA-03-HA-4410 (Honda City) · Silk Board Flyover Junction · Watchlist Match' },
  { time: '14:29:44', cam: 'CAM-BLR-0015', type: 'ANPR',    severity: 'warn',     desc: 'KA-05-NB-1102 (Silver Swift) · Chickpet Main Road Checkpoint · Stolen Vehicle Match' },
  { time: '14:28:51', cam: 'CAM-BLR-0042', type: 'FACE AI', severity: 'critical', desc: 'Suresh Naidu (SUS-7104) · Koramangala 5th Block Portico · Match Conf: 92.8%' },
  { time: '14:26:05', cam: 'CAM-BLR-0060', type: 'ANPR',    severity: 'warn',     desc: 'KA-04-MH-9002 (Freight Truck) · Nelamangala Toll Plaza Lane 4 · Toll Intercept' },
  { time: '14:25:13', cam: 'CAM-BLR-0010', type: 'COMMAND', severity: 'info',     desc: 'KSP State HQ Press Briefing Stream Live · Nrupatunga Road' },
];

// ─── Dynamic AI Stream Component ─────────────────────────────────────────────
function CameraStream({ cam, videoRef, isPaused, aiOverlayEnabled = true }) {
  const localVideo = CAMERA_SPECIFIC_VIDEOS[cam.id] || 'https://vjs.zencdn.net/v/oceans.mp4';
  const internalVideoRef = useRef(null);
  const activeVideoRef = videoRef || internalVideoRef;

  const profile = DYNAMIC_DETECTION_PROFILES[cam.id];
  const [hasError, setHasError] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [isTargetVisible, setIsTargetVisible] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [detectionConfidence, setDetectionConfidence] = useState(90);

  // High-frequency live timestamp OSD
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toISOString().replace('T', ' ').slice(0, 19) +
        '.' + String(now.getMilliseconds()).padStart(3, '0')
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 100);
    return () => clearInterval(interval);
  }, []);

  // Sync Pause/Resume
  useEffect(() => {
    if (!activeVideoRef || !activeVideoRef.current) return;
    if (isPaused) {
      activeVideoRef.current.pause();
    } else {
      activeVideoRef.current.play().catch(() => {});
    }
  }, [isPaused, activeVideoRef]);

  // Real-time Computer Vision Detection Loop tied to Video Playback
  useEffect(() => {
    const video = activeVideoRef.current;
    if (!video || !profile) return;

    let animId;
    const updateTracking = () => {
      if (video && !video.paused && !video.ended) {
        const currentTime = video.currentTime % 10; // Normalized 10s loop cycle
        const { start, end } = profile.activeWindow;

        if (currentTime >= start && currentTime <= end) {
          setIsTargetVisible(true);
          const progress = (currentTime - start) / (end - start);
          
          // Smooth Linear Interpolation (LERP) between start and end bounding boxes
          const interpX = profile.startBox.x + (profile.endBox.x - profile.startBox.x) * progress;
          const interpY = profile.startBox.y + (profile.endBox.y - profile.startBox.y) * progress;
          const interpW = profile.startBox.w + (profile.endBox.w - profile.startBox.w) * progress;
          const interpH = profile.startBox.h + (profile.endBox.h - profile.startBox.h) * progress;

          setCurrentBox({ x: interpX, y: interpY, w: interpW, h: interpH });
          
          // Slight realistic sensor confidence jitter
          const jitter = Math.sin(currentTime * 4) * 0.8;
          setDetectionConfidence((profile.confidence + jitter).toFixed(1));
        } else {
          // Out of detection window — subject has left or not yet entered frame
          setIsTargetVisible(false);
        }
      }
      animId = requestAnimationFrame(updateTracking);
    };

    animId = requestAnimationFrame(updateTracking);
    return () => cancelAnimationFrame(animId);
  }, [activeVideoRef, profile]);

  const isRed = profile?.riskScore > 50 || profile?.type === 'FACE AI';

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex flex-col justify-between p-3 overflow-hidden select-none font-mono">
      
      {/* Authentic High-Definition Video Stream */}
      {!hasError ? (
        <video
          ref={activeVideoRef}
          src={localVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95] contrast-[1.08]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
          Stream Connection Restoring...
        </div>
      )}

      {/* Subtle Cinematic Vignette (Zero artificial grid mesh) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

      {/* Top Stream OSD Telemetry HUD */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
          <span className="text-[10px] text-zinc-400 font-mono border-l border-white/20 pl-2">
            {cam.id}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {aiOverlayEnabled && isTargetVisible && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md border ${
              isRed
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-xs'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
            }`}>
              {profile?.type} LOCK
            </span>
          )}
          <span className="text-[9.5px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
            {timeStr || 'LIVE'}
          </span>
        </div>
      </div>

      {/* ── Dynamic Real-time AI Bounding Box (Only visible when target is detected) ── */}
      {aiOverlayEnabled && isTargetVisible && currentBox && (
        <div
          className={`absolute z-20 rounded-md border-2 transition-transform duration-75 pointer-events-none ${
            isRed
              ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
          }`}
          style={{
            top: `${currentBox.y}%`,
            left: `${currentBox.x}%`,
            width: `${currentBox.w}%`,
            height: `${currentBox.h}%`,
          }}
        >
          {/* Authentic Target Corner Reticles */}
          <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${isRed ? 'border-red-400' : 'border-emerald-300'}`} />
          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${isRed ? 'border-red-400' : 'border-emerald-300'}`} />
          <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${isRed ? 'border-red-400' : 'border-emerald-300'}`} />
          <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${isRed ? 'border-red-400' : 'border-emerald-300'}`} />

          {/* Dynamic AI Recognition Header Badge */}
          <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[9px] font-extrabold whitespace-nowrap shadow-lg flex items-center gap-1 ${
            isRed
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            <Target className="w-3 h-3 animate-spin text-white" style={{ animationDuration: '4s' }} />
            <span>{profile?.tag}</span>
            <span className="opacity-85 font-mono">({detectionConfidence}%)</span>
          </div>
        </div>
      )}

      {/* Optical Scan Line (Shows only when AI is searching) */}
      {aiOverlayEnabled && !isTargetVisible && (
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse pointer-events-none top-1/2" />
      )}

      {/* Bottom Telemetry OSD */}
      <div className="relative z-10 flex justify-between items-center text-[9px] text-zinc-400 mt-auto bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
        <span>{cam.fps || 30} FPS · 1080p HD</span>
        <span className="hidden sm:inline font-mono">LAT 12.9716° N · LNG 77.5946° E</span>
        <span className="text-zinc-300 font-bold">{cam.camera_type === 'face_recognition' ? 'Biometrics' : cam.camera_type === 'anpr' ? 'Optical ANPR' : 'Surveillance'}</span>
      </div>
    </div>
  );
}

// ─── Forensic Deep Inspection Modal ─────────────────────────────────────────
function CameraInspectionModal({ cam, onClose, onDispatch }) {
  const suspectData = DYNAMIC_DETECTION_PROFILES[cam.id] || DYNAMIC_DETECTION_PROFILES['CAM-BLR-0055'];
  const [stage, setStage] = useState('scan');
  const [dispatched, setDispatched] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [aiOverlayEnabled, setAiOverlayEnabled] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    playSurveillanceSound('beep');

    const t1 = setTimeout(() => {
      setStage('lock');
      playSurveillanceSound('lock');
    }, 1000);

    const t2 = setTimeout(() => {
      setStage('match');
      playSurveillanceSound('alert');
    }, 2200);

    const t3 = setTimeout(() => {
      setStage('identified');
      speakDrishtiAlert(suspectData.drishtiSpeech);
    }, 3400);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [cam.id, suspectData]);

  const handleDispatch = async () => {
    setDispatched(true);
    playSurveillanceSound('beep');

    try {
      fetch('/server/push-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'PATROL_UNIT_BLR_04',
          title: `🚨 TARGET HIT: ${suspectData.name}`,
          message: `Camera ${cam.id} (${cam.location}) flagged target. Risk: ${suspectData.riskScore}%. Immediate intercept required.`
        })
      }).catch(() => {});
    } catch (_) {}

    if (onDispatch) onDispatch(suspectData);
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99998] transition-opacity"
      />

      <div className="fixed inset-3 sm:inset-6 md:inset-8 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl z-[99999] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 text-zinc-100 font-sans">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">{cam.name}</h3>
              <p className="text-xs text-zinc-400 font-mono">{cam.id} · {cam.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-white transition-all cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isPaused ? 'Resume' : 'Freeze'}</span>
            </button>

            <button
              onClick={() => setAiOverlayEnabled(!aiOverlayEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                aiOverlayEnabled
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Toggle AI Recognition Bounding Box"
            >
              {aiOverlayEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{aiOverlayEnabled ? 'AI Layer: ON' : 'AI Layer: OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Viewport & Side Dossier */}
        <div className="flex-1 bg-black relative flex flex-col lg:flex-row items-stretch overflow-hidden">
          
          {/* Main Video Viewport */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
            <CameraStream cam={cam} videoRef={videoRef} isPaused={isPaused} aiOverlayEnabled={aiOverlayEnabled} />

            {/* Scanning Radar HUD */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-mono text-white">
                <Target className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>
                  {stage === 'scan' && 'Searching Video Stream...'}
                  {stage === 'lock' && 'Biometric Face Alignment in Progress...'}
                  {(stage === 'match' || stage === 'identified') && `🚨 MATCH CONFIRMED: ${suspectData.name} (${suspectData.confidence}%)`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Forensic Dossier Panel */}
          {stage === 'identified' && (
            <div className="w-full lg:w-[420px] bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto z-40">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-0.5 font-mono">
                      {suspectData.status}
                    </span>
                    <h4 className="text-xl font-extrabold text-white">{suspectData.name}</h4>
                    <p className="text-xs text-zinc-400 font-medium">Alias: “{suspectData.alias}”</p>
                  </div>
                  {suspectData.riskScore > 0 && (
                    <div className="text-right bg-red-950/40 border border-red-800/40 px-3 py-1.5 rounded-xl">
                      <span className="text-2xl font-black text-red-400 block leading-none font-mono">{suspectData.riskScore}</span>
                      <span className="text-[9px] text-zinc-400 font-bold block mt-0.5 font-mono">RISK SCORE</span>
                    </div>
                  )}
                </div>

                {/* Target Visual Cue Badge */}
                {suspectData.targetCue && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 flex items-center gap-2.5 text-xs text-red-300 font-semibold">
                    <Target className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Target Cue: {suspectData.targetCue}</span>
                  </div>
                )}

                {/* Structured Incident Synopsis & AI Rationale */}
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Live Incident Synopsis
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                      {suspectData.incidentBriefing}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Info className="w-3.5 h-3.5 text-emerald-400" />
                      AI Biometric Match Rationale
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      {suspectData.aiRationale}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-0.5 font-mono">FIR Case File</span>
                      {(() => {
                        const firNum = suspectData.fir || 'FIR-2026-BL-9104';
                        return (
                          <Link href={`/dashboard/fir/${encodeURIComponent(firNum)}`} className="font-bold text-blue-400 hover:underline flex items-center gap-1 font-mono">
                            {firNum} <ExternalLink className="w-3 h-3" />
                          </Link>
                        );
                      })()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-0.5 font-mono">Legal Sections</span>
                      <span className="font-bold text-red-400 truncate block font-mono text-[11px]">{suspectData.ipc}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-zinc-800 mt-4">
                {suspectData.riskScore > 50 && (
                  <button
                    onClick={handleDispatch}
                    disabled={dispatched}
                    className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                      dispatched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                    }`}
                  >
                    {dispatched ? (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        Patrol Intercept Unit Dispatched
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4.5 h-4.5" />
                        Dispatch Immediate Patrol Unit
                      </>
                    )}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/dashboard/trail?suspect=${suspectData.suspectId}`}
                    className="py-2.5 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold text-center transition-all"
                  >
                    View Geo Trail
                  </Link>
                  <button
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Camera Card ─────────────────────────────────────────────────────────────
function CameraCard({ cam, onInspect, onTriggerScan, aiOverlayEnabled }) {
  const profile = DYNAMIC_DETECTION_PROFILES[cam.id];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col group">
      {/* 16:9 Feed Viewport */}
      <div
        onClick={() => onInspect(cam)}
        className="relative aspect-video bg-black overflow-hidden cursor-pointer"
      >
        {cam.is_active ? (
          <>
            <CameraStream cam={cam} aiOverlayEnabled={aiOverlayEnabled} />

            {/* Hover Expand Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 bg-black/80 backdrop-blur-md p-3 rounded-full text-white shadow-xl">
              <Maximize2 className="w-5 h-5" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono">
            <WifiOff className="w-7 h-7" />
            <span className="text-xs font-bold uppercase tracking-wider">Feed Offline</span>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {cam.name}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 font-mono ${
              cam.camera_type === 'face_recognition'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : cam.camera_type === 'anpr'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
            }`}>
              {cam.camera_type === 'face_recognition' ? 'Face AI' : cam.camera_type === 'anpr' ? 'ANPR' : 'CCTV'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{cam.location}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          {cam.is_active ? (
            <button
              onClick={() => onInspect(cam)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-zinc-900 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
              <span>Verify Target</span>
            </button>
          ) : (
            <span className="text-xs text-zinc-400 italic">Offline</span>
          )}

          <button
            onClick={() => onInspect(cam)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-white hover:bg-blue-600 transition-all cursor-pointer"
            title="Inspect Stream"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Surveillance Page ──────────────────────────────────────────────────
export default function SurveillancePage() {
  const [filter, setFilter] = useState('all');
  const [activeCamModal, setActiveCamModal] = useState(null);
  const [detectionLog, setDetectionLog] = useState(INITIAL_EVENTS);
  const [aiOverlayEnabled, setAiOverlayEnabled] = useState(true);

  // ANPR Quick Lookup State
  const [plateInput, setPlateInput] = useState('');
  const [plateResult, setPlateResult] = useState(null);
  const [plateLoading, setPlateLoading] = useState(false);

  const handlePlateSearch = async () => {
    const plate = plateInput.trim();
    if (!plate) return;
    setPlateLoading(true);
    setPlateResult(null);

    const fallbackResult = {
      ...DEMO_ANPR_RESULT,
      plate_number: plate,
      _queried_plate: plate
    };

    try {
      const { data } = await fetchWithFallback('anpr-check', fallbackResult, {
        method: 'POST',
        body: { plate_number: plate }
      });
      setPlateResult({ ...(data || fallbackResult), _queried_plate: plate });
    } catch (err) {
      setPlateResult(fallbackResult);
    } finally {
      setPlateLoading(false);
    }
  };

  const filteredCameras = MOCK_CAMERAS.filter((c) => {
    if (filter === 'active') return c.is_active;
    if (filter === 'anpr') return c.has_anpr;
    if (filter === 'face') return c.has_face_recog;
    return true;
  });

  const activeCount = MOCK_CAMERAS.filter((c) => c.is_active).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">CCTV & ANPR Surveillance Command</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {activeCount} Active Feeds Online
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time biometric facial recognition and automated license plate reader (ANPR) camera matrix
          </p>
        </div>

        {/* Global Controls: AI Overlay Toggle + Audio */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAiOverlayEnabled(!aiOverlayEnabled)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-2xs ${
              aiOverlayEnabled
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{aiOverlayEnabled ? 'AI Tracking: ACTIVE' : 'AI Tracking: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Feeds' },
            { id: 'active', label: 'Online Only' },
            { id: 'anpr', label: 'ANPR Readers' },
            { id: 'face', label: 'Face AI Sensors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          Showing {filteredCameras.length} of {MOCK_CAMERAS.length} total streams
        </span>
      </div>

      {/* Camera Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map((cam) => (
          <CameraCard
            key={cam.id}
            cam={cam}
            onInspect={(c) => setActiveCamModal(c)}
            onTriggerScan={(c) => setActiveCamModal(c)}
            aiOverlayEnabled={aiOverlayEnabled}
          />
        ))}
      </div>

      {/* ANPR Quick Plate Query Engine */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
              ANPR Hotlist Plate Search & Verification
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Query optical recognition archive across Karnataka toll plazas and city junctions
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">STATE ANPR NETWORK</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handlePlateSearch()}
              placeholder="Enter Plate No (e.g., KA-01-MJ-8821, KA-05-NB-1102)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handlePlateSearch}
            disabled={plateLoading || !plateInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {plateLoading ? 'Searching...' : 'Scan Hotlist'}
          </button>
        </div>

        {plateResult && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
                  {plateResult._queried_plate}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Vehicle: {plateResult.vehicle_details || 'Bajaj Pulsar 220'} · Status: <strong className="text-red-500">{plateResult.status || 'HOTLIST MATCH'}</strong>
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/trail?plate=${plateResult._queried_plate}`}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold transition-all shadow-2xs"
            >
              Track Geo Trail →
            </Link>
          </div>
        )}
      </div>

      {/* Live Surveillance Audit Log */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            Live Surveillance Audit Log
          </h3>
          <span className="text-xs font-mono text-zinc-400">Auto-updating telemetry stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Camera Sensor</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Detection Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {detectionLog.map((ev, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 font-mono text-zinc-500">{ev.time}</td>
                  <td className="py-3 font-mono font-bold text-zinc-900 dark:text-white">{ev.cam}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ev.severity === 'critical'
                        ? 'text-red-600 dark:text-red-400 font-extrabold'
                        : ev.severity === 'warn'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-500'
                    }`}>
                      {ev.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-zinc-800 dark:text-zinc-200">{ev.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Modal */}
      {activeCamModal && (
        <CameraInspectionModal
          cam={activeCamModal}
          onClose={() => setActiveCamModal(null)}
          onDispatch={(target) => {
            setDetectionLog((prev) => [
              {
                time: new Date().toLocaleTimeString('en-GB'),
                cam: activeCamModal.id,
                type: 'DISPATCH',
                severity: 'critical',
                desc: `🚨 Intercept Dispatched for ${target.name} at ${activeCamModal.location}`,
              },
              ...prev,
            ]);
          }}
        />
      )}
    </div>
  );
}