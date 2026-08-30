'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X, ShieldAlert, ArrowRight, Camera, MapPin, Radio, AlertTriangle } from 'lucide-react';

export default function AlertNotification() {
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
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.12);
            } catch (e) {
              console.warn('Web audio not allowed', e);
            }
          }
          prevCountRef.current = alertList.length;
        }
      } catch (err) {
        // Fallback mock alerts if endpoint is offline
        if (alerts.length === 0) {
          const mockAlerts = [
            {
              id: 'a1',
              severity: 'critical',
              plate_number: 'KA-01-MJ-8821',
              camera_name: 'Silk Board Inbound Junction (CAM-04)',
              fir_case_number: 'KAR/BLR/2026/04921',
              timestamp: 'Just now',
              crime_type: 'Stolen Pulsar 220 Transit'
            },
            {
              id: 'a2',
              severity: 'high',
              plate_number: 'KA-05-NB-1102',
              camera_name: 'MG Road Metro Signal Approach',
              fir_case_number: 'KAR/BLR/2026/01184',
              timestamp: '8m ago',
              crime_type: 'Cloned ANPR Sighting'
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
  }, []);

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
        className="relative w-9 h-9 rounded-full bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all shadow-xs cursor-pointer"
        title="Active Alerts"
      >
        <Bell className="w-4 h-4" />
        {hasNewAlert && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 animate-ping z-10" />
        )}
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold font-heading flex items-center justify-center z-20 ring-2 ring-white">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Modern Clean Alert Dropdown Panel */}
      {isPanelOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-92 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xl z-[9999] animate-in fade-in zoom-in-95 duration-150 text-slate-900 font-sans">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold font-heading text-slate-900 tracking-tight">
                Active ANPR Alerts
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                {alerts.length} New
              </span>
            </div>
            
            <button
              onClick={() => setIsPanelOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active target sightings.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 hover:bg-slate-50/80 transition-colors group relative"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {/* HSRP License Plate Pill */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span className="text-xs font-bold font-heading text-slate-900 tracking-wider">
                        {alert.plate_number}
                      </span>
                    </div>

                    <span className="text-[10px] font-medium text-slate-400">
                      {alert.timestamp}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <Camera className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{alert.camera_name}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="truncate max-w-[180px]">
                        {alert.crime_type || 'Flagged Target'}
                      </span>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-medium">
                        {alert.fir_case_number.split('/').pop() || alert.fir_case_number}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Track Link */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                    <Link
                      href="/dashboard/surveillance"
                      onClick={() => setIsPanelOpen(false)}
                      className="text-[11px] font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 group-hover:underline"
                    >
                      <span>Track on Feed</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <Link
              href="/dashboard/surveillance"
              onClick={() => setIsPanelOpen(false)}
              className="w-full text-center text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center justify-center gap-1 py-1 hover:underline"
            >
              <span>View All Surveillance Feeds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
