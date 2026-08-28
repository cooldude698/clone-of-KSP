'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  type: 'MO_MATCH' | 'SYNDICATE_LINK' | 'HOTSPOT_SPIKE' | 'CROSS_DISTRICT' | 'REPEAT_OFFENDER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  location: string;
  details: string;
  confidence: number;
  badge: string;
}

const INITIAL_ANOMALIES: AnomalyEvent[] = [
  {
    id: 'ANM-901',
    timestamp: 'Just now',
    type: 'MO_MATCH',
    severity: 'CRITICAL',
    title: 'Night Two-Wheeler Theft MO Match',
    location: 'Raichur & Bengaluru Urban Corridor',
    details: 'Shared master key bypass method detected across 4 FIRs in 48h (Suspect: Ramesh Kumar)',
    confidence: 98.4,
    badge: 'SYNDICATE MO',
  },
  {
    id: 'ANM-902',
    timestamp: '6s ago',
    type: 'CROSS_DISTRICT',
    severity: 'HIGH',
    title: 'Inter-District Suspect Relocation',
    location: 'Kalaburagi → Davangere Transit',
    details: 'Suspect Vikram Singh vehicle signature matched at NH-50 Toll Hub (FIR KAR/KAL/0330)',
    confidence: 94.7,
    badge: 'TRANSIT CORRIDOR',
  },
  {
    id: 'ANM-903',
    timestamp: '12s ago',
    type: 'SYNDICATE_LINK',
    severity: 'CRITICAL',
    title: 'Commercial MDMA Ring Expansion',
    location: 'Tumakuru & Bengaluru East Border',
    details: 'Secondary distribution node active near Bajaj Chowk linking Imran Khan network',
    confidence: 96.9,
    badge: 'NARCOTICS NEXUS',
  },
  {
    id: 'ANM-904',
    timestamp: '18s ago',
    type: 'HOTSPOT_SPIKE',
    severity: 'HIGH',
    title: 'Predictive Night Break-In Anomaly',
    location: 'Chikkamagaluru Market Sector 4',
    details: 'Gold looting MO recurrence forecast: +34% probability between 23:00 - 04:00',
    confidence: 91.2,
    badge: 'BURGLARY CLUSTER',
  },
  {
    id: 'ANM-905',
    timestamp: '24s ago',
    type: 'REPEAT_OFFENDER',
    severity: 'MEDIUM',
    title: 'Digital Banking Phishing Wave',
    location: 'Prasad Path & Gara Zila Hub',
    details: 'Coordinated fake banking portal scam invoking Sec 66D IT Act (Suspect: Bhavani Karpe)',
    confidence: 89.5,
    badge: 'CYBER FRAUD',
  },
];

const STREAMING_POOL: Omit<AnomalyEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'MO_MATCH',
    severity: 'CRITICAL',
    title: 'High-Value Housebreaking Fingerprint Match',
    location: 'Chikkamagaluru Ganesh Marg',
    details: 'Rear balcony latch shearing pattern matches FIR KAR/CHI/2024/0901',
    confidence: 97.8,
    badge: 'LATENT MO',
  },
  {
    type: 'CROSS_DISTRICT',
    severity: 'HIGH',
    title: 'Multi-Precinct Armed Robbery Link',
    location: 'Vijayapura → Bidar Border Axis',
    details: 'Pillion rider weapon intimidation MO identified in 3 pending case records',
    confidence: 95.1,
    badge: 'ARMED GANG',
  },
  {
    type: 'HOTSPOT_SPIKE',
    severity: 'HIGH',
    title: 'Night Shift Patrol Gap Detected',
    location: 'Silk Board & Madiwala Junction',
    details: 'Vehicle theft vulnerability elevated by 28% during 01:30 - 03:30 hours',
    confidence: 93.6,
    badge: 'PATROL OPTIMIZER',
  },
  {
    type: 'REPEAT_OFFENDER',
    severity: 'CRITICAL',
    title: 'Repeat Offender Nexus Active',
    location: 'Bengaluru Urban Central PS',
    details: 'Suspect Ramesh Kumar co-accused telemetry pinged near Keer Circle',
    confidence: 99.1,
    badge: 'TOP WATCHLIST',
  },
  {
    type: 'SYNDICATE_LINK',
    severity: 'MEDIUM',
    title: 'Domestic Abuse Escalation Model',
    location: 'Hassan Kumer Nagar & Vijayapura',
    details: 'Cross-jurisdictional complaint filing pattern flagged for early counseling intervention',
    confidence: 88.4,
    badge: 'EARLY ALERT',
  },
  {
    type: 'MO_MATCH',
    severity: 'HIGH',
    title: 'Speeding Hit & Run Corridor Recurrence',
    location: 'Kalaburagi Murty Circle',
    details: '3rd incident logged in 14 days with unregistered commercial tipper truck profile',
    confidence: 94.2,
    badge: 'TRAFFIC FORENSICS',
  },
];

interface TelemetryContextType {
  tick: number;
  lastUpdated: string;
  isPulseActive: boolean;
  confidenceScore: number;
  activeClustersCount: number;
  activeSyndicatesCount: number;
  flaggedPrecinctsCount: number;
  totalAnalyzedFirs: number;
  anomalies: AnomalyEvent[];
  latestAnomaly: AnomalyEvent;
  districtRiskUpdates: Record<string, { score: number; trend: 'up' | 'down' | 'stable'; label: string }>;
}

const AnalystTelemetryContext = createContext<TelemetryContextType>({
  tick: 0,
  lastUpdated: '',
  isPulseActive: true,
  confidenceScore: 97.4,
  activeClustersCount: 8,
  activeSyndicatesCount: 5,
  flaggedPrecinctsCount: 6,
  totalAnalyzedFirs: 535815,
  anomalies: INITIAL_ANOMALIES,
  latestAnomaly: INITIAL_ANOMALIES[0],
  districtRiskUpdates: {},
});

export function AnalystTelemetryProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isPulseActive, setIsPulseActive] = useState(true);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(INITIAL_ANOMALIES);
  const [confidenceScore, setConfidenceScore] = useState(97.4);

  // Dynamic 3-second heartbeat cycle
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
      updateTime();

      // Fluctuate confidence score slightly around 96.8 - 98.6%
      setConfidenceScore((prev) => {
        const delta = (Math.random() * 0.4 - 0.2);
        const next = +(prev + delta).toFixed(1);
        return next > 98.8 ? 98.4 : next < 96.2 ? 96.8 : next;
      });

      // Pulse indicator toggle
      setIsPulseActive(false);
      setTimeout(() => setIsPulseActive(true), 150);

      // Rotate/Inject new dynamic anomaly alert every 3s
      setAnomalies((prev) => {
        const nextTemplate = STREAMING_POOL[Math.floor(Math.random() * STREAMING_POOL.length)];
        const newEvent: AnomalyEvent = {
          id: `ANM-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: 'Just now',
          type: nextTemplate.type,
          severity: nextTemplate.severity,
          title: nextTemplate.title,
          location: nextTemplate.location,
          details: nextTemplate.details,
          confidence: +(nextTemplate.confidence + (Math.random() * 1.2 - 0.6)).toFixed(1),
          badge: nextTemplate.badge,
        };

        // Age existing timestamps
        const aged = prev.map((item, idx) => ({
          ...item,
          timestamp: `${(idx + 1) * 3}s ago`,
        }));

        return [newEvent, ...aged.slice(0, 7)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // District risk fluctuations computed dynamically every 3 seconds
  const districtRiskUpdates = {
    'Bengaluru Urban': {
      score: 91 + (tick % 3 === 0 ? 1 : 0),
      trend: (tick % 2 === 0 ? 'up' : 'stable') as 'up' | 'stable',
      label: 'High Density Anomaly',
    },
    'Kalaburagi': {
      score: 86 - (tick % 4 === 0 ? 1 : 0),
      trend: 'stable' as 'stable',
      label: 'Hit & Run Spike',
    },
    'Raichur': {
      score: 89 + (tick % 2 === 0 ? 1 : -1),
      trend: (tick % 3 === 0 ? 'up' : 'down') as 'up' | 'down',
      label: 'Vehicle Theft Ring',
    },
    'Chikkamagaluru': {
      score: 82 + (tick % 2 === 1 ? 1 : 0),
      trend: 'up' as 'up',
      label: 'Burglary MO Pattern',
    },
    'Tumakuru': {
      score: 79,
      trend: 'down' as 'down',
      label: 'Narcotics Sub-Hub',
    },
    'Vijayapura': {
      score: 84,
      trend: 'stable' as 'stable',
      label: 'Armed Robbery Transit',
    },
  };

  return (
    <AnalystTelemetryContext.Provider
      value={{
        tick,
        lastUpdated,
        isPulseActive,
        confidenceScore,
        activeClustersCount: 8,
        activeSyndicatesCount: 5,
        flaggedPrecinctsCount: 6,
        totalAnalyzedFirs: 535815 + (tick * 3),
        anomalies,
        latestAnomaly: anomalies[0] || INITIAL_ANOMALIES[0],
        districtRiskUpdates,
      }}
    >
      {children}
    </AnalystTelemetryContext.Provider>
  );
}

export function useAnalystTelemetry() {
  return useContext(AnalystTelemetryContext);
}
