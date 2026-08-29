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
  Radar, ShieldCheck, UserCheck, ArrowUpRight, Compass, Sparkles,
  Pin, Bookmark, Camera, FileCheck
} from 'lucide-react';
import InvestigatorWall from '@/components/InvestigatorWall';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';
import { getSuspectMedia } from '@/lib/suspect-media';

// Dynamic import of Leaflet network map for the Map View tab
const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[580px] flex items-center justify-center text-slate-400 font-mono bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800">Calibrating Geo-Spatial Intelligence Grid…</div> }
);

// Structured Syndicate Knowledge Base with unique identifiers & portraits
const SYNDICATES = [
  {
    id: 'SYN-VT-01',
    name: 'Bullet Ramesh Inter-District Vehicle Theft Syndicate',
    category: 'vehicle_theft',
    category_label: 'Vehicle Theft & Fencing',
    color: '#3b82f6',
    threat_level: 'CRITICAL',
    risk_score: 94,
    estimated_volume: '₹1.8 Cr (42 Vehicles/yr)',
    districts: ['Bengaluru Urban', 'Raichur', 'Bidar'],
    primary_corridor: 'Hosur Road Corridor → Raichur Border Checkpost',
    predicted_escape_route: 'Silk Board TTMC → Attibele Toll → NH-44 Northward to Raichur chopshops',
    anpr_chokepoints: ['CAM-BLR-0045 (Silk Board TTMC)', 'CAM-RAI-0012 (Balay Circle)'],
    kingpin: {
      id: 'SUS-8842',
      name: 'Ramesh Kumar',
      alias: 'Bullet Ramesh',
      role: 'Syndicate Head & Logistics Mastermind',
      risk_score: 94,
      status: 'Active Watchlist / Under Surveillance',
      vehicle: 'Hyundai i10 / Bajaj Pulsar (KA-01-MJ-8821)',
      last_location: 'Silk Board TTMC Parking Bay 3, Hosur Road',
      mugshot: '/mugshots/ramesh-kumar.jpg'
    },
    lieutenants: [
      { id: 'SUS-4401', name: 'Deepak Shetty', alias: 'Chopshop Lead', role: 'Chopshop Fence & Disposal Lead', risk_score: 75, district: 'Yelahanka', mugshot: '/mugshots/deepak-shetty.jpg' },
      { id: 'SUS-1190', name: 'Manoj Reddy', alias: 'Jammer', role: 'Getaway Driver & Jammer Operator', risk_score: 65, district: 'Electronic City', mugshot: '/mugshots/ravi-shankar.jpg' },
      { id: 'SUS-2211', name: 'Farid Mirza', alias: 'Chotta Mirza', role: 'Master Key & Hardware Supplier', risk_score: 82, district: 'Central Bengaluru', mugshot: '/mugshots/farid-mirza.jpg' }
    ],
    connected_firs: [
      { case_number: 'KAR/BEN/2024/0747', crime: 'Vehicle Theft', station: 'Bengaluru Urban Central PS', date: '2024-06-01', status: 'Chargesheeted', note: 'Recovered master frequency jammer' },
      { case_number: 'KAR/RAI/2024/0123', crime: 'Motorcycle Theft', station: 'Raichur Suburban PS', date: '2024-06-01', status: 'Chargesheeted', note: 'Chassis VIN tampering confirmed' },
      { case_number: 'KAR/BID/2024/0897', crime: 'Hatchback Theft', station: 'Bidar Suburban PS', date: '2024-05-30', status: 'Open', note: 'ANPR hit on Attibele toll gate' },
      { case_number: 'KAR/BEN/2024/1840', crime: 'Vehicle Theft', station: 'Bengaluru Urban East PS', date: '2024-05-31', status: 'Chargesheeted', note: 'Keyway code duplicator seized' }
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
      mugshot: '/mugshots/imran-khan.jpg'
    },
    lieutenants: [
      { id: 'SUS-2211', name: 'Farid Mirza', alias: 'Chotta Mirza', role: 'Contraband Sourcing & Arms Supplier', risk_score: 82, district: 'Central Bengaluru', mugshot: '/mugshots/farid-mirza.jpg' },
      { id: 'SUS-3302', name: 'Arun Gowda', alias: 'Courier Arun', role: 'Dead-drop Courier & Logistics', risk_score: 68, district: 'Tumakuru', mugshot: '/mugshots/anand-gowda.jpg' }
    ],
    connected_firs: [
      { case_number: 'KAR/BEN/2024/1726', crime: 'Drug Offence (MDMA)', station: 'Bengaluru Urban East PS', date: '2024-06-01', status: 'Chargesheeted', note: '1.2kg MDMA seized at dead-drop' },
      { case_number: 'KAR/TUM/2024/0774', crime: 'Contraband Raid', station: 'Tumakuru Town PS', date: '2024-06-01', status: 'Closed', note: 'Encrypted Wickr chat logs verified' },
      { case_number: 'KAR/KOP/2024/0131', crime: 'Substance Seizure', station: 'Koppal Town PS', date: '2024-05-31', status: 'Open', note: 'Parcel delivery node raided' },
      { case_number: 'KAR/BEN/2024/0122', crime: 'Synthetic Narcotics', station: 'Bengaluru Urban East PS', date: '2024-06-01', status: 'Chargesheeted', note: 'Bank account frozen under NDPS 68F' }
    ],
    modus_operandi: 'Operates encrypted messaging distribution channels with dead-drop coordinates near tech parks and university nodes. Relies on fast delivery couriers wearing unbranded helmets.',
    tactical_action: 'Coordinate with CCB Anti-Narcotics Wing, initiate bank account freezes under NDPS Section 68F, and inspect parcel distribution hubs.'
  },
  {
    id: 'SYN-RB-03',
    name: 'Snake Naidu Armed Highway Robbery & Extortion Cell',
    category: 'robbery',
    category_label: 'Armed Robbery & Extortion',
    color: '#f43f5e',
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
      mugshot: '/mugshots/suresh-naidu.jpg'
    },
    lieutenants: [
      { id: 'SUS-3302', name: 'Arun Gowda', alias: 'Spotter Arun', role: 'Highway Spotter & Target Scout', risk_score: 68, district: 'Tumakuru', mugshot: '/mugshots/anand-gowda.jpg' },
      { id: 'SUS-1190', name: 'Manoj Reddy', alias: 'Rider Manoj', role: 'High-Speed Getaway Driver', risk_score: 65, district: 'Electronic City', mugshot: '/mugshots/ravi-shankar.jpg' }
    ],
    connected_firs: [
      { case_number: 'KAR/VIJ/2024/2269', crime: 'Armed Robbery', station: 'Vijayapura Industrial PS', date: '2024-05-31', status: 'Open', note: 'Bladed weapons recovered' },
      { case_number: 'KAR/BEN/2024/0675', crime: 'Highway Robbery', station: 'Bengaluru Urban East PS', date: '2024-05-31', status: 'Chargesheeted', note: 'Cash loot of ₹4.5L recovered' },
      { case_number: 'KAR/BID/2024/1595', crime: 'Cashier Extortion', station: 'Bidar Rural PS', date: '2024-05-31', status: 'Open', note: 'CCTV footage matches suspect' },
      { case_number: 'KAR/BEN/2024/2250', crime: 'Armed Robbery', station: 'Bengaluru Urban North PS', date: '2024-05-30', status: 'Under Investigation', note: 'NBW issued against Naidu' }
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
    threat_level: 'HIGH',
    risk_score: 88,
    estimated_volume: '₹4.2 Cr (Digital Extortion)',
    districts: ['Bengaluru Urban', 'Chikkamagaluru', 'Tumakuru'],
    primary_corridor: 'ITPB Tech Corridor → Decentralized Crypto Nodes',
    predicted_escape_route: 'Whitefield Cyber Hub → Chikkamagaluru Cloud Proxy → Multi-state mule drain',
    anpr_chokepoints: ['CAM-WF-0082 (ITPB Main Road)', 'CAM-CHI-0008 (Prasad Path)'],
    kingpin: {
      id: 'SUS-9104',
      name: 'Vikram Malhotra',
      alias: 'Vicky Blade',
      role: 'Cyber Extortion & Money Laundering Head',
      risk_score: 88,
      status: 'Digital Intelligence Tracking',
      vehicle: 'Black Yamaha R15 (KA-03-HA-8820)',
      last_location: 'ITPB Tech Corridor, Whitefield, Bengaluru',
      mugshot: '/mugshots/vikram-malhotra.jpg'
    },
    lieutenants: [
      { id: 'SUS-6022', name: 'Bhavani Karpe', alias: 'Karpe Madam', role: 'Mule Bank Account Coordinator', risk_score: 85, district: 'Bengaluru / Chikkamagaluru', mugshot: '/mugshots/bhavani-karpe.jpg' },
      { id: 'SUS-5011', name: 'Vikram Reddy', alias: 'Asset Vicky', role: 'Physical Asset Conversion Lead', risk_score: 84, district: 'Chikkamagaluru', mugshot: '/mugshots/vikram-reddy.jpg' }
    ],
    connected_firs: [
      { case_number: 'FIR-2026-BL-9104', crime: 'Cyber Extortion', station: 'Whitefield Cyber Crime PS', date: '2026-07-22', status: 'Under Investigation', note: '14 mule accounts frozen' },
      { case_number: 'KAR/BEN/2024/0380', crime: 'Banking Phishing', station: 'Bengaluru Urban Traffic PS', date: '2024-06-01', status: 'Chargesheeted', note: 'VoIP IP proxy hops traced' },
      { case_number: 'KAR/CHI/2024/2061', crime: 'Cyber Extortion', station: 'Chikkamagaluru Town PS', date: '2024-05-31', status: 'Under Investigation', note: 'Crypto wallet ledger seized' },
      { case_number: 'KAR/TUM/2024/1316', crime: 'Financial Fraud', station: 'Tumakuru Industrial PS', date: '2024-05-31', status: 'Under Investigation', note: 'Mule bank kit recovered' }
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
    threat_level: 'HIGH',
    risk_score: 90,
    estimated_volume: '₹45 Lakhs (Protection Money)',
    districts: ['Hassan', 'Vijayapura', 'Raichur'],
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
      mugshot: '/mugshots/anand-shinde.jpg'
    },
    lieutenants: [
      { id: 'SUS-1190', name: 'Manoj Reddy', alias: 'Rider Manoj', role: 'Local Intimidation Operative', risk_score: 65, district: 'Electronic City', mugshot: '/mugshots/ravi-shankar.jpg' },
      { id: 'SUS-2223', name: 'Chetan Shetty', alias: 'Chota Chetan', role: 'Property Lockbreaker & Lookout', risk_score: 89, district: 'Kalaburagi', mugshot: '/mugshots/chetan-shetty.jpg' }
    ],
    connected_firs: [
      { case_number: 'KAR/HAS/2024/1961', crime: 'Domestic Violence & Extortion', station: 'Hassan Industrial PS', date: '2024-06-01', status: 'Open', note: 'Witness protection deployed' },
      { case_number: 'KAR/VIJ/2024/1383', crime: 'Extortion Complaint', station: 'Vijayapura Suburban PS', date: '2024-05-31', status: 'Open', note: 'Shopkeeper protection detail active' }
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
          risk_score: selectedSyndicate.kingpin.risk_score,
          modus_operandi: selectedSyndicate.modus_operandi
        }
      ],
      victims: [{ full_name: 'KSP State Complainant', age: 40 }],
      related_firs: selectedSyndicate.connected_firs,
      case_summary: `Cross-district syndicate correlation verified under ${selectedSyndicate.name}.`
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16 font-sans text-slate-900 dark:text-slate-100">
      
      {/* ── 1. TOP HEADER & TELEMETRY HUB ── */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <NetworkIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Criminal Syndicate & Gang Nexus
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  5 ACTIVE GANG RINGS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Karnataka State Police CCTNS · Multi-Hop Organized Crime Network
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold self-start md:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'cards', label: 'Syndicate Cards', icon: Layers },
              { id: 'hierarchy', label: 'Investigation Wall', icon: Share2 },
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
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-700/60'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. UNIFIED STATS TILES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Kingpins Tracked</span>
            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">5 High-Value</p>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>100% Active ANPR Sweeps</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Key Lieutenants</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">11 Operatives</p>
          <p className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500">
            Chopshops, Mules & Couriers
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Correlated FIRs</span>
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">51 Indexed</p>
          <p className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Cross-District Verified
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Surveillance Nodes</span>
            <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">18 Chokepoints</p>
          <p className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500">
            Statewide Interceptor Grid
          </p>
        </div>
      </div>

      {/* ── 3. FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Syndicates' },
            { id: 'vehicle_theft', label: 'Vehicle Theft' },
            { id: 'narcotics', label: 'Narcotics NDPS' },
            { id: 'robbery', label: 'Armed Robbery' },
            { id: 'cybercrime', label: 'Cyber Fraud' },
            { id: 'assault', label: 'Extortion' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search syndicate, kingpin, or corridor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* ── 4. VIEW 1: SYNDICATE CARDS WORKBENCH ── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Syndicate Cards Grid (7 Cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {filteredSyndicates.map(syn => {
              const isSelected = selectedSyndicate.id === syn.id;
              return (
                <div
                  key={syn.id}
                  onClick={() => setSelectedSyndicate(syn)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative bg-white dark:bg-zinc-900 shadow-2xs space-y-3.5 ${
                    isSelected
                      ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10'
                      : 'border-slate-200/90 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-mono">
                        {syn.category_label}
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                        {syn.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60">
                        RISK {syn.risk_score}/100
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-medium">
                        {syn.connected_firs.length} Cases
                      </span>
                    </div>
                  </div>

                  {/* Kingpin & Lieutenants Strip with Distinct Authentic Indian Portraits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Kingpin Capsule */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={syn.kingpin.mugshot}
                          alt={syn.kingpin.name}
                          className="w-full h-full object-cover object-top"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-1 ring-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono block">Prime Kingpin</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{syn.kingpin.name}</p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">“{syn.kingpin.alias}”</p>
                      </div>
                    </div>

                    {/* Key Lieutenants Capsule */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                        Specialized Cells ({syn.lieutenants.length})
                      </span>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {syn.lieutenants.map(lt => (
                            <div key={lt.id} className="w-6 h-6 rounded-full overflow-hidden border border-white dark:border-zinc-800 shrink-0 bg-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={lt.mugshot} alt={lt.name} className="w-full h-full object-cover object-top" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">
                          {syn.lieutenants.map(l => l.name.split(' ')[0]).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modus Operandi Narrative */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-2">
                    <strong className="text-slate-900 dark:text-white font-semibold">Modus Operandi:</strong> {syn.modus_operandi}
                  </p>

                  {/* Corridor Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] truncate max-w-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{syn.primary_corridor}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSyndicate(syn);
                        setViewMode('hierarchy');
                      }}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-xs shrink-0 cursor-pointer"
                    >
                      <span>Investigation Wall</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Syndicate Deep-Dive Focus Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-mono block">
                  Target Syndicate Focus
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedSyndicate.name}
                </h3>
              </div>

              {/* Kingpin Spotlight */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-300 dark:border-zinc-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedSyndicate.kingpin.mugshot}
                      alt={selectedSyndicate.kingpin.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedSyndicate.kingpin.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Alias: <span className="font-semibold text-slate-800 dark:text-slate-200">“{selectedSyndicate.kingpin.alias}”</span>
                    </p>
                    <span className="inline-block text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200/60 mt-0.5">
                      Risk Rating {selectedSyndicate.kingpin.risk_score}/100
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pt-2 border-t border-slate-200/80 dark:border-zinc-700/60 font-sans">
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Status:</strong> {selectedSyndicate.kingpin.status}</p>
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Vehicle:</strong> {selectedSyndicate.kingpin.vehicle}</p>
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Last Sighted:</strong> {selectedSyndicate.kingpin.last_location}</p>
                </div>
              </div>

              {/* Connected CCTNS Cases */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Connected Case Dockets ({selectedSyndicate.connected_firs.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedSyndicate.connected_firs.map(fir => (
                    <div
                      key={fir.case_number}
                      onClick={() => handleCaseClick(fir.case_number)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          <FileText className="w-3 h-3" />
                          <span>{fir.case_number}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-medium">
                          {fir.crime} · {fir.station}
                        </p>
                      </div>
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                        {fir.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Directives */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>COMMAND TACTICAL DIRECTIVE</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {selectedSyndicate.tactical_action}
                </p>
              </div>

              {/* Deep Link to Co-Pilot Chat */}
              <Link
                href="/dashboard/chat"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <span>Query DRISHTI Copilot On This Gang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. VIEW 2: CINEMATIC POLICE INVESTIGATION WALL (RED STRINGS & PINS) ── */}
      {viewMode === 'hierarchy' && (
        <div className="rounded-2xl bg-[#1e1b18] border-2 border-stone-800 shadow-2xl p-4 sm:p-6 space-y-6 text-stone-100 relative overflow-hidden">
          {/* Corkboard / Blackboard Ambient Texture Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80 relative z-10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 shadow-rose-600/50 shadow-md animate-pulse" />
                <h3 className="text-base sm:text-lg font-black tracking-wide text-stone-100 uppercase font-mono">
                  CRIMINAL CONSPIRACY INVESTIGATION WALL
                </h3>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Multi-Hop Case Correlation & Syndicate Thread Matrix · Active Detective Docket
              </p>
            </div>

            {/* Syndicate Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-stone-400">Target Gang:</span>
              <select
                value={selectedSyndicate.id}
                onChange={(e) => {
                  const s = SYNDICATES.find(syn => syn.id === e.target.value);
                  if (s) setSelectedSyndicate(s);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-700 text-xs font-bold font-mono text-amber-300 focus:outline-none shadow-md cursor-pointer"
              >
                {SYNDICATES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── MOVIE STYLE PINBOARD CANVAS WITH RED STRINGS ── */}
          <div className="relative min-h-[600px] w-full p-4 sm:p-8 rounded-xl bg-[radial-gradient(#2d2824_1px,transparent_1px)] [background-size:16px_16px] bg-[#1a1714] border border-stone-800/60 shadow-inner">
            
            {/* SVG Connecting Red Yarn / Strings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="stringShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Dynamic Connecting Lines from Kingpin (Top Center) to Lieutenants & Evidence */}
              {/* String 1: Kingpin to Left Lt */}
              <line x1="50%" y1="120" x2="20%" y2="280" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="6,2" filter="url(#stringShadow)" opacity="0.9" />
              {/* String 2: Kingpin to Mid Lt */}
              <line x1="50%" y1="120" x2="50%" y2="280" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="8,2" filter="url(#stringShadow)" opacity="0.95" />
              {/* String 3: Kingpin to Right Lt */}
              <line x1="50%" y1="120" x2="80%" y2="280" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="6,2" filter="url(#stringShadow)" opacity="0.9" />

              {/* String 4: Left Lt to FIR 1 */}
              <line x1="20%" y1="360" x2="16%" y2="480" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4,2" filter="url(#stringShadow)" opacity="0.8" />
              {/* String 5: Mid Lt to FIR 2 */}
              <line x1="50%" y1="360" x2="40%" y2="480" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4,2" filter="url(#stringShadow)" opacity="0.8" />
              {/* String 6: Right Lt to FIR 3 & 4 */}
              <line x1="80%" y1="360" x2="65%" y2="480" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4,2" filter="url(#stringShadow)" opacity="0.8" />
              <line x1="80%" y1="360" x2="88%" y2="480" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,2" filter="url(#stringShadow)" opacity="0.85" />
            </svg>

            {/* ── TIER 1: KINGPIN POLAROID PIN ── */}
            <div className="relative z-10 flex flex-col items-center justify-center pb-12">
              {/* Red Metal Pushpin */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-800 to-red-500 shadow-md border border-red-300 z-20 -mb-2.5 animate-bounce" />
              
              {/* Polaroid Frame */}
              <div className="bg-[#fffdfa] text-stone-900 p-3 pb-4 rounded shadow-2xl border border-stone-300 max-w-xs w-full transform rotate-[-1.5deg] hover:rotate-0 transition-transform duration-200">
                <div className="relative aspect-square w-full rounded overflow-hidden bg-stone-200 border border-stone-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedSyndicate.kingpin.mugshot}
                    alt={selectedSyndicate.kingpin.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute top-2 right-2 bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow">
                    PRIME KINGPIN
                  </span>
                </div>

                <div className="mt-2.5 text-center font-mono">
                  <h4 className="font-black text-sm uppercase text-stone-900 tracking-tight">
                    {selectedSyndicate.kingpin.name}
                  </h4>
                  <p className="text-[11px] text-red-700 font-bold">
                    ALIAS: &quot;{selectedSyndicate.kingpin.alias}&quot;
                  </p>
                  <p className="text-[10px] text-stone-500 mt-1 border-t border-stone-200 pt-1">
                    Threat Index: <span className="font-bold text-red-600">{selectedSyndicate.kingpin.risk_score}%</span> · {selectedSyndicate.districts[0]}
                  </p>
                </div>
              </div>

              {/* Yellow Evidence Sticky Note */}
              <div className="mt-2 bg-[#fef08a] text-stone-900 px-3 py-1.5 rounded shadow-md border border-amber-300 font-mono text-[10.5px] font-bold transform rotate-[2deg] max-w-sm text-center">
                📌 TARGET: Sighted at {selectedSyndicate.kingpin.last_location.split('—')[0]}
              </div>
            </div>

            {/* ── TIER 2: LIEUTENANTS & SPECIALIZED CELLS ── */}
            <div className="relative z-10 pt-4 pb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-12 bg-stone-700" />
                <span className="text-[10.5px] font-bold font-mono uppercase tracking-widest text-amber-400 bg-stone-900/80 px-3 py-1 rounded-full border border-stone-700">
                  TIER 2: OPERATIONAL LIEUTENANTS & FIELD MOLES
                </span>
                <span className="h-px w-12 bg-stone-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {selectedSyndicate.lieutenants.map((lt, idx) => {
                  const rotation = idx === 0 ? 'rotate-[-2deg]' : idx === 1 ? 'rotate-[1deg]' : 'rotate-[2.5deg]';
                  return (
                    <div key={lt.id} className="flex flex-col items-center">
                      {/* Pushpin */}
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-md border border-amber-200 z-20 -mb-2" />
                      
                      {/* Polaroid Card */}
                      <div className={`bg-[#faf8f5] text-stone-900 p-2.5 pb-3 rounded shadow-xl border border-stone-300 w-full transform ${rotation} hover:rotate-0 transition-transform`}>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={lt.mugshot}
                              alt={lt.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0 font-mono text-left">
                            <h5 className="font-bold text-xs uppercase text-stone-900 truncate">{lt.name}</h5>
                            <p className="text-[10px] text-blue-700 font-bold truncate">{lt.role}</p>
                            <span className="inline-block mt-1 text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded border border-red-200">
                              Risk {lt.risk_score}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-stone-200 text-[10px] text-stone-600 font-mono flex items-center justify-between">
                          <span>Sector: {lt.district}</span>
                          <span className="text-amber-700 font-bold">LINKED</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── TIER 3: CCTNS EVIDENCE SLATES & FIR DOCKETS ── */}
            <div className="relative z-10 pt-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-12 bg-stone-700" />
                <span className="text-[10.5px] font-bold font-mono uppercase tracking-widest text-emerald-400 bg-stone-900/80 px-3 py-1 rounded-full border border-stone-700">
                  TIER 3: SEIZED EVIDENCE & CCTNS CASE DOCKETS
                </span>
                <span className="h-px w-12 bg-stone-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {selectedSyndicate.connected_firs.map((fir, idx) => (
                  <div
                    key={fir.case_number}
                    onClick={() => handleCaseClick(fir.case_number)}
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    {/* Metal Pushpin */}
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 shadow-md border border-emerald-200 z-20 -mb-1.5" />
                    
                    {/* Index Card Frame */}
                    <div className="bg-[#f4f1ea] text-stone-900 p-3 rounded shadow-lg border border-stone-300 w-full hover:bg-amber-50 transition-colors font-mono space-y-1 text-left transform hover:-translate-y-1 transition-transform">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-black text-emerald-800">{fir.case_number}</span>
                        <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 font-bold rounded text-[9px]">
                          {fir.status}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-stone-900">{fir.crime}</p>
                      <p className="text-[10px] text-stone-500 truncate">{fir.station}</p>
                      
                      {fir.note && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-200 text-[9.5px] text-red-800 font-semibold italic">
                          ⚡ {fir.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── 6. VIEW 3: STRATEGIC NEXUS MATRIX (CLEAN MODERN LEDGER) ── */}
      {viewMode === 'matrix' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Cross-District Criminal Syndicate Nexus Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Inter-state crime nexus, financial volume, corridor tracking & linked CCTNS evidence
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              5 Primary Rings • 51 Linked Case Dockets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="px-4 py-3 font-bold">Syndicate Network</th>
                  <th className="px-4 py-3 font-bold">Prime Kingpin</th>
                  <th className="px-4 py-3 font-bold">Financial Scale</th>
                  <th className="px-4 py-3 font-bold">Operating Corridor</th>
                  <th className="px-4 py-3 font-bold">Threat Level</th>
                  <th className="px-4 py-3 font-bold">Linked FIRs</th>
                  <th className="px-4 py-3 font-bold text-right">Dossier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {SYNDICATES.map((syn) => (
                  <tr key={syn.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Syndicate Name */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: syn.color }} />
                        <span className="truncate max-w-xs">{syn.name}</span>
                      </div>
                    </td>

                    {/* Kingpin with Mugshot */}
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={syn.kingpin.mugshot} alt={syn.kingpin.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{syn.kingpin.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">“{syn.kingpin.alias}”</div>
                        </div>
                      </div>
                    </td>

                    {/* Financial Scale */}
                    <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {syn.estimated_volume}
                    </td>

                    {/* Corridor */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate">
                      {syn.primary_corridor}
                    </td>

                    {/* Threat Pill */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        syn.threat_level === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                      }`}>
                        {syn.threat_level} ({syn.risk_score}%)
                      </span>
                    </td>

                    {/* Linked FIRs */}
                    <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {syn.connected_firs.length} Cases
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedSyndicate(syn);
                          handleCaseClick(syn.connected_firs[0].case_number);
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                      >
                        Inspect Docket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. VIEW 4: PREDICTIVE INTERCEPTION MAP ── */}
      {viewMode === 'map' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Predictive Escape Route & ANPR Interception Grid
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Calibrated multi-source intel feeds (FASTag sweeps, SIM cell tower hops, ANPR time-decay trajectory)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 font-bold">
                MULTI-SOURCE INTEL SYNCED
              </span>
            </div>
          </div>

          {/* Predictive Route Highlights Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Tracking Target</span>
              <p className="font-bold text-slate-900 dark:text-white">{selectedSyndicate.kingpin.name} ({selectedSyndicate.kingpin.alias})</p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400">{selectedSyndicate.kingpin.vehicle}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Next Corridor</span>
              <p className="font-bold text-rose-600 dark:text-rose-400">{selectedSyndicate.predicted_escape_route}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Surveillance Checkpoints</span>
              <p className="text-slate-700 dark:text-slate-300">{selectedSyndicate.anpr_chokepoints.join(' · ')}</p>
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
