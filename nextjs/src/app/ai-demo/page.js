'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import DrishtiOrb from '@/components/DrishtiOrb';
import DrishtiChat from '@/components/DrishtiChat';
import useDrishtiVoice from '@/components/DrishtiVoice';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import Leaflet with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// CSS helper
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Load custom Leaflet icon on client
let customIcon = null;
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

// 1. Dynamic Bar Chart Component
const CustomBarChart = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;
  const maxVal = Math.max(...data.map(d => d.value || 0), 1);
  return (
    <div className="w-full space-y-4 p-5 bg-white/5 border border-white/5 rounded-2xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">Crime Analytics Chart</h3>
      <div className="space-y-3.5">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-gray-300">
              <span>{item.label}</span>
              <span className="font-bold text-blue-400">{item.value}</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Dynamic Network Graph Component
const CustomNetworkGraph = ({ data }) => {
  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) return null;
  
  const nodes = data.nodes.map((node, i) => {
    const angle = (i / data.nodes.length) * 2 * Math.PI;
    const x = 150 + 90 * Math.cos(angle);
    const y = 150 + 90 * Math.sin(angle);
    return { ...node, x, y };
  });

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 self-start">Suspect Network Connections</h3>
      <svg viewBox="0 0 300 300" className="w-full aspect-square max-h-[300px]">
        {data.links.map((link, idx) => {
          const sourceNode = nodes.find(n => n.id === link.source);
          const targetNode = nodes.find(n => n.id === link.target);
          if (!sourceNode || !targetNode) return null;
          return (
            <line
              key={idx}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              className="stroke-white/20 stroke-[1.5]"
            />
          );
        })}
        {nodes.map((node, idx) => (
          <g key={idx}>
            <circle
              cx={node.x}
              cy={node.y}
              r={12}
              className={cn(
                "fill-blue-500 stroke-white/10 stroke-2 cursor-pointer transition-colors",
                node.type === 'suspect' && "fill-red-500 hover:fill-red-400",
                node.type === 'case' && "fill-amber-500 hover:fill-amber-400"
              )}
            />
            <text
              x={node.x}
              y={node.y + 22}
              textAnchor="middle"
              className="fill-gray-300 text-[9px] font-semibold font-mono"
            >
              {node.label || node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 3. Dynamic Stat Cards Component
const CustomStatCards = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {data.map((card, idx) => (
        <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 shadow-inner hover:border-white/10 transition-all">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold font-mono">{card.label}</span>
          <span className="text-2xl font-bold tracking-tight text-white">{card.value}</span>
          {card.description && <span className="text-[9px] text-gray-500 font-medium">{card.description}</span>}
        </div>
      ))}
    </div>
  );
};

// 4. Dynamic FIR Records List Component
const CustomFirList = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;
  return (
    <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 overflow-hidden flex flex-col">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">Recent FIR Records</h3>
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2.5 px-3">FIR ID</th>
              <th className="py-2.5 px-3">Area</th>
              <th className="py-2.5 px-3">Offense</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((fir, idx) => (
              <tr key={idx} className="text-xs hover:bg-white/5 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{fir.id || fir.fir_id}</td>
                <td className="py-2.5 px-3 text-gray-300">{fir.area || fir.location}</td>
                <td className="py-2.5 px-3 text-gray-300">{fir.offense || fir.type}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {fir.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. Dynamic Map Component
const CustomMap = ({ data, type }) => {
  if (typeof window === 'undefined') return null;
  
  // Default centered coordinates (Bengaluru)
  const defaultCenter = [12.9716, 77.5946];
  
  const markers = Array.isArray(data) ? data : [];
  const isTrail = type === 'geo_trail';
  const trailPositions = markers.map(m => [m.lat || m.latitude || defaultCenter[0], m.lng || m.longitude || defaultCenter[1]]);
  
  return (
    <div className="w-full aspect-[16/10] max-h-[400px] border border-white/5 rounded-2xl overflow-hidden bg-slate-900 flex flex-col relative z-0">
      <div className="absolute top-4 left-4 z-[1000] bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
        {isTrail ? 'Suspect Geo-Trail' : 'Active Hotspots Map'}
      </div>
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((marker, idx) => {
          const lat = marker.lat || marker.latitude || defaultCenter[0];
          const lng = marker.lng || marker.longitude || defaultCenter[1];
          const radius = marker.intensity ? marker.intensity * 200 : 500;
          return (
            <React.Fragment key={idx}>
              {customIcon && <Marker position={[lat, lng]} icon={customIcon} />}
              <Circle 
                position={[lat, lng]} 
                radius={radius}
                pathOptions={{ 
                  fillColor: marker.color || 'red', 
                  color: marker.color || 'red', 
                  fillOpacity: 0.25,
                  weight: 1.5
                }}
              />
            </React.Fragment>
          );
        })}
        {isTrail && trailPositions.length > 1 && (
          <Polyline positions={trailPositions} pathOptions={{ color: 'red', weight: 4, dashArray: '10, 10', className: 'animate-pulse' }} />
        )}
      </MapContainer>
    </div>
  );
};

export default function DrishtiDashboard() {
  const [orbState, setOrbState] = useState('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);
  const [dispatchToast, setDispatchToast] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  // Geo-Fencing Overwatch Effect
  useEffect(() => {
    if (response && response.visualization && response.visualization.type === 'geo_trail') {
      setCriticalAlert("CRITICAL ALERT: Suspect entering unpatrolled Sector 4. Recommend dispatching Hoysala Unit immediately.");
    } else {
      setCriticalAlert(null);
    }
  }, [response]);

  const handleStartSession = () => {
    setSessionStarted(true);
    const currentHour = new Date().getHours();
    
    // Trigger Midnight Briefing if it's between 6 PM and 6 AM
    if (currentHour >= 18 || currentHour < 6) {
      setOrbState('speaking');
      const briefingText = "Good evening, Inspector. Here is your night briefing: There are 3 active hotspots in your sector, and a BOLO was issued for a white Swift. Stay safe.";
      
      setResponse({
        response_text: briefingText,
        visualization: {
          type: 'hotspot_map',
          title: 'Active Hotspots - Night Shift',
          data: [
            { lat: 12.9716, lng: 77.5946, intensity: 0.8, color: 'red' },
            { lat: 12.9352, lng: 77.6245, intensity: 0.6, color: 'orange' },
            { lat: 12.9250, lng: 77.5938, intensity: 0.9, color: 'red' }
          ]
        },
        follow_up_suggestions: ["Show me the white Swift details", "Dispatch patrol to hotspots"],
        urgency: 'medium'
      });
      
      // Delay speak slightly to ensure TTS engine is ready
      setTimeout(() => {
        speak(briefingText, 'en-IN');
      }, 500);
    }
  };

  const handleExportPdf = async () => {
    if (!conversationId) return;
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, title: "DRISHTI AI Intelligence Report", officer_name: "Inspector", badge_number: "KSP-092" })
      });
      const data = await res.json();
      if (data.pdf_base64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.pdf_base64}`;
        link.download = `KSP_Intelligence_Report_${conversationId.substring(0, 8)}.pdf`;
        link.click();
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  const handleDispatch = () => {
    setDispatchToast("Intelligence package dispatched to field units via WhatsApp/SMS.");
    setTimeout(() => {
      setDispatchToast(null);
    }, 4000);
  };

  // Sample queries that double as clickable template buttons
  const sampleQueries = [
    "Show active patrol routes in Jayanagar",
    "List recent FIR records near Silk Board",
    "Display suspect network for Case #492",
    "Show crime hotspot map of Bengaluru"
  ];

  // Time ticks
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuery = async (queryText) => {
    setOrbState('thinking');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, language: 'en', conversation_id: conversationId })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResponse(data);
      if (data.conversation_id) setConversationId(data.conversation_id);
      setOrbState('speaking');
      if (data.response_text) {
        speak(data.response_text, 'en-IN');
      } else {
        setOrbState('idle');
      }
    } catch (err) {
      console.error('Failed to handle query:', err);
      setOrbState('idle');
    }
  };

  const { startListening, stopListeningAndGetTranscript, speak } = useDrishtiVoice({
    onWake: () => handleWakeToggle(),
    onSpeakStart: () => { },
    onSpeakEnd: () => setOrbState('idle'),
    onError: (err) => {
      const errName = err?.name || err?.error || err;
      if (
        errName === 'aborted' ||
        errName === 'NotFoundError' ||
        errName === 'not-allowed' ||
        errName === 'network'
      ) return;
      console.error('DrishtiVoice Error:', err);
      setOrbState('idle');
    }
  });

  const stopListening = () => {
    const text = stopListeningAndGetTranscript();
    setTranscript(text || '');
    if (text && text.trim().length > 0) {
      handleQuery(text.trim());
    }
  };

  const handleWakeToggle = () => {
    setOrbState(prev => {
      if (prev === 'listening') {
        stopListening();
        return 'idle';
      }
      setIsChatOpen(true);
      return 'listening';
    });
  };

  // Cross-platform keyboard shortcut PTT logic
  // Windows/Linux: Ctrl+Alt
  // Mac: Cmd+Shift
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
    const pressedKeys = { ctrl: false, alt: false, meta: false, shift: false };
    let isPttActive = false;

    const handleKeyDown = (e) => {
      if (e.key === 'Control') pressedKeys.ctrl = true;
      if (e.key === 'Alt') pressedKeys.alt = true;
      if (e.key === 'Meta') pressedKeys.meta = true;
      if (e.key === 'Shift') pressedKeys.shift = true;

      const triggerPTT = isMac
        ? (pressedKeys.meta && pressedKeys.shift)
        : (pressedKeys.ctrl && pressedKeys.alt);

      if (triggerPTT && !isPttActive) {
        isPttActive = true;
        setOrbState('listening');
        setIsChatOpen(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Control') pressedKeys.ctrl = false;
      if (e.key === 'Alt') pressedKeys.alt = false;
      if (e.key === 'Meta') pressedKeys.meta = false;
      if (e.key === 'Shift') pressedKeys.shift = false;

      const releasePTT = isMac
        ? (!pressedKeys.meta || !pressedKeys.shift)
        : (!pressedKeys.ctrl || !pressedKeys.alt);

      if (releasePTT && isPttActive) {
        isPttActive = false;
        stopListening();
        setOrbState('idle');
      }
    };

    const handleBlur = () => {
      pressedKeys.ctrl = false;
      pressedKeys.alt = false;
      pressedKeys.meta = false;
      pressedKeys.shift = false;
      if (isPttActive) {
        isPttActive = false;
        stopListening();
        setOrbState('idle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [stopListening]);

  // Sync listening trigger based on orbState
  useEffect(() => {
    if (orbState === 'listening') {
      startListening('en-IN');
    }
  }, [orbState, startListening]);

  const handleOrbClick = () => {
    handleWakeToggle();
  };

  const handleChipClick = (chipText) => {
    setTranscript(chipText);
    handleQuery(chipText);
  };

  const handleSendText = (text) => {
    setTranscript(text);
    handleQuery(text);
  };

  // Helper function to render active visualization based on response JSON
  const renderVisualization = () => {
    if (!response || !response.visualization) return null;
    const { type, data } = response.visualization;
    switch (type) {
      case 'heatmap':
      case 'map_pins':
      case 'hotspot_map':
      case 'geo_trail':
        return <CustomMap data={Array.isArray(data) ? data : data?.hotspots || data?.cameras || []} type={type} />;
      case 'bar_chart':
      case 'line_chart':
        return <CustomBarChart data={Array.isArray(data) ? data : data?.trends || []} />;
      case 'network_graph':
        return <CustomNetworkGraph data={data} />;
      case 'stat_card':
        return <CustomStatCards data={data} />;
      case 'fir_list':
        return <CustomFirList data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] text-white overflow-hidden font-sans select-none">
      {/* Dynamic Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
      
      {/* Top Bar Header */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between p-6 z-10 bg-slate-950/40 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-950 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-white font-extrabold tracking-wider overflow-hidden">
            <span className="relative z-10 text-sm font-black">KSP</span>
            <div className="absolute inset-0 bg-blue-400/20 animate-pulse pointer-events-none" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-gray-100 flex items-center gap-2">
              <span>Karnataka State Police</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">DRISHTI v2.5</span>
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest font-medium uppercase">Unified Command Center Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-400 font-semibold font-mono">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>AI CORE READY</span>
          </div>
          <div className="font-mono text-gray-300 font-bold text-lg bg-black/30 border border-white/5 px-4 py-1.5 rounded-lg shadow-inner">
            {currentTime ? currentTime.toLocaleTimeString('en-IN') : ''}
          </div>
        </div>
      </header>

      {/* Critical Alert Geo-fencing Banner */}
      <AnimatePresence>
        {criticalAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-28 left-0 w-full z-40 flex justify-center px-6"
          >
            <div className="bg-red-600/90 backdrop-blur-md border border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.6)] px-6 py-3 rounded-xl flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <span className="text-white font-bold tracking-wide text-sm">{criticalAlert}</span>
              <button onClick={() => setCriticalAlert(null)} className="ml-4 text-white/70 hover:text-white transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispatch Success Toast */}
      <AnimatePresence>
        {dispatchToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-44 left-0 w-full z-40 flex justify-center px-6"
          >
            <div className="bg-green-600/90 backdrop-blur-md border border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] px-6 py-3 rounded-xl flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/>
              </svg>
              <span className="text-white font-bold tracking-wide text-sm">{dispatchToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content grid layout */}
      <main className="pt-28 px-8 pb-8 w-full h-screen grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden">
        
        {/* Left Side: System Telemetry status & instruction cards */}
        <section className="lg:col-span-4 flex flex-col bg-[#0a0f1d]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">System Telemetry</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Real-time status indicators</p>
          </div>

          <div className="space-y-3.5">
            {/* Status Info */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Assistant Mode</p>
                <h3 className="text-xs font-bold text-white uppercase mt-0.5">
                  {orbState === 'listening' ? 'Listening...' : orbState === 'thinking' ? 'Processing...' : orbState === 'speaking' ? 'Speaking...' : 'Ready'}
                </h3>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full shadow-lg ${
                orbState === 'listening' ? 'bg-green-400 shadow-green-500/50' :
                orbState === 'thinking' ? 'bg-amber-400 shadow-amber-500/50 animate-pulse' :
                orbState === 'speaking' ? 'bg-cyan-400 shadow-cyan-500/50' :
                'bg-blue-500 shadow-blue-500/50'
              }`} />
            </div>

            {/* Guide Card */}
            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Voice Control Guide</h4>
              <ul className="text-xs text-gray-400 mt-3 space-y-2.5 list-disc list-inside">
                <li>Double-clap to <span className="text-blue-300 font-semibold">Start / Stop</span> wake mode</li>
                <li>Hold <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">Alt</kbd> to Push-to-Talk</li>
                <li>Click the floating Siri-style Orb to toggle</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Center/Right Side: Dynamic Visualization display */}
        <section className="lg:col-span-8 h-full flex flex-col justify-center relative overflow-hidden">
          {response && response.visualization ? (
            <div className="w-full flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out]">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Response Data Visualization</span>
                <button 
                  onClick={() => setResponse(null)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-semibold"
                >
                  Clear Visuals
                </button>
              </div>
              {renderVisualization()}
            </div>
          ) : (
            /* Standby welcome screen with interactive click-to-query tiles */
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-6 py-12">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-wide text-gray-100">Welcome to DRISHTI</h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto">Conversational intelligence portal for the Karnataka State Police. Press the push-to-talk shortcut or double clap to query.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                {!sessionStarted ? (
                  <div className="col-span-1 md:col-span-2 flex justify-center py-6">
                    <button
                      onClick={handleStartSession}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-3"
                    >
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                      INITIALIZE SECURE SESSION
                    </button>
                  </div>
                ) : (
                  sampleQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendText(query)}
                      className="p-4 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all flex flex-col justify-between group h-24"
                    >
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-blue-300 transition-colors">{query}</span>
                      <span className="text-[10px] text-gray-500 font-mono self-end group-hover:text-blue-400 transition-colors">Run query &rarr;</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Drishti Chat Panel */}
      <DrishtiChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        transcript={transcript}
        response={response}
        onSendText={handleSendText}
        onChipClick={handleChipClick}
        onDispatch={handleDispatch}
        onExportPdf={handleExportPdf}
      />

      {/* Drishti Orb */}
      <DrishtiOrb
        state={orbState}
        onClick={handleOrbClick}
      />

      {/* Custom Keyframe Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}