'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, Activity, Clock, Navigation, Download, Map as MapIcon, ChevronRight } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

import { fetchWithFallback } from '@/lib/fetch-with-fallback';
import { DEMO_TRAIL } from '@/lib/demo-data';

// Dynamically import Leaflet component to avoid SSR issues
const TrailMapView = dynamic(() => import('./TrailMapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-steel-800 animate-pulse rounded-2xl flex items-center justify-center text-paper-100/50">Loading Map...</div>
});

export default function GeoTrailPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPlate, setSearchedPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [trailData, setTrailData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [highlightedHop, setHighlightedHop] = useState(null);

  // Auto load demo trail on mount and check URL query param
  useEffect(() => {
    let plateParam = 'KA-01-MJ-8821';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPlate = urlParams.get('plate');
      if (urlPlate) plateParam = urlPlate.toUpperCase();
    }

    const trailWithPlate = DEMO_TRAIL.trail.map(h => ({
      ...h,
      plate_detected: plateParam
    }));

    setTrailData(trailWithPlate);
    setMetadata({
      totalHops: DEMO_TRAIL.total_hops,
      totalDistance: DEMO_TRAIL.total_distance_km,
      status: DEMO_TRAIL.trail_status,
      duration: DEMO_TRAIL.duration_minutes,
      lastUpdated: new Date().toLocaleTimeString('en-IN')
    });
    setSearchedPlate(plateParam);
    setSearchQuery(plateParam);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const plate = searchQuery.trim().toUpperCase();
    setSearchedPlate(plate);
    setLoading(true);
    setError(null);
    setHighlightedHop(null);
    
    try {
      const fallback = {
        ...DEMO_TRAIL,
        trail: DEMO_TRAIL.trail.map(h => ({ ...h, plate_detected: plate }))
      };

      const { data } = await fetchWithFallback(
        'trail',
        fallback,
        {
          method: 'POST',
          body: {
            crime_lat: 12.9716,
            crime_lng: 77.5946,
            crime_timestamp: new Date().toISOString(),
            vehicle_type: 'vehicle'
          }
        }
      );

      const trailList = data?.trail || fallback.trail;
      setTrailData(trailList);
      setMetadata({
        totalHops: data?.total_hops || fallback.total_hops,
        totalDistance: data?.total_distance_km || fallback.total_distance_km,
        status: data?.trail_status || fallback.trail_status,
        duration: data?.duration_minutes || fallback.duration_minutes,
        lastUpdated: new Date().toLocaleTimeString('en-IN')
      });
    } catch (err) {
      setTrailData(DEMO_TRAIL.trail);
      setMetadata({
        totalHops: DEMO_TRAIL.total_hops,
        totalDistance: DEMO_TRAIL.total_distance_km,
        status: DEMO_TRAIL.trail_status,
        duration: DEMO_TRAIL.duration_minutes,
        lastUpdated: new Date().toLocaleTimeString('en-IN')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!metadata || trailData.length === 0) return;
    
    const summary = `DRISHTI GEO TRAIL REPORT\n` +
      `========================\n\n` +
      `Plate Number: ${searchedPlate}\n` +
      `Status: ${metadata.status}\n` +
      `Total Hops: ${metadata.totalHops}\n` +
      `Total Distance: ${metadata.totalDistance} km\n` +
      `Duration: ${metadata.duration} minutes\n\n` +
      `SIGHTINGS TIMELINE:\n` +
      `-------------------\n` +
      trailData.map((hop) => (
        `Hop ${hop.hop} | ${new Date(hop.timestamp).toLocaleString('en-IN')} | ${hop.camera_name} | Confidence: ${hop.confidence}%\n`
      )).join('') + 
      `\nReport Generated: ${new Date().toLocaleString('en-IN')}\n`;
      
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoTrail_${searchedPlate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-void-000 p-6">
      {/* 1. Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-paper-100 tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-accent" />
            Suspect Geo-Trail Tracker
          </h2>
          <p className="text-sm text-paper-100/50 mt-1">Trace vehicle movements across the ANPR network</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Plate (e.g. KA-01-AB-1234)"
            className="w-full bg-steel-800 border border-steel-600 rounded-xl py-2.5 pl-10 pr-4 text-paper-100 placeholder-paper-100/40 focus:outline-none focus:border-accent transition-colors"
          />
          <Search className="w-4 h-4 text-paper-100/50 absolute left-3.5 top-3" />
          <button type="submit" className="hidden" />
        </form>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 min-h-0 bg-black/20 border border-steel-600/30 rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-void-000/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-paper-100/70 mt-4 tracking-wider animate-pulse">Scanning surveillance network...</p>
          </div>
        )}

        {!loading && !searchedPlate && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-paper-100/40 z-10 pointer-events-none">
            <MapIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Enter a plate number to begin tracing</p>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-status-error/80 z-10 pointer-events-none bg-void-000">
            <Activity className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Map Section */}
        <div className="flex-1 h-full relative p-4">
          <div className="w-full h-full rounded-xl overflow-hidden border border-steel-700 shadow-2xl relative">
            <TrailMapView trailData={trailData} highlightedHop={highlightedHop} />
            
            {/* Map Overlay HUD */}
            {metadata && (
              <div className="absolute top-4 left-4 z-[400] flex gap-3 pointer-events-none">
                <div className="bg-void-000/80 backdrop-blur border border-steel-600/50 rounded-lg px-4 py-2 shadow-lg">
                  <p className="text-xs text-paper-100/50 uppercase tracking-widest font-semibold">Active Target</p>
                  <p className="text-lg font-bold text-accent font-mono mt-0.5">{searchedPlate}</p>
                </div>
                <div className="bg-void-000/80 backdrop-blur border border-steel-600/50 rounded-lg px-4 py-2 shadow-lg flex gap-6">
                  <div>
                    <p className="text-[10px] text-paper-100/50 uppercase tracking-wider">Distance</p>
                    <p className="text-sm font-semibold text-paper-100">{metadata.totalDistance} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-paper-100/50 uppercase tracking-wider">Status</p>
                    <p className={`text-sm font-semibold capitalize ${metadata.status === 'active' ? 'text-status-success' : 'text-status-error'}`}>
                      {metadata.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Panel */}
        {metadata && trailData.length > 0 && (
          <div className="w-full md:w-[380px] border-l border-steel-600/30 bg-steel-800/20 flex flex-col h-full">
            <div className="p-4 border-b border-steel-600/30 flex justify-between items-center bg-black/10">
              <h3 className="font-semibold text-paper-100 tracking-wide">Sighting Timeline</h3>
              <span className="text-xs text-paper-100/40">{metadata.totalHops} Hops</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {trailData.map((hop, i) => (
                <div 
                  key={hop.hop}
                  onClick={() => setHighlightedHop(hop.hop)}
                  className={`relative pl-6 pb-2 cursor-pointer transition-all ${highlightedHop === hop.hop ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  {/* Timeline connecting line */}
                  {i < trailData.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-steel-600/50"></div>
                  )}
                  {/* Timeline dot */}
                  <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-void-000 shadow-sm ${
                    i === 0 ? 'bg-status-success' : i === trailData.length - 1 ? 'bg-status-error' : 'bg-accent'
                  }`}></div>

                  <div className={`bg-steel-800/40 border transition-colors rounded-xl p-3 ${highlightedHop === hop.hop ? 'border-accent shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-steel-600/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-paper-100/70">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(hop.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/20 text-paper-100/60">
                        Hop {hop.hop}
                      </span>
                    </div>
                    
                    <p className="font-semibold text-paper-100 text-sm mb-1 leading-snug">{hop.camera_name}</p>
                    
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-status-success/80 bg-status-success/10 px-2 py-1 rounded-md">
                        <Activity className="w-3.5 h-3.5" />
                        <span>{hop.confidence}% Match</span>
                      </div>
                      <span className="text-paper-100/40">{hop.distance_from_crime_km} km away</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-steel-600/30 bg-black/10">
              <button 
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 bg-steel-700/50 hover:bg-steel-700 text-paper-100 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                Export Trail Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
