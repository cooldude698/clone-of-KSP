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
  HelpCircle, AlertCircle, Maximize2, Minimize2, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestigatorWall from '@/components/InvestigatorWall';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

// Dynamic import of Leaflet network map for the Map View tab
const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[580px] flex items-center justify-center text-slate-400 font-mono bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800">Calibrating Geo-Spatial Intelligence Grid…</div> }
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
      { id: 'SUS-4401', name: 'Deepak Shetty', alias: 'Chopshop Fence Lead', role: 'Chopshop Fence & Disposal Lead', risk_score: 75, district: 'Yelahanka', mugshot: '/mugshots/deepak-shetty.jpg', task: 'Runs Yelahanka auto scrap yard & engine dismantling' },
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
  const [viewMode, setViewMode] = useState('hierarchy'); // Default to Investigation Wall
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseData, setActiveCaseData] = useState(null);

  // Investigation Pinboard Interactive States
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState(null);
  const [customPins, setCustomPins] = useState([]);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [newPinNote, setNewPinNote] = useState({ text: '', author: 'Insp. V. Sharma', tag: 'ANPR HIT' });

  // Load custom pins from localStorage
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
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      color: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800'
    };
    const updated = [newPin, ...customPins];
    setCustomPins(updated);
    try {
      localStorage.setItem('ksp_custom_evidence_pins', JSON.stringify(updated));
    } catch (_) {}
    setIsAddPinModalOpen(false);
    setNewPinNote({ text: '', author: 'Insp. V. Sharma', tag: 'ANPR HIT' });
  };

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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 font-sans text-slate-900 dark:text-slate-100">
      
      {/* ── 1. TOP HEADER & TELEMETRY HUB ── */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0 shadow-md">
              <NetworkIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Criminal Syndicate & Gang Nexus
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 text-xs font-mono px-3 py-0.5 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  5 ACTIVE GANG RINGS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Karnataka State Police CCTNS · Multi-Hop Organized Crime Network & Detective Wall
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold self-start md:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'hierarchy', label: 'Investigation Wall', icon: Share2 },
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
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-700/60'
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Kingpins Tracked</span>
            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">5 High-Value</p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>100% Active ANPR Sweeps</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Key Lieutenants</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">11 Operatives</p>
          <p className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500">
            Chopshops, Mules & Couriers
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Correlated FIRs</span>
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">51 Indexed</p>
          <p className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Cross-District Verified
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Surveillance Nodes</span>
            <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">18 Chokepoints</p>
          <p className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500">
            Statewide Interceptor Grid
          </p>
        </div>
      </div>

      {/* ── 3. FILTER BAR (CARDS & MATRIX VIEW) ── */}
      {viewMode !== 'hierarchy' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search syndicate, kingpin, or corridor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>
      )}

      {/* ── 4. VIEW 1: MOVIE-STYLE DETECTIVE INVESTIGATION WALL (ROUNDED CARDS + DYNAMIC RED STRINGS) ── */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-4">
          {/* Top Control Bar for Detective Board */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-red-600/50 shadow-md animate-pulse" />
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 block">
                  Active Criminal Syndicate Target
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedSyndicate.name}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Target Syndicate Selector */}
              <div className="relative">
                <select
                  value={selectedSyndicate.id}
                  onChange={(e) => {
                    const s = SYNDICATES.find(syn => syn.id === e.target.value);
                    if (s) setSelectedSyndicate(s);
                  }}
                  className="pl-3.5 pr-8 py-2 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none shadow-xs"
                >
                  {SYNDICATES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* + Pin Clue Button */}
              <button
                onClick={() => setIsAddPinModalOpen(true)}
                className="py-2 px-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pin Field Clue</span>
              </button>
            </div>
          </div>

          {/* ── CINEMATIC BULLETIN WALL CANVAS ── */}
          <div className="relative w-full p-6 sm:p-10 rounded-3xl bg-[#1a1d24] border border-slate-800 shadow-2xl overflow-hidden select-none">
            
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#2e323b_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none z-0" />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] pointer-events-none z-0" />

            {/* ── DYNAMIC SVG RED YARN STRINGS LAYER ── */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="yarnShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
                </filter>
                <filter id="yarnGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* String 1: Kingpin -> Left Dossier */}
              <path
                d="M 50% 190 Q 30% 140, 16% 160"
                stroke={hoveredNode === 'kingpin' || hoveredNode === 'dossier' ? '#ff3333' : '#dc2626'}
                strokeWidth={hoveredNode === 'kingpin' || hoveredNode === 'dossier' ? '3.5' : '2.5'}
                strokeDasharray="8,2"
                filter={hoveredNode === 'kingpin' ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
                className="transition-all duration-300"
              />

              {/* String 2: Kingpin -> Right Escape Corridor Map */}
              <path
                d="M 50% 190 Q 70% 130, 84% 160"
                stroke={hoveredNode === 'kingpin' || hoveredNode === 'map' ? '#ff3333' : '#dc2626'}
                strokeWidth={hoveredNode === 'kingpin' || hoveredNode === 'map' ? '3.5' : '2.5'}
                strokeDasharray="8,2"
                filter={hoveredNode === 'kingpin' ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
                className="transition-all duration-300"
              />

              {/* String 3: Kingpin -> Left Lt (Deepak Shetty) */}
              <path
                d="M 50% 190 Q 32% 380, 18% 540"
                stroke={hoveredNode === 'lt-0' || hoveredNode === 'kingpin' ? '#ff2222' : '#dc2626'}
                strokeWidth={hoveredNode === 'lt-0' ? '4' : '2.5'}
                strokeDasharray="10,2"
                filter={hoveredNode === 'lt-0' ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
              />

              {/* String 4: Kingpin -> Mid Lt (Manoj Reddy) */}
              <path
                d="M 50% 190 Q 50% 380, 50% 540"
                stroke={hoveredNode === 'lt-1' || hoveredNode === 'kingpin' ? '#ff2222' : '#dc2626'}
                strokeWidth={hoveredNode === 'lt-1' ? '4' : '2.5'}
                strokeDasharray="10,2"
                filter={hoveredNode === 'lt-1' ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
              />

              {/* String 5: Kingpin -> Right Lt (Farid Mirza) */}
              <path
                d="M 50% 190 Q 68% 380, 82% 540"
                stroke={hoveredNode === 'lt-2' || hoveredNode === 'kingpin' ? '#ff2222' : '#dc2626'}
                strokeWidth={hoveredNode === 'lt-2' ? '4' : '2.5'}
                strokeDasharray="10,2"
                filter={hoveredNode === 'lt-2' ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
              />

              {/* Strings from Lieutenants down to FIRs */}
              <path d="M 18% 660 Q 15% 730, 14% 790" stroke="#b91c1c" strokeWidth="2" strokeDasharray="5,2" filter="url(#yarnShadow)" />
              <path d="M 50% 660 Q 42% 730, 38% 790" stroke="#b91c1c" strokeWidth="2" strokeDasharray="5,2" filter="url(#yarnShadow)" />
              <path d="M 50% 660 Q 58% 730, 62% 790" stroke="#b91c1c" strokeWidth="2" strokeDasharray="5,2" filter="url(#yarnShadow)" />
              <path d="M 82% 660 Q 84% 730, 86% 790" stroke="#b91c1c" strokeWidth="2" strokeDasharray="5,2" filter="url(#yarnShadow)" />
            </svg>

            {/* ── TIER 1 (TOP SECTION): DOSSIER, MAIN WANTED POSTER & CORRIDOR MAP ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-20 items-start pb-8">
              
              {/* Top Left: Rounded Police Intel Sheet */}
              <div
                onMouseEnter={() => setHoveredNode('dossier')}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedEvidenceModal({
                  title: 'KSP CID OFFICIAL DOSSIER RECORD',
                  type: 'OFFICIAL DOCUMENT',
                  content: `Subject ${selectedSyndicate.kingpin.name} (Alias: "${selectedSyndicate.kingpin.alias}") classified under High-Recidivism Organized Gang Index. Operating corridor: ${selectedSyndicate.primary_corridor}. Verified CCTNS ID: ${selectedSyndicate.kingpin.id}.`,
                  date: '24 Nov 2024',
                  stamp: 'CONFIDENTIAL CCTNS'
                })}
                className="md:col-span-3 bg-white text-slate-900 p-5 rounded-3xl shadow-xl border border-slate-200/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer relative space-y-3"
              >
                {/* Silver Metal Pushpin */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-slate-600 to-slate-200 border-2 border-slate-400 shadow-md" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-mono">
                    CONFIDENTIAL CCTNS
                  </span>
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                    POLICE INTEL DOSSIER
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedSyndicate.kingpin.id}
                  </p>
                </div>
                
                <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                  <p><strong className="text-slate-900">Name:</strong> {selectedSyndicate.kingpin.name}</p>
                  <p><strong className="text-slate-900">Threat:</strong> <span className="text-rose-600 font-bold">{selectedSyndicate.threat_level} ({selectedSyndicate.risk_score}%)</span></p>
                  <p><strong className="text-slate-900">Territory:</strong> {selectedSyndicate.districts.join(', ')}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sign: Insp. V. Sharma</span>
                  <span className="text-indigo-600 font-semibold font-mono">VERIFIED</span>
                </div>
              </div>

              {/* Center: Large Rounded "WANTED BY POLICE" Poster (Main Kingpin) */}
              <div
                onMouseEnter={() => setHoveredNode('kingpin')}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedEvidenceModal({
                  title: `WANTED NOTICE: ${selectedSyndicate.kingpin.name}`,
                  type: 'WANTED BULLETIN',
                  mugshot: selectedSyndicate.kingpin.mugshot,
                  content: `Wanted in connection with multi-district organized offenses. Associated vehicle: ${selectedSyndicate.kingpin.vehicle}. Last verified sighting: ${selectedSyndicate.kingpin.last_location}. Reward declared: ${selectedSyndicate.kingpin.reward}.`,
                  date: 'CURRENT BULLETIN',
                  stamp: 'ACTIVE NBW WARRANT'
                })}
                className="md:col-span-6 bg-white text-slate-900 p-6 rounded-3xl shadow-2xl border-2 border-slate-200 hover:shadow-2xl hover:scale-101 transition-all duration-200 cursor-pointer relative max-w-md mx-auto w-full text-center space-y-4"
              >
                {/* Big Red Shiny Pushpin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-red-900 via-red-600 to-red-400 border-2 border-red-300 shadow-xl z-30" />

                {/* Poster Header */}
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-extrabold text-lg sm:text-xl uppercase tracking-wider text-slate-900 font-mono">
                    ★ WANTED BY POLICE ★
                  </h3>
                  <p className="text-[10.5px] font-bold text-rose-600 tracking-wider uppercase font-mono mt-0.5">
                    KARNATAKA STATE POLICE · CCTNS WATCHLIST
                  </p>
                </div>

                {/* Mugshot Frame with Rounded Borders */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-300 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedSyndicate.kingpin.mugshot}
                    alt={selectedSyndicate.kingpin.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute bottom-2 right-2 bg-rose-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase shadow">
                    PRIME KINGPIN
                  </span>
                </div>

                {/* Kingpin Identity */}
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">
                    {selectedSyndicate.kingpin.name}
                  </h4>
                  <p className="text-xs text-rose-600 font-bold font-mono">
                    KNOWN ALIAS: &quot;{selectedSyndicate.kingpin.alias}&quot;
                  </p>
                  
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-left text-xs text-slate-600">
                    <p><strong className="text-slate-900">Reward:</strong> <span className="font-bold text-emerald-600 font-mono">{selectedSyndicate.kingpin.reward}</span></p>
                    <p className="truncate"><strong className="text-slate-900">Vehicle:</strong> {selectedSyndicate.kingpin.vehicle.split('(')[0]}</p>
                  </div>
                </div>

                {/* Pinned Sighting Pill */}
                <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-semibold text-left flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Last Sighted: {selectedSyndicate.kingpin.last_location.split('—')[0]}</span>
                </div>
              </div>

              {/* Top Right: Rounded Escape Corridor Telemetry Map */}
              <div
                onMouseEnter={() => setHoveredNode('map')}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedEvidenceModal({
                  title: 'PREDICTED ESCAPE CORRIDOR & CHOKEPOINT GRID',
                  type: 'CORRIDOR MAPPING',
                  content: `Primary Transit: ${selectedSyndicate.primary_corridor}. Predicted Path: ${selectedSyndicate.predicted_escape_route}. Active ANPR Intercept Nodes: ${selectedSyndicate.anpr_chokepoints.join(', ')}.`,
                  date: 'LIVE CALIBRATION',
                  stamp: 'FASTAG / ANPR GRID'
                })}
                className="md:col-span-3 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white p-5 rounded-3xl shadow-xl border border-slate-200/80 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer relative space-y-3"
              >
                {/* Yellow Pushpin */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border-2 border-amber-500 shadow-md" />
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 text-xs font-bold">
                  <span className="text-slate-900 dark:text-white font-mono uppercase text-[11px]">TRANSIT CORRIDOR</span>
                  <Navigation className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                </div>

                {/* Map Vector Graphic */}
                <div className="h-28 bg-slate-900 text-white rounded-2xl p-3 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:8px_8px]" />
                  
                  {/* Route Polyline */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold">
                    <span className="bg-rose-900 text-rose-200 px-2 py-0.5 rounded-lg">NODE A</span>
                    <span className="text-amber-400">──▶</span>
                    <span className="bg-amber-900 text-amber-200 px-2 py-0.5 rounded-lg">TOLL</span>
                    <span className="text-amber-400">──▶</span>
                    <span className="bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-lg">YARD</span>
                  </div>

                  <p className="relative z-10 text-[10px] text-slate-300 line-clamp-2">
                    Route: <span className="text-white font-bold">{selectedSyndicate.predicted_escape_route}</span>
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>ANPR Hits: 2 Verified</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">GRID SYNC</span>
                </div>
              </div>

            </div>

            {/* ── TIER 2: FORENSIC EVIDENCE & ANPR TILES ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-20 pb-8 max-w-3xl mx-auto">
              
              {/* Forensic Fingerprint AFIS Card */}
              <div
                onClick={() => setSelectedEvidenceModal({
                  title: 'LATENT BIOMETRIC FINGERPRINT MATCH',
                  type: 'FORENSIC SCIENCE LAB EVIDENCE',
                  content: `Latent fingerprints lifted from ignition lock and frequency jammer casing matched subject ${selectedSyndicate.kingpin.name} with 98.4% AFIS algorithm confidence.`,
                  date: '18 Jul 2026',
                  stamp: 'FSL CONFIRMED MATCH'
                })}
                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-lg border border-slate-200/80 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer relative space-y-2"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 border border-emerald-300 shadow-md" />
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-zinc-800">
                  <span className="font-mono text-[10px] uppercase">FORENSIC LAB REPORT</span>
                  <span className="text-rose-600 font-mono text-[10px]">#EV-9021-FSL</span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                    <Fingerprint className="w-7 h-7" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">AFIS Latent Match: 98.4%</p>
                    <p className="text-slate-500 text-[11px] truncate">Stolen vehicle steering & jammer casing</p>
                    <p className="text-emerald-600 font-semibold text-[11px] mt-0.5">Matched: {selectedSyndicate.kingpin.name}</p>
                  </div>
                </div>
              </div>

              {/* CCTV Camera Snapshot Still */}
              <div
                onClick={() => setSelectedEvidenceModal({
                  title: 'ANPR SURVEILLANCE CAMERA INTERCEPT',
                  type: 'CCTV SURVEILLANCE STILL',
                  content: `Camera CAM-BLR-0045 recorded vehicle ${selectedSyndicate.kingpin.vehicle} passing Silk Board TTMC at high speed. Facial match algorithm flagged subject with 98.4% confidence score.`,
                  date: '18 Jul 2026 14:22 hrs',
                  stamp: 'ANPR TIME-STAMPED'
                })}
                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-lg border border-slate-200/80 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer relative space-y-2"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-300 border border-cyan-400 shadow-md" />
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-zinc-800">
                  <span className="font-mono text-[10px] uppercase">ANPR CAMERA FEED</span>
                  <span className="text-rose-600 font-mono text-[10px]">REC ● 14:22:10</span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/60 rounded-2xl flex items-center justify-center text-cyan-600 shrink-0">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">CAM-BLR-0045 @ Silk Board</p>
                    <p className="text-slate-500 text-[11px] truncate">Plate: KA-01-MJ-8821</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] mt-0.5">Biometric Match: 98.4%</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── TIER 3: KEY LIEUTENANTS ROUNDED CARDS ── */}
            <div className="relative z-20 pb-8">
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="h-px w-16 bg-slate-700" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest text-amber-400 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700 shadow-md">
                  OPERATIONAL LIEUTENANTS ({selectedSyndicate.lieutenants.length})
                </span>
                <span className="h-px w-16 bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {selectedSyndicate.lieutenants.map((lt, idx) => (
                  <div
                    key={lt.id}
                    onMouseEnter={() => setHoveredNode(`lt-${idx}`)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedEvidenceModal({
                      title: `LIEUTENANT DOSSIER: ${lt.name}`,
                      type: 'SYNDICATE OPERATIVE PROFILE',
                      mugshot: lt.mugshot,
                      content: `Role: ${lt.role}. Operational Area: ${lt.district}. Assignment: ${lt.task}. Risk Score: ${lt.risk_score}%.`,
                      date: 'ACTIVE FILE',
                      stamp: 'KEY ENFORCER'
                    })}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    {/* Pushpin */}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 shadow-lg border border-amber-200 z-30 -mb-2.5 group-hover:scale-110 transition-transform" />
                    
                    {/* Rounded Card */}
                    <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white p-4 rounded-3xl shadow-xl border border-slate-200/80 dark:border-zinc-800 w-full group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-200 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={lt.mugshot}
                            alt={lt.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 text-left">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">{lt.name}</h5>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate">{lt.role}</p>
                          <span className="inline-block mt-1 text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold px-2 py-0.2 rounded-full font-mono border border-rose-200/60">
                            Risk {lt.risk_score}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {lt.task}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Sector: {lt.district}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">LINKED</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── TIER 4: CCTNS FIR CASE DOCKETS ── */}
            <div className="relative z-20 pt-2">
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="h-px w-16 bg-slate-700" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-400 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700 shadow-md">
                  SEIZED EVIDENCE & CCTNS CASE DOCKETS ({selectedSyndicate.connected_firs.length})
                </span>
                <span className="h-px w-16 bg-slate-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {selectedSyndicate.connected_firs.map((fir, idx) => (
                  <div
                    key={fir.case_number}
                    onClick={() => handleCaseClick(fir.case_number)}
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    {/* Green Pushpin */}
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 shadow-md border border-emerald-200 z-30 -mb-2 group-hover:scale-115 transition-transform" />
                    
                    {/* Rounded Manila Docket */}
                    <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white p-4 rounded-3xl shadow-lg border border-slate-200/80 dark:border-zinc-800 w-full hover:bg-slate-50 dark:hover:bg-zinc-800/80 space-y-2 text-left transform group-hover:-translate-y-1.5 transition-all">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{fir.case_number}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold rounded-full text-[10px]">
                          {fir.status}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{fir.crime}</p>
                      <p className="text-[11px] text-slate-500 truncate">{fir.station}</p>
                      
                      {fir.note && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-snug">
                          ⚡ {fir.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CUSTOM USER PINNED NOTES ROW ── */}
            {customPins.length > 0 && (
              <div className="relative z-20 pt-8 max-w-5xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                    Investigating Officer Field Annotations ({customPins.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {customPins.map(pin => (
                    <div
                      key={pin.id}
                      className={`${pin.color || 'bg-amber-50 dark:bg-amber-950/60'} text-slate-900 dark:text-white p-3.5 rounded-2xl shadow-md border border-amber-200 dark:border-amber-800 text-xs max-w-xs space-y-1`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pb-1 border-b border-amber-200/60 dark:border-amber-800">
                        <span>{pin.tag}</span>
                        <span>{pin.date}</span>
                      </div>
                      <p className="font-semibold leading-relaxed">{pin.text}</p>
                      <p className="text-[10.5px] text-slate-500 italic">— {pin.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 5. VIEW 2: SYNDICATE CARDS WORKBENCH ── */}
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
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative bg-white dark:bg-zinc-900 shadow-sm space-y-4 ${
                    isSelected
                      ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10'
                      : 'border-slate-200/90 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-mono">
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

                  {/* Kingpin & Lieutenants Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Kingpin Capsule */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
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
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5">
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

                  {/* Modus Operandi Narrative */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    <strong className="text-slate-900 dark:text-white font-semibold">Modus Operandi:</strong> {syn.modus_operandi}
                  </p>

                  {/* Corridor Footer */}
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
                      <span>Investigation Wall</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Syndicate Focus Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-mono block">
                  Target Syndicate Focus
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedSyndicate.name}
                </h3>
              </div>

              {/* Kingpin Spotlight */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-300 dark:border-zinc-600">
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

              {/* Connected CCTNS Cases */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                  Connected Case Dockets ({selectedSyndicate.connected_firs.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedSyndicate.connected_firs.map(fir => (
                    <div
                      key={fir.case_number}
                      onClick={() => handleCaseClick(fir.case_number)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
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
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                        {fir.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Directives */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>COMMAND TACTICAL DIRECTIVE</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedSyndicate.tactical_action}
                </p>
              </div>

              {/* Deep Link to Co-Pilot Chat */}
              <Link
                href="/dashboard/chat"
                className="w-full py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Query DRISHTI Copilot On This Gang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. VIEW 3: STRATEGIC NEXUS MATRIX (CLEAN MODERN LEDGER) ── */}
      {viewMode === 'matrix' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-4">
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
                    {/* Syndicate Name */}
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: syn.color }} />
                        <span className="truncate max-w-xs">{syn.name}</span>
                      </div>
                    </td>

                    {/* Kingpin with Mugshot */}
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

                    {/* Financial Scale */}
                    <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {syn.estimated_volume}
                    </td>

                    {/* Corridor */}
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate">
                      {syn.primary_corridor}
                    </td>

                    {/* Threat Pill */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold font-mono ${
                        syn.threat_level === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                      }`}>
                        {syn.threat_level} ({syn.risk_score}%)
                      </span>
                    </td>

                    {/* Linked FIRs */}
                    <td className="px-4 py-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {syn.connected_firs.length} Cases
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSyndicate(syn);
                          handleCaseClick(syn.connected_firs[0].case_number);
                        }}
                        className="px-3.5 py-1.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 font-bold text-xs transition-all cursor-pointer shadow-xs"
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
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-4">
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
              <span className="px-3 py-1 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 font-bold">
                MULTI-SOURCE INTEL SYNCED
              </span>
            </div>
          </div>

          {/* Predictive Route Highlights Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
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
          <div className="h-[580px] rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800">
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

      {/* ── 8. EVIDENCE INSPECTOR LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {selectedEvidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4 relative"
            >
              <button
                onClick={() => setSelectedEvidenceModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono block">
                  {selectedEvidenceModal.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedEvidenceModal.title}
                </h3>
              </div>

              {selectedEvidenceModal.mugshot && (
                <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-zinc-700 bg-slate-100 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedEvidenceModal.mugshot} alt="Evidence" className="w-full h-full object-cover object-top" />
                </div>
              )}

              <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>{selectedEvidenceModal.content}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-zinc-800 font-mono">
                <span>Date: {selectedEvidenceModal.date}</span>
                <span className="text-emerald-600 font-bold uppercase">{selectedEvidenceModal.stamp}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedEvidenceModal(null)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Close Inspection
                </button>
                <Link
                  href="/dashboard/chat"
                  className="px-4 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-indigo-600 text-xs font-bold"
                >
                  Cross-Examine with Co-Pilot
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 9. ADD CLUE / PIN MODAL ── */}
      <AnimatePresence>
        {isAddPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 relative"
            >
              <button
                onClick={() => setIsAddPinModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono">
                  📌 Pin Investigation Clue to Wall
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach field observation or forensic clue to {selectedSyndicate.name}.
                </p>
              </div>

              <form onSubmit={handleAddCustomPin} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">Clue / Observation *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Sighted black Pulsar near Silk Board flyover at 23:15 hrs..."
                    value={newPinNote.text}
                    onChange={(e) => setNewPinNote({ ...newPinNote, text: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-bold">Category Tag</label>
                    <select
                      value={newPinNote.tag}
                      onChange={(e) => setNewPinNote({ ...newPinNote, tag: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ANPR HIT">ANPR HIT</option>
                      <option value="FIELD SIGHTING">FIELD SIGHTING</option>
                      <option value="WEAPON CLUE">WEAPON CLUE</option>
                      <option value="MULE ACCOUNT">MULE ACCOUNT</option>
                      <option value="INFORMER INTEL">INFORMER INTEL</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 dark:text-slate-300 font-bold">Officer Sign-Off</label>
                    <input
                      type="text"
                      value={newPinNote.author}
                      onChange={(e) => setNewPinNote({ ...newPinNote, author: e.target.value })}
                      className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPinModalOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold hover:bg-indigo-600"
                  >
                    Pin to Board
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 10. INVESTIGATOR WALL SLIDE-OVER ── */}
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
