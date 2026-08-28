'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ShieldAlert, Share2, MapPin, Layers, Zap, AlertTriangle,
  TrendingUp, Users, RefreshCw, Clock, Shield, ArrowRight,
  ExternalLink, ChevronRight, Activity, Filter, Eye, UserX,
  FileText, Car, DollarSign, Database, ChevronDown, CheckCircle2,
  SlidersHorizontal, Lock, Radio, Network as NetworkIcon, Search
} from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

// Dynamic import of Leaflet network map for the Map View tab
const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[550px] flex items-center justify-center text-gray-400 font-mono bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800">Loading Geo-Spatial Surveillance Grid...</div> }
);

// Structured Syndicate Knowledge Base
const SYNDICATES = [
  {
    id: 'SYN-VT-01',
    name: 'Bullet Ramesh Inter-District Vehicle Theft Syndicate',
    category: 'vehicle_theft',
    category_label: 'Vehicle Theft & Fencing',
    color: '#2563eb', // Blue
    badge_color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    threat_level: 'CRITICAL',
    risk_score: 94,
    estimated_volume: '₹1.8 Cr (42 Vehicles/yr)',
    districts: ['Bengaluru Urban', 'Raichur', 'Bidar'],
    primary_corridor: 'Hosur Road Corridor $\\rightarrow$ Raichur Border Checkpost',
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
    tactical_action: 'Deploy mobile PCR interceptors along Hosur Road exit corridor and activate automated ANPR license plate sweeps at Attibele Checkpost.'
  },
  {
    id: 'SYN-ND-02',
    name: 'Helmet Imran Commercial Synthetic Narcotics Ring',
    category: 'narcotics',
    category_label: 'Commercial Narcotics (NDPS)',
    color: '#10b981', // Emerald
    badge_color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    threat_level: 'CRITICAL',
    risk_score: 96,
    estimated_volume: '₹3.4 Cr (Commercial MDMA)',
    districts: ['Bengaluru Urban', 'Tumakuru', 'Koppal'],
    primary_corridor: 'Outer Ring Road Bellandur $\\rightarrow$ Tumakuru Industrial Gate',
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
    color: '#ef4444', // Red
    badge_color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    threat_level: 'HIGH',
    risk_score: 91,
    estimated_volume: '₹95 Lakhs (Highway Loot)',
    districts: ['Bengaluru Urban', 'Vijayapura', 'Bidar', 'Mysuru Urban'],
    primary_corridor: 'National Highway 44 & 50 Corridor',
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
    color: '#06b6d4', // Cyan
    badge_color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    threat_level: 'HIGH',
    risk_score: 88,
    estimated_volume: '₹4.2 Cr (Digital Extortion)',
    districts: ['Bengaluru Urban', 'Chikkamagaluru', 'Tumakuru'],
    primary_corridor: 'ITPB Tech Corridor $\\rightarrow$ Decentralized Crypto Nodes',
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
    color: '#8b5cf6', // Purple
    badge_color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    threat_level: 'HIGH',
    risk_score: 90,
    estimated_volume: '₹45 Lakhs (Protection Money)',
    districts: ['Hassan', 'Vijayapura'],
    primary_corridor: 'Hassan Industrial Belt $\\rightarrow$ Vijayapura Suburban Area',
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
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'hierarchy' | 'map' | 'cases'
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans text-[var(--text-primary)]">
      {/* 1. TOP HEADER & EXECUTIVE KPI BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface-1)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-600/20 shadow-xs">
              <NetworkIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Criminal Syndicate & Gang Nexus
                </h1>
                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                  5 Active Rings
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                Karnataka Police Cross-District Multi-Hop Intelligence & Organized Crime Matrix
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-semibold">
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'matrix' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Syndicate Cards</span>
          </button>

          <button
            onClick={() => setViewMode('hierarchy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'hierarchy' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Org Hierarchy Flow</span>
          </button>

          <button
            onClick={() => setViewMode('cases')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'cases' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Case Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Territorial Map</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Kingpins Tracked</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">5 High-Value</p>
          <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">100% Active ANPR Alert</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Key Lieutenants</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">11 Operatives</p>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">Chopshops & Mules</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Correlated FIRs</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">51 Indexed</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">Cross-District Verified</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Surveillance Nodes</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">18 Chokepoints</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5 block">Statewide Live Grid</span>
        </div>
      </div>

      {/* 3. CATEGORY FILTER CHIPS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Syndicates (5)' },
            { id: 'vehicle_theft', label: 'Vehicle Theft (1)' },
            { id: 'narcotics', label: 'Narcotics NDPS (1)' },
            { id: 'robbery', label: 'Armed Robbery (1)' },
            { id: 'cybercrime', label: 'Cyber Fraud (1)' },
            { id: 'assault', label: 'Extortion (1)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-xs font-bold'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syndicate or kingpin..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. MAIN VIEW WORKSPACE */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left / Middle: List of Syndicate Dossier Cards */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSyndicates.map(syn => {
              const isSelected = selectedSyndicate.id === syn.id;
              return (
                <div
                  key={syn.id}
                  onClick={() => setSelectedSyndicate(syn)}
                  className={`p-5 rounded-2xl bg-white dark:bg-[#18181B] border transition-all cursor-pointer shadow-xs relative overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${syn.badge_color}`}>
                        {syn.category_label}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                        {syn.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        RISK {syn.risk_score}/100
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {syn.connected_firs.length} Linked Cases
                      </span>
                    </div>
                  </div>

                  {/* Kingpin & Key Operatives Showcase */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3.5">
                    {/* Kingpin Highlight Box */}
                    <div className="sm:col-span-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-500 font-mono block">
                        👑 Prime Kingpin
                      </span>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                        {syn.kingpin.name}
                      </p>
                      <p className="text-[10.5px] text-gray-500 dark:text-gray-400 italic">
                        "{syn.kingpin.alias}"
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 mt-1 truncate">
                        {syn.kingpin.last_location}
                      </p>
                    </div>

                    {/* Operatives Roster */}
                    <div className="sm:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
                          Key Lieutenants & Fences ({syn.lieutenants.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {syn.lieutenants.map(lt => (
                            <span key={lt.id} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200">
                              {lt.name} <span className="text-[9.5px] text-gray-400">({lt.role.split(' ')[0]})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-[10.5px] text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span className="font-medium truncate">{syn.districts.join(' · ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Modus Operandi & Actions */}
                  <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="line-clamp-2">
                      <strong className="text-gray-900 dark:text-white font-semibold">Modus Operandi: </strong>
                      {syn.modus_operandi}
                    </p>
                  </div>

                  {/* Footer Card Navigation */}
                  <div className="flex items-center justify-between mt-3 pt-2 text-xs">
                    <span className="text-[11px] font-mono text-gray-400">
                      Vehicle: <code className="text-gray-700 dark:text-gray-300 font-semibold">{syn.kingpin.vehicle}</code>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSyndicate(syn);
                        setViewMode('hierarchy');
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline text-xs"
                    >
                      <span>View Org Hierarchy</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Syndicate Deep-Dive Focus Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-20 p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                    Active Syndicate Focus
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedSyndicate.name}
                  </h3>
                </div>
              </div>

              {/* Kingpin Spotlight */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {selectedSyndicate.kingpin.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {selectedSyndicate.kingpin.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      Alias: <span className="font-semibold text-gray-700 dark:text-gray-200">"{selectedSyndicate.kingpin.alias}"</span>
                    </p>
                    <span className="inline-block text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20 mt-0.5">
                      Risk Rating {selectedSyndicate.kingpin.risk_score}/100
                    </span>
                  </div>
                </div>
                <div className="text-[11.5px] text-gray-600 dark:text-gray-300 space-y-1 pt-1 border-t border-gray-200 dark:border-zinc-700/60 font-mono">
                  <p><strong>Status:</strong> {selectedSyndicate.kingpin.status}</p>
                  <p><strong>Vehicle:</strong> {selectedSyndicate.kingpin.vehicle}</p>
                  <p><strong>Last Sighted:</strong> {selectedSyndicate.kingpin.last_location}</p>
                </div>
              </div>

              {/* Connected CCTNS Cases */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono block">
                  Connected CCTNS Case Files ({selectedSyndicate.connected_firs.length})
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedSyndicate.connected_firs.map(fir => (
                    <div
                      key={fir.case_number}
                      onClick={() => handleCaseClick(fir.case_number)}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-gray-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                          <FileText className="w-3 h-3" />
                          <span>{fir.case_number}</span>
                        </div>
                        <p className="text-[10.5px] text-gray-500 dark:text-gray-400 font-medium">
                          {fir.crime} · {fir.station}
                        </p>
                      </div>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200">
                        {fir.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Directives */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Command Tactical Directive</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-snug">
                  {selectedSyndicate.tactical_action}
                </p>
              </div>

              {/* Deep Link to Co-Pilot Chat */}
              <Link
                href="/dashboard/chat"
                className="w-full py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Ask DRISHTI AI About This Gang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. HIERARCHY ORG FLOW VIEW */}
      {viewMode === 'hierarchy' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                Multi-Hop Organizational Flowchart
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
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
                className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {SYNDICATES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clean 3-Tier Multi-Hop Tree */}
          <div className="flex flex-col items-center space-y-8 py-4">
            {/* TIER 1: KINGPIN */}
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-500 shadow-md text-center max-w-sm">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full inline-block mb-1.5">
                  👑 TIER 1: SYNDICATE KINGPIN
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedSyndicate.kingpin.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  "{selectedSyndicate.kingpin.alias}"
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 font-mono text-[10.5px]">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                    RISK {selectedSyndicate.kingpin.risk_score}/100
                  </span>
                  <span className="text-gray-500">{selectedSyndicate.districts[0]}</span>
                </div>
              </div>
              {/* Connector */}
              <div className="w-0.5 h-8 bg-blue-400/50" />
            </div>

            {/* TIER 2: LIEUTENANTS & FENCES */}
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                TIER 2: KEY LIEUTENANTS & SPECIALIZED CELLS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                {selectedSyndicate.lieutenants.map(lt => (
                  <div key={lt.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-blue-500/30 text-center shadow-xs">
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">{lt.name}</h5>
                    <p className="text-[10.5px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">{lt.role}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-mono text-gray-500">
                      <span>{lt.district}</span>
                      <span>·</span>
                      <span className="font-bold text-rose-500">Risk {lt.risk_score}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Connector */}
              <div className="w-0.5 h-8 bg-emerald-400/50" />
            </div>

            {/* TIER 3: LINKED CCTNS CASE DOCKETS */}
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                TIER 3: CORRELATED CCTNS INCIDENT DOCKETS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full max-w-4xl">
                {selectedSyndicate.connected_firs.map(fir => (
                  <div
                    key={fir.case_number}
                    onClick={() => handleCaseClick(fir.case_number)}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500 shadow-xs cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{fir.case_number}</span>
                    </div>
                    <p className="text-[10.5px] text-gray-900 dark:text-white font-medium mt-1 truncate">{fir.crime}</p>
                    <p className="text-[10px] text-gray-400 truncate">{fir.station}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CASE MATRIX TAB */}
      {viewMode === 'cases' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Cross-District Syndicate Case Registry
              </h3>
              <p className="text-xs text-gray-400">
                Complete audit trail of all cases linked to active crime rings
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/70 border-b border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 font-mono text-[10.5px]">
                  <th className="px-4 py-2.5">CASE NUMBER</th>
                  <th className="px-4 py-2.5">SYNDICATE NETWORK</th>
                  <th className="px-4 py-2.5">PRIME ACCUSED</th>
                  <th className="px-4 py-2.5">CRIME OFFENCE</th>
                  <th className="px-4 py-2.5">POLICE STATION</th>
                  <th className="px-4 py-2.5">STATUS</th>
                  <th className="px-4 py-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {SYNDICATES.flatMap(s => s.connected_firs.map(f => ({ ...f, syndicate_name: s.name, kingpin: s.kingpin.name }))).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {row.case_number}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      {row.syndicate_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {row.kingpin}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                      {row.crime}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {row.station}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleCaseClick(row.case_number)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TERRITORIAL MAP TAB */}
      {viewMode === 'map' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18181B] border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Karnataka State Police Syndicate Territorial & ANPR Map
              </h3>
              <p className="text-xs text-gray-400">
                Real-time geospatial distribution of syndicate operating zones & camera chokepoints
              </p>
            </div>
          </div>
          <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800">
            <NetworkMapView
              nodes={SYNDICATES.map(s => ({
                id: s.kingpin.id,
                label: `${s.kingpin.name}\n(${s.name})`,
                district: s.districts[0],
                risk_score: s.risk_score,
                type: 'suspect',
                color: s.color
              }))}
              edges={[]}
              selectedNodeId={selectedSyndicate.kingpin.id}
              onNodeClick={(id) => {
                const syn = SYNDICATES.find(s => s.kingpin.id === id);
                if (syn) setSelectedSyndicate(syn);
              }}
              height={600}
            />
          </div>
        </div>
      )}

      {/* 8. INVESTIGATOR WALL SLIDE-OVER */}
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
