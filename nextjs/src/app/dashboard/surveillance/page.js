'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_ANPR_RESULT } from '@/lib/demo-data';
import { Camera, Wifi, WifiOff, Eye, MapPin, Maximize2, X, ShieldAlert, Search, AlertTriangle, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';

// ─── Local Real-life Surveillance Loop Video URLs ───────────────────────────
// ANPR: Overhead traffic cams
// Face AI: Pedestrians walking on street
// CCTV: Intersection overview
const SURVEILLANCE_VIDEOS = {
  anpr: [
    '/videos/traffic1.mp4',
    '/videos/traffic2.mp4'
  ],
  face_recognition: [
    '/videos/people1.mp4',
    '/videos/people2.mp4'
  ],
  cctv: [
    '/videos/people3.mp4',
    '/videos/traffic1.mp4'
  ]
};

// Map each camera ID explicitly to a unique, locally hosted direct mp4 URL
const CAMERA_SPECIFIC_VIDEOS = {
  'CAM-BLR-0010': '/videos/traffic1.mp4', // Real street traffic (vehicles, bikes, pedestrians)
  'CAM-BLR-0012': '/videos/people1.mp4',   // High-angle pedestrian crossing/crowd
  'CAM-BLR-0015': '/videos/traffic2.mp4',  // Freeway multi-lane highway traffic
  'CAM-BLR-0035': '/videos/people3.mp4',   // Direct CCTV pedestrian pathway tracking
  'CAM-BLR-0042': '/videos/people2.mp4',   // Close-up sidewalk walk (Face AI context)
};

function CameraStream({ cam }) {
  const localVideo = CAMERA_SPECIFIC_VIDEOS[cam.id] || '/videos/traffic1.mp4';
  const cdnVideo = cam.video_url || 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4';
  
  const [currentSrc, setCurrentSrc] = useState(localVideo);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentSrc === localVideo && cdnVideo) {
      // Primary local video failed on deployment, switch to HTTPS CDN video
      setCurrentSrc(cdnVideo);
    } else {
      // Both failed or blocked, show fallback stream overlay
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="absolute inset-0 w-full h-full bg-void-000 flex flex-col items-center justify-center p-4">
        <div className="w-full h-full border border-steel-600/30 rounded flex flex-col items-center justify-center relative overflow-hidden bg-steel-800/40">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          <Camera className="w-8 h-8 text-phosphor-500/40 animate-pulse mb-2" />
          <span className="text-[10px] font-mono font-bold text-phosphor-500 uppercase tracking-widest">LIVE CCTNS STREAM</span>
          <span className="text-[9px] font-mono text-paper-100/40 mt-1">{cam.id} · {cam.fps || 30} FPS</span>
        </div>
      </div>
    );
  }

  return (
    <video
      src={currentSrc}
      autoPlay
      loop
      muted
      playsInline
      onError={handleError}
      className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-110 pointer-events-none"
    />
  );
}




const MOCK_CAMERAS = [
  {
    id: 'CAM-BLR-0010',
    name: 'Vijayanagar TTMC CCTV',
    location: 'Vijayanagar TTMC, Bengaluru (12.9651, 77.5348)',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    // Overhead traffic / highway cam — matches ANPR context
    video_url: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
    detected_target: 'KA-01-MJ-8821',
    target_type: 'ANPR MATCH: STOLEN VEHICLE',
    confidence: 98.4,
    fps: 30,
    // where to place the detection box: top|center|bottom + left|center|right
    boxPos: 'bottom-center',
  },
  {
    id: 'CAM-BLR-0012',
    name: 'MG Road BATCS Signal Pole 5',
    location: 'MG Road, Bengaluru (12.9737, 77.6138)',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    // Pedestrian / crowd street — matches face-recog context
    video_url: 'https://videos.pexels.com/video-files/856555/856555-hd_1920_1080_25fps.mp4',
    detected_target: 'RAMESH KUMAR (SUSPECT)',
    target_type: 'FACE MATCH: RISK 94%',
    confidence: 96.1,
    fps: 60,
    boxPos: 'center-center',
  },
  {
    id: 'CAM-BLR-0002',
    name: 'Shalom Apt Gate Camera 1',
    location: 'Banaswadi, Bengaluru (13.0040, 77.6192)',
    camera_type: 'cctv',
    is_active: false,
    has_anpr: false,
    has_face_recog: false,
    video_url: null,
    detected_target: null,
    target_type: null,
    confidence: 0,
    fps: 0,
    boxPos: null,
  },
  {
    id: 'CAM-BLR-0015',
    name: 'BTP Traffic Signal Dome 15',
    location: 'Hebbal Flyover, Bengaluru (13.0064, 77.5787)',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    // Junction / intersection overhead — matches ANPR dome cam
    video_url: 'https://videos.pexels.com/video-files/4167518/4167518-uhd_2560_1440_30fps.mp4',
    detected_target: 'KA-05-NB-1102 (MOTORBIKE)',
    target_type: 'ANPR CHECK: WATCHLIST PASS',
    confidence: 99.1,
    fps: 30,
    boxPos: 'bottom-right',
  },
  {
    id: 'CAM-BLR-0035',
    name: 'Silk Board Junction BTP Panning',
    location: 'Silk Board, Bengaluru (12.9344, 77.6123)',
    camera_type: 'cctv',
    is_active: true,
    has_anpr: false,
    has_face_recog: false,
    // Busy road / flyover patrol view
    video_url: 'https://videos.pexels.com/video-files/2103099/2103099-uhd_2560_1440_24fps.mp4',
    detected_target: 'SECTOR PATROL ACTIVE',
    target_type: 'PATROL MONITORING',
    confidence: 94.0,
    fps: 30,
    boxPos: 'top-right',
  },
  {
    id: 'CAM-BLR-0042',
    name: 'KR Puram Junction BATCS',
    location: 'KR Puram, Bengaluru (12.9936, 77.6073)',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    // Street-level pedestrian / mixed — face recognition context
    video_url: 'https://videos.pexels.com/video-files/2103099/2103099-uhd_2560_1440_24fps.mp4',
    detected_target: 'SURESH NAIDU (CO-ACCUSED)',
    target_type: 'FACE MATCH: RISK 86%',
    confidence: 92.8,
    fps: 60,
    boxPos: 'center-left',
  },
];

const TYPE_BADGES = {
  anpr:             { label: 'ANPR',    className: 'bg-phosphor-500/20 text-phosphor-500 border-phosphor-500/30' },
  face_recognition: { label: 'Face AI', className: 'bg-warn-500/20 text-warn-500 border-warn-500/30' },
  cctv:             { label: 'CCTV',    className: 'bg-steel-600/60 text-paper-100/60 border-steel-600/50' },
};

// ─── Live Incident Ticker ────────────────────────────────────────────────────
const LIVE_INCIDENTS = [
  "🔴 CAM-BLR-0012 · FACE MATCH ALERT — Ramesh Kumar (SUS-8842) spotted MG Road 14:32:07",
  "🟡 CAM-BLR-0015 · ANPR TRIGGERED — KA-05-NB-1102 matches stolen vehicle watchlist",
  "🔵 CAM-BLR-0010 · PLATE READ — KA-01-MJ-8821 · Owner: Suresh K · Status: FLAGGED",
  "🔴 CAM-BLR-0042 · FACE MATCH — Suresh Naidu (SUS-7104) co-accused Koramangala 14:28:51",
  "🟢 CAM-BLR-0035 · Patrol unit KSP-04 confirmed en route Silk Board junction",
  "🟡 CAM-BLR-0010 · Suspicious stationary vehicle >8 min · Initiating extended scan",
];

function LiveIncidentTicker() {
  return (
    <div className="w-full overflow-hidden bg-critical-500/10 border border-critical-500/30 rounded-xl py-2 mb-4">
      <div style={{ display: 'flex', animation: 'tickerScroll 28s linear infinite', whiteSpace: 'nowrap' }}>
        {[...LIVE_INCIDENTS, ...LIVE_INCIDENTS].map((item, i) => (
          <span key={i} className="inline-block px-10 text-xs font-mono text-critical-500 font-bold border-r border-critical-500/20">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Detection Event Log data ────────────────────────────────────────────────
const INITIAL_EVENTS = [
  { time: '14:32:07', cam: 'CAM-BLR-0012', type: 'FACE',   severity: 'critical', desc: 'Ramesh Kumar (SUS-8842) — Conf: 96.1%' },
  { time: '14:29:44', cam: 'CAM-BLR-0015', type: 'ANPR',   severity: 'warn',     desc: 'KA-05-NB-1102 · Stolen Motorbike Match' },
  { time: '14:28:51', cam: 'CAM-BLR-0042', type: 'FACE',   severity: 'critical', desc: 'Suresh Naidu (SUS-7104) — Conf: 92.8%' },
  { time: '14:25:13', cam: 'CAM-BLR-0010', type: 'ANPR',   severity: 'warn',     desc: 'KA-01-MJ-8821 · Active Watchlist Flag' },
  { time: '14:21:03', cam: 'CAM-BLR-0035', type: 'PATROL', severity: 'info',     desc: 'Patrol Unit KSP-04 Check-in · Silk Board' },
];

const AUTO_EVENTS = [
  { cam: 'CAM-BLR-0015', type: 'ANPR',   severity: 'info', desc: 'KA-03-AB-2291 · Clear — No alerts' },
  { cam: 'CAM-BLR-0010', type: 'ANPR',   severity: 'warn', desc: 'KA-01-XY-9981 · Secondary watchlist match' },
  { cam: 'CAM-BLR-0042', type: 'FACE',   severity: 'info', desc: 'Unknown subject scanned — No DB match' },
  { cam: 'CAM-BLR-0035', type: 'PATROL', severity: 'info', desc: 'Patrol sector sweep complete — No incidents' },
];


// ─── ANPR Canvas: top-down road, vehicles moving, plate-reader flash ──────────
function ANPRCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width  = canvas.parentElement.clientWidth  || 320;
      canvas.height = canvas.parentElement.clientHeight || 200;
    };
    resize();

    // lanes
    const lanes = [0.28, 0.44, 0.60, 0.76].map(f => ({ y: canvas.height * f }));
    const vehicles = lanes.map((l, i) => ({
      x: Math.random() * canvas.width,
      speed: (1.2 + Math.random() * 1.4) * (i % 2 === 0 ? 1 : -1),
      w: 26 + Math.random() * 14,
      h: 14,
      color: ['#e5e5e5','#b0b0b0','#787878','#f0f0f0'][i],
      y: l.y,
      flash: 0,
    }));
    let scanLine = 0;
    let flashTimer = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      // Dark asphalt
      ctx.fillStyle = '#0d0f0d';
      ctx.fillRect(0, 0, W, H);

      // Road surface band
      ctx.fillStyle = '#111311';
      ctx.fillRect(0, H * 0.22, W, H * 0.62);

      // Lane dividers (dashed white)
      ctx.setLineDash([14, 10]);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      [0.36, 0.52, 0.68].forEach(f => {
        ctx.beginPath(); ctx.moveTo(0, H * f); ctx.lineTo(W, H * f); ctx.stroke();
      });
      ctx.setLineDash([]);

      // Road edges
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H * 0.22); ctx.lineTo(W, H * 0.22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H * 0.84); ctx.lineTo(W, H * 0.84); ctx.stroke();

      // Vehicles
      vehicles.forEach(v => {
        v.x += v.speed;
        if (v.speed > 0 && v.x > W + 30) v.x = -30;
        if (v.speed < 0 && v.x < -30) v.x = W + 30;

        // Headlight / tail light glow
        const gl = ctx.createRadialGradient(v.speed > 0 ? v.x - v.w/2 : v.x + v.w/2, v.y, 1,
                                              v.speed > 0 ? v.x - v.w/2 : v.x + v.w/2, v.y, 18);
        gl.addColorStop(0, v.speed > 0 ? 'rgba(255,240,180,0.6)' : 'rgba(255,60,60,0.5)');
        gl.addColorStop(1, 'transparent');
        ctx.fillStyle = gl; ctx.beginPath();
        ctx.arc(v.speed > 0 ? v.x - v.w/2 : v.x + v.w/2, v.y, 18, 0, Math.PI * 2);
        ctx.fill();

        // Vehicle body
        ctx.fillStyle = v.color;
        ctx.fillRect(v.x - v.w/2, v.y - v.h/2, v.w, v.h);

        // ANPR flash when near center
        if (Math.abs(v.x - W/2) < 20 && v.flash <= 0) {
          v.flash = 8;
          flashTimer = 12;
        }
        if (v.flash > 0) {
          ctx.strokeStyle = `rgba(16,185,129,${v.flash/8})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(v.x - v.w/2 - 4, v.y - v.h/2 - 4, v.w + 8, v.h + 8);
          // Plate reading bar
          ctx.fillStyle = `rgba(16,185,129,${v.flash/8 * 0.9})`;
          ctx.fillRect(v.x - v.w/2, v.y + v.h/2 + 2, v.w, 4);
          v.flash--;
        }
      });

      // ANPR scan beam
      scanLine = (scanLine + 1.8) % H;
      ctx.strokeStyle = 'rgba(16,185,129,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, scanLine); ctx.lineTo(W, scanLine); ctx.stroke();

      // Flash strobe (plate read event)
      if (flashTimer > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flashTimer / 80})`;
        ctx.fillRect(0, 0, W, H);
        flashTimer--;
      }

      // Noise grain
      for (let i = 0; i < 120; i++) {
        const nx = Math.random() * W, ny = Math.random() * H;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(nx, ny, 1, 1);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ─── Face AI Canvas: grayscale street, pedestrian shapes, face box ────────────
function FaceCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    canvas.width  = canvas.parentElement.clientWidth  || 320;
    canvas.height = canvas.parentElement.clientHeight || 200;
    const W = canvas.width, H = canvas.height;

    const people = Array.from({ length: 5 }, (_, i) => ({
      x: (i * W / 5) + Math.random() * 40,
      y: H * 0.45 + Math.random() * (H * 0.3),
      speed: (Math.random() * 0.5 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
      size: 0.55 + Math.random() * 0.3,
      detected: i === 1,
    }));
    let scanY = 0, tick = 0;

    const drawPerson = (p) => {
      const s = p.size;
      const bh = 32 * s, bw = 14 * s;
      // Body (silhouette)
      ctx.fillStyle = p.detected ? 'rgba(200,200,200,0.95)' : 'rgba(140,140,140,0.7)';
      ctx.fillRect(p.x - bw/2, p.y, bw, bh);
      // Head
      ctx.beginPath();
      ctx.arc(p.x, p.y - 5 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();

      if (p.detected) {
        // Face detection box around head
        const fw = 26 * s, fh = 28 * s;
        const fx = p.x - fw/2, fy = p.y - fh * 0.9;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(fx, fy, fw, fh);
        // corner brackets
        const cs = 5;
        [
          [fx, fy, cs, 0, 0, cs],
          [fx+fw, fy, -cs, 0, 0, cs],
          [fx, fy+fh, cs, 0, 0, -cs],
          [fx+fw, fy+fh, -cs, 0, 0, -cs],
        ].forEach(([x, y, dx1, dy1, dx2, dy2]) => {
          ctx.beginPath();
          ctx.moveTo(x+dx1, y+dy1); ctx.lineTo(x, y); ctx.lineTo(x+dx2, y+dy2);
          ctx.stroke();
        });
        // scanning bar inside box
        const barY = fy + ((tick * 1.5) % fh);
        ctx.fillStyle = 'rgba(239,68,68,0.3)';
        ctx.fillRect(fx, barY, fw, 2);
      }
    };

    const draw = () => {
      tick++;
      // Grayscale foggy street background
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, W, H);

      // Pavement / sidewalk
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, H * 0.38, W, H * 0.62);

      // Sidewalk texture lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 24) {
        ctx.beginPath(); ctx.moveTo(gx, H * 0.38); ctx.lineTo(gx, H); ctx.stroke();
      }

      // Move and draw people
      people.forEach(p => {
        p.x += p.speed;
        if (p.x > W + 20) p.x = -20;
        if (p.x < -20) p.x = W + 20;
        drawPerson(p);
      });

      // Scan sweep
      scanY = (scanY + 1.2) % H;
      ctx.strokeStyle = 'rgba(239,68,68,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();

      // Grain
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ─── CCTV Canvas: wide intersection, top-down, cars + patrol sweep ────────────
function CCTVCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    canvas.width  = canvas.parentElement.clientWidth  || 320;
    canvas.height = canvas.parentElement.clientHeight || 200;
    const W = canvas.width, H = canvas.height;

    const cars = [
      { x: 0,    y: H * 0.42, sx: 1.1,  sy: 0,    w: 22, h: 12, c: '#aaa' },
      { x: W,    y: H * 0.58, sx: -0.9, sy: 0,    w: 18, h: 11, c: '#888' },
      { x: W/2,  y: 0,        sx: 0,    sy: 1.0,  w: 12, h: 20, c: '#bbb' },
      { x: W/2 + 24, y: H,   sx: 0,    sy: -1.1, w: 12, h: 20, c: '#999' },
    ];
    let patrolAngle = 0;

    const draw = () => {
      // Dark road surface
      ctx.fillStyle = '#0e100e';
      ctx.fillRect(0, 0, W, H);

      // Horizontal road band
      ctx.fillStyle = '#131513';
      ctx.fillRect(0, H * 0.38, W, H * 0.24);
      // Vertical road band
      ctx.fillStyle = '#131513';
      ctx.fillRect(W * 0.44, 0, W * 0.12, H);

      // Centre lines
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H); ctx.stroke();
      ctx.setLineDash([]);

      // Cars
      cars.forEach(c => {
        c.x += c.sx; c.y += c.sy;
        if (c.x > W + 20) c.x = -20;
        if (c.x < -20) c.x = W + 20;
        if (c.y > H + 20) c.y = -20;
        if (c.y < -20) c.y = H + 20;

        // headlight glow
        const dir = c.sx !== 0 ? (c.sx > 0 ? -1 : 1) : (c.sy > 0 ? -1 : 1);
        const glx = c.sx !== 0 ? c.x + dir * c.w/2 : c.x;
        const gly = c.sy !== 0 ? c.y + dir * c.h/2 : c.y;
        const gl = ctx.createRadialGradient(glx, gly, 1, glx, gly, 14);
        gl.addColorStop(0, 'rgba(255,240,200,0.45)'); gl.addColorStop(1, 'transparent');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(glx, gly, 14, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = c.c;
        ctx.fillRect(c.x - c.w/2, c.y - c.h/2, c.w, c.h);
      });

      // Patrol sweep (rotating sector)
      patrolAngle = (patrolAngle + 0.015) % (Math.PI * 2);
      const sweepGrad = ctx.createConicalGradient
        ? null
        : null; // fallback arc sweep
      ctx.strokeStyle = 'rgba(16,185,129,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W/2, H/2);
      ctx.arc(W/2, H/2, Math.max(W, H) * 0.8, patrolAngle, patrolAngle + 0.4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(16,185,129,0.06)';
      ctx.fill();
      ctx.stroke();

      // Grain
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

function CameraCanvas({ cam }) {
  if (cam.camera_type === 'face_recognition') return <FaceCanvas />;
  if (cam.camera_type === 'cctv')             return <CCTVCanvas />;
  return <ANPRCanvas />;
}



function CameraCard({ cam, onInspect }) {
  const typeCfg = TYPE_BADGES[cam.camera_type] || TYPE_BADGES.cctv;
  const [timecode, setTimecode] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTimecode(d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0').slice(0, 2));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      onClick={() => onInspect(cam)}
      className={`glass-card rounded-2xl overflow-hidden border transition-all hover:scale-[1.01] cursor-pointer relative group flex flex-col
      ${cam.is_active ? 'border-steel-600 hover:border-phosphor-500/50' : 'border-steel-600/30 opacity-60'}`}
    >
      {/* Stream container */}
      <div className="h-52 bg-[#0d0f0d] relative flex items-center justify-center overflow-hidden">
        {cam.is_active ? (
          <>
            {/* Real-life YouTube footage — contextually matched */}
            <CameraStream cam={cam} />

            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
            }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />

            {/* ── TOP-LEFT: LIVE badge + timecode ── */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-critical-500 animate-ping" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-critical-500">LIVE</span>
              </div>
              <span className="text-[9px] font-mono text-white/60 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                {timecode}
              </span>
            </div>

            {/* ── TOP-RIGHT: FPS badge ── */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="text-[9px] font-mono text-white/50 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                {cam.fps || 30} FPS
              </span>
            </div>

            {/* ── DETECTION OVERLAY — positioned by boxPos, label below box ── */}
            {cam.detected_target && (() => {
              const posMap = {
                'top-left':      'top-10 left-3',
                'top-right':     'top-10 right-3',
                'center-left':   'top-1/3 left-4',
                'center-center': 'top-1/3 left-[35%]',
                'center-right':  'top-1/3 right-4',
                'bottom-left':   'bottom-10 left-3',
                'bottom-center': 'bottom-10 left-[30%]',
                'bottom-right':  'bottom-10 right-3',
              };
              const posClass = posMap[cam.boxPos] || 'top-1/3 left-[30%]';
              const isRisk = cam.has_face_recog;
              const color  = isRisk ? '#ef4444' : '#10b981';
              return (
                <div className={`absolute z-20 ${posClass}`}>
                  {/* Reticle box */}
                  <div style={{ border: `1.5px solid ${color}`, width: 68, height: 52, borderRadius: 3, position: 'relative' }}>
                    {/* Corner brackets */}
                    {[['top:0;left:0', 'borderTop', 'borderLeft'],
                      ['top:0;right:0', 'borderTop', 'borderRight'],
                      ['bottom:0;left:0', 'borderBottom', 'borderLeft'],
                      ['bottom:0;right:0', 'borderBottom', 'borderRight'],
                    ].map(([pos], idx) => (
                      <span key={idx} style={{
                        position: 'absolute',
                        width: 8, height: 8,
                        [pos.split(';')[0].split(':')[0]]: -1,
                        [pos.split(';')[1].split(':')[0]]: -1,
                        borderTop:    pos.includes('top')    ? `2px solid ${color}` : 'none',
                        borderBottom: pos.includes('bottom') ? `2px solid ${color}` : 'none',
                        borderLeft:   pos.includes('left')   ? `2px solid ${color}` : 'none',
                        borderRight:  pos.includes('right')  ? `2px solid ${color}` : 'none',
                      }} />
                    ))}
                  </div>
                  {/* Label — below box, hard capped width */}
                  <div style={{
                    marginTop: 3,
                    background: 'rgba(0,0,0,0.82)',
                    border: `1px solid ${color}55`,
                    borderRadius: 2,
                    padding: '2px 6px',
                    maxWidth: 120,
                    overflow: 'hidden',
                  }}>
                    <div style={{ color, fontSize: 8, fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cam.detected_target}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 7, fontFamily: 'monospace' }}>
                      CONF: {cam.confidence}%
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Hover expand icon */}
            <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-1.5 rounded bg-black/70 text-white/70 hover:text-white transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <WifiOff className="w-8 h-8 text-paper-100/30" />
            <span className="text-xs text-paper-100/30 font-mono uppercase tracking-wider">Feed Offline</span>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-4 bg-steel-700/60 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-sm font-bold text-paper-100 leading-snug group-hover:text-phosphor-500 transition-colors">{cam.name}</p>
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${typeCfg.className}`}>
              {typeCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-paper-100/40" />
            <span className="text-xs text-paper-100/60 font-sans">{cam.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-steel-600/40 pt-2.5 mt-2 text-[10px] text-paper-100/50 font-mono">
          <span>{cam.id}</span>
          <div className="flex items-center gap-2 font-bold">
            {cam.has_anpr && <span className="text-phosphor-500 bg-phosphor-500/10 px-1.5 py-0.5 rounded border border-phosphor-500/30">ANPR</span>}
            {cam.has_face_recog && <span className="text-warn-500 bg-warn-500/10 px-1.5 py-0.5 rounded border border-warn-500/30">FACE AI</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SurveillancePage() {
  const [filter, setFilter] = useState('all');
  const [activeCamModal, setActiveCamModal] = useState(null);
  const [snapshotResult, setSnapshotResult] = useState(null);

  // ── Detection Event Log state ───────────────────────────────────────────────
  const [detectionLog, setDetectionLog] = useState(INITIAL_EVENTS);

  // ── ANPR Plate Search state ─────────────────────────────────────────────────
  const [plateInput, setPlateInput]   = useState('');
  const [plateResult, setPlateResult] = useState(null);
  const [plateLoading, setPlateLoading] = useState(false);
  const [plateError, setPlateError]   = useState(null);

  const handlePlateSearch = async () => {
    const plate = plateInput.trim();
    if (!plate) return;
    setPlateLoading(true);
    setPlateError(null);
    setPlateResult(null);

    const fallbackResult = {
      ...DEMO_ANPR_RESULT,
      plate_number: plate,
      _queried_plate: plate
    };

    try {
      const { data } = await fetchWithFallback('anpr-check', fallbackResult, {
        method: 'POST',
        body: {
          plate_number:  plate,
          camera_id:     'MANUAL-LOOKUP',
          camera_name:   'Surveillance Dashboard Manual Check',
          lat:           12.9716,
          lng:           77.5946,
          timestamp:     new Date().toISOString(),
        }
      });

      setPlateResult({ ...(data || fallbackResult), _queried_plate: plate });
    } catch (err) {
      setPlateResult(fallbackResult);
    } finally {
      setPlateLoading(false);
    }
  };

  // ── Auto-append detection events ────────────────────────────────────────────
  useEffect(() => {
    let idx = 0;
    const id = setInterval(() => {
      const evt = AUTO_EVENTS[idx % AUTO_EVENTS.length];
      const now = new Date();
      const time = now.toTimeString().split(' ')[0];
      setDetectionLog(prev => [{ ...evt, time }, ...prev].slice(0, 20));
      idx++;
    }, 18000 + Math.random() * 12000);
    return () => clearInterval(id);
  }, []);

  const filtered = MOCK_CAMERAS.filter((c) => {
    if (filter === 'active') return c.is_active;
    if (filter === 'anpr') return c.has_anpr;
    if (filter === 'face') return c.has_face_recog;
    return true;
  });

  const activeCount = MOCK_CAMERAS.filter((c) => c.is_active).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in relative min-h-screen bg-void-000">
      
      <style>{`
        .bg-scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.4)
          );
          background-size: 100% 4px;
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-600/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-paper-100 font-mono">Real-Time CCTV & ANPR Grid</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-critical-500/20 text-critical-500 border border-critical-500/30 uppercase">
              HIGH FREQUENCY SCANNER
            </span>
          </div>
          <p className="text-xs text-paper-100/50 mt-0.5">
            Bengaluru Urban Command Matrix · AI Target Detection & Optical Character Recognition
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success-500/10 border border-success-500/20">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-ping" />
            <span className="text-xs text-success-500 font-mono font-bold">{activeCount}/{MOCK_CAMERAS.length} STREAMS ONLINE</span>
          </div>
        </div>
      </div>

      {/* ── LIVE INCIDENT TICKER ──────────────────────────────────────────────── */}
      <LiveIncidentTicker />

      {/* ── ANPR PLATE SEARCH WIDGET ─────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-steel-600/50 bg-steel-700/60 overflow-hidden">
        {/* Widget Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-steel-600/40 bg-void-000/20">
          <div className="w-7 h-7 rounded-lg bg-phosphor-500/15 flex items-center justify-center border border-phosphor-500/30">
            <Search className="w-3.5 h-3.5 text-phosphor-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-paper-100 font-mono uppercase tracking-widest">ANPR Plate Lookup</h3>
            <p className="text-[10px] text-paper-100/40">Real-time plate scan against FIR watchlist &amp; ANPR sightings database</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-phosphor-500/15 text-phosphor-500 border border-phosphor-500/30 uppercase">Live Check</span>
        </div>

        {/* Search Row */}
        <div className="flex items-center gap-3 p-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper-100/30" />
            <input
              id="anpr-plate-input"
              type="text"
              placeholder="Enter plate number (e.g. KA-01-MJ-8821)"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handlePlateSearch()}
              className="w-full bg-void-000/60 border border-steel-600/60 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-paper-100 placeholder:text-paper-100/25 focus:outline-none focus:border-phosphor-500/60 focus:ring-1 focus:ring-phosphor-500/30 transition-all"
            />
          </div>
          <button
            id="anpr-search-btn"
            onClick={handlePlateSearch}
            disabled={plateLoading || !plateInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-phosphor-500 hover:bg-phosphor-500/80 disabled:opacity-40 disabled:cursor-not-allowed text-void-000 text-sm font-bold font-mono uppercase tracking-wide transition-all shadow-lg shadow-phosphor-500/20"
          >
            {plateLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
          {(plateResult || plateError) && (
            <button
              onClick={() => { setPlateResult(null); setPlateError(null); setPlateInput(''); }}
              className="p-2.5 rounded-xl border border-steel-600/50 text-paper-100/40 hover:text-paper-100 hover:border-steel-600 transition-all"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error State */}
        {plateError && (
          <div className="mx-5 mb-5 flex items-start gap-3 p-4 rounded-xl bg-critical-500/10 border border-critical-500/30">
            <AlertTriangle className="w-4 h-4 text-critical-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-critical-500">Lookup Failed</p>
              <p className="text-xs text-paper-100/60 mt-0.5">{plateError}</p>
              <button onClick={handlePlateSearch} className="text-xs text-phosphor-500 font-bold mt-1 hover:underline">Retry →</button>
            </div>
          </div>
        )}

        {/* Result — ALERT (match found) */}
        {plateResult && plateResult.alert === true && (
          <div className="mx-5 mb-5 rounded-xl border border-critical-500/50 bg-critical-500/8 overflow-hidden">
            {/* Alert banner */}
            <div className="flex items-center gap-3 px-4 py-3 bg-critical-500/15 border-b border-critical-500/30">
              <ShieldAlert className="w-5 h-5 text-critical-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-critical-500 uppercase tracking-widest">
                  🚨 Alert — {plateResult.severity || 'CRITICAL'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-critical-500/70 bg-critical-500/10 px-2 py-0.5 rounded border border-critical-500/30 shrink-0 uppercase">
                {plateResult.status || 'FLAGGED'}
              </span>
            </div>

            {/* Data grid */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-xs">
              <div>
                <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">Plate Number</span>
                <span className="font-mono font-bold text-paper-100">{plateResult._queried_plate || plateInput}</span>
              </div>
              <div>
                <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">Severity</span>
                <span className="font-semibold text-critical-500 uppercase">{plateResult.severity || 'HIGH'}</span>
              </div>
              <div>
                <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">Crime Type</span>
                <span className="font-semibold text-paper-100/80 capitalize">{(plateResult.original_crime || '—').replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">Crime Date</span>
                <span className="font-mono text-paper-100/80">
                  {plateResult.crime_date
                    ? new Date(plateResult.crime_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">District</span>
                <span className="font-semibold text-paper-100/80">{plateResult.district || '—'}</span>
              </div>
              {plateResult.fir_case_number && (
                <div>
                  <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">FIR Case</span>
                  <Link
                    href={`/dashboard/fir/${plateResult.fir_case_number}`}
                    className="font-mono font-bold text-phosphor-500 hover:text-phosphor-400 hover:underline transition-colors"
                  >
                    {plateResult.fir_case_number}
                  </Link>
                </div>
              )}
              {plateResult.instructions && (
                <div className="col-span-2 md:col-span-3">
                  <span className="text-[9px] text-paper-100/40 uppercase tracking-widest font-bold block mb-0.5">Field Instructions</span>
                  <p className="text-paper-100/70 italic">{plateResult.instructions}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 px-4 pb-4">
              <Link
                href={`/dashboard/trail?plate=${encodeURIComponent(plateResult.plate || plateInput)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-phosphor-500 hover:bg-phosphor-500/80 text-void-000 text-xs font-bold font-mono uppercase tracking-wide transition-all shadow-lg shadow-phosphor-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Full Trail
              </Link>
              {plateResult.fir_case_number && (
                <Link
                  href={`/dashboard/fir/${plateResult.fir_case_number}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-critical-500/50 bg-critical-500/10 hover:bg-critical-500/20 text-critical-500 text-xs font-bold font-mono uppercase tracking-wide transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  View FIR
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Result — CLEAR (no match) */}
        {plateResult && plateResult.alert === false && (
          <div className="mx-5 mb-5 flex items-center gap-3 p-4 rounded-xl bg-success-500/8 border border-success-500/30">
            <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-500">✓ Clear — No Alerts</p>
              <p className="text-xs text-paper-100/50 mt-0.5">
                Plate <span className="font-mono font-bold text-paper-100">{plateResult.plate || plateInput}</span> has no matches in the FIR watchlist or ANPR flagging database.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bengaluru OSM Cameras',  value: '1,541', icon: Camera, color: 'text-phosphor-500' },
          { label: 'ANPR Optical Sensors',   value: '1,024', icon: Eye,    color: 'text-warn-500' },
          { label: 'Live Target Matches',    value: '3 ACTIVE', icon: ShieldAlert, color: 'text-critical-500' },
          { label: 'Network Bandwidth',     value: '98.7% UP', icon: Wifi,  color: 'text-success-500' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-steel-600/40 bg-steel-700/50">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-paper-100 font-mono">{s.value}</p>
            <p className="text-xs text-paper-100/50 mt-0.5 font-sans">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'active', 'anpr', 'face'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-phosphor-500 text-paper-100 shadow-lg shadow-phosphor-500/20'
                  : 'bg-steel-700 border border-steel-600/50 text-paper-100/50 hover:text-paper-100'
              }`}
            >
              {f === 'all' ? 'All Feeds' : f === 'anpr' ? 'ANPR Sensors' : f === 'face' ? 'Face AI Sensors' : 'Online Only'}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-paper-100/40">{filtered.length} active feeds rendering</span>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cam) => (
          <CameraCard key={cam.id} cam={cam} onInspect={(c) => setActiveCamModal(c)} />
        ))}
      </div>

      {/* ── DETECTION EVENT LOG ───────────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-steel-600/50 bg-steel-700/60 overflow-hidden">
        {/* Log Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-steel-600/40 bg-void-000/20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-critical-500/15 flex items-center justify-center border border-critical-500/30">
              <ShieldAlert className="w-3.5 h-3.5 text-critical-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-paper-100 font-mono uppercase tracking-widest">Detection Event Log</h3>
              <p className="text-[10px] text-paper-100/40">Live AI detections · Face match · ANPR · Patrol check-in</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-critical-500 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-critical-500 uppercase">LIVE FEED</span>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-steel-600/30 text-paper-100/40 text-[10px] uppercase tracking-widest">
                <th className="px-5 py-2.5 text-left font-bold">Time</th>
                <th className="px-3 py-2.5 text-left font-bold">Camera</th>
                <th className="px-3 py-2.5 text-left font-bold">Type</th>
                <th className="px-3 py-2.5 text-left font-bold">Severity</th>
                <th className="px-3 py-2.5 text-left font-bold flex-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {detectionLog.map((evt, i) => {
                const sevCfg = {
                  critical: { dot: 'bg-critical-500',  text: 'text-critical-500',  badge: 'bg-critical-500/15 text-critical-500 border-critical-500/30', row: 'bg-critical-500/5 hover:bg-critical-500/10' },
                  warn:     { dot: 'bg-warn-500',      text: 'text-warn-500',      badge: 'bg-warn-500/15 text-warn-500 border-warn-500/30',             row: 'bg-warn-500/5 hover:bg-warn-500/10' },
                  info:     { dot: 'bg-phosphor-500',  text: 'text-phosphor-500',  badge: 'bg-phosphor-500/15 text-phosphor-500 border-phosphor-500/30', row: 'hover:bg-steel-600/20' },
                }[evt.severity] || {};
                const typeCfg = {
                  FACE:   'text-warn-500 bg-warn-500/10 border-warn-500/30',
                  ANPR:   'text-phosphor-500 bg-phosphor-500/10 border-phosphor-500/30',
                  PATROL: 'text-paper-100/60 bg-steel-600/40 border-steel-600/40',
                }[evt.type] || 'text-paper-100/50 bg-steel-700 border-steel-600';
                return (
                  <tr key={i} className={`border-b border-steel-600/20 transition-colors ${sevCfg.row} ${i === 0 ? 'animate-fade-in' : ''}`}>
                    <td className="px-5 py-2.5 font-bold text-paper-100/80">{evt.time}</td>
                    <td className="px-3 py-2.5 text-paper-100/60">{evt.cam}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${typeCfg}`}>{evt.type}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`flex items-center gap-1.5 ${sevCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sevCfg.dot} ${evt.severity === 'critical' ? 'animate-ping' : ''}`} />
                        {evt.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-paper-100/70">{evt.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Camera Inspection Modal */}
      {activeCamModal && (
        <>
          <div
            onClick={() => setActiveCamModal(null)}
            className="fixed inset-0 bg-void-000/80 backdrop-blur-md z-[99998] animate-fade-in"
          />
          <div className="fixed inset-6 md:inset-12 bg-steel-700 border border-steel-600 rounded-2xl shadow-2xl z-[99999] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-steel-600 flex items-center justify-between bg-steel-700/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-critical-500 animate-ping" />
                <div>
                  <h3 className="text-base font-bold font-mono text-paper-100">{activeCamModal.name}</h3>
                  <p className="text-xs text-paper-100/50 font-mono">{activeCamModal.id} · {activeCamModal.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-phosphor-500/20 text-phosphor-500 border border-phosphor-500/30 text-xs font-mono font-bold">
                  STREAM: 1080p 60FPS H.265
                </span>
                <button
                  onClick={() => setActiveCamModal(null)}
                  className="w-8 h-8 rounded-lg bg-steel-600/50 hover:bg-steel-600 flex items-center justify-center text-paper-100/60 hover:text-paper-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Video Stream Main */}
            <div className="flex-1 bg-void-000 relative flex items-center justify-center overflow-hidden">
              {activeCamModal.is_active ? (
                <>
                  <CameraStream cam={activeCamModal} />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
                  }} />

                  {/* High Tech Overlay Reticle */}
                  {activeCamModal.detected_target && (
                    <div className="absolute top-1/3 left-1/3 border-2 border-critical-500 bg-critical-500/20 p-3 rounded-lg z-30 animate-pulse">
                      <p className="text-xs font-mono font-bold text-paper-100 bg-void-000/90 px-2 py-1 rounded border border-critical-500/50">
                        🚨 TARGET CONFIRMED: {activeCamModal.detected_target}
                      </p>
                      <p className="text-[10px] font-mono text-phosphor-500 font-bold mt-1">
                        CONFIDENCE MATCH: {activeCamModal.confidence}%
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <WifiOff className="w-12 h-12 text-paper-100/30" />
                  <p className="text-sm font-mono text-paper-100/40">FEED OFFLINE · NO VIDEO PACKETS DETECTED</p>
                </div>
              )}
            </div>

            {/* Modal Control Bar */}
            <div className="p-4 bg-steel-700/90 border-t border-steel-600 flex items-center justify-between font-mono text-xs text-paper-100/60">
              <div className="flex items-center gap-4">
                <span>PTZ: READY</span>
                <span>OPTICAL ZOOM: 4.2X</span>
                <span>ANPR SENSOR: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!activeCamModal) return;
                    const suspects = {
                      'CAM-BLR-0012': { name: 'RAMESH KUMAR',  id: 'SUS-8842', risk: 94, match: 96.1, ipc: 'IPC §379 §34' },
                      'CAM-BLR-0042': { name: 'SURESH NAIDU',  id: 'SUS-7104', risk: 88, match: 92.8, ipc: 'IPC §392 §34' },
                    };
                    const result = suspects[activeCamModal.id] || {
                      name: 'UNKNOWN SUBJECT',
                      id: 'UNIDENTIFIED',
                      risk: 0,
                      match: 0,
                      ipc: 'N/A',
                    };
                    setSnapshotResult({ ...result, cam: activeCamModal.id, time: new Date().toTimeString().split(' ')[0] });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-steel-600 hover:bg-steel-600/80 text-paper-100 font-bold transition-all"
                >
                  📸 Snapshot + Analyse
                </button>
              </div>
            </div>

            {/* Snapshot Result Panel */}
            {snapshotResult && (
              <div className="px-6 py-4 bg-void-000 border-t border-steel-600 font-mono text-xs">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-steel-700 border-2 border-critical-500/60 flex items-center justify-center shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-critical-500 font-bold text-sm">{snapshotResult.name}</div>
                    <div className="text-paper-100/50 mt-0.5">ID: {snapshotResult.id} · Cam: {snapshotResult.cam} · Captured: {snapshotResult.time}</div>
                    {snapshotResult.risk > 0 && (
                      <>
                        <div className="text-warn-500 mt-1">Risk Score: {snapshotResult.risk}/100 · Face Match: {snapshotResult.match}%</div>
                        <div className="text-phosphor-500">Charges: {snapshotResult.ipc}</div>
                      </>
                    )}
                    {snapshotResult.risk === 0 && (
                      <div className="text-paper-100/40 mt-1">No match found in biometric database</div>
                    )}
                  </div>
                  <button
                    onClick={() => setSnapshotResult(null)}
                    className="text-paper-100/30 hover:text-paper-100 transition-colors text-lg leading-none shrink-0"
                  >✕</button>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}