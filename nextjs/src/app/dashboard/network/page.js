'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ShieldAlert, Share2, MapPin, Layers, Zap, AlertTriangle,
  TrendingUp, Users, RefreshCw, Clock, Shield, ArrowRight,
  ExternalLink, ChevronRight, Activity, Filter, Eye, UserX,
  FileText, Car, DollarSign, Database, ChevronDown, CheckCircle2,
  SlidersHorizontal, Lock, Radio, Network as NetworkIcon, Search,
  Terminal, Flame, Crosshair, Briefcase, FlaskConical, Navigation,
  Radar, ShieldCheck, UserCheck, ArrowUpRight, Compass
} from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

// Dynamic import of Leaflet network map for the Map View tab
const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[580px] flex items-center justify-center text-slate-400 font-mono bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800">Calibrating Geo-Spatial Intelligence Grid…</div> }
);

// Structured Syndicate Knowledge Base
const SYNDICATES = [
  {
    id: 'SYN-VT-01',
    name: 'Bullet Ramesh Inter-District Vehicle Theft Syndicate',
    category: 'vehicle_theft',
    category_label: 'Vehicle Theft & Fencing',
    color: '#2563eb',
    badge_color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
    threat_level: 'CRITICAL',
    risk_score: 94,
    estimated_volume: '₹1.8 Cr (42 Vehicles/yr)',
    districts: ['Bengaluru Urban', 'Raichur', 'Bidar'],
    primary_corridor: 'Hosur Road Corridor → Raichur Border Checkpost',
    predicted_escape_route: 'Silk Board TTMC → Attibele Toll → NH-44 Northward to Raichur rural chopshop yard',
    anpr_chokepoints: ['CAM-BLR-0045 (Silk Board TTMC)', 'CAM-RAI-0012 (Balay Circle)'],
    kingpin: {
      id: 'SUS-8842',
      name: 'Ramesh Kumar',
      alias: 'Bullet Ramesh',
      role: 'Syndicate Head & Logistics Mastermind',
      risk_score: 94,
      status: 'Active Watchlist / Under Surveillance',
      vehicle: 'White Hyundai i10 / Bajaj Pulsar (KA-01-MJ-8821)',
      last_location: 'Silk Board TTMC Parking Bay 3, Hosur Road Corridor',
      avatar_bg: 'bg-blue-600'
    },
    lieutenants: [
      { id: 'SUS-4401', name: 'Deepak Shetty', role: 'Chopshop Fence & Disposal Lead', risk_score: 75, district: 'Yelahanka' },
      { id: 'SUS-1190', name: 'Manoj Reddy', role: 'Getaway Driver & Jammer Operator', risk_score: 65, district: 'Electronic City' },
      { id: 'SUS-2211', name: 'Farid Mirza', role: 'Master Key & Hardware Supplier', risk_score: 82, district: 'Central Bengaluru' }
    ],
    connected_firs: [
      { case_number: 'KAR/BEN/2024/0747', crime: 'Vehicle Theft', station: 'Bengaluru Urban Central PS', date: '2024-06-01', status: 'Chargesheeted' },
      { case_number: 'KAR/RAI/2024/0123', crime: 'Motorcycle Theft', station: 'Raichur Suburban PS', date: '2024-06-01', status: 'Chargesheeted' },
      { case_number: 'KAR/BID/2024/0897', crime: 'Hatchback Theft', station: 'Bidar Suburban PS', date: '2024-05-30', status: 'Open' },
      { case_number: 'KAR/BEN/2024/1840', crime: 'Vehicle Theft', station: 'Bengaluru Urban East PS', date: '2024-05-31', status: 'Chargesheeted' }
    ],
    modus_operandi: 'Uses electronic frequency jammers to disrupt alarm systems and master immobilizer bypasses between 22:00-04:00 hrs. Transits stolen two-wheelers and hatchbacks to rural chopshops in Raichur within 6 hours.',
    tactical_action: 'Deploy mobile PCR interceptors along Hosur Road exit corridor and activate automated ANPR sweeps at Attibele Checkpost.'
  },
  {
    id: 'SYN-ND-02',
    name: 'Helmet Imran Commercial Synthetic Narcotics Ring',
    category: 'narcotics',
    category_label: 'Commercial Narcotics (NDPS)',
    color: '#10b981',
    badge_color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    threat_level: 'CRITICAL',
    risk_score: 96,
    estimated_volume: '₹3.4 Cr (Commercial MDMA)',
    districts: ['Bengaluru Urban', 'Tumakuru', 'Koppal'],
    primary_corridor: 'Outer Ring Road Bellandur → Tumakuru Industrial Gate',
    predicted_escape_route: 'Bellandur Tech Node → Outer Ring Road Flyover → Tumakuru Highway Drop Zone',
    anpr_chokepoints: ['CAM-WF-0019 (Outer Ring Road Bellandur)', 'CAM-TUM-0004 (Bajaj Chowk)'],
    kingpin: {
      id: 'SUS-5921',
      name: 'Imran Khan',
      alias: 'Helmet Imran',
      role: 'Commercial Narcotics Trafficking Lead',
      risk_score: 96,
      status: 'High Priority Intercept Target',
      vehicle: 'Dark Grey KTM Duke 390 (KA-04-ER-9112)',
      last_location: 'Near Wadhwa, Bengaluru Urban East corridor',
      avatar_bg: 'bg-emerald-600'
    },
    lieutenants: [
      { id: 'SUS-2211', name: 'Farid Mirza', role: 'Contraband Sourcing & Arms Supplier', risk_score: 82, district: 'Central Bengaluru' },
      { id: 'SUS-3302', name: 'Arun Gowda', role: 'Dead-drop Courier & Logistics', risk_score: 68, district: 'Tumakuru' }
    ],
    connected_firs: [
      { case_number: 'KAR/BEN/2024/1726', crime: 'Drug Offence (MDMA)', station: 'Bengaluru Urban East PS', date: '2024-06-01', status: 'Chargesheeted' },
      { case_number: 'KAR/TUM/2024/0774', crime: 'Contraband Raid', station: 'Tumakuru Town PS', date: '2024-06-01', status: 'Closed' },
      { case_number: 'KAR/KOP/2024/0131', crime: 'Substance Seizure', station: 'Koppal Town PS', date: '2024-05-31', status: 'Open' },
      { case_number: 'KAR/BEN/2024/0122', crime: 'Synthetic Narcotics', station: 'Bengaluru Urban East PS', date: '2024-06-01', status: 'Chargesheeted' }
    ],
    modus_operandi: 'Operates encrypted messaging distribution channels with dead-drop coordinates near tech parks and university nodes. Relies on fast delivery couriers wearing unbranded helmets.',
    tactical_action: 'Coordinate with CCB Anti-Narcotics Wing, initiate bank account freezes under NDPS Section 68F, and inspect parcel distribution hubs.'
  },
  {
    id: 'SYN-RB-03',
    name: 'Snake Naidu Armed Highway Robbery & Extortion Cell',
    category: 'robbery',
    category_label: 'Armed Robbery & Extortion',
    color: '#ef4444',
    badge_color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
    threat_level: 'HIGH',
    risk_score: 91,
    estimated_volume: '₹95 Lakhs (Highway Loot)',
    districts: ['Bengaluru Urban', 'Vijayapura', 'Bidar', 'Mysuru Urban'],
    primary_corridor: 'National Highway 44 & 50 Corridor',
    predicted_escape_route: 'Indiranagar 100ft Road → Cubbon Fringe → NH-44 Toll Intercept toward Vijayapura',
    anpr_chokepoints: ['CAM-BLR-0088 (Indiranagar 100ft Rd)', 'CAM-VIJ-0002 (Karan Marg)'],
    kingpin: {
      id: 'SUS-7104',
      name: 'Suresh Naidu',
      alias: 'Snake Naidu',
      role: 'Highway Extortion & Armed Robbery Gang Leader',
      risk_score: 91,
      status: 'ABSCONDING (NBW Issued)',
      vehicle: 'TVS Apache RTR Black (KA-04-V-9901)',
      last_location: 'Indiranagar 100ft Road / Cubbon Park Fringe',
      avatar_bg: 'bg-rose-600'
    },
    lieutenants: [
      { id: 'SUS-3302', name: 'Arun Gowda', role: 'Highway Spotter & Target Scout', risk_score: 68, district: 'Tumakuru' },
      { id: 'SUS-1190', name: 'Manoj Reddy', role: 'High-Speed Getaway Driver', risk_score: 65, district: 'Electronic City' }
    ],
    connected_firs: [
      { case_number: 'KAR/VIJ/2024/2269', crime: 'Armed Robbery', station: 'Vijayapura Industrial PS', date: '2024-05-31', status: 'Open' },
      { case_number: 'KAR/BEN/2024/0675', crime: 'Highway Robbery', station: 'Bengaluru Urban East PS', date: '2024-05-31', status: 'Chargesheeted' },
      { case_number: 'KAR/BID/2024/1595', crime: 'Cashier Extortion', station: 'Bidar Rural PS', date: '2024-05-31', status: 'Open' },
      { case_number: 'KAR/BEN/2024/2250', crime: 'Armed Robbery', station: 'Bengaluru Urban North PS', date: '2024-05-30', status: 'Under Investigation' }
    ],
    modus_operandi: 'Intercepts late-night commercial transport vehicles and solitary commuters using bladed weapons. Flees across district boundaries within 90 minutes.',
    tactical_action: 'Issue Non-Bailable Warrant execution alert across all 31 SP control rooms and initiate Lookout Circular at state toll gates.'
  },
  {
    id: 'SYN-CY-04',
    name: 'Vikram Malhotra Cyber Extortion & Crypto Mule Nexus',
    category: 'cybercrime',
    category_label: 'Cyber Fraud & Money Laundering',
    color: '#06b6d4',
    badge_color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
    threat_level: 'HIGH',
    risk_score: 88,
    estimated_volume: '₹4.2 Cr (Digital Extortion)',
    districts: ['Bengaluru Urban', 'Chikkamagaluru', 'Tumakuru'],
    primary_corridor: 'ITPB Tech Corridor → Decentralized Crypto Nodes',
    predicted_escape_route: 'Whitefield Cyber Hub → Chikkamagaluru Cloud Proxy → Multi-state mule account drain',
    anpr_chokepoints: ['CAM-WF-0082 (ITPB Main Road)', 'CAM-CHI-0008 (Prasad Path)'],
    kingpin: {
      id: 'SUS-9104',
      name: 'Vikram Malhotra',
      alias: 'Vicky Blade / Shadow Vicky',
      role: 'Cyber Extortion & Money Laundering Head',
      risk_score: 88,
      status: 'Digital Intelligence Tracking',
      vehicle: 'Black Yamaha R15 (KA-03-HA-8820)',
      last_location: 'ITPB Tech Corridor, Whitefield, Bengaluru',
      avatar_bg: 'bg-cyan-600'
    },
    lieutenants: [
      { id: 'SUS-6022', name: 'Bhavani Karpe', role: 'Mule Bank Account Coordinator', risk_score: 85, district: 'Bengaluru / Chikkamagaluru' },
      { id: 'SUS-5011', name: 'Vikram Reddy', role: 'Physical Asset Conversion Lead', risk_score: 84, district: 'Chikkamagaluru' }
    ],
    connected_firs: [
      { case_number: 'FIR-2026-BL-9104', crime: 'Cyber Extortion', station: 'Whitefield Cyber Crime PS', date: '2026-07-22', status: 'Under Investigation' },
      { case_number: 'KAR/BEN/2024/0380', crime: 'Banking Phishing', station: 'Bengaluru Urban Traffic PS', date: '2024-06-01', status: 'Chargesheeted' },
      { case_number: 'KAR/CHI/2024/2061', crime: 'Cyber Extortion', station: 'Chikkamagaluru Town PS', date: '2024-05-31', status: 'Under Investigation' },
      { case_number: 'KAR/TUM/2024/1316', crime: 'Financial Fraud', station: 'Tumakuru Industrial PS', date: '2024-05-31', status: 'Under Investigation' }
    ],
    modus_operandi: 'Impersonates law enforcement and customs officials over VoIP video calls, coercing victims into transferring funds to mule accounts, which are converted into cryptocurrency within 20 minutes.',
    tactical_action: 'Freeze 14 identified mule accounts via State Cyber Cell 1930 portal, trace IP routing, and coordinate with Whitefield CEN PS.'
  },
  {
    id: 'SYN-EX-05',
    name: 'Anand Shinde Protection & Habitual Violence Cell',
    category: 'assault',
    category_label: 'Extortion & Organized Assault',
    color: '#8b5cf6',
    badge_color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
    threat_level: 'HIGH',
    risk_score: 90,
    estimated_volume: '₹45 Lakhs (Protection Money)',
    districts: ['Hassan', 'Vijayapura'],
    primary_corridor: 'Hassan Industrial Belt → Vijayapura Suburban Area',
    predicted_escape_route: 'Hassan Industrial Gate → State Highway 57 Intercept toward Vijayapura Hideout',
    anpr_chokepoints: ['CAM-HAS-0001 (Kumer Nagar)', 'CAM-VIJ-0009 (Shenoy Zila)'],
    kingpin: {
      id: 'SUS-8041',
      name: 'Anand Shinde',
      alias: 'Buda Anand',
      role: 'Protection Racket & Syndicate Enforcer',
      risk_score: 90,
      status: 'Arrest Warrant Pending',
      vehicle: 'Hero Splendor (KA-36-E-4491)',
      last_location: 'Near Kumer Nagar, Hassan Industrial Belt',
      avatar_bg: 'bg-purple-600'
    },
    lieutenants: [
      { id: 'SUS-1190', name: 'Manoj Reddy', role: 'Local Intimidation Operative', risk_score: 65, district: 'Electronic City' }
    ],
    connected_firs: [
      { case_number: 'KAR/HAS/2024/1961', crime: 'Domestic Violence & Extortion', station: 'Hassan Industrial PS', date: '2024-06-01', status: 'Open' },
      { case_number: 'KAR/VIJ/2024/1383', crime: 'Extortion Complaint', station: 'Vijayapura Suburban PS', date: '2024-05-31', status: 'Open' }
    ],
    modus_operandi: 'Runs systematic protection rackets targeting small merchants and industrial contractors using physical intimidation.',
    tactical_action: 'Serve summons under Section 35 BNSS, conduct witness safety verification, and deploy night beat constables near Hassan Industrial Area.'
  }
];

export default function NetworkPage() {
  const [selectedSyndicate, setSelectedSyndicate] = useState(SYNDICATES[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'hierarchy' | 'matrix' | 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseData, setActiveCaseData] = useState(null);

  // Filtered syndicates list based on category and search
  const filteredSyndicates = useMemo(() => {
    return SYNDICATES.filter(s => {
      const matchesCat = activeCategory === 'all' || s.category === activeCategory;
      const matchesSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kingpin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.districts.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCaseClick = (caseNum) => {
    let storedFir = getFIRFromStore(caseNum);
    if (!storedFir) {
      storedFir = DEMO_FIRS.firs.find(f => f.case_number === caseNum || f.case_number?.includes(caseNum));
    }
    const firData = storedFir || DEMO_FIRS.firs[0];

    setActiveCaseData({
      fir: {
        case_number: firData.case_number || caseNum,
        crime_type: firData.crime_type || firData.crime_type_code || 'vehicle_theft',
        date_filed: firData.date_filed || '2024-06-01',
        location_name: firData.location_name || firData.district_name || 'Bengaluru Urban',
        case_status: firData.status || firData.case_status || 'open',
        description: firData.description || 'Verified CCTNS first information report statement filed at Karnataka State Police command center.',
        police_station: firData.police_station || 'KSP Intelligence Cell PS',
        district_name: firData.district_name || 'Bengaluru Urban'
      },
      accused: [
        {
          full_name: firData.accused_name || selectedSyndicate.kingpin.name,
          alias: selectedSyndicate.kingpin.alias,
          age: 34,
          gender: 'Male',
          prior_convictions: 7,
          risk_score: firData.risk_score || selectedSyndicate.risk_score
        }
      ],
      victims: [{ full_name: 'KSP State Complainant', age: 40 }],
      related_firs: selectedSyndicate.connected_firs,
      case_summary: `Cross-district syndicate correlation verified under ${selectedSyndicate.name}.`
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans text-slate-900 dark:text-white animate-fade-in">
      
      {/* ── 1. TOP HEADER & EXECUTIVE TELEMETRY HUB ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121215] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">
                  CRIMINAL SYNDICATE & GANG NEXUS
                </h1>
                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase">
                  5 RINGS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Karnataka State Police CCTNS • Multi-Hop Gang Disruption & Predictive Tracking Grid
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 text-xs font-mono font-bold self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'cards', label: 'Syndicate Cards', icon: Layers },
            { id: 'hierarchy', label: 'Workflow Hierarchy', icon: Share2 },
            { id: 'matrix', label: 'Nexus Matrix', icon: Database },
            { id: 'map', label: 'Predictive Routes', icon: Navigation },
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. DE-CONGESTED STATS KPI TILES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Kingpins Tracked</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">5 High-Value</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-rose-600 dark:text-rose-400 font-mono font-semibold">
            100% Active ANPR Sweeps
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Key Lieutenants</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">11 Operatives</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            Chopshops, Mules & Couriers
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Correlated FIRs</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">51 Indexed</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            Cross-District Multi-Hop Verified
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
            <span className="font-mono uppercase tracking-wider font-semibold">Surveillance Nodes</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Radar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">18 Chokepoints</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
            Statewide Interceptor Grid
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & CATEGORY FILTER CHIPS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Syndicates' },
            { id: 'vehicle_theft', label: 'Vehicle Theft' },
            { id: 'narcotics', label: 'Narcotics NDPS' },
            { id: 'robbery', label: 'Armed Robbery' },
            { id: 'cybercrime', label: 'Cyber Fraud' },
            { id: 'assault', label: 'Extortion' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0 w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syndicate, kingpin, or corridor…"
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* ── 4. VIEW 1: SYNDICATE DOSSIER CARDS (SPACIOUS & CLEAN) ── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Middle: List of Syndicate Dossier Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredSyndicates.map(syn => {
              const isSelected = selectedSyndicate.id === syn.id;
              return (
                <div
                  key={syn.id}
                  onClick={() => setSelectedSyndicate(syn)}
                  className={`p-5 rounded-2xl bg-white dark:bg-[#121215] border transition-all cursor-pointer shadow-xs relative overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-200/90 dark:border-zinc-800 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${syn.badge_color}`}>
                        {syn.category_label}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                        {syn.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        RISK {syn.risk_score}/100
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {syn.connected_firs.length} Cases
                      </span>
                    </div>
                  </div>

                  {/* Kingpin & Lieutenants Clean Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3.5">
                    {/* Kingpin */}
                    <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono block">
                        Prime Kingpin
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {syn.kingpin.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                        "{syn.kingpin.alias}"
                      </p>
                    </div>

                    {/* Key Operatives */}
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 flex flex-col justify-between">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                        Specialized Cells ({syn.lieutenants.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {syn.lieutenants.map(lt => (
                          <span key={lt.id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium">
                            {lt.name} ({lt.role.split(' ')[0]})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modus Operandi Snippet */}
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                    <strong>Modus Operandi:</strong> {syn.modus_operandi}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[11px] truncate max-w-xs">
                      Corridor: {syn.primary_corridor}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSyndicate(syn);
                        setViewMode('hierarchy');
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline text-xs shrink-0"
                    >
                      <span>Workflow Flowchart</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Syndicate Deep-Dive Focus Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                    Target Syndicate Focus
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {selectedSyndicate.name}
                  </h3>
                </div>
              </div>

              {/* Kingpin Spotlight */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
                    {selectedSyndicate.kingpin.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedSyndicate.kingpin.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                      Alias: <span className="font-semibold text-slate-800 dark:text-zinc-200">"{selectedSyndicate.kingpin.alias}"</span>
                    </p>
                    <span className="inline-block text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 mt-0.5">
                      Risk Rating {selectedSyndicate.kingpin.risk_score}/100
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/80 font-mono">
                  <p><strong>Status:</strong> {selectedSyndicate.kingpin.status}</p>
                  <p><strong>Vehicle:</strong> {selectedSyndicate.kingpin.vehicle}</p>
                  <p><strong>Last Sighted:</strong> {selectedSyndicate.kingpin.last_location}</p>
                </div>
              </div>

              {/* Connected CCTNS Cases */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Connected CCTNS Case Dockets ({selectedSyndicate.connected_firs.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 drishti-scrollbar">
                  {selectedSyndicate.connected_firs.map(fir => (
                    <div
                      key={fir.case_number}
                      onClick={() => handleCaseClick(fir.case_number)}
                      className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-zinc-800/80 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                          <FileText className="w-3 h-3" />
                          <span>{fir.case_number}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-medium">
                          {fir.crime} · {fir.station}
                        </p>
                      </div>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                        {fir.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Directives */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>COMMAND TACTICAL DIRECTIVE</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug font-sans">
                  {selectedSyndicate.tactical_action}
                </p>
              </div>

              {/* Deep Link to Co-Pilot Chat */}
              <Link
                href="/dashboard/chat"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Query DRISHTI Copilot On This Gang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. VIEW 2: VISUALLY STUNNING WORKFLOW ORG HIERARCHY ── */}
      {viewMode === 'hierarchy' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                Multi-Hop Organizational Intelligence Flow
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                {selectedSyndicate.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedSyndicate.id}
                onChange={(e) => {
                  const s = SYNDICATES.find(syn => syn.id === e.target.value);
                  if (s) setSelectedSyndicate(s);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold font-mono text-slate-800 dark:text-zinc-200 focus:outline-none shadow-xs"
              >
                {SYNDICATES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean 3-Tier Multi-Hop Workflow Pipeline */}
          <div className="flex flex-col items-center space-y-6 py-4">
            
            {/* TIER 1: KINGPIN / STRATEGIC HEAD */}
            <div className="flex flex-col items-center w-full max-w-md">
              <div className="w-full p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500 shadow-sm text-center relative">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full inline-block mb-1.5 border border-rose-500/25">
                  👑 TIER 1: SYNDICATE MASTERMIND
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {selectedSyndicate.kingpin.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
                  "{selectedSyndicate.kingpin.alias}"
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 font-mono text-[10.5px]">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold shadow-xs">
                    THREAT RISK {selectedSyndicate.kingpin.risk_score}/100
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400">{selectedSyndicate.districts[0]}</span>
                </div>
              </div>
              {/* Animated Connector */}
              <div className="w-0.5 h-7 bg-blue-500/50" />
            </div>

            {/* TIER 2: SPECIALIZED OPERATIONAL CELLS */}
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                TIER 2: KEY LIEUTENANTS & SPECIALIZED CELLS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-4xl">
                {selectedSyndicate.lieutenants.map(lt => (
                  <div key={lt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-blue-500/30 text-center shadow-xs hover:border-blue-500 transition-all">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white font-mono">{lt.name}</h5>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{lt.role}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                      <span>{lt.district}</span>
                      <span>·</span>
                      <span className="font-bold text-rose-500">Risk {lt.risk_score}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Connector */}
              <div className="w-0.5 h-7 bg-emerald-500/50 mt-1" />
            </div>

            {/* TIER 3: LINKED CCTNS INCIDENT DOCKETS */}
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                TIER 3: CORRELATED CCTNS INCIDENT EVIDENCE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-5xl">
                {selectedSyndicate.connected_firs.map(fir => (
                  <div
                    key={fir.case_number}
                    onClick={() => handleCaseClick(fir.case_number)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500 shadow-xs cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{fir.case_number}</span>
                    </div>
                    <p className="text-xs text-slate-900 dark:text-white font-bold mt-1 truncate">{fir.crime}</p>
                    <p className="text-[10px] text-slate-400 truncate">{fir.station}</p>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[9.5px] font-mono">
                      <span className="text-slate-400">{fir.date}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{fir.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── 6. VIEW 3: STRATEGIC NEXUS MATRIX & ASSET RECOVERY LEDGER ── */}
      {viewMode === 'matrix' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Cross-District Criminal Syndicate Nexus Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Inter-state crime nexus, financial volume, corridor tracking & linked CCTNS evidence
              </p>
            </div>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
              5 Primary Rings • 51 Linked Case Dockets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10.5px]">
                  <th className="px-4 py-3 font-semibold">SYNDICATE NETWORK</th>
                  <th className="px-4 py-3 font-semibold">PRIME KINGPIN</th>
                  <th className="px-4 py-3 font-semibold">FINANCIAL SCALE</th>
                  <th className="px-4 py-3 font-semibold">OPERATING CORRIDOR</th>
                  <th className="px-4 py-3 font-semibold">THREAT LEVEL</th>
                  <th className="px-4 py-3 font-semibold">LINKED FIRs</th>
                  <th className="px-4 py-3 font-semibold text-right">DOSSIER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {SYNDICATES.map((syn) => (
                  <tr key={syn.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: syn.color }} />
                        <span className="truncate max-w-xs">{syn.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-zinc-300">
                      <div className="font-semibold">{syn.kingpin.name}</div>
                      <div className="text-[10px] text-slate-400 italic">"{syn.kingpin.alias}"</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {syn.estimated_volume}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-zinc-400 text-[11px] max-w-xs truncate font-mono">
                      {syn.primary_corridor}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        syn.threat_level === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {syn.threat_level} ({syn.risk_score})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {syn.connected_firs.length} Cases
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedSyndicate(syn);
                          handleCaseClick(syn.connected_firs[0].case_number);
                        }}
                        className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-all cursor-pointer font-mono shadow-2xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. VIEW 4: CIA/SPECIAL AGENT-GRADE PREDICTIVE INTERCEPTION MAP ── */}
      {viewMode === 'map' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                  Predictive Escape Route & ANPR Interception Grid
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Calibrated multi-source intel feeds (FASTag sweeps, SIM cell tower hops, ANPR time-decay trajectory)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                MULTI-SOURCE INTEL SYNCED
              </span>
            </div>
          </div>

          {/* Predictive Route Highlights Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Tracking Target</span>
              <p className="font-bold text-slate-900 dark:text-white">{selectedSyndicate.kingpin.name} ({selectedSyndicate.kingpin.alias})</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">{selectedSyndicate.kingpin.vehicle}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Next Corridor</span>
              <p className="font-bold text-rose-600 dark:text-rose-400">{selectedSyndicate.predicted_escape_route}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Surveillance Checkpoints</span>
              <p className="text-slate-700 dark:text-zinc-300">{selectedSyndicate.anpr_chokepoints.join(' · ')}</p>
            </div>
          </div>

          {/* Leaflet Network Map */}
          <div className="h-[580px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
            <NetworkMapView
              nodes={SYNDICATES.map(s => ({
                id: s.kingpin.id,
                label: `${s.kingpin.name} (${s.kingpin.alias})`,
                district: s.districts[0],
                risk_score: s.risk_score,
                type: 'suspect',
                color: s.color,
                route: s.predicted_escape_route,
                vehicle: s.kingpin.vehicle
              }))}
              edges={[]}
              selectedNodeId={selectedSyndicate.kingpin.id}
              onNodeClick={(id) => {
                const syn = SYNDICATES.find(s => s.kingpin.id === id);
                if (syn) setSelectedSyndicate(syn);
              }}
              height={580}
            />
          </div>
        </div>
      )}

      {/* ── 8. INVESTIGATOR WALL SLIDE-OVER ── */}
      {activeCaseData && (
        <InvestigatorWall
          caseData={activeCaseData}
          onClose={() => setActiveCaseData(null)}
          onNavigate={(targetCase) => handleCaseClick(targetCase)}
        />
      )}
    </div>
  );
}
