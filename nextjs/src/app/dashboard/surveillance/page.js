'use client';

import { useState, useEffect } from 'react';
import { Camera, Wifi, WifiOff, Eye, MapPin, Clock, Maximize2, X, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

const MOCK_CAMERAS = [
  {
    id: 'CAM-BL-001',
    name: 'Silk Board Junction - Main',
    location: 'Silk Board, Bengaluru',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-busy-intersection-at-night-41551-large.mp4',
    detected_target: 'KA-01-MJ-8821',
    target_type: 'ANPR MATCH: STOLEN VEHICLE',
    confidence: 98.4,
    fps: 30
  },
  {
    id: 'CAM-BL-002',
    name: 'MG Road BATCS East',
    location: 'MG Road, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-flowing-on-a-busy-street-41555-large.mp4',
    detected_target: 'RAMESH KUMAR (SUSPECT)',
    target_type: 'FACE MATCH: RISK 94%',
    confidence: 96.1,
    fps: 60
  },
  {
    id: 'CAM-BL-003',
    name: 'Whitefield Gate 1',
    location: 'Whitefield, Bengaluru',
    camera_type: 'cctv',
    is_active: false,
    has_anpr: false,
    has_face_recog: false,
    video_url: null,
    detected_target: null,
    target_type: null,
    confidence: 0,
    fps: 0
  },
  {
    id: 'CAM-BL-004',
    name: 'Hebbal Flyover Cam',
    location: 'Hebbal, Bengaluru',
    camera_type: 'anpr',
    is_active: true,
    has_anpr: true,
    has_face_recog: false,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-car-traffic-on-a-highway-at-night-41549-large.mp4',
    detected_target: 'KA-05-NB-1102',
    target_type: 'ANPR CHECK: WATCHLIST PASS',
    confidence: 99.1,
    fps: 30
  },
  {
    id: 'CAM-BL-005',
    name: 'JP Nagar 6th Phase',
    location: 'JP Nagar, Bengaluru',
    camera_type: 'cctv',
    is_active: true,
    has_anpr: false,
    has_face_recog: false,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41550-large.mp4',
    detected_target: 'SECTOR PATROL ACTIVE',
    target_type: 'PATROL MONITORING',
    confidence: 94.0,
    fps: 30
  },
  {
    id: 'CAM-BL-006',
    name: 'KR Puram Junction',
    location: 'KR Puram, Bengaluru',
    camera_type: 'face_recognition',
    is_active: true,
    has_anpr: true,
    has_face_recog: true,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-traffic-on-a-city-street-41553-large.mp4',
    detected_target: 'SURESH NAIDU (CO-ACCUSED)',
    target_type: 'FACE MATCH: RISK 86%',
    confidence: 92.8,
    fps: 60
  },
];

const TYPE_BADGES = {
  anpr:             { label: 'ANPR',    className: 'bg-phosphor-500/20 text-phosphor-500 border-phosphor-500/30' },
  face_recognition: { label: 'Face AI', className: 'bg-warn-500/20 text-warn-500 border-warn-500/30' },
  cctv:             { label: 'CCTV',    className: 'bg-steel-600/60 text-paper-100/60 border-steel-600/50' },
};

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
      className={`glass-card rounded-2xl overflow-hidden border transition-all hover:scale-[1.01] cursor-pointer relative group flex flex-col justify-between
      ${cam.is_active ? 'border-steel-600 hover:border-phosphor-500/50 shadow-2xl' : 'border-steel-600/30 opacity-60'}`}
    >
      {/* Video / Stream Canvas Container */}
      <div className="h-52 bg-void-000 relative flex items-center justify-center overflow-hidden">
        {cam.is_active && cam.video_url ? (
          <>
            <video
              src={cam.video_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover filter brightness-90 contrast-110"
            />
            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-scanlines opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-void-000/60 via-transparent to-void-000/80 pointer-events-none" />

            {/* Laser Scan Animation Line */}
            <div className="absolute inset-x-0 h-0.5 bg-phosphor-500/70 shadow-[0_0_8px_#10b981] animate-laser-scan pointer-events-none" />

            {/* Live Badge & Ticker */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-10">
              <div className="flex items-center gap-1.5 bg-void-000/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-steel-600/60">
                <div className="w-1.5 h-1.5 rounded-full bg-critical-500 animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-critical-500 uppercase">LIVE</span>
              </div>
              <span className="text-[10px] font-mono text-paper-100/70 bg-void-000/80 backdrop-blur-md px-2 py-1 rounded border border-steel-600/60">
                {timecode}
              </span>
            </div>

            <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
              <span className="text-[10px] font-mono text-phosphor-500 bg-void-000/80 backdrop-blur-md px-2 py-1 rounded border border-steel-600/60">
                {cam.fps} FPS
              </span>
            </div>

            {/* Target Detection Reticle Bounding Box */}
            {cam.detected_target && (
              <div className={`absolute z-20 border-2 rounded p-1 transition-all animate-pulse-slow ${
                cam.has_face_recog ? 'border-critical-500 bg-critical-500/10 top-1/4 left-1/3' : 'border-phosphor-500 bg-phosphor-500/10 bottom-1/4 right-1/4'
              }`}>
                <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-void-000/90 text-paper-100 border border-steel-600 whitespace-nowrap flex items-center gap-1">
                  <Zap className="w-3 h-3 text-warn-500 animate-bounce" />
                  <span>{cam.detected_target}</span>
                </div>
                <div className="text-[8px] font-mono text-phosphor-500 mt-0.5 text-right font-semibold">
                  MATCH: {cam.confidence}%
                </div>
              </div>
            )}

            {/* Hover Expand Icon */}
            <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-1.5 rounded-lg bg-steel-700/90 text-paper-100 hover:bg-phosphor-500 transition-colors">
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

  const filtered = MOCK_CAMERAS.filter((c) => {
    if (filter === 'active') return c.is_active;
    if (filter === 'anpr') return c.has_anpr;
    if (filter === 'face') return c.has_face_recog;
    return true;
  });

  const activeCount = MOCK_CAMERAS.filter((c) => c.is_active).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in relative min-h-screen bg-void-000">
      
      {/* Keyframe animation for laser scanning line */}
      <style jsx global>{`
        @keyframes laser-scan {
          0% { top: 0%; }
          50% { top: 95%; }
          100% { top: 0%; }
        }
        .animate-laser-scan {
          animation: laser-scan 3.5s linear infinite;
        }
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cameras Mounted',  value: '6,842', icon: Camera, color: 'text-phosphor-500' },
          { label: 'ANPR Optical Sensors',   value: '4,218', icon: Eye,    color: 'text-warn-500' },
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
              {activeCamModal.video_url ? (
                <>
                  <video
                    src={activeCamModal.video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover filter brightness-95 contrast-110"
                  />
                  <div className="absolute inset-0 bg-scanlines opacity-30 pointer-events-none" />
                  <div className="absolute inset-x-0 h-0.5 bg-phosphor-500/80 shadow-[0_0_12px_#10b981] animate-laser-scan pointer-events-none" />

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
                  onClick={() => alert(`Snapshot captured for ${activeCamModal.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-steel-600 hover:bg-steel-600/80 text-paper-100 font-bold transition-all"
                >
                  📸 Take Snapshot
                </button>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}