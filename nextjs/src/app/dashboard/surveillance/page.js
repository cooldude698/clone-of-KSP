'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_ANPR_RESULT } from '@/lib/demo-data';
import {
  Camera, WifiOff, Eye, MapPin, Maximize2, X,
  ShieldAlert, Search, AlertTriangle, CheckCircle2, ChevronRight,
  ExternalLink, Zap, Radio, Volume2, ShieldCheck, RefreshCw,
  UserCheck, Layers, Grid, List, Activity, Filter, FileText, Info,
  Pause, Play, Target, User
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
      audio.volume = 0.7;
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
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'lock') {
      [0, 0.06].forEach((delay, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(1200 + idx * 250, now + delay);
        g.gain.setValueAtTime(0.25, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);
        o.start(now + delay); o.stop(now + delay + 0.05);
      });
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now); osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn('[Surveillance Sound]', e);
  }
}

// ─── DRISHTI Voice Alert Speech ──────────────────────────────────────────────
function speakDrishtiAlert(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    u.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('google')) || voices[0];
    if (bestVoice) u.voice = bestVoice;
    window.speechSynthesis.speak(u);
  } catch (_) {}
}

// CCTV Video Mapping — direct GitHub CDN URLs pinned to commit 6b33c15b04de078cc4b0723c051a559d69cd6e64 containing your real KSP project videos!
const CDN_BASE = 'https://raw.githubusercontent.com/vedeshskhatri/kspdatathon2026/6b33c15b04de078cc4b0723c051a559d69cd6e64/nextjs/public/videos';

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

// ── Pinpoint Biometric Data & Precise Face/Plate Box Framing ──
const CINEMATIC_SUSPECT_DATA = {
  'CAM-BLR-0055': {
    name: 'Farid Mirza',
    alias: 'Chotta Mirza',
    suspectId: 'SUS-6091',
    riskScore: 92,
    confidence: 95.3,
    fir: 'FIR-2026-BL-3104',
    ipc: 'IPC §395, §397 (Dacoity with Deadly Weapons)',
    lastSeen: 'KSRTC Majestic Terminal 3 Platform',
    status: 'WANTED / HIGH DANGER',
    targetCue: 'Man wearing Red Shirt & Travel Bag walking left-to-right across bus platform',
    incidentBriefing: 'Subject identified walking across KSRTC Bus Terminal Platform 3 during routine AI biometric sweep. Wanted in connection with armed dacoity at Majestic jewelry store (FIR-2026-BL-3104). Subject spotted wearing red shirt carrying travel bag.',
    aiRationale: '128-point facial landmark alignment matched against KSP Wanted Biometric Registry with 95.3% confidence score.',
    drishtiSpeech: 'Alert. Facial match confirmed on Camera BLR 0055. Farid Mirza detected at Majestic Bus Stand Terminal 3.',
    cropBox: { x: 25, y: 32, w: 14, h: 22 }, // Tight face box framing the man in red shirt
  },
  'CAM-BLR-0012': {
    name: 'Ramesh Kumar',
    alias: 'Bullet Ramesh',
    suspectId: 'SUS-8842',
    riskScore: 94,
    confidence: 96.1,
    fir: 'FIR-2024-BLR-0842',
    ipc: 'IPC §379, §392, §34 (Armed Robbery)',
    lastSeen: 'Commercial Street Pedestrian Arcade',
    status: 'WANTED / CRITICAL',
    targetCue: 'Pedestrian in center walkway walking towards camera',
    incidentBriefing: 'Primary suspect Ramesh Kumar identified walking along Commercial Street pedestrian plaza arcade. Active warrant in armed robbery and chain snatching series (FIR-2024-BLR-0842).',
    aiRationale: 'Facial feature vector matched against CCTNS suspect wanted profile with 96.1% confidence score.',
    drishtiSpeech: 'Alert. Facial match confirmed on Camera BLR 0012. Ramesh Kumar, alias Bullet Ramesh. Commercial Street Pedestrian Arcade.',
    cropBox: { x: 42, y: 20, w: 12, h: 20 },
  },
  'CAM-BLR-0015': {
    name: 'KA-05-NB-1102',
    alias: 'Silver Maruti Suzuki Swift',
    suspectId: 'VEH-1102',
    riskScore: 91,
    confidence: 99.1,
    fir: 'FIR-2026-MYS-0112',
    ipc: 'IPC §379 (Stolen Car Watchlist)',
    lastSeen: 'Chickpet Main Road Traffic Checkpoint',
    status: 'STOLEN CAR MATCH',
    targetCue: 'Silver Maruti Suzuki Swift approaching checkpoint',
    incidentBriefing: 'Silver Maruti Suzuki Swift flagged by optical ANPR sensor approaching Chickpet Main Road checkpoint. Vehicle reported stolen from Jayanagar 4th Block (FIR-2026-MYS-0112).',
    aiRationale: 'Optical character recognition (OCR) plate extraction matched active Karnataka Stolen Vehicle Registry with 99.1% confidence.',
    drishtiSpeech: 'ANPR Alert. Silver Maruti Swift KA 05 NB 1102 detected at Chickpet Checkpoint. Stolen vehicle alert.',
    cropBox: { x: 22, y: 44, w: 28, h: 22 },
  },
  'CAM-BLR-0010': {
    name: 'KSP HQ Press Briefing',
    alias: 'Senior IPS Officer Command Stream',
    suspectId: 'HQ-CMD-01',
    riskScore: 0,
    confidence: 99.4,
    fir: 'COMMAND-HQ',
    ipc: 'Live Briefing · Karnataka State Police HQ',
    lastSeen: 'Nrupatunga Road, Bengaluru',
    status: 'COMMAND STREAM ACTIVE',
    targetCue: 'Senior IPS Officer at Podium',
    incidentBriefing: 'Karnataka State Police Headquarters live press briefing stream. Senior IPS officer detailing city-wide CCTNS surveillance matrix deployment to news media.',
    aiRationale: 'Authorized official stream — Headquarters Command Pass (99.4% stream health).',
    drishtiSpeech: 'KSP Headquarters Press Briefing Stream active. Senior IPS officer live briefing in progress.',
    cropBox: { x: 38, y: 15, w: 25, h: 35 },
  },
  'CAM-BLR-0035': {
    name: 'KSP Night Barricade Checkpost',
    alias: 'Outer Ring Road Security Check',
    suspectId: 'CHECK-ORR-04',
    riskScore: 15,
    confidence: 94.0,
    fir: 'PATROL-BARRICADE',
    ipc: 'Barricade Security Sweep Active',
    lastSeen: 'Outer Ring Road Checkpost, Bengaluru',
    status: 'BARRICADE ACTIVE',
    targetCue: 'Karnataka Police Night Barricade Checkpoint',
    incidentBriefing: 'Karnataka State Police night security checkpoint active on Outer Ring Road. Barricade security sweep and vehicle inspection in progress.',
    aiRationale: 'Sector Security Checkpoint — Area Monitoring Active (94.0% confidence).',
    drishtiSpeech: 'Karnataka Police checkpost active on Outer Ring Road. Barricade security sweep in progress.',
    cropBox: { x: 34, y: 38, w: 32, h: 26 },
  },
  'CAM-BLR-0042': {
    name: 'Suresh Naidu',
    alias: 'Naidu Bhai',
    suspectId: 'SUS-7104',
    riskScore: 88,
    confidence: 92.8,
    fir: 'FIR-2026-BL-4921',
    ipc: 'IPC §420, §120B (Extortion & Fraud)',
    lastSeen: 'Koramangala 5th Block Portico',
    status: 'CO-ACCUSED',
    targetCue: 'Executive Portico Entrance',
    incidentBriefing: 'Co-accused Suresh Naidu spotted at Koramangala 5th Block executive portico. Linked to active extortion and fraud syndicate (FIR-2026-BL-4921).',
    aiRationale: 'Low-light facial biometric match against co-accused database with 92.8% confidence score.',
    drishtiSpeech: 'Alert. Facial match confirmed on Camera BLR 0042. Suresh Naidu at Koramangala 5th Block portico.',
    cropBox: { x: 28, y: 26, w: 16, h: 25 },
  },
  'CAM-BLR-0050': {
    name: 'KA-03-HA-4410',
    alias: 'Dark Blue Honda City Sedan',
    suspectId: 'VEH-4410',
    riskScore: 89,
    confidence: 97.6,
    fir: 'FIR-2026-BL-5012',
    ipc: 'IPC §379 (Vehicle Theft / Highway Intercept)',
    lastSeen: 'Silk Board Flyover BTP Junction',
    status: 'WATCHLIST MATCH',
    targetCue: 'Dark Blue Honda City Sedan',
    incidentBriefing: 'Dark Blue Honda City flagged passing Silk Board flyover ANPR reader. Vehicle linked to active highway robbery investigation (FIR-2026-BL-5012).',
    aiRationale: 'ANPR plate scan matched active watchlist entry with 97.6% confidence.',
    drishtiSpeech: 'ANPR Alert. License plate KA 03 HA 4410 detected at Silk Board Flyover Junction. Watchlist pass match.',
    cropBox: { x: 32, y: 38, w: 30, h: 22 },
  },
  'CAM-BLR-0060': {
    name: 'KA-04-MH-9002',
    alias: 'Commercial Freight Truck',
    suspectId: 'VEH-9002',
    riskScore: 85,
    confidence: 98.9,
    fir: 'FIR-2026-RUR-0089',
    ipc: 'IPC §379, §411 (Stolen Goods Transport)',
    lastSeen: 'Nelamangala Expressway Toll Plaza (Lane 4)',
    status: 'TOLL INTERCEPT',
    targetCue: 'Commercial Freight Truck in Lane 4',
    incidentBriefing: 'Commercial freight truck intercepted at Nelamangala Toll Plaza Lane 4. Suspected of transporting stolen commercial goods (FIR-2026-RUR-0089).',
    aiRationale: 'Commercial vehicle ANPR scan triggered toll gate intercept protocol with 98.9% confidence.',
    drishtiSpeech: 'ANPR Toll Alert. Commercial truck KA 04 MH 9002 intercepted at Nelamangala Expressway Toll Plaza.',
    cropBox: { x: 28, y: 30, w: 32, h: 32 },
  },
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
    detected_target: 'Farid Mirza (Red Shirt)',
    target_type: 'FACE MATCH: RISK 92%',
    confidence: 95.3,
    fps: 60,
    boxPos: 'center-left',
  },
  {
    id: 'CAM-BLR-0012',
    name: 'Commercial Street Pedestrian Arcade',
    location: 'Shivajinagar, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    detected_target: 'Ramesh Kumar (Suspect)',
    target_type: 'FACE MATCH: RISK 94%',
    confidence: 96.1,
    fps: 60,
    boxPos: 'center-center',
  },
  {
    id: 'CAM-BLR-0015',
    name: 'Chickpet Main Road Checkpoint',
    location: 'City Market Zone, Bengaluru',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    detected_target: 'KA-05-NB-1102 (Maruti Swift)',
    target_type: 'ANPR MATCH: STOLEN CAR',
    confidence: 99.1,
    fps: 30,
    boxPos: 'bottom-left',
  },
  {
    id: 'CAM-BLR-0010',
    name: 'KSP State HQ Press Room',
    location: 'Nrupatunga Road, Bengaluru',
    camera_type: 'cctv',
    is_active: true,
    has_anpr: false,
    has_face_recog: true,
    detected_target: 'Senior IPS Officer Briefing',
    target_type: 'HQ COMMAND STREAM',
    confidence: 99.4,
    fps: 30,
    boxPos: 'bottom-left',
  },
  {
    id: 'CAM-BLR-0035',
    name: 'KSP Night Barricade Checkpost',
    location: 'Outer Ring Road, Bengaluru',
    camera_type: 'cctv',
    is_active: true,
    has_anpr: false,
    has_face_recog: false,
    detected_target: 'KSP Night Checkpoint Active',
    target_type: 'BARRICADE CHECKPOINT',
    confidence: 94.0,
    fps: 30,
    boxPos: 'bottom-left',
  },
  {
    id: 'CAM-BLR-0042',
    name: 'Koramangala Executive Portico',
    location: '5th Block, Koramangala, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    detected_target: 'Suresh Naidu (Co-Accused)',
    target_type: 'FACE MATCH: RISK 88%',
    confidence: 92.8,
    fps: 60,
    boxPos: 'bottom-left',
  },
  {
    id: 'CAM-BLR-0050',
    name: 'Silk Board Flyover BTP Junction',
    location: 'Silk Board, Outer Ring Road, Bengaluru',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    detected_target: 'KA-03-HA-4410 (Honda City)',
    target_type: 'ANPR MATCH: WATCHLIST PASS',
    confidence: 97.6,
    fps: 30,
    boxPos: 'bottom-right',
  },
  {
    id: 'CAM-BLR-0060',
    name: 'Nelamangala Toll Plaza (Lane 4)',
    location: 'NH-48 Nelamangala Toll, Bengaluru Rural',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    detected_target: 'KA-04-MH-9002 (Freight Truck)',
    target_type: 'ANPR MATCH: TOLL INTERCEPT',
    confidence: 98.9,
    fps: 30,
    boxPos: 'bottom-left',
  },
  {
    id: 'CAM-BLR-0002',
    name: 'Banaswadi Sub-Division Gate 1',
    location: 'Banaswadi, Bengaluru',
    camera_type: 'cctv',
    is_active: false,
    has_anpr: false,
    has_face_recog: false,
    detected_target: null,
    target_type: null,
    confidence: 0,
    fps: 0,
    boxPos: null,
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

function CameraStream({ cam, videoRef, isPaused }) {
  const localVideo = CAMERA_SPECIFIC_VIDEOS[cam.id] || 'https://vjs.zencdn.net/v/oceans.mp4';
  const [hasError, setHasError] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace('T', ' ').slice(0, 19) + '.' + String(now.getMilliseconds()).padStart(3, '0'));
    };
    updateClock();
    const interval = setInterval(updateClock, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;
    if (isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused, videoRef]);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col justify-between p-3 overflow-hidden select-none font-mono">
      {/* Background Cyber CCTV Video Stream */}
      {!hasError && (
        <video
          ref={videoRef}
          src={localVideo}
          autoPlay
          loop
          muted
          playsInline
          onError={handleError}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85] contrast-[1.15] opacity-80"
        />
      )}

      {/* Cyber Grid & Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-black/60 pointer-events-none" />

      {/* Top Feed HUD */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-cyan-500/30 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">LIVE CCTNS SENSOR</span>
        </div>
        <span className="text-[9px] font-bold text-emerald-400 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-500/30">
          {timeStr || 'LIVE'}
        </span>
      </div>

      {/* Targeted Bounding Box — rendered precisely over the suspect/vehicle target */}
      {cam.detected_target && (() => {
        const cropBox = CINEMATIC_SUSPECT_DATA[cam.id]?.cropBox || { x: 32, y: 25, w: 22, h: 32 };
        const isRed = cam.has_face_recog;
        return (
          <div
            className={`absolute z-20 rounded-md border-2 ${
              isRed
                ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-red-500/20'
                : 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/20'
            } transition-all pointer-events-none`}
            style={{
              top: `${cropBox.y}%`,
              left: `${cropBox.x}%`,
              width: `${cropBox.w}%`,
              height: `${cropBox.h}%`,
            }}
          >
            {/* Precise Corner Reticles */}
            <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${isRed ? 'border-red-400' : 'border-emerald-400'}`} />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${isRed ? 'border-red-400' : 'border-emerald-400'}`} />
            <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${isRed ? 'border-red-400' : 'border-emerald-400'}`} />
            <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${isRed ? 'border-red-400' : 'border-emerald-400'}`} />

            {/* Micro Badge tag */}
            <div className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[8px] font-extrabold whitespace-nowrap shadow-md ${
              isRed ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              🎯 {cam.detected_target} ({cam.confidence || 95}% MATCH)
            </div>
          </div>
        );
      })()}

      {/* Bottom Sensor Footer */}
      <div className="relative z-10 flex justify-between items-center text-[8px] text-slate-400 mt-auto">
        <span>SENSOR: {cam.id}</span>
        <span>LAT 12.9716° N · LNG 77.5946° E</span>
      </div>
    </div>
  );
}

// ─── High-Contrast Executive Detection Inspection Modal ───────────────────
function CameraInspectionModal({ cam, onClose, onDispatch }) {
  const suspectData = CINEMATIC_SUSPECT_DATA[cam.id] || CINEMATIC_SUSPECT_DATA['CAM-BLR-0055'];
  const [stage, setStage] = useState('scan');
  const [dispatched, setDispatched] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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

  const handleDispatch = () => {
    setDispatched(true);
    playSurveillanceSound('beep');
    if (onDispatch) onDispatch(suspectData);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99998] transition-opacity"
      />

      <div className="fixed inset-4 md:inset-8 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-[99999] flex flex-col overflow-hidden animate-fade-in text-slate-100">
        
        {/* High Contrast Topbar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">{cam.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{cam.id} · {cam.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={togglePause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              {isPaused ? 'Resume Playback' : 'Freeze & Pinpoint Target'}
            </button>

            <span className={`text-xs font-bold px-3 py-1 rounded-md border ${
              suspectData.riskScore > 50
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              {suspectData.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Viewport */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
          <CameraStream cam={cam} videoRef={videoRef} isPaused={isPaused} />

          {/* Precision Tight Face/Plate Box Framing Actual Subject */}
          <div
            className={`absolute transition-all duration-300 rounded-md border-2 ${
              suspectData.riskScore > 50 && (stage === 'match' || stage === 'identified')
                ? 'border-red-500 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.7)] ring-4 ring-red-500/30'
                : 'border-emerald-500 bg-emerald-500/15'
            }`}
            style={{
              top: `${suspectData.cropBox.y}%`,
              left: `${suspectData.cropBox.x}%`,
              width: `${suspectData.cropBox.w}%`,
              height: `${suspectData.cropBox.h}%`,
            }}
          >
            {/* Corner Corner Reticles */}
            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-400" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-400" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-400" />

            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-bold text-white whitespace-nowrap shadow-xl flex items-center gap-1.5 z-30">
              <Target className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              {stage === 'scan' && 'Scanning Stream...'}
              {stage === 'lock' && 'Locking On Face...'}
              {(stage === 'match' || stage === 'identified') && `🚨 MATCH: ${suspectData.name} (${suspectData.confidence}%)`}
            </div>
          </div>

          {/* Solid High-Contrast Side Dossier Panel */}
          {stage === 'identified' && (
            <div className="absolute right-6 top-6 bottom-6 w-[440px] bg-slate-900 border border-slate-700/90 rounded-xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in z-40">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
                      {suspectData.status}
                    </span>
                    <h4 className="text-xl font-extrabold text-white">{suspectData.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">Alias: &quot;{suspectData.alias}&quot;</p>
                  </div>
                  {suspectData.riskScore > 0 && (
                    <div className="text-right bg-red-950/40 border border-red-800/40 px-3 py-1.5 rounded-lg">
                      <span className="text-2xl font-black text-red-400 block leading-none">{suspectData.riskScore}</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">RISK SCORE</span>
                    </div>
                  )}
                </div>

                {/* Target Visual Cue Badge */}
                {suspectData.targetCue && (
                  <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center gap-2 text-xs text-red-300 font-semibold">
                    <Target className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Target Cue: {suspectData.targetCue}</span>
                  </div>
                )}

                {/* Structured Incident Summary & AI Rationale */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Incident & Sight Synopsis
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {suspectData.incidentBriefing}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-400" />
                      AI Biometric Match Rationale
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {suspectData.aiRationale}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">FIR Case File</span>
                      {(() => {
                        const firNum = suspectData.fir || suspectData.case_number || 'FIR-2026-BL-9104';
                        return (
                          <Link href={`/dashboard/fir/${firNum}`} className="font-bold text-blue-400 hover:underline flex items-center gap-1">
                            {firNum} <ExternalLink className="w-3 h-3" />
                          </Link>
                        );
                      })()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">IPC Offense</span>
                      <span className="font-bold text-red-400 truncate block">{suspectData.ipc}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-800 mt-4">
                {suspectData.riskScore > 50 && (
                  <button
                    onClick={handleDispatch}
                    disabled={dispatched}
                    className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                      dispatched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                    }`}
                  >
                    {dispatched ? (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        Patrol Unit KSP-04 Dispatched
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
                    className="py-2.5 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center transition-all"
                  >
                    View Geo Trail
                  </Link>
                  <button
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
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
function CameraCard({ cam, onInspect, onTriggerScan }) {
  return (
    <div className="bg-surface-1 border border-steel-600/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Feed Viewport (16:9) */}
      <div
        onClick={() => onInspect(cam)}
        className="relative aspect-video bg-surface-0 overflow-hidden cursor-pointer"
      >
        {cam.is_active ? (
          <>
            <CameraStream cam={cam} />

            {/* Top Bar Metadata */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-status-critical animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
                <span className="text-[10px] text-white/70 border-l border-white/20 pl-2">{cam.id}</span>
              </div>
              <span className="text-[10px] font-medium text-white/80 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                {cam.fps || 30} FPS
              </span>
            </div>

            {/* Detection Target Badge */}
            {cam.detected_target && (
              <div className="absolute bottom-3 left-3 z-10">
                <div className={`px-2.5 py-1 rounded-md backdrop-blur-md border text-[11px] font-semibold flex items-center gap-1.5 shadow-sm ${
                  cam.has_face_recog
                    ? 'bg-status-critical text-white border-status-critical'
                    : cam.has_anpr
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-white border-slate-700'
                }`}>
                  <Zap className="w-3 h-3" />
                  {cam.detected_target}
                </div>
              </div>
            )}

            {/* Hover Expand Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 p-3 rounded-full text-white">
              <Maximize2 className="w-5 h-5" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary">
            <WifiOff className="w-7 h-7" />
            <span className="text-xs font-medium uppercase tracking-wider">Feed Offline</span>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-paper-100 leading-snug group-hover:text-accent transition-colors">
              {cam.name}
            </h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${
              cam.has_face_recog
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : cam.has_anpr
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-surface-2 text-text-secondary border-steel-600/30'
            }`}>
              {cam.camera_type === 'face_recognition' ? 'Face AI' : cam.camera_type === 'anpr' ? 'ANPR' : 'CCTV'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{cam.location}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-steel-600/20 flex items-center justify-between gap-2">
          {cam.is_active ? (
            <button
              onClick={() => onTriggerScan(cam)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-surface-2 hover:bg-steel-600/30 text-paper-100 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-steel-600/30"
            >
              <Zap className="w-3.5 h-3.5 text-accent" />
              Verify Stream Target
            </button>
          ) : (
            <span className="text-xs text-text-secondary italic">Offline</span>
          )}

          <button
            onClick={() => onInspect(cam)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-paper-100 hover:bg-surface-2 transition-all"
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

  // ANPR Lookup State
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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in text-paper-100">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-steel-600/30">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-paper-100">CCTV & ANPR Surveillance Command</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {activeCount} Live Streams Operational
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time Karnataka Police CCTNS video feeds, vehicle ANPR recognition, and facial match analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveCamModal(MOCK_CAMERAS[0])} // Opens KSRTC Majestic feed
            className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Run Target Analysis Demo
          </button>
        </div>
      </div>

      {/* ANPR Lookup Search Bar */}
      <div className="bg-surface-1 border border-steel-600/30 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-paper-100">ANPR License Plate Verification Desk</h3>
          </div>
          <span className="text-[11px] text-text-secondary">Instant database query against active FIR watchlist</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter license plate number (e.g. KA-03-HA-4410, KA-05-NB-1102, or KA-01-MJ-8821)"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handlePlateSearch()}
              className="w-full bg-surface-0 border border-steel-600/40 rounded-lg px-4 py-2 text-xs font-mono text-paper-100 focus:outline-none focus:border-accent transition-all"
            />
          </div>
          <button
            onClick={handlePlateSearch}
            disabled={plateLoading || !plateInput.trim()}
            className="px-5 py-2 rounded-lg bg-accent text-white text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {plateLoading ? 'Searching...' : 'Check Watchlist'}
          </button>
          {plateResult && (
            <button
              onClick={() => { setPlateResult(null); setPlateInput(''); }}
              className="p-2 text-text-secondary hover:text-paper-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Result Card */}
        {plateResult && (
          <div className={`p-4 rounded-lg border text-xs ${
            plateResult.alert
              ? 'bg-status-critical/5 border-status-critical/30 text-paper-100'
              : 'bg-emerald-500/5 border-emerald-500/30 text-paper-100'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-steel-600/20">
              <span className="font-bold">{plateResult._queried_plate}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                plateResult.alert ? 'bg-status-critical text-white' : 'bg-emerald-600 text-white'
              }`}>
                {plateResult.alert ? 'Stolen / Flagged Vehicle' : 'Clear — No FIR Match'}
              </span>
            </div>
            {plateResult.alert && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <div>
                  <span className="text-[10px] text-text-secondary block">Crime Severity</span>
                  <span className="font-semibold text-status-critical uppercase">{plateResult.severity || 'HIGH'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary block">Crime Type</span>
                  <span className="font-semibold">{plateResult.original_crime || 'Vehicle Theft'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary block">District</span>
                  <span className="font-semibold">{plateResult.district || 'Bengaluru City'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary block">FIR Case File</span>
                  <Link href={`/dashboard/fir/${plateResult.fir_case_number || plateResult.case_number || 'FIR-2026-MYS-0112'}`} className="font-semibold text-accent hover:underline">
                    {plateResult.fir_case_number || plateResult.case_number || 'FIR-2026-MYS-0112'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Feeds' },
            { id: 'active', label: 'Online Only' },
            { id: 'anpr', label: 'ANPR Readers' },
            { id: 'face', label: 'Face AI Sensors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface-1 border border-steel-600/30 text-text-secondary hover:text-paper-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-secondary font-medium">
          Showing {filteredCameras.length} of {MOCK_CAMERAS.length} total streams
        </span>
      </div>

      {/* Camera Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map((cam) => (
          <CameraCard
            key={cam.id}
            cam={cam}
            onInspect={(c) => setActiveCamModal(c)}
            onTriggerScan={(c) => setActiveCamModal(c)}
          />
        ))}
      </div>

      {/* Audit Log / Event Table */}
      <div className="bg-surface-1 border border-steel-600/30 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-steel-600/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-paper-100">Live Surveillance Audit Log</h3>
          <span className="text-[11px] text-text-secondary">Auto-updating telemetry stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-steel-600/30 text-text-secondary text-[11px] uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Camera Sensor</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-5 py-3 font-semibold">Detection Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-600/20">
              {detectionLog.map((evt, idx) => (
                <tr key={idx} className="hover:bg-surface-2/40 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium text-text-secondary">{evt.time}</td>
                  <td className="px-4 py-3 font-medium text-paper-100">{evt.cam}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-2 border border-steel-600/30 text-text-secondary">
                      {evt.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${
                      evt.severity === 'critical' ? 'text-status-critical' : evt.severity === 'warn' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {evt.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-paper-100/90">{evt.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Camera Inspection Modal */}
      {activeCamModal && (
        <CameraInspectionModal
          cam={activeCamModal}
          onClose={() => setActiveCamModal(null)}
          onDispatch={(suspect) => {
            const time = new Date().toTimeString().split(' ')[0];
            setDetectionLog(prev => [{
              time,
              cam: activeCamModal.id,
              type: 'DISPATCH',
              severity: 'critical',
              desc: `Sector Patrol Unit Dispatched for ${suspect.name} (${suspect.suspectId})`
            }, ...prev]);
          }}
        />
      )}

    </div>
  );
}