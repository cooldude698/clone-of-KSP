'use client';

import { useState } from 'react';
import { Camera, Wifi, WifiOff, Eye, MapPin, Clock } from 'lucide-react';

const MOCK_CAMERAS = [
  { id: 'CAM-BL-001', name: 'Silk Board Junction - Main', location: 'Silk Board, Bengaluru', camera_type: 'anpr', is_active: true, has_anpr: true, has_face_recog: false },
  { id: 'CAM-BL-002', name: 'MG Road BATCS East', location: 'MG Road, Bengaluru', camera_type: 'face_recognition', is_active: true, has_anpr: true, has_face_recog: true },
  { id: 'CAM-BL-003', name: 'Whitefield Gate 1', location: 'Whitefield, Bengaluru', camera_type: 'cctv', is_active: false, has_anpr: false, has_face_recog: false },
  { id: 'CAM-BL-004', name: 'Hebbal Flyover Cam', location: 'Hebbal, Bengaluru', camera_type: 'anpr', is_active: true, has_anpr: true, has_face_recog: false },
  { id: 'CAM-BL-005', name: 'JP Nagar 6th Phase', location: 'JP Nagar, Bengaluru', camera_type: 'cctv', is_active: true, has_anpr: false, has_face_recog: false },
  { id: 'CAM-BL-006', name: 'KR Puram Junction', location: 'KR Puram, Bengaluru', camera_type: 'face_recognition', is_active: true, has_anpr: true, has_face_recog: true },
];

const TYPE_BADGES = {
  anpr:             { label: 'ANPR',    className: 'bg-phosphor-500/20 text-phosphor-500 border-phosphor-500/30' },
  face_recognition: { label: 'Face AI', className: 'bg-warn-500/20 text-warn-500 border-warn-500/30' },
  cctv:             { label: 'CCTV',    className: 'bg-steel-600/60 text-paper-100/60 border-steel-600/50' },
};

function CameraCard({ cam }) {
  const typeCfg = TYPE_BADGES[cam.camera_type] || TYPE_BADGES.cctv;
  return (
    <div className={`glass-card rounded-xl overflow-hidden border transition-all hover:-translate-y-0.5 relative
      ${cam.is_active ? 'border-steel-600 hover:border-phosphor-500/30 live-scanline' : 'border-steel-600/30 opacity-60'}`}>
      <div className="h-36 bg-void-000 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-void-000/60" />
        {cam.is_active ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-full h-full bg-steel-700/50 flex items-center justify-center">
              <Camera className="w-8 h-8 text-steel-600" />
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-void-000/90 px-2 py-0.5 rounded border border-steel-600/50 shadow-sm z-20">
              <div className="w-1.5 h-1.5 rounded-full bg-phosphor-500 pulse-phosphor" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-phosphor-500 uppercase">LIVE</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <WifiOff className="w-7 h-7 text-paper-100/30" />
            <span className="text-xs text-paper-100/30 font-mono">Feed Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-paper-100 leading-snug">{cam.name}</p>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border flex-shrink-0 ${typeCfg.className}`}>
            {typeCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3 text-paper-100/30" />
          <span className="text-xs text-paper-100/50">{cam.location}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-paper-100/40 font-mono">
          <span>{cam.id}</span>
          {cam.has_anpr && <span className="text-phosphor-500">ANPR</span>}
          {cam.has_face_recog && <span className="text-warn-500">Face</span>}
        </div>
      </div>
    </div>
  );
}

export default function SurveillancePage() {
  const [filter, setFilter] = useState('all');

  const filtered = MOCK_CAMERAS.filter((c) => {
    if (filter === 'active') return c.is_active;
    if (filter === 'anpr') return c.has_anpr;
    if (filter === 'face') return c.has_face_recog;
    return true;
  });

  const activeCount = MOCK_CAMERAS.filter((c) => c.is_active).length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-paper-100">Surveillance Network</h2>
          <p className="text-xs text-paper-100/50 mt-0.5">Live CCTV and ANPR feeds -- Bengaluru Urban</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20">
            <div className="w-2 h-2 rounded-full bg-success-500 pulse-phosphor" />
            <span className="text-xs text-success-500 font-medium">{activeCount}/{MOCK_CAMERAS.length} online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Cameras',  value: '6,842', icon: Camera, color: 'text-phosphor-500' },
          { label: 'ANPR Enabled',   value: '4,218', icon: Eye,    color: 'text-warn-500' },
          { label: 'Active Alerts',  value: '3',     icon: Clock,  color: 'text-critical-500' },
          { label: 'Network Uptime', value: '98.7%', icon: Wifi,   color: 'text-success-500' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-steel-600/40">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-paper-100 font-mono">{s.value}</p>
            <p className="text-xs text-paper-100/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {['all', 'active', 'anpr', 'face'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
              ${filter === f
                ? 'bg-phosphor-500 text-paper-100'
                : 'bg-steel-700 border border-steel-600/50 text-paper-100/50 hover:text-paper-100'}`}
          >
            {f === 'all' ? 'All Cameras' : f === 'anpr' ? 'ANPR Only' : f === 'face' ? 'Face AI' : 'Active Only'}
          </button>
        ))}
        <span className="text-xs text-paper-100/30 ml-2">{filtered.length} cameras</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cam) => (
          <CameraCard key={cam.id} cam={cam} />
        ))}
      </div>
    </div>
  );
}