'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function AlertNotification() {
  const { resolvedTheme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const prevCountRef = useRef(0);
  const panelRef = useRef(null);

  // Poll for alerts every 5 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
        const response = await fetch(`${apiBase}/anpr-check/alerts/`);
        if (!response.ok) throw new Error('API unreachable');
        
        const data = await response.json();
        const alertList = data.alerts || [];
        setAlerts(alertList);

        if (alertList.length > prevCountRef.current) {
          if (prevCountRef.current > 0) {
            setHasNewAlert(true);
            // Trigger web audio beep
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high note
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.15);
            } catch (e) {
              console.warn('Web audio not allowed', e);
            }
          }
          prevCountRef.current = alertList.length;
        }
      } catch (err) {
        // Fallback mock alerts during hackathon if endpoint is offline or 404
        if (alerts.length === 0) {
          const mockAlerts = [
            {
              id: 'a1',
              severity: 'critical',
              plate_number: 'KA-01-MJ-8821',
              camera_name: 'Silk Board Inbound Junction',
              fir_case_number: 'KAR/BLR/2026/04921',
              timestamp: new Date().toLocaleTimeString(),
            },
            {
              id: 'a2',
              severity: 'high',
              plate_number: 'KA-03-HH-4592',
              camera_name: 'MG Road East Metro Exit',
              fir_case_number: 'KAR/BLR/2026/01103',
              timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
            },
          ];
          setAlerts(mockAlerts);
          prevCountRef.current = mockAlerts.length;
        }
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  // Click outside listener to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenToggle = () => {
    setIsPanelOpen(!isPanelOpen);
    setHasNewAlert(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="alert-bell-btn"
        onClick={handleOpenToggle}
        className="relative w-8 h-8 rounded-lg bg-steel-700 hover:bg-steel-600 border border-steel-600 flex items-center justify-center text-paper-100 hover:text-paper-100 transition-all shadow-sm"
        title="Active Alerts"
      >
        <Bell className="w-4 h-4 text-phosphor-500" />
        {hasNewAlert && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-critical-500 flex items-center justify-center animate-ping z-10" />
        )}
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-critical-500 text-paper-100 text-[8px] font-mono font-bold flex items-center justify-center z-20">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Alert Dropdown Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-steel-700 border border-steel-600 rounded-xl overflow-hidden shadow-2xl z-[9999] animate-fade-in text-paper-100">
          <div className="px-4 py-3 border-b border-steel-600 bg-steel-600/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-critical-500" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase">Active ANPR Alerts</span>
            </div>
            <button
               onClick={() => setIsPanelOpen(false)}
               className="text-paper-100/50 hover:text-paper-100 transition-colors"
             >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-steel-600/40">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-paper-100/50 font-mono">
                No active target sightings.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 transition-colors hover:bg-steel-600/20 relative overflow-hidden live-scanline`}
                >
                  {/* Left edge colored border by severity */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      alert.severity === 'critical' ? 'bg-critical-500' : 'bg-warn-500'
                    }`}
                  />

                  {/* Pulsing Phosphor indicator tag inside Live alert */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-void-000/90 px-1.5 py-0.5 rounded border border-steel-600/35">
                    <div className="w-1 h-1 rounded-full bg-phosphor-500 pulse-phosphor" />
                    <span className="text-[8px] font-mono tracking-widest text-phosphor-500 uppercase font-bold">LIVE</span>
                  </div>

                  {/* Stamp placement (Rotated Rubber Stamp) */}
                  <div className="mt-4 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-paper-100/50 font-mono">{alert.timestamp}</p>
                      <h4 className="text-sm font-bold font-mono tracking-wide text-paper-100">
                        {alert.plate_number}
                      </h4>
                      <p className="text-[11px] text-paper-100/60 font-mono">
                        Spotted at: {alert.camera_name}
                      </p>
                    </div>

                    {/* Rubber case stamp style */}
                    <div className="case-stamp select-none mr-1 transform rotate-[-6deg] text-[9px]">
                      {alert.fir_case_number.split('/').pop() || 'ALERT'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-steel-600 bg-steel-600/10 flex items-center justify-center">
            <button className="text-[10px] font-mono text-phosphor-500 hover:underline flex items-center gap-1">
              Open Alerts Console <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
