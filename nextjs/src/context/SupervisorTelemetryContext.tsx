'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PatrolUnit {
  id: string;
  callsign: string;
  type: 'PCR Van' | 'Cheetah Bike' | 'Highway Interceptor' | 'Drone Unit';
  officer: string;
  district: string;
  precinct: string;
  lat: number;
  lng: number;
  heading: number; // 0 - 360 degrees
  latSpeed: number; // trajectory delta per tick
  lngSpeed: number; // trajectory delta per tick
  status: 'PATROLLING' | 'DISPATCHED' | 'ON_SCENE' | 'STANDBY';
  fuel: number;
  speedKmH: number;
  distanceKm: number;
  assignedIncident?: string;
  lastPing: string;
  breadcrumb: [number, number][]; // past 6 trail points
}

export interface SanctionRequest {
  id: string;
  firNumber: string;
  requestType: 'Goonda Act Preventive Detention' | 'Section 110 BNSS Notice' | 'Inter-State Transit Remand' | 'Bank Account Freeze Warrant' | 'CCTV Subpoena Sanction';
  suspectName: string;
  district: string;
  policeStation: string;
  investigatingOfficer: string;
  urgency: 'CRITICAL' | 'HIGH' | 'ROUTINE';
  status: 'PENDING_SANCTION' | 'APPROVED' | 'REVISE_REQUESTED';
  timestamp: string;
  summary: string;
}

export interface DistrictAuditMetric {
  district: string;
  disposalRate: number;
  chargeSheetCompliance: number;
  avgResponseMin: number;
  activeStaffOnDuty: number;
  pendingClearances: number;
  underreportingRisk: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface IncidentRadioCall {
  id: string;
  callsign: string;
  message: string;
  location: string;
  time: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
}

interface SupervisorTelemetryContextType {
  tick: number;
  lastUpdated: string;
  isPulseActive: boolean;
  activePatrolCount: number;
  avgResponseTimeSec: number;
  pendingSanctionsCount: number;
  statewideClearanceRate: number;
  patrolUnits: PatrolUnit[];
  sanctions: SanctionRequest[];
  districtAudits: DistrictAuditMetric[];
  recentRadioCalls: IncidentRadioCall[];
  approveSanction: (id: string) => void;
  redeployPatrol: (unitId: string, newLocation: string) => void;
}

const INITIAL_PATROL_UNITS: PatrolUnit[] = [
  {
    id: 'PU-01',
    callsign: 'PCR-14 (Delta)',
    type: 'PCR Van',
    officer: 'ASI Raghavendra B.',
    district: 'Bengaluru Urban',
    precinct: 'Silk Board - Hosur Corridor',
    lat: 12.9176,
    lng: 77.6238,
    heading: 135,
    latSpeed: 0.00045, // moving southeast along Hosur Rd
    lngSpeed: 0.00055,
    status: 'PATROLLING',
    fuel: 82,
    speedKmH: 88,
    distanceKm: 14.2,
    lastPing: 'Live 1s ago',
    breadcrumb: [[12.915, 77.620], [12.916, 77.622], [12.9176, 77.6238]],
  },
  {
    id: 'PU-02',
    callsign: 'Cheetah-08',
    type: 'Cheetah Bike',
    officer: 'HC Mallikarjun K.',
    district: 'Kalaburagi',
    precinct: 'Murty Circle Ring Road',
    lat: 17.3297,
    lng: 76.8343,
    heading: 45,
    latSpeed: 0.00065, // fast moving northeast
    lngSpeed: 0.00060,
    status: 'DISPATCHED',
    fuel: 75,
    speedKmH: 112,
    distanceKm: 22.8,
    assignedIncident: 'Pursuing Unregistered Commercial Vehicle on NH-50',
    lastPing: 'Live 1s ago',
    breadcrumb: [[17.327, 76.831], [17.328, 76.832], [17.3297, 76.8343]],
  },
  {
    id: 'PU-03',
    callsign: 'Interceptor-04',
    type: 'Highway Interceptor',
    officer: 'PSI Siddaramaiah N.',
    district: 'Raichur',
    precinct: 'Manvi Road Express Toll',
    lat: 16.2076,
    lng: 77.3463,
    heading: 90,
    latSpeed: 0.00030,
    lngSpeed: 0.00085, // cruising east on highway
    status: 'PATROLLING',
    fuel: 91,
    speedKmH: 138,
    distanceKm: 41.5,
    lastPing: 'Live 1s ago',
    breadcrumb: [[16.206, 77.341], [16.207, 77.343], [16.2076, 77.3463]],
  },
  {
    id: 'PU-04',
    callsign: 'Drone-Alpha 01',
    type: 'Drone Unit',
    officer: 'Tech Spec. Sandeep R.',
    district: 'Bengaluru Urban',
    precinct: 'Indiranagar 100ft Aerial Grid',
    lat: 12.9784,
    lng: 77.6408,
    heading: 270,
    latSpeed: 0.00035, // circling west
    lngSpeed: -0.00045,
    status: 'PATROLLING',
    fuel: 86,
    speedKmH: 66,
    distanceKm: 8.4,
    lastPing: 'Live 1s ago',
    breadcrumb: [[12.977, 77.643], [12.978, 77.642], [12.9784, 77.6408]],
  },
  {
    id: 'PU-05',
    callsign: 'Cheetah-22',
    type: 'Cheetah Bike',
    officer: 'PC Dinesh Gowda',
    district: 'Chikkamagaluru',
    precinct: 'Market Beat #3',
    lat: 13.3161,
    lng: 75.7720,
    heading: 220,
    latSpeed: -0.00040,
    lngSpeed: -0.00035,
    status: 'PATROLLING',
    fuel: 68,
    speedKmH: 81,
    distanceKm: 11.2,
    lastPing: 'Live 1s ago',
    breadcrumb: [[13.318, 75.774], [13.317, 75.773], [13.3161, 75.7720]],
  },
  {
    id: 'PU-06',
    callsign: 'PCR-29 (Bravo)',
    type: 'PCR Van',
    officer: 'ASI Sharanappa T.',
    district: 'Vijayapura',
    precinct: 'Industrial Estate Gate',
    lat: 16.8302,
    lng: 75.7100,
    heading: 315,
    latSpeed: 0.00050,
    lngSpeed: -0.00040,
    status: 'DISPATCHED',
    fuel: 93,
    speedKmH: 94,
    distanceKm: 19.6,
    assignedIncident: 'Industrial Perimeter Security & ANPR Cordon',
    lastPing: 'Live 1s ago',
    breadcrumb: [[16.828, 75.712], [16.829, 75.711], [16.8302, 75.7100]],
  },
];

const RADIO_CALL_POOL: IncidentRadioCall[] = [
  { id: 'RC-1', callsign: 'PCR-14', message: 'Passed Silk Board flyover. Traffic normal, ANPR camera sync 100%.', location: 'Hosur Road', time: 'Just now', severity: 'INFO' },
  { id: 'RC-2', callsign: 'Cheetah-08', message: 'Visual on suspect vehicle on NH-50 northbound. Requesting spike barrier support.', location: 'Kalaburagi Ring Rd', time: '10s ago', severity: 'CRITICAL' },
  { id: 'RC-3', callsign: 'Drone-Alpha 01', message: 'Thermal scan detected 0 crowd build-up at 100ft junction. All clear.', location: 'Indiranagar', time: '25s ago', severity: 'INFO' },
  { id: 'RC-4', callsign: 'Interceptor-04', message: 'Manvi toll checkpoint active. 18 commercial trucks verified.', location: 'Raichur Highway', time: '40s ago', severity: 'HIGH' },
];

const INITIAL_SANCTIONS: SanctionRequest[] = [
  {
    id: 'SANC-2026-081',
    firNumber: 'KAR/RAI/2024/0123',
    requestType: 'Goonda Act Preventive Detention',
    suspectName: 'Ramesh Kumar (Bullet Ramesh)',
    district: 'Raichur',
    policeStation: 'Raichur Suburban PS',
    investigatingOfficer: 'Insp. Anand Patil',
    urgency: 'CRITICAL',
    status: 'PENDING_SANCTION',
    timestamp: '18:15 IST',
    summary: 'Subject has 4 repeat vehicle theft charges across Raichur & Ballari. IO requests 1-year preventive detention order under Karnataka Prevention of Dangerous Activities Act.',
  },
  {
    id: 'SANC-2026-082',
    firNumber: 'KAR/BEN/2024/1726',
    requestType: 'Bank Account Freeze Warrant',
    suspectName: 'Imran Khan (Chotta Imran)',
    district: 'Bengaluru Urban',
    policeStation: 'Bengaluru Urban East PS',
    investigatingOfficer: 'Insp. R. Venkatesh',
    urgency: 'CRITICAL',
    status: 'PENDING_SANCTION',
    timestamp: '18:02 IST',
    summary: 'Forensic audit detected ₹34.5 Lakhs narcotics transaction proceeds in 3 private bank accounts. Immediate SP statutory freeze authorization requested.',
  },
  {
    id: 'SANC-2026-083',
    firNumber: 'KAR/KAL/2024/0330',
    requestType: 'Inter-State Transit Remand',
    suspectName: 'Vikram Singh',
    district: 'Kalaburagi',
    policeStation: 'Kalaburagi Rural PS',
    investigatingOfficer: 'Insp. Suresh Kulkarni',
    urgency: 'HIGH',
    status: 'PENDING_SANCTION',
    timestamp: '17:48 IST',
    summary: 'Hit & Run fatal case suspect intercepted near Solapur border (Maharashtra). Requisitioning inter-state custody transfer permit.',
  },
  {
    id: 'SANC-2026-084',
    firNumber: 'KAR/CHI/2024/0901',
    requestType: 'Section 110 BNSS Notice',
    suspectName: 'Vikram Reddy',
    district: 'Chikkamagaluru',
    policeStation: 'Chikkamagaluru Market PS',
    investigatingOfficer: 'PSI Manjunath Swamy',
    urgency: 'ROUTINE',
    status: 'PENDING_SANCTION',
    timestamp: '17:20 IST',
    summary: 'Habitual housebreak offender execution of peace bond and statutory good behavior bond submission for 3 years.',
  },
];

const INITIAL_AUDITS: DistrictAuditMetric[] = [
  { district: 'Bengaluru Urban', disposalRate: 88.4, chargeSheetCompliance: 92.1, avgResponseMin: 5.4, activeStaffOnDuty: 412, pendingClearances: 4, underreportingRisk: 'LOW' },
  { district: 'Kalaburagi', disposalRate: 82.1, chargeSheetCompliance: 84.6, avgResponseMin: 7.2, activeStaffOnDuty: 198, pendingClearances: 8, underreportingRisk: 'MODERATE' },
  { district: 'Raichur', disposalRate: 79.5, chargeSheetCompliance: 81.3, avgResponseMin: 8.1, activeStaffOnDuty: 164, pendingClearances: 11, underreportingRisk: 'HIGH' },
  { district: 'Chikkamagaluru', disposalRate: 91.2, chargeSheetCompliance: 94.0, avgResponseMin: 6.0, activeStaffOnDuty: 142, pendingClearances: 2, underreportingRisk: 'LOW' },
  { district: 'Tumakuru', disposalRate: 85.7, chargeSheetCompliance: 87.5, avgResponseMin: 6.8, activeStaffOnDuty: 185, pendingClearances: 5, underreportingRisk: 'LOW' },
  { district: 'Vijayapura', disposalRate: 80.9, chargeSheetCompliance: 83.2, avgResponseMin: 7.9, activeStaffOnDuty: 176, pendingClearances: 9, underreportingRisk: 'MODERATE' },
];

const SupervisorTelemetryContext = createContext<SupervisorTelemetryContextType>({
  tick: 0,
  lastUpdated: '',
  isPulseActive: true,
  activePatrolCount: 142,
  avgResponseTimeSec: 402,
  pendingSanctionsCount: 4,
  statewideClearanceRate: 84.5,
  patrolUnits: INITIAL_PATROL_UNITS,
  sanctions: INITIAL_SANCTIONS,
  districtAudits: INITIAL_AUDITS,
  recentRadioCalls: RADIO_CALL_POOL,
  approveSanction: () => {},
  redeployPatrol: () => {},
});

export function SupervisorTelemetryProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isPulseActive, setIsPulseActive] = useState(true);
  const [patrolUnits, setPatrolUnits] = useState<PatrolUnit[]>(INITIAL_PATROL_UNITS);
  const [sanctions, setSanctions] = useState<SanctionRequest[]>(INITIAL_SANCTIONS);
  const [districtAudits, setDistrictAudits] = useState<DistrictAuditMetric[]>(INITIAL_AUDITS);
  const [avgResponseTimeSec, setAvgResponseTimeSec] = useState(402);
  const [recentRadioCalls, setRecentRadioCalls] = useState<IncidentRadioCall[]>(RADIO_CALL_POOL);

  // Dynamic 2-second continuous movement & telemetry heartbeat
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
      updateTime();
      setIsPulseActive((prev) => !prev);

      // Micro-fluctuate response time slightly around 6m 38s - 6m 45s (398 - 405s)
      setAvgResponseTimeSec((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const next = prev + delta;
        return next > 408 ? 402 : next < 396 ? 400 : next;
      });

      // Continuous 2-second movement in designated direction along vehicle vector
      setPatrolUnits((prev) =>
        prev.map((unit, idx) => {
          // Reversible bounce if patrol unit hits boundary of sector
          let nextLatSpeed = unit.latSpeed;
          let nextLngSpeed = unit.lngSpeed;

          // Simple bounce oscillation to keep them in realistic sector bounds
          if (idx === 0) { // Bengaluru Urban (Silk Board Corridor)
            if (unit.lat > 12.945) nextLatSpeed = -Math.abs(unit.latSpeed);
            if (unit.lat < 12.895) nextLatSpeed = Math.abs(unit.latSpeed);
            if (unit.lng > 77.655) nextLngSpeed = -Math.abs(unit.lngSpeed);
            if (unit.lng < 77.600) nextLngSpeed = Math.abs(unit.lngSpeed);
          } else if (idx === 1) { // Kalaburagi
            if (unit.lat > 17.360) nextLatSpeed = -Math.abs(unit.latSpeed);
            if (unit.lat < 17.300) nextLatSpeed = Math.abs(unit.latSpeed);
            if (unit.lng > 76.860) nextLngSpeed = -Math.abs(unit.lngSpeed);
            if (unit.lng < 76.810) nextLngSpeed = Math.abs(unit.lngSpeed);
          } else if (idx === 2) { // Raichur
            if (unit.lng > 77.380) nextLngSpeed = -Math.abs(unit.lngSpeed);
            if (unit.lng < 77.310) nextLngSpeed = Math.abs(unit.lngSpeed);
          }

          const newLat = +(unit.lat + nextLatSpeed * 8).toFixed(5);
          const newLng = +(unit.lng + nextLngSpeed * 8).toFixed(5);

          // Speed minor fluctuations
          const speedVariance = Math.floor((Math.random() - 0.5) * 6);
          const newSpeed = Math.max(50, Math.min(160, unit.speedKmH + speedVariance));

          // Distance odometer increment
          const newDistance = +(unit.distanceKm + (newSpeed * (1 / 3600))).toFixed(2);

          // Breadcrumb trail (keep last 6 points)
          const newBreadcrumb: [number, number][] = [...unit.breadcrumb.slice(-5), [newLat, newLng]];

          return {
            ...unit,
            lat: newLat,
            lng: newLng,
            latSpeed: nextLatSpeed,
            lngSpeed: nextLngSpeed,
            speedKmH: newSpeed,
            distanceKm: newDistance,
            lastPing: 'Moving (1s live)',
            breadcrumb: newBreadcrumb,
          };
        })
      );
    }, 1000); // Exactly 1 second

    return () => clearInterval(interval);
  }, []);

  const approveSanction = (id: string) => {
    setSanctions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'APPROVED' } : s))
    );
  };

  const redeployPatrol = (unitId: string, newLocation: string) => {
    setPatrolUnits((prev) =>
      prev.map((u) =>
        u.id === unitId ? { ...u, precinct: newLocation, status: 'DISPATCHED', lastPing: 'Re-routed now' } : u
      )
    );
  };

  const pendingCount = sanctions.filter((s) => s.status === 'PENDING_SANCTION').length;

  return (
    <SupervisorTelemetryContext.Provider
      value={{
        tick,
        lastUpdated,
        isPulseActive,
        activePatrolCount: 142 + (tick % 4),
        avgResponseTimeSec,
        pendingSanctionsCount: pendingCount,
        statewideClearanceRate: 84.5,
        patrolUnits,
        sanctions,
        districtAudits,
        recentRadioCalls,
        approveSanction,
        redeployPatrol,
      }}
    >
      {children}
    </SupervisorTelemetryContext.Provider>
  );
}

export function useSupervisorTelemetry() {
  return useContext(SupervisorTelemetryContext);
}
