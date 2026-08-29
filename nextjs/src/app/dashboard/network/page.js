'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Pin, Bookmark, Camera, FileCheck, Plus, X, Tag, FileSpreadsheet,
  HelpCircle, AlertCircle, Maximize2, Minimize2, Fingerprint, Paperclip,
  Key, Film, Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestigatorWall from '@/components/InvestigatorWall';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

// Dynamic import of Leaflet network map for the Map View tab
const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[580px] flex items-center justify-center text-slate-400 font-mono bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800">Calibrating Geo-Spatial Intelligence Grid…</div> }
);

// Structured Syndicate Knowledge Base with unique identifiers & authentic Indian portraits
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
      mugshot: '/mugshots/ramesh-kumar.jpg',
      reward: '₹1,00,000'
    },
    lieutenants: [
      { id: 'SUS-4401', name: 'Deepak Shetty', alias: 'Chopshop Fence', role: 'Chopshop Fence & Disposal Lead', risk_score: 75, district: 'Yelahanka', mugshot: '/mugshots/deepak-shetty.jpg', task: 'Runs Yelahanka auto scrap yard & engine dismantling' },
      { id: 'SUS-1190', name: 'Manoj Reddy', alias: 'Jammer Manoj', role: 'Getaway Driver & Jammer Operator', risk_score: 65, district: 'Electronic City', mugshot: '/mugshots/ravi-shankar.jpg', task: 'Operates 433MHz frequency immobilizer bypass units' },
      { id: 'SUS-2211', name: 'Farid Mirza', alias: 'Chotta Mirza', role: 'Master Key & Hardware Supplier', risk_score: 82, district: 'Central Bengaluru', mugshot: '/mugshots/farid-mirza.jpg', task: 'Procures blank smart-keys & lock-picking toolkits' }
    ],
    connected_firs: [
      { case_number: 'KAR/BEN/2024/0747', crime: 'Vehicle Theft', station: 'Bengaluru Urban Central PS', date: '2024-06-01', status: 'Chargesheeted', note: 'Recovered master 433MHz frequency jammer unit' },
      { case_number: 'KAR/RAI/2024/0123', crime: 'Motorcycle Theft', station: 'Raichur Suburban PS', date: '2024-06-01', status: 'Chargesheeted', note: 'Chassis VIN serial tampering confirmed by FSL' },
      { case_number: 'KAR/BID/2024/0897', crime: 'Hatchback Theft', station: 'Bidar Suburban PS', date: '2024-05-30', status: 'Open', note: 'ANPR hit at Attibele Toll checkpost (23:42 hrs)' },
      { case_number: 'KAR/BEN/2024/1840', crime: 'Keyway Duplication', station: 'Bengaluru Urban East PS', date: '2024-05-31', status: 'Chargesheeted', note: 'OBD-II programmer & 14 blank smart keys seized' }
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
      mugshot: '/mugshots/imran-khan.jpg',
      reward: '₹2,50,000'
    },
    lieutenants: [
      { id: 'SUS-2211', name: 'Farid Mirza', alias: 'Chotta Mirza', role: 'Contraband Sourcing & Arms Supplier', risk_score: 82, district: 'Central Bengaluru', mugshot: '/mugshots/farid-mirza.jpg', task: 'Procures synthetic meth precursors from Goa transit' },
      { id: 'SUS-3302', name: 'Arun Gowda', alias: 'Courier Arun', role: 'Dead-drop Courier & Logistics', risk_score: 68, district: 'Tumakuru', mugshot: '/mugshots/anand-gowda.jpg', task: 'Executes dead-drops at highway fuel pumps & flyovers' }
    ],
    connected_firs: [
      { case_number: 'KAR/BEN/2024/1726', crime: 'Drug Offence (MDMA)', station: 'Bengaluru Urban East PS', date: '2024-06-01', status: 'Chargesheeted', note: '1.2kg MDMA seized at dead-drop node' },
      { case_number: 'KAR/TUM/2024/0774', crime: 'Contraband Raid', station: 'Tumakuru Town PS', date: '2024-06-01', status: 'Closed', note: 'Encrypted chat logs verified by Cyber Cell' },
      { case_number: 'KAR/KOP/2024/0131', crime: 'Substance Seizure', station: 'Koppal Town PS', date: '2024-05-31', status: 'Open', note: 'Parcel delivery consignment intercepted' },
      { case_number: 'KAR/BEN/2024/0122', crime: 'Synthetic Narcotics', station: 'Bengaluru Urban East PS', date: '2024-06-01', status: 'Chargesheeted', note: 'Bank account frozen under NDPS Section 68F' }
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
      mugshot: '/mugshots/suresh-naidu.jpg',
      reward: '₹1,50,000'
    },
    lieutenants: [
      { id: 'SUS-3302', name: 'Arun Gowda', alias: 'Spotter Arun', role: 'Highway Spotter & Target Scout', risk_score: 68, district: 'Tumakuru', mugshot: '/mugshots/anand-gowda.jpg', task: 'Monitors cash transit trucks at toll plazas' },
      { id: 'SUS-1190', name: 'Manoj Reddy', alias: 'Rider Manoj', role: 'High-Speed Getaway Driver', risk_score: 65, district: 'Electronic City', mugshot: '/mugshots/ravi-shankar.jpg', task: 'Evades highway police interceptors on modified bike' }
    ],
    connected_firs: [
      { case_number: 'KAR/VIJ/2024/2269', crime: 'Armed Robbery', station: 'Vijayapura Industrial PS', date: '2024-05-31', status: 'Open', note: 'Bladed weapons & machetes recovered from scene' },
      { case_number: 'KAR/BEN/2024/0675', crime: 'Highway Robbery', station: 'Bengaluru Urban East PS', date: '2024-05-31', status: 'Chargesheeted', note: 'Cash loot of ₹4.5L recovered in bag' },
      { case_number: 'KAR/BID/2024/1595', crime: 'Cashier Extortion', station: 'Bidar Rural PS', date: '2024-05-31', status: 'Open', note: 'CCTV footage matches suspect physical specs' },
      { case_number: 'KAR/BEN/2024/2250', crime: 'Armed Robbery', station: 'Bengaluru Urban North PS', date: '2024-05-30', status: 'Under Investigation', note: 'NBW warrant issued against Naidu' }
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
      mugshot: '/mugshots/vikram-malhotra.jpg',
      reward: '₹2,00,000'
    },
    lieutenants: [
      { id: 'SUS-6022', name: 'Bhavani Karpe', alias: 'Karpe Madam', role: 'Mule Bank Account Coordinator', risk_score: 85, district: 'Bengaluru / Chikkamagaluru', mugshot: '/mugshots/bhavani-karpe.jpg', task: 'Recruits fake KYC accounts from students & gig workers' },
      { id: 'SUS-5011', name: 'Vikram Reddy', alias: 'Asset Vicky', role: 'Physical Asset Conversion Lead', risk_score: 84, district: 'Chikkamagaluru', mugshot: '/mugshots/vikram-reddy.jpg', task: 'Converts USDT crypto transfers into gold bullion' }
    ],
    connected_firs: [
      { case_number: 'FIR-2026-BL-9104', crime: 'Cyber Extortion', station: 'Whitefield Cyber Crime PS', date: '2026-07-22', status: 'Under Investigation', note: '14 mule bank accounts frozen under 1930 Helpline' },
      { case_number: 'KAR/BEN/2024/0380', crime: 'Banking Phishing', station: 'Bengaluru Urban Traffic PS', date: '2024-06-01', status: 'Chargesheeted', note: 'VoIP IP proxy hops traced to offshore server' },
      { case_number: 'KAR/CHI/2024/2061', crime: 'Cyber Extortion', station: 'Chikkamagaluru Town PS', date: '2024-05-31', status: 'Under Investigation', note: 'Cold storage crypto wallet hardware seized' },
      { case_number: 'KAR/TUM/2024/1316', crime: 'Financial Fraud', station: 'Tumakuru Industrial PS', date: '2024-05-31', status: 'Under Investigation', note: 'Mule bank debit card kit recovered' }
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
      mugshot: '/mugshots/anand-shinde.jpg',
      reward: '₹75,000'
    },
    lieutenants: [
      { id: 'SUS-1190', name: 'Manoj Reddy', alias: 'Rider Manoj', role: 'Local Intimidation Operative', risk_score: 65, district: 'Electronic City', mugshot: '/mugshots/ravi-shankar.jpg', task: 'Executes physical threats on construction contractors' },
      { id: 'SUS-2223', name: 'Chetan Shetty', alias: 'Chota Chetan', role: 'Property Lockbreaker & Lookout', risk_score: 89, district: 'Kalaburagi', mugshot: '/mugshots/chetan-shetty.jpg', task: 'Surveils target business owners after closing hours' }
    ],
    connected_firs: [
      { case_number: 'KAR/HAS/2024/1961', crime: 'Domestic Violence & Extortion', station: 'Hassan Industrial PS', date: '2024-06-01', status: 'Open', note: 'Witness protection detail deployed at complainant site' },
      { case_number: 'KAR/VIJ/2024/1383', crime: 'Extortion Complaint', station: 'Vijayapura Suburban PS', date: '2024-05-31', status: 'Open', note: 'Audio recording of threat call submitted to IO' }
    ],
    modus_operandi: 'Runs systematic protection rackets targeting small merchants and industrial contractors using physical intimidation.',
    tactical_action: 'Serve summons under Section 35 BNSS, conduct witness safety verification, and deploy night beat constables near Hassan Industrial Area.'
  }
];

export default function NetworkPage() {
  const [selectedSyndicate, setSelectedSyndicate] = useState(SYNDICATES[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('hierarchy');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseData, setActiveCaseData] = useState(null);

  // Investigation Pinboard Interactive States
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState(null);
  const [customPins, setCustomPins] = useState([]);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [newPinNote, setNewPinNote] = useState({ text: '', author: 'Insp. V. Sharma', tag: 'ANPR HIT' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_evidence_pins');
      if (stored) setCustomPins(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const handleAddCustomPin = (e) => {
    e.preventDefault();
    if (!newPinNote.text.trim()) return;
    const newPin = {
      id: `CUSTOM-PIN-${Date.now()}`,
      text: newPinNote.text,
      author: newPinNote.author || 'Investigating Officer',
      tag: newPinNote.tag || 'FIELD CLUE',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    };
    const updated = [newPin, ...customPins];
    setCustomPins(updated);
    try {
      localStorage.setItem('ksp_custom_evidence_pins', JSON.stringify(updated));
    } catch (_) {}
    setIsAddPinModalOpen(false);
    setNewPinNote({ text: '', author: 'Insp. V. Sharma', tag: 'ANPR HIT' });
  };

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
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-20 font-sans text-slate-900 dark:text-slate-100">
      
      {/* ── TOP HEADER & TELEMETRY HUB ── */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0 shadow-md">
              <NetworkIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Criminal Syndicate & Gang Nexus
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  5 ACTIVE GANG RINGS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Karnataka State Police CCTNS · Authentic Detective War Room & Evidence Pinboard
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold self-start md:self-auto">
            {[
              { id: 'hierarchy', label: 'Investigation Board', icon: Share2 },
              { id: 'cards', label: 'Syndicate Cards', icon: Layers },
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
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-bold' 
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

      {/* ── VIEW 1: DENSE AUTHENTIC DETECTIVE PINBOARD (NO EMPTY GAPS, 100% PACKED) ── */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-4">
          {/* Top Control Bar for Detective Board */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1e2025] text-stone-200 px-4 py-2.5 rounded-xl border border-stone-700 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-600 shadow-red-600/70 shadow-sm animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-amber-400">
                  CRIMINAL INTELLIGENCE EVIDENCE WALL:
                </span>
                <span className="text-xs sm:text-sm font-bold text-white font-mono">
                  {selectedSyndicate.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSyndicate.id}
                onChange={(e) => {
                  const s = SYNDICATES.find(syn => syn.id === e.target.value);
                  if (s) setSelectedSyndicate(s);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-600 text-xs font-bold text-stone-100 font-mono focus:outline-none cursor-pointer"
              >
                {SYNDICATES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={() => setIsAddPinModalOpen(true)}
                className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Pin Clue</span>
              </button>
            </div>
          </div>

          {/* ── CINEMATIC DETECTIVE PINBOARD CANVAS (PACKED COMPACT BOARD WITH REALISTIC TEXTURE) ── */}
          <div className="relative w-full max-w-6xl mx-auto rounded-3xl bg-[#2b2f38] border-[12px] border-[#1e1c18] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(0,0,0,0.7)] p-4 sm:p-6 overflow-hidden select-none">
            
            {/* Ambient Cork/Felt Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#404652_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none z-0 opacity-80" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.85)] pointer-events-none z-0" />

            {/* ── DENSE SVG RED YARN WEB (CRISS-CROSSING TIGHTLY ACROSS NODES) ── */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-20" 
              viewBox="0 0 1000 680" 
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="1.5" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.85" />
                </filter>
              </defs>

              <g fill="none" strokeLinecap="round" filter="url(#pinShadow)">
                {/* 1. Top-Left Dossier (180, 70) -> Center Wanted Poster (500, 60) */}
                <path d="M 180 70 Q 340 30, 500 60" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 2. Top-Left Newspaper (160, 220) -> Center Wanted Poster (500, 60) */}
                <path d="M 160 220 Q 320 140, 500 60" stroke="#dc2626" strokeWidth="2" strokeDasharray="5,2" />

                {/* 3. Center Wanted Poster (500, 60) -> Top-Right FASTag & Keys (720, 50) */}
                <path d="M 500 60 Q 610 25, 720 50" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 4. Top-Right FASTag & Keys (720, 50) -> Top-Right Toll Slip (880, 60) */}
                <path d="M 720 50 Q 800 30, 880 60" stroke="#dc2626" strokeWidth="2" strokeDasharray="5,2" />

                {/* 5. Top-Right Toll Slip (880, 60) -> Mid-Right Lieutenants (840, 220) */}
                <path d="M 880 60 Q 890 140, 840 220" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 6. Center Wanted Poster (500, 60) -> Mid-Right Lieutenants (840, 220) */}
                <path d="M 500 60 Q 680 120, 840 220" stroke="#ef4444" strokeWidth="3" strokeDasharray="7,2" />

                {/* 7. Center Wanted Poster (500, 60) -> Center Forensic Hardware (500, 360) */}
                <path d="M 500 60 Q 480 200, 500 360" stroke="#ef4444" strokeWidth="3" strokeDasharray="7,2" />

                {/* 8. Center Forensic Hardware (500, 360) -> Mid-Left Radar Map (220, 380) */}
                <path d="M 500 360 Q 360 360, 220 380" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 9. Center Forensic Hardware (500, 360) -> Mid-Right Police Gazette (820, 380) */}
                <path d="M 500 360 Q 660 360, 820 380" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 10. Center Forensic Hardware (500, 360) -> Bottom-Left Operatives (220, 560) */}
                <path d="M 500 360 Q 360 480, 220 560" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 11. Center Forensic Hardware (500, 360) -> Bottom-Center CCTNS Leads (500, 540) */}
                <path d="M 500 360 Q 500 450, 500 540" stroke="#ef4444" strokeWidth="3" strokeDasharray="7,2" />

                {/* 12. Center Forensic Hardware (500, 360) -> Bottom-Right Dossier (820, 560) */}
                <path d="M 500 360 Q 670 480, 820 560" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,2" />

                {/* 13. Bottom-Left Operatives (220, 560) -> Bottom-Center CCTNS Leads (500, 540) */}
                <path d="M 220 560 Q 360 570, 500 540" stroke="#dc2626" strokeWidth="2" strokeDasharray="5,2" />

                {/* 14. Bottom-Center CCTNS Leads (500, 540) -> Bottom-Right Dossier (820, 560) */}
                <path d="M 500 540 Q 660 570, 820 560" stroke="#dc2626" strokeWidth="2" strokeDasharray="5,2" />
              </g>

              {/* 3D Pushpins with Shiny Highlights */}
              {[
                { x: 180, y: 70 },
                { x: 160, y: 220 },
                { x: 500, y: 60 },
                { x: 720, y: 50 },
                { x: 880, y: 60 },
                { x: 840, y: 220 },
                { x: 500, y: 360 },
                { x: 220, y: 380 },
                { x: 820, y: 380 },
                { x: 220, y: 560 },
                { x: 500, y: 540 },
                { x: 820, y: 560 }
              ].map((pin, i) => (
                <g key={i} filter="url(#pinShadow)">
                  <circle cx={pin.x} cy={pin.y} r="6.5" fill="#991b1b" />
                  <circle cx={pin.x} cy={pin.y} r="4.5" fill="#ef4444" />
                  <circle cx={pin.x - 1.5} cy={pin.y - 1.5} r="1.5" fill="#ffffff" opacity="0.9" />
                </g>
              ))}
            </svg>

            {/* ── ARTIFACT GRID: DENSE 3-COLUMN STRUCTURE THAT FILLS 100% OF THE CANVAS ── */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3.5">
              
              {/* ── LEFT COLUMN (4 Cols): Top Dossier + Deccan Chronicle Newspaper + Radar Grid ── */}
              <div className="md:col-span-4 space-y-3">
                {/* 1. Official CID Suspect Profile Sheet */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'KSP CID REVIEW PROGRAM — AGENT PROFILE',
                    type: 'OFFICIAL POLICE DOSSIER',
                    mugshot: selectedSyndicate.kingpin.mugshot,
                    content: `Subject ${selectedSyndicate.kingpin.name} (Alias: "${selectedSyndicate.kingpin.alias}") classified under CCTNS Organized Crime Index. Operating Corridor: ${selectedSyndicate.primary_corridor}. Threat Level: ${selectedSyndicate.threat_level} (${selectedSyndicate.risk_score}%). Multiple non-bailable warrants pending execution across 3 districts.`,
                    date: '24 Nov 2024',
                    stamp: 'VERIFIED CCTNS'
                  })}
                  className="bg-[#faf7f0] text-stone-950 p-3 rounded shadow-xl border border-stone-300 font-mono text-xs transform rotate-[-2deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  <div className="flex items-center justify-between border-b border-stone-300 pb-1 text-[9px] font-bold text-stone-800">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-stone-700" /> KSP CID REVIEW PROGRAM</span>
                    <span className="text-[8px] bg-red-700 text-white px-1 font-bold rounded">CONFIDENTIAL</span>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <div className="w-14 h-16 bg-stone-200 rounded border border-stone-400 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.kingpin.mugshot} alt="Kingpin" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="text-[9px] space-y-0.5 min-w-0">
                      <p><strong className="text-stone-900">NAME:</strong> {selectedSyndicate.kingpin.name}</p>
                      <p><strong className="text-stone-900">ALIAS:</strong> “{selectedSyndicate.kingpin.alias}”</p>
                      <p><strong className="text-stone-900">ID:</strong> {selectedSyndicate.kingpin.id}</p>
                      <p><strong className="text-stone-900">THREAT:</strong> <span className="text-red-700 font-bold">{selectedSyndicate.threat_level}</span></p>
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-stone-200 text-[8px] text-stone-600 flex items-center justify-between">
                    <span>Insp. V. Sharma</span>
                    <span className="font-bold text-red-700 border border-red-700 px-1">CCTNS VERIFIED</span>
                  </div>
                </div>

                {/* 2. Deccan Chronicle Vintage Newspaper Clipping */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'THE DECCAN CHRONICLE — CRIME SPECIAL EDITION',
                    type: 'NEWSPAPER ARCHIVE PRESS CLIPPING',
                    content: `Special Squad cracks inter-district vehicle theft racket in midnight sweep. 42 vehicles recovered across Bengaluru, Raichur, and Bidar corridors. Master electronic bypass devices seized from Yelahanka chopshop.`,
                    date: '02 Jun 2024',
                    stamp: 'PRESS ARCHIVE'
                  })}
                  className="bg-[#e8e2d5] text-stone-950 p-3 rounded shadow-lg border border-stone-400 font-mono text-[9.5px] transform rotate-[1.5deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                >
                  <div className="border-b-2 border-black pb-0.5 mb-1 flex items-center justify-between font-serif">
                    <span className="font-black text-xs uppercase tracking-tight">THE DECCAN CHRONICLE</span>
                    <span className="text-[8px] font-mono text-stone-600">PAGE 4 · CRIME</span>
                  </div>
                  <div className="bg-stone-900 text-white font-serif font-black text-[11px] p-0.5 uppercase leading-tight mb-1 text-center">
                    SPECIAL SQUAD BUSTS HIGHWAY GANG
                  </div>
                  <p className="text-[8px] text-stone-700 font-serif leading-snug">
                    Over 42 vehicles traced along NH-44 corridor. Police recover master 433MHz frequency jammers from Yelahanka chopshop.
                  </p>
                </div>

                {/* 3. Satellite Reconnaissance Radar Grid */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'RECONNAISSANCE GRID & HIGHWAY RADAR MAP',
                    type: 'SATELLITE ESCAPE TRAIL',
                    content: `Satellite ANPR radar grid tracking getaway movement along Hosur Road toward Attibele Toll Plaza. Predicted intercept waypoint flagged at Balay Circle.`,
                    date: '18 Jul 2026',
                    stamp: 'SATELLITE RADAR'
                  })}
                  className="bg-[#141923] text-stone-100 p-2.5 rounded shadow-xl border border-stone-700 font-mono text-[9px] transform rotate-[-1deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-stone-700 text-sky-400 font-bold">
                    <span>TRANSIT RADAR GRID</span>
                    <Crosshair className="w-3 h-3 text-red-500 animate-pulse" />
                  </div>
                  <div className="mt-1 h-14 bg-[#0a0d14] rounded border border-stone-800 p-1.5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px]" />
                    <div className="relative z-10 text-[8px] text-sky-300 font-bold">
                      ROUTE: SILK BOARD → ATTIBELE TOLL
                    </div>
                    <div className="relative z-10 text-[7.5px] text-stone-400">
                      ANPR CAM-0045 & CAM-0012 HIT
                    </div>
                  </div>
                </div>

                {/* 4. Bottom-Left Handwritten Operatives Cluster */}
                <div className="bg-[#fffbeb] text-amber-950 p-2 rounded shadow border border-amber-300 font-mono text-[9px] transform rotate-[-2deg] space-y-1.5">
                  <p className="font-bold text-[8.5px]">❓ UNKNOWN INFORMATION — OPERATIVES:</p>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-12 h-14 bg-stone-200 rounded border border-stone-400 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/mugshots/ravi-shankar.jpg" alt="Manoj" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="w-12 h-14 bg-stone-200 rounded border border-stone-400 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/mugshots/deepak-shetty.jpg" alt="Deepak" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="text-[8px] text-stone-800 font-bold min-w-0">
                      <p>Manoj Reddy</p>
                      <p>Deepak Shetty</p>
                      <p className="text-amber-800">IMEI Tracking Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CENTER COLUMN (4 Cols): WANTED Poster + Seized Hardware + CCTNS Linked Cases ── */}
              <div className="md:col-span-4 space-y-3">
                {/* Centerpiece "WANTED BY POLICE" Poster */}
                <div
                  onMouseEnter={() => setHoveredNode('kingpin')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedEvidenceModal({
                    title: `WANTED NOTICE: ${selectedSyndicate.kingpin.name}`,
                    type: 'WANTED BULLETIN',
                    mugshot: selectedSyndicate.kingpin.mugshot,
                    content: `Wanted for organized gang offenses, vehicle theft, and conspiracy under IPC § 379, 392, 120B. Physical specs: Height 5'9", Age 34, Medium build. Last seen near ${selectedSyndicate.kingpin.last_location}. Reward declared: ${selectedSyndicate.kingpin.reward}.`,
                    date: 'CURRENT BULLETIN',
                    stamp: 'ACTIVE NBW WARRANT'
                  })}
                  className="bg-[#fffefb] text-stone-950 p-3.5 rounded shadow-2xl border-2 border-stone-400 text-center font-mono transform rotate-[-0.5deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  <div className="border-b-2 border-black pb-1 mb-1.5">
                    <h3 className="font-black text-base uppercase tracking-tight text-black">
                      ★ WANTED BY POLICE ★
                    </h3>
                    <p className="text-[8px] font-bold text-red-700 tracking-wider uppercase">
                      KARNATAKA STATE POLICE · CCTNS WATCHLIST
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-w-[190px] mx-auto">
                    <div className="relative aspect-square rounded overflow-hidden bg-stone-200 border border-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.kingpin.mugshot} alt={selectedSyndicate.kingpin.name} className="w-full h-full object-cover object-top" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/85 text-white text-[7.5px] font-bold py-0.5">
                        {selectedSyndicate.kingpin.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="relative aspect-square rounded overflow-hidden bg-stone-200 border border-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.lieutenants[0].mugshot} alt={selectedSyndicate.lieutenants[0].name} className="w-full h-full object-cover object-top" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/85 text-white text-[7.5px] font-bold py-0.5">
                        {selectedSyndicate.lieutenants[0].name.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-stone-900">
                      {selectedSyndicate.kingpin.name} & {selectedSyndicate.lieutenants[0].name}
                    </p>
                    <p className="text-[7.5px] text-red-700 font-bold">
                      THOUGHT TO BE ARMED AND DANGEROUS
                    </p>
                    <div className="bg-stone-100 p-1 rounded border border-stone-300 text-[8px] text-stone-700">
                      <strong className="text-stone-900">REWARD:</strong> <strong className="text-emerald-800">{selectedSyndicate.kingpin.reward}</strong>. Sighted near {selectedSyndicate.kingpin.last_location.split('—')[0]}.
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -right-2 bg-[#fef08a] text-stone-950 px-2 py-0.5 rounded shadow border border-amber-300 text-[8px] font-black uppercase transform rotate-[6deg] z-20">
                    ⚡ DANGEROUS!!!
                  </div>
                </div>

                {/* Center Forensic Hardware Seizure Docket */}
                <div
                  onMouseEnter={() => setHoveredNode('evidence')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedEvidenceModal({
                    title: 'EVIDENCE SEIZURE: RECOVERED JAMMERS & TOOLS',
                    type: 'SEIZED HARDWARE DOCKET',
                    content: `Recovered master 433MHz frequency jammer unit, OBD-II keyway code duplicator, and 14 blank smart keys from Yelahanka chopshop. Tampered chassis numbers confirmed by FSL forensics.`,
                    date: '01 Jun 2024',
                    stamp: 'SEIZED EVIDENCE #EV-4910'
                  })}
                  className="bg-[#eef2f6] text-stone-900 p-3 rounded shadow-xl border border-stone-300 font-mono text-[9px] transform rotate-[1deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-stone-300 pb-1 text-[8.5px] font-bold">
                    <span className="text-emerald-800">EVIDENCE SEIZURE</span>
                    <span className="text-red-700">#EV-4910-KSP</span>
                  </div>

                  <div className="pt-1.5 space-y-0.5 text-stone-800">
                    <p className="font-black text-stone-950">⚡ RECOVERED HARDWARE:</p>
                    <p>• 433MHz Master RF Jammer</p>
                    <p>• OBD-II smart-key duplicator & 14 blanks</p>
                    <p className="text-emerald-800 font-bold text-[8px]">FSL Forensics Confirmed</p>
                  </div>
                </div>

                {/* Center-Bottom FIR Quick-List on Board */}
                <div className="bg-[#f8fafc] text-stone-900 p-2.5 rounded shadow border border-slate-300 font-mono text-[8.5px] space-y-1">
                  <div className="font-bold text-slate-800 flex items-center justify-between border-b pb-0.5">
                    <span>LINKED CCTNS CASE FILES</span>
                    <span className="text-indigo-600 font-bold">{selectedSyndicate.connected_firs.length} Dockets</span>
                  </div>
                  {selectedSyndicate.connected_firs.slice(0, 2).map(fir => (
                    <div
                      key={fir.case_number}
                      onClick={() => handleCaseClick(fir.case_number)}
                      className="flex items-center justify-between hover:bg-slate-100 p-0.5 rounded cursor-pointer"
                    >
                      <span className="font-bold text-indigo-700">{fir.case_number}</span>
                      <span className="text-stone-500">{fir.crime}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT COLUMN (4 Cols): FASTag Toll + Polaroid Lieutenants Cluster + Police Gazette + Dossier 2 ── */}
              <div className="md:col-span-4 space-y-3">
                {/* 1. FASTag Toll Tag & Keyway Tools */}
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => setSelectedEvidenceModal({
                      title: 'FASTAG & HIGHWAY TRANSIT PASSES',
                      type: 'ELECTRONIC EVIDENCE ARTIFACT',
                      content: `Seized electronic RFID toll tags, FASTag toll passes, and parking cards associated with syndicate getaway vehicles.`,
                      date: '18 Jul 2026',
                      stamp: 'FASTAG SWEEP'
                    })}
                    className="flex-1 bg-[#1f2937] text-white p-2 rounded shadow-lg border border-stone-500 font-mono text-[8px] transform rotate-[-2deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                  >
                    <div className="flex items-center justify-between pb-0.5 border-b border-stone-600 text-amber-400 font-bold">
                      <span>FASTAG TOLL</span>
                      <Radio className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    <p className="pt-0.5 text-[7.5px] text-stone-300">TAG: 34161FA8829104</p>
                    <p className="text-emerald-400 text-[7.5px]">VEH: KA-01-MJ-8821</p>
                  </div>

                  <div
                    onClick={() => setSelectedEvidenceModal({
                      title: 'ATTIBELE TOLL BARRIER RECEIPT',
                      type: 'HIGHWAY TOLL EVIDENCE',
                      content: `Attibele Toll Plaza lane 4 recorded vehicle ${selectedSyndicate.kingpin.vehicle} passing at 23:42 hrs without stopping. Automatic barrier breach recorded.`,
                      date: '18 Jul 2026 23:42 hrs',
                      stamp: 'ANPR HIT'
                    })}
                    className="bg-[#f8f5ee] text-stone-950 p-2 rounded shadow border border-stone-300 font-mono text-[8px] transform rotate-[2deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                  >
                    <p className="font-bold text-red-700">#TL-8821</p>
                    <p className="text-[7.5px] text-stone-600">Attibele Toll</p>
                  </div>
                </div>

                {/* 2. Personal Facial Profile with Clustered Polaroids */}
                <div
                  onMouseEnter={() => setHoveredNode('lt-0')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="bg-[#faf8f4] text-stone-900 p-2.5 rounded shadow-xl border border-stone-300 font-mono text-xs transform rotate-[1deg] space-y-1.5"
                >
                  <div className="bg-[#e0f2fe] text-sky-950 p-1 rounded border border-sky-300 text-[8.5px] font-black flex items-center justify-between">
                    <span>PERSONAL FACIAL PROFILE</span>
                    <span className="text-sky-700">ANPR MATCH 98.4%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {selectedSyndicate.lieutenants.map((lt) => (
                      <div
                        key={lt.id}
                        onClick={() => setSelectedEvidenceModal({
                          title: `OPERATIVE DOSSIER: ${lt.name}`,
                          type: 'SYNDICATE LIEUTENANT PROFILE',
                          mugshot: lt.mugshot,
                          content: `Role: ${lt.role}. Sector: ${lt.district}. Assignment: ${lt.task}. Risk Rating: ${lt.risk_score}%.`,
                          date: 'ACTIVE FILE',
                          stamp: 'KEY ENFORCER'
                        })}
                        className="bg-white p-1 rounded border border-stone-300 text-center cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className="aspect-square rounded overflow-hidden bg-stone-200 border border-stone-300 mb-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={lt.mugshot} alt={lt.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <p className="font-extrabold text-[7.5px] uppercase truncate text-stone-900">{lt.name.split(' ')[0]}</p>
                        <p className="text-[6.5px] text-blue-700 font-bold truncate">{lt.district}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. The Police Gazette Article */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'THE POLICE GAZETTE / INVESTIGATION BULLETIN',
                    type: 'NEWSPAPER ARCHIVE SNIPPET',
                    content: `Press report covering the ongoing surveillance of inter-district supply chains along the Bengaluru-Raichur highway.`,
                    date: '28 May 2024',
                    stamp: 'INTELLIGENCE RECORD'
                  })}
                  className="bg-[#f5ede0] text-stone-900 p-2 rounded shadow border border-stone-400 font-serif text-[8px] transform rotate-[-1deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                >
                  <div className="border-b border-black pb-0.5 mb-0.5 text-center font-bold">
                    The Police Gazette · Intelligence Bulletin
                  </div>
                  <p className="font-bold text-[8.5px] uppercase leading-tight">
                    WHATEVER YOU DO, DO IT A HUNDRED PERCENT.
                  </p>
                  <p className="text-stone-700 text-[7.5px] mt-0.5 leading-snug">
                    Highway surveillance intensified at border checkposts across Raichur and Bidar.
                  </p>
                </div>

                {/* 4. Second CID Agent Profile Sheet */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: `KSP CID REVIEW PROGRAM — ${selectedSyndicate.lieutenants[2]?.name || 'FARID MIRZA'}`,
                    type: 'OFFICIAL POLICE DOSSIER',
                    mugshot: selectedSyndicate.lieutenants[2]?.mugshot || selectedSyndicate.lieutenants[0].mugshot,
                    content: `Subject ${selectedSyndicate.lieutenants[2]?.name || 'Farid Mirza'} identified as primary technical specialist and arms procurement lead for the syndicate.`,
                    date: '20 Jul 2024',
                    stamp: 'CID VERIFIED'
                  })}
                  className="bg-[#fbf9f4] text-stone-950 p-2.5 rounded shadow-xl border border-stone-300 font-mono text-xs transform rotate-[1.5deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                >
                  <div className="flex items-center gap-1 border-b border-stone-300 pb-0.5 text-[8.5px] font-bold uppercase text-stone-800">
                    <Shield className="w-3 h-3 text-stone-700" />
                    <span>KSP CID REVIEW PROGRAM</span>
                  </div>

                  <div className="flex gap-2 pt-1.5">
                    <div className="w-12 h-14 bg-stone-200 rounded border border-stone-300 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.lieutenants[2]?.mugshot || selectedSyndicate.lieutenants[0].mugshot} alt="Operative" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="text-[8px] space-y-0.5 min-w-0">
                      <p><strong className="text-stone-900">NAME:</strong> {(selectedSyndicate.lieutenants[2]?.name || 'Farid Mirza').split(' ')[0]}</p>
                      <p><strong className="text-stone-900">ROLE:</strong> Key Specialist</p>
                      <p><strong className="text-stone-900">RISK:</strong> <span className="text-red-700 font-bold">{selectedSyndicate.lieutenants[2]?.risk_score || 82}%</span></p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ── CCTNS CASE DOCKETS ROW (AT BOTTOM OF PINBOARD) ── */}
          <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-mono text-xs">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <Pin className="w-3.5 h-3.5 text-rose-500" />
                CCTNS LINKED CASE DOCKETS & EVIDENCE FILES ({selectedSyndicate.connected_firs.length})
              </span>
              <span className="text-[11px] text-slate-400 font-bold">CLICK FILE TO OPEN FULL CASE DOCKET</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedSyndicate.connected_firs.map((fir) => (
                <div
                  key={fir.case_number}
                  onClick={() => handleCaseClick(fir.case_number)}
                  className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-indigo-500 font-mono text-left cursor-pointer hover:scale-102 transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] border-b border-slate-200 dark:border-zinc-700 pb-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{fir.case_number}</span>
                    <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold rounded text-[8.5px]">
                      {fir.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white mt-1">{fir.crime}</p>
                  <p className="text-[10px] text-slate-500 truncate">{fir.station}</p>
                  {fir.note && (
                    <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-zinc-700 text-[10px] text-rose-600 dark:text-rose-400 font-semibold italic truncate">
                      ⚡ {fir.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: SYNDICATE CARDS WORKBENCH ── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3.5">
            {filteredSyndicates.map(syn => {
              const isSelected = selectedSyndicate.id === syn.id;
              return (
                <div
                  key={syn.id}
                  onClick={() => setSelectedSyndicate(syn)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative bg-white dark:bg-zinc-900 shadow-xs space-y-4 ${
                    isSelected
                      ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10'
                      : 'border-slate-200/90 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-mono">
                        {syn.category_label}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {syn.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60">
                        RISK {syn.risk_score}/100
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-medium">
                        {syn.connected_firs.length} Cases
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
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

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                        Specialized Cells ({syn.lieutenants.length})
                      </span>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex -space-x-2 overflow-hidden">
                          {syn.lieutenants.map(lt => (
                            <div key={lt.id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shrink-0 bg-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={lt.mugshot} alt={lt.name} className="w-full h-full object-cover object-top" />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                          {syn.lieutenants.map(l => l.name.split(' ')[0]).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    <strong className="text-slate-900 dark:text-white font-semibold">Modus Operandi:</strong> {syn.modus_operandi}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-xs truncate max-w-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                      <span>Investigation Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-mono block">
                  Target Syndicate Focus
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedSyndicate.name}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-300 dark:border-zinc-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedSyndicate.kingpin.mugshot}
                      alt={selectedSyndicate.kingpin.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedSyndicate.kingpin.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Alias: <span className="font-semibold text-slate-800 dark:text-slate-200">“{selectedSyndicate.kingpin.alias}”</span>
                    </p>
                    <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200/60 mt-1">
                      Risk Rating {selectedSyndicate.kingpin.risk_score}/100
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-zinc-700/60">
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Status:</strong> {selectedSyndicate.kingpin.status}</p>
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Vehicle:</strong> {selectedSyndicate.kingpin.vehicle}</p>
                  <p><strong className="text-slate-900 dark:text-white font-semibold">Last Sighted:</strong> {selectedSyndicate.kingpin.last_location}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Connected Case Dockets ({selectedSyndicate.connected_firs.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedSyndicate.connected_firs.map(fir => (
                    <div
                      key={fir.case_number}
                      onClick={() => handleCaseClick(fir.case_number)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{fir.case_number}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {fir.crime} · {fir.station}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                        {fir.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>COMMAND TACTICAL DIRECTIVE</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedSyndicate.tactical_action}
                </p>
              </div>

              <Link
                href="/dashboard/chat"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Query DRISHTI Copilot On This Gang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 3: STRATEGIC NEXUS MATRIX ── */}
      {viewMode === 'matrix' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Cross-District Criminal Syndicate Nexus Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Inter-state crime nexus, financial volume, corridor tracking & linked CCTNS evidence
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              5 Primary Rings • 51 Linked Case Dockets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="px-4 py-3.5 font-bold">Syndicate Network</th>
                  <th className="px-4 py-3.5 font-bold">Prime Kingpin</th>
                  <th className="px-4 py-3.5 font-bold">Financial Scale</th>
                  <th className="px-4 py-3.5 font-bold">Operating Corridor</th>
                  <th className="px-4 py-3.5 font-bold">Threat Level</th>
                  <th className="px-4 py-3.5 font-bold">Linked FIRs</th>
                  <th className="px-4 py-3.5 font-bold text-right">Dossier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {SYNDICATES.map((syn) => (
                  <tr key={syn.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: syn.color }} />
                        <span className="truncate max-w-xs">{syn.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={syn.kingpin.mugshot} alt={syn.kingpin.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{syn.kingpin.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">“{syn.kingpin.alias}”</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {syn.estimated_volume}
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate">
                      {syn.primary_corridor}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold font-mono ${
                        syn.threat_level === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                      }`}>
                        {syn.threat_level} ({syn.risk_score}%)
                      </span>
                    </td>

                    <td className="px-4 py-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {syn.connected_firs.length} Cases
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSyndicate(syn);
                          handleCaseClick(syn.connected_firs[0].case_number);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 font-bold text-xs transition-all cursor-pointer shadow-xs"
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

      {/* ── VIEW 4: PREDICTIVE INTERCEPTION MAP ── */}
      {viewMode === 'map' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
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
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 font-bold">
                MULTI-SOURCE INTEL SYNCED
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
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

      {/* ── EVIDENCE INSPECTOR LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {selectedEvidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1c1e22] border-2 border-stone-700 text-stone-100 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4 relative font-mono"
            >
              <button
                onClick={() => setSelectedEvidenceModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pb-3 border-b border-stone-700">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  {selectedEvidenceModal.type}
                </span>
                <h3 className="text-base font-bold text-white uppercase">
                  {selectedEvidenceModal.title}
                </h3>
              </div>

              {selectedEvidenceModal.mugshot && (
                <div className="w-32 h-32 mx-auto rounded overflow-hidden border-2 border-stone-600 bg-stone-900 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedEvidenceModal.mugshot} alt="Evidence" className="w-full h-full object-cover object-top" />
                </div>
              )}

              <div className="bg-[#121316] p-3.5 rounded-xl border border-stone-800 text-xs text-stone-300 leading-relaxed">
                <p>{selectedEvidenceModal.content}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
                <span>Date: {selectedEvidenceModal.date}</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedEvidenceModal.stamp}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedEvidenceModal(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
                >
                  Close Inspection
                </button>
                <Link
                  href="/dashboard/chat"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
                >
                  Cross-Examine with Co-Pilot
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD CLUE / PIN MODAL ── */}
      <AnimatePresence>
        {isAddPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e2024] border-2 border-stone-700 text-stone-100 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4 relative font-mono"
            >
              <button
                onClick={() => setIsAddPinModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pb-3 border-b border-stone-700">
                <h3 className="text-sm font-bold text-white uppercase">
                  📌 Pin Investigation Clue to Board
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Attach field observation or forensic clue to {selectedSyndicate.name}.
                </p>
              </div>

              <form onSubmit={handleAddCustomPin} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-stone-300 font-bold">Clue / Observation *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Sighted black Pulsar near Silk Board flyover at 23:15 hrs..."
                    value={newPinNote.text}
                    onChange={(e) => setNewPinNote({ ...newPinNote, text: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-stone-300 font-bold">Category Tag</label>
                    <select
                      value={newPinNote.tag}
                      onChange={(e) => setNewPinNote({ ...newPinNote, tag: e.target.value })}
                      className="w-full p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none"
                    >
                      <option value="ANPR HIT">ANPR HIT</option>
                      <option value="FIELD SIGHTING">FIELD SIGHTING</option>
                      <option value="WEAPON CLUE">WEAPON CLUE</option>
                      <option value="MULE ACCOUNT">MULE ACCOUNT</option>
                      <option value="INFORMER INTEL">INFORMER INTEL</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-300 font-bold">Officer Sign-Off</label>
                    <input
                      type="text"
                      value={newPinNote.author}
                      onChange={(e) => setNewPinNote({ ...newPinNote, author: e.target.value })}
                      className="w-full p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPinModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400"
                  >
                    Pin to Board
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INVESTIGATOR WALL SLIDE-OVER ── */}
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
