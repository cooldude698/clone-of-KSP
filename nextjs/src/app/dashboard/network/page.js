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
  Key, Film, Disc, Newspaper, Printer, Trash2, StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestigatorWall from '@/components/InvestigatorWall';
import { DEMO_FIRS } from '@/lib/demo-data';
import { getFIRFromStore } from '@/lib/fir-store';

// Dynamic import of Leaflet network map (2D fallback)
const NetworkMapView = dynamic(
  () => import('./NetworkMapView'),
  { ssr: false, loading: () => <div className="h-[580px] flex items-center justify-center text-slate-400 font-mono bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800">Calibrating Geo-Spatial Intelligence Grid…</div> }
);

// Dynamic import of 3D MapLibre GL network map (default)
const NetworkMapView3D = dynamic(
  () => import('./NetworkMapView3D'),
  { ssr: false, loading: () => (
    <div className="h-[580px] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs bg-[#f8f5f0] rounded-2xl border border-slate-200">
      <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
      <span>Initialising 3D Tactical Grid…</span>
    </div>
  )}
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
  const [isMap3D, setIsMap3D] = useState(true); // default: 3D city view

  // Evidence Inspector Lightbox Modal
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState(null);
  
  // Custom Officer Pinned Details & Clues
  const [customPins, setCustomPins] = useState([
    {
      id: 'INIT-CLUE-1',
      text: 'ANPR camera hit at Attibele Checkpost at 23:42 hrs (KA-01-MJ-8821).',
      author: 'Insp. V. Sharma',
      tag: 'ANPR HIT',
      date: '29 Aug',
      rotation: 'rotate-[-3deg]',
      color: 'bg-[#fef9c3] border-amber-300 text-stone-900'
    },
    {
      id: 'INIT-CLUE-2',
      text: 'Informer reports second chopshop active near Raichur Industrial fringe.',
      author: 'SI M. Gowda',
      tag: 'INFORMER INTEL',
      date: '29 Aug',
      rotation: 'rotate-[2.5deg]',
      color: 'bg-[#dbeafe] border-sky-300 text-stone-900'
    }
  ]);
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false);
  const [newPinNote, setNewPinNote] = useState({ text: '', author: 'Insp. V. Sharma', tag: 'ANPR HIT' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ksp_custom_evidence_pins_v2');
      if (stored) setCustomPins(JSON.parse(stored));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || params.get('view');
        if (tab === 'routes' || tab === 'predictive_routes' || tab === 'map') {
          setViewMode('map');
        } else if (tab === 'matrix' || tab === 'nexus_matrix') {
          setViewMode('matrix');
        } else if (tab === 'syndicates' || tab === 'cards' || tab === 'grid') {
          setViewMode('grid');
        } else if (tab === 'wall' || tab === 'hierarchy') {
          setViewMode('hierarchy');
        }
      }
    } catch (_) {}
  }, []);

  const handleAddCustomPin = (e) => {
    e.preventDefault();
    if (!newPinNote.text.trim()) return;
    const rotations = ['rotate-[-4deg]', 'rotate-[3deg]', 'rotate-[-2.5deg]', 'rotate-[4.5deg]', 'rotate-[-1.5deg]'];
    const colors = [
      'bg-[#fef9c3] border-amber-300 text-stone-900', // Yellow sticky
      'bg-[#dbeafe] border-sky-300 text-stone-900',   // Sky blue
      'bg-[#fee2e2] border-rose-300 text-stone-900',  // Rose pink
      'bg-[#dcfce7] border-emerald-300 text-stone-900' // Pale green
    ];
    const newPin = {
      id: `CUSTOM-PIN-${Date.now()}`,
      text: newPinNote.text,
      author: newPinNote.author || 'Investigating Officer',
      tag: newPinNote.tag || 'FIELD CLUE',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      rotation: rotations[Math.floor(Math.random() * rotations.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    const updated = [newPin, ...customPins];
    setCustomPins(updated);
    try {
      localStorage.setItem('ksp_custom_evidence_pins_v2', JSON.stringify(updated));
    } catch (_) {}
    setIsAddPinModalOpen(false);
    setNewPinNote({ text: '', author: 'Insp. V. Sharma', tag: 'ANPR HIT' });
  };

  const handleDeleteCustomPin = (id) => {
    const updated = customPins.filter(p => p.id !== id);
    setCustomPins(updated);
    try {
      localStorage.setItem('ksp_custom_evidence_pins_v2', JSON.stringify(updated));
    } catch (_) {}
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
              <Newspaper className="w-5 h-5" />
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
                Karnataka State Police CCTNS · Decorated Detective Evidence Wall & Crime Dispatch
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold self-start md:self-auto">
            {[
              { id: 'hierarchy', label: 'Investigation Wall', icon: Newspaper },
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

      {/* ── VIEW 1: ORGANIC, CRISS-CROSSED, DECORATED NEWSPAPER INVESTIGATION WALL ── */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-4">
          
          {/* Target Syndicate Selector Bar & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1e2024] text-stone-200 px-4 py-2.5 rounded-xl border border-stone-700 shadow-md font-mono">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-amber-500/70 shadow-sm animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-amber-400">ACTIVE INVESTIGATION WALL:</span>
                <span className="font-bold text-white">{selectedSyndicate.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSyndicate.id}
                onChange={(e) => {
                  const s = SYNDICATES.find(syn => syn.id === e.target.value);
                  if (s) setSelectedSyndicate(s);
                }}
                className="px-2.5 py-1.5 rounded bg-stone-900 border border-stone-600 text-xs font-bold text-stone-100 focus:outline-none cursor-pointer"
              >
                {SYNDICATES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                onClick={() => setIsAddPinModalOpen(true)}
                className="py-1.5 px-3.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Pin Detail / Clue</span>
              </button>
            </div>
          </div>

          {/* ── THE ORGANIC DECORATED NEWSPAPER EVIDENCE WALL (CRISS-CROSSED, ANGLE-ROTATED, LAYERED) ── */}
          <div className="relative w-full rounded-3xl bg-[#e6ddcd] dark:bg-[#181a1d] border-[10px] border-[#2b2722] p-5 sm:p-8 shadow-2xl overflow-hidden select-none">
            
            {/* Vintage Newsprint Paper Texture with Halftone Grain */}
            <div className="absolute inset-0 bg-[radial-gradient(#8d7d65_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none z-0" />
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.3)] pointer-events-none z-0" />

            {/* Top Newspaper Masthead Strip (Taped across the top) */}
            <div className="relative z-10 bg-[#f4eee2] dark:bg-[#202328] p-3 rounded-lg border-2 border-stone-500 shadow-md text-center transform rotate-[-0.5deg] mb-6">
              {/* Scotch Tape at corners */}
              <div className="absolute -top-2 left-6 w-16 h-4 bg-amber-100/60 backdrop-blur-xs border border-amber-300/40 rounded-xs shadow-xs transform rotate-[-2deg]" />
              <div className="absolute -top-2 right-6 w-16 h-4 bg-amber-100/60 backdrop-blur-xs border border-amber-300/40 rounded-xs shadow-xs transform rotate-[2deg]" />
              
              <div className="flex items-center justify-between text-[9px] font-mono text-stone-600 dark:text-stone-400 border-b border-stone-400 pb-0.5 uppercase tracking-wider">
                <span>VOL. LXXIV NO. 28,491</span>
                <span className="font-bold text-stone-900 dark:text-white">BENGALURU, KARNATAKA · STATE CRIME DISPATCH</span>
                <span>EXCLUSIVE CCTNS INVESTIGATION</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-serif tracking-tight uppercase text-stone-900 dark:text-stone-100 py-0.5">
                THE KARNATAKA POLICE GAZETTE
              </h2>
              <div className="border-t border-stone-400 pt-0.5 text-[10px] font-mono font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">
                ★ ACTIVE CROSS-DISTRICT CRIMINAL SYNDICATE INVESTIGATION WALL ★
              </div>
            </div>

            {/* ── CRISS-CROSSING DECORATED ARTIFACT COLLAGE ── */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* ── LEFT CLUSTER (4 Cols): Angled Dossier + Torn Deccan Chronicle Article + Radar Still ── */}
              <div className="md:col-span-4 space-y-4">
                
                {/* 1. Official CID Suspect Profile (Angled & Pinned with Paperclip) */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'KSP CID REVIEW PROGRAM — SUBJECT AGENT PROFILE',
                    type: 'OFFICIAL POLICE DOSSIER',
                    mugshot: selectedSyndicate.kingpin.mugshot,
                    content: `Subject ${selectedSyndicate.kingpin.name} (Alias: "${selectedSyndicate.kingpin.alias}") classified under CCTNS Organized Crime Index. Operating Corridor: ${selectedSyndicate.primary_corridor}. Threat Level: ${selectedSyndicate.threat_level} (${selectedSyndicate.risk_score}%). Multiple non-bailable warrants pending execution across 3 districts.`,
                    date: '24 Nov 2024',
                    stamp: 'VERIFIED CCTNS'
                  })}
                  className="bg-[#fcfaf5] dark:bg-[#1f2227] text-stone-950 dark:text-stone-100 p-3.5 rounded shadow-xl border border-stone-400 font-mono text-xs transform rotate-[-3.5deg] cursor-pointer hover:rotate-0 hover:scale-103 transition-all relative"
                >
                  {/* Red Pin Top Left */}
                  <div className="absolute -top-2 left-4 w-4 h-4 rounded-full bg-gradient-to-tr from-red-800 to-red-400 border border-white shadow-md z-30" />
                  {/* Paperclip Top Right */}
                  <div className="absolute -top-2 right-4 w-3 h-6 border-2 border-stone-500 rounded-full opacity-70 z-30" />

                  <div className="flex items-center justify-between border-b border-stone-300 pb-1 text-[8.5px] font-bold uppercase text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-stone-700" /> KSP CID REVIEW PROGRAM</span>
                    <span className="bg-red-700 text-white px-1 py-0.2 rounded text-[7.5px]">CONFIDENTIAL</span>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <div className="w-14 h-16 bg-stone-200 dark:bg-stone-800 rounded border border-stone-400 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.kingpin.mugshot} alt="Kingpin" className="w-full h-full object-cover object-top filter grayscale contrast-125" />
                    </div>
                    <div className="text-[9px] space-y-0.5 min-w-0">
                      <p><strong className="text-stone-900 dark:text-white">NAME:</strong> {selectedSyndicate.kingpin.name}</p>
                      <p><strong className="text-stone-900 dark:text-white">ALIAS:</strong> “{selectedSyndicate.kingpin.alias}”</p>
                      <p><strong className="text-stone-900 dark:text-white">ID:</strong> {selectedSyndicate.kingpin.id}</p>
                      <p><strong className="text-stone-900 dark:text-white">THREAT:</strong> <span className="text-red-700 dark:text-red-400 font-bold">{selectedSyndicate.threat_level}</span></p>
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-stone-300 dark:border-stone-700 text-[8px] text-stone-600 dark:text-stone-400 flex items-center justify-between">
                    <span>Insp. V. Sharma</span>
                    <span className="font-bold text-red-700 border border-red-700 px-1">CCTNS VERIFIED</span>
                  </div>
                </div>

                {/* 2. Torn Deccan Chronicle Newspaper Article (Angled Criss-Cross) */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'THE DECCAN CHRONICLE — CRIME SPECIAL EDITION',
                    type: 'NEWSPAPER ARCHIVE PRESS CLIPPING',
                    content: `Special Squad cracks inter-district vehicle theft racket in midnight sweep. 42 vehicles recovered across Bengaluru, Raichur, and Bidar corridors. Master electronic bypass devices seized from Yelahanka chopshop.`,
                    date: '02 Jun 2024',
                    stamp: 'PRESS ARCHIVE'
                  })}
                  className="bg-[#e8dfce] dark:bg-[#1b1d22] text-stone-900 dark:text-stone-100 p-3 rounded shadow-lg border border-stone-400 font-serif text-xs transform rotate-[2.5deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  {/* Tape on Top */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-amber-100/60 backdrop-blur-xs border border-amber-300/40 shadow-xs transform rotate-[-1deg]" />

                  <div className="border-b-2 border-black dark:border-stone-500 pb-0.5 mb-1 flex items-center justify-between">
                    <span className="font-black text-[11px] uppercase">THE DECCAN CHRONICLE</span>
                    <span className="text-[8px] font-mono text-stone-600 dark:text-stone-400">PAGE 4 · CRIME</span>
                  </div>
                  <div className="bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-black text-[10px] p-1 uppercase leading-tight mb-1 text-center">
                    SPECIAL SQUAD BUSTS HIGHWAY GANG
                  </div>
                  <p className="text-[8.5px] leading-snug text-stone-800 dark:text-stone-200">
                    Over 42 vehicles traced along NH-44 corridor. Police recover master 433MHz frequency jammers from Yelahanka chopshop.
                  </p>
                </div>

                {/* 3. Night Radar & CCTV Intercept Still */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'RECONNAISSANCE GRID & HIGHWAY RADAR MAP',
                    type: 'SATELLITE ESCAPE TRAIL',
                    content: `Satellite ANPR radar grid tracking getaway movement along Hosur Road toward Attibele Toll Plaza. Predicted intercept waypoint flagged at Balay Circle.`,
                    date: '18 Jul 2026',
                    stamp: 'SATELLITE RADAR'
                  })}
                  className="bg-[#141923] text-stone-100 p-2.5 rounded shadow-xl border border-stone-700 font-mono text-[9px] transform rotate-[-1.5deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  <div className="absolute -top-1.5 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-red-800 to-red-400 border border-white shadow-md z-30" />
                  <div className="flex items-center justify-between pb-1 border-b border-stone-700 text-sky-400 font-bold">
                    <span>TRANSIT RADAR GRID</span>
                    <Crosshair className="w-3 h-3 text-red-500 animate-pulse" />
                  </div>
                  <div className="mt-1 h-14 bg-[#0a0d14] rounded border border-stone-800 p-1.5 flex flex-col justify-between">
                    <span className="text-sky-300 font-bold text-[8px]">ROUTE: {selectedSyndicate.predicted_escape_route}</span>
                    <span className="text-stone-400 text-[7.5px]">ANPR: {selectedSyndicate.anpr_chokepoints.join(' · ')}</span>
                  </div>
                </div>

              </div>

              {/* ── CENTER CLUSTER (4 Cols): Pinned Wanted Poster + Seized Evidence Docket ── */}
              <div className="md:col-span-4 space-y-4">
                
                {/* 1. Large Pinned Wanted Poster with Taped Corners */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: `WANTED NOTICE: ${selectedSyndicate.kingpin.name}`,
                    type: 'WANTED BULLETIN',
                    mugshot: selectedSyndicate.kingpin.mugshot,
                    content: `Wanted for organized gang offenses, vehicle theft, and conspiracy under IPC § 379, 392, 120B. Physical specs: Height 5'9", Age 34, Medium build. Last seen near ${selectedSyndicate.kingpin.last_location}. Reward declared: ${selectedSyndicate.kingpin.reward}.`,
                    date: 'CURRENT BULLETIN',
                    stamp: 'ACTIVE NBW WARRANT'
                  })}
                  className="bg-[#fffefb] dark:bg-[#1a1c1f] text-stone-950 dark:text-stone-100 p-3.5 rounded shadow-2xl border-2 border-stone-400 text-center font-mono transform rotate-[1deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  {/* Pushpin at Center Top */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-red-800 to-red-400 border border-white shadow-lg z-30" />

                  <div className="border-b-2 border-black dark:border-stone-500 pb-1 mb-1.5">
                    <h3 className="font-black text-base uppercase tracking-tight text-black dark:text-white">
                      ★ WANTED BY POLICE ★
                    </h3>
                    <p className="text-[8px] font-bold text-red-700 dark:text-red-400 uppercase">
                      KARNATAKA STATE POLICE · CCTNS WATCHLIST
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-w-[190px] mx-auto">
                    <div className="relative aspect-square rounded overflow-hidden bg-stone-200 border border-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.kingpin.mugshot} alt={selectedSyndicate.kingpin.name} className="w-full h-full object-cover object-top filter grayscale contrast-125" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/90 text-white text-[7px] font-bold py-0.5">
                        {selectedSyndicate.kingpin.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="relative aspect-square rounded overflow-hidden bg-stone-200 border border-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedSyndicate.lieutenants[0].mugshot} alt={selectedSyndicate.lieutenants[0].name} className="w-full h-full object-cover object-top filter grayscale contrast-125" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/90 text-white text-[7px] font-bold py-0.5">
                        {selectedSyndicate.lieutenants[0].name.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-stone-900 dark:text-white">
                      {selectedSyndicate.kingpin.name} & {selectedSyndicate.lieutenants[0].name}
                    </p>
                    <p className="text-[7.5px] text-red-700 dark:text-red-400 font-bold">
                      THOUGHT TO BE ARMED AND DANGEROUS
                    </p>
                    <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded border border-stone-300 dark:border-stone-700 text-[8px] text-stone-700 dark:text-stone-300">
                      <strong>REWARD:</strong> <strong className="text-emerald-800 dark:text-emerald-400">{selectedSyndicate.kingpin.reward}</strong>. Sighted near {selectedSyndicate.kingpin.last_location.split('—')[0]}.
                    </div>
                  </div>

                  {/* Yellow Danger Sticky Note */}
                  <div className="absolute -bottom-2 -right-2 bg-[#fef08a] text-stone-950 px-2 py-0.5 rounded shadow border border-amber-300 text-[8px] font-black uppercase transform rotate-[6deg] z-20">
                    ⚡ DANGEROUS!!!
                  </div>
                </div>

                {/* 2. Seized Hardware Forensic Docket */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'EVIDENCE SEIZURE: RECOVERED JAMMERS & TOOLS',
                    type: 'SEIZED HARDWARE DOCKET',
                    content: `Recovered master 433MHz frequency jammer unit, OBD-II keyway code duplicator, and 14 blank smart keys from Yelahanka chopshop. Tampered chassis numbers confirmed by FSL forensics.`,
                    date: '01 Jun 2024',
                    stamp: 'SEIZED EVIDENCE #EV-4910'
                  })}
                  className="bg-[#edf2f7] dark:bg-[#1a1c22] text-stone-900 dark:text-stone-100 p-3 rounded shadow-xl border border-stone-400 font-mono text-[9px] transform rotate-[-2deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  <div className="flex items-center justify-between border-b border-stone-300 pb-1 text-[8.5px] font-bold">
                    <span className="text-emerald-800 dark:text-emerald-400">⚡ EVIDENCE SEIZURE</span>
                    <span className="text-red-700">#EV-4910</span>
                  </div>
                  <div className="pt-1 space-y-0.5">
                    <p className="font-bold">• 433MHz Master RF Jammer</p>
                    <p className="font-bold">• OBD-II Duplicator & 14 Smart Blanks</p>
                    <p className="text-emerald-800 dark:text-emerald-400 font-bold text-[8px]">FSL Forensics Verified</p>
                  </div>
                </div>

              </div>

              {/* ── RIGHT CLUSTER (4 Cols): FASTag Toll + Clustered Polaroids + Gazette Snippet ── */}
              <div className="md:col-span-4 space-y-4">
                
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
                    className="flex-1 bg-[#1f2937] text-white p-2 rounded shadow-lg border border-stone-500 font-mono text-[8px] transform rotate-[-2.5deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
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
                    className="bg-[#f8f5ee] dark:bg-[#1a1b1e] text-stone-950 dark:text-stone-100 p-2 rounded shadow border border-stone-400 font-mono text-[8px] transform rotate-[3deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all"
                  >
                    <p className="font-bold text-red-700">#TL-8821</p>
                    <p className="text-[7.5px] text-stone-600 dark:text-stone-400">Attibele Toll</p>
                  </div>
                </div>

                {/* 2. Personal Facial Profile with Clustered Polaroids */}
                <div className="bg-[#faf7f0] dark:bg-[#1e2025] text-stone-900 dark:text-stone-100 p-2.5 rounded shadow-xl border border-stone-400 font-mono text-xs transform rotate-[2deg] space-y-1.5 relative">
                  {/* Pushpin */}
                  <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-gradient-to-tr from-red-800 to-red-400 border border-white shadow-md z-30" />

                  <div className="bg-[#e0f2fe] text-sky-950 p-1 rounded border border-sky-300 text-[8.5px] font-black flex items-center justify-between">
                    <span>PERSONAL FACIAL PROFILE</span>
                    <span className="text-sky-700">ANPR MATCH 98.4%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {selectedSyndicate.lieutenants.map((lt, idx) => {
                      const rot = idx === 0 ? 'rotate-[-3deg]' : idx === 1 ? 'rotate-[2deg]' : 'rotate-[-2deg]';
                      return (
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
                          className={`bg-white dark:bg-stone-900 p-1 rounded border border-stone-300 dark:border-stone-700 text-center cursor-pointer hover:scale-110 hover:z-30 transition-all transform ${rot}`}
                        >
                          <div className="aspect-square rounded overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-400 dark:border-stone-600 mb-0.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lt.mugshot} alt={lt.name} className="w-full h-full object-cover object-top filter grayscale contrast-125" />
                          </div>
                          <p className="font-extrabold text-[7.5px] uppercase truncate text-stone-900 dark:text-white">{lt.name.split(' ')[0]}</p>
                          <p className="text-[6.5px] text-blue-700 dark:text-blue-400 font-bold truncate">{lt.district}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. The Police Gazette Article Clipping */}
                <div
                  onClick={() => setSelectedEvidenceModal({
                    title: 'THE POLICE GAZETTE / INVESTIGATION BULLETIN',
                    type: 'NEWSPAPER ARCHIVE SNIPPET',
                    content: `Press report covering the ongoing surveillance of inter-district supply chains along the Bengaluru-Raichur highway.`,
                    date: '28 May 2024',
                    stamp: 'INTELLIGENCE RECORD'
                  })}
                  className="bg-[#f5ede0] dark:bg-[#1b1c1e] text-stone-900 dark:text-stone-100 p-2.5 rounded shadow border border-stone-400 font-serif text-[8px] transform rotate-[-2deg] cursor-pointer hover:rotate-0 hover:scale-102 transition-all relative"
                >
                  <div className="border-b border-black dark:border-stone-500 pb-0.5 mb-0.5 text-center font-bold">
                    The Police Gazette · Intelligence Bulletin
                  </div>
                  <p className="font-bold text-[8.5px] uppercase leading-tight">
                    WHATEVER YOU DO, DO IT A HUNDRED PERCENT.
                  </p>
                  <p className="text-stone-700 dark:text-stone-300 text-[7.5px] mt-0.5 leading-snug">
                    Highway surveillance intensified at border checkposts across Raichur and Bidar.
                  </p>
                </div>

              </div>

            </div>

            {/* ── 4. DYNAMIC OFFICER PINNED DETAILS & CLUES SECTION ── */}
            <div className="mt-8 pt-4 border-t-2 border-dashed border-stone-400 dark:border-stone-600 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-amber-600" />
                  OFFICER PINNED FIELD DETAILS & EVIDENCE LEADS ({customPins.length})
                </span>
                <button
                  onClick={() => setIsAddPinModalOpen(true)}
                  className="text-[11px] text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Clue / Observation</span>
                </button>
              </div>

              {/* Dynamic Grid of Officer Pinned Sticky Notes (Angled & Decorated) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {customPins.map((pin) => (
                  <div
                    key={pin.id}
                    className={`p-3 rounded shadow-md border font-mono text-xs cursor-pointer hover:scale-103 transition-transform relative ${pin.rotation} ${pin.color}`}
                  >
                    {/* Pushpin */}
                    <div className="absolute -top-2 left-3 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-red-800 to-red-400 border border-white shadow-xs" />
                    
                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomPin(pin.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 text-stone-400 hover:text-red-700 rounded transition"
                      title="Remove Pin"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider border-b border-stone-300/80 pb-1 mb-1 text-stone-700">
                      <span>{pin.tag}</span>
                      <span>{pin.date}</span>
                    </div>

                    <p className="text-[10.5px] text-stone-900 font-medium leading-snug">
                      {pin.text}
                    </p>

                    <div className="mt-2 pt-1 border-t border-stone-300/60 text-[8px] text-stone-600 font-bold">
                      — {pin.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5. BOTTOM CCTNS CASE FILES & JUDICIAL CHARGESHEETS ── */}
            <div className="mt-6 pt-4 border-t-2 border-black dark:border-stone-500 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                  CCTNS LINKED CASE DOCKETS & JUDICIAL CHARGESHEETS ({selectedSyndicate.connected_firs.length})
                </span>
                <span className="text-[10px] text-stone-500 font-bold">CLICK FILE TO OPEN FULL COURT DOCKET</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                {selectedSyndicate.connected_firs.map((fir) => (
                  <div
                    key={fir.case_number}
                    onClick={() => handleCaseClick(fir.case_number)}
                    className="bg-[#f0eae1] dark:bg-[#1e2024] p-3 rounded border border-stone-400 dark:border-stone-600 hover:border-black dark:hover:border-white text-left cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[9.5px] border-b border-stone-400 pb-1">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{fir.case_number}</span>
                      <span className="px-1.5 py-0.2 bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded text-[8px]">
                        {fir.status}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-stone-950 dark:text-white mt-1">{fir.crime}</p>
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 truncate">{fir.station}</p>
                    {fir.note && (
                      <div className="mt-1.5 pt-1 border-t border-stone-300 dark:border-stone-700 text-[9.5px] text-red-700 dark:text-red-400 font-semibold italic truncate">
                        ⚡ {fir.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                      <span>Investigation Wall</span>
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

          {/* 3D/2D Map Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tactical Map</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700">
              <button
                id="btn-network-map-3d"
                onClick={() => setIsMap3D(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  isMap3D
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                3D
              </button>
              <button
                id="btn-network-map-2d"
                onClick={() => setIsMap3D(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  !isMap3D
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                2D
              </button>
            </div>
          </div>

          <div className="h-[580px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
            {isMap3D ? (
              <NetworkMapView3D
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
                is3D={isMap3D}
              />
            ) : (
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
            )}
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

      {/* ── AUTHENTIC NEWSPAPER BROADSHEET EVIDENCE LOG MEMORANDUM MODAL ── */}
      <AnimatePresence>
        {isAddPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="bg-[#f7f3e8] dark:bg-[#1f2126] border-4 border-stone-800 dark:border-stone-500 text-stone-950 dark:text-stone-100 rounded-2xl max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-6 sm:p-7 space-y-6 relative font-serif overflow-hidden"
            >
              {/* Pushpin at Top Center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-red-800 to-red-500 border-2 border-white shadow-md z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Scotch Tape at Top Left Corner */}
              <div className="absolute -top-2 left-6 w-16 h-4 bg-amber-200/60 backdrop-blur-xs border border-amber-300/40 rounded-xs shadow-xs transform rotate-[-3deg]" />

              {/* Close Button */}
              <button
                onClick={() => setIsAddPinModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-stone-300 dark:bg-stone-800 hover:bg-stone-400 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Newspaper Header Strip */}
              <div className="space-y-1.5 pt-1 pb-3 border-b-2 border-black dark:border-stone-400 text-center">
                <div className="flex items-center justify-between text-[9px] font-mono text-stone-600 dark:text-stone-400 border-b border-stone-400 pb-1 uppercase tracking-wider">
                  <span>KSP INTELLIGENCE DESK</span>
                  <span className="font-bold text-red-700 dark:text-red-400">★ FIELD DISPATCH MEMO ★</span>
                  <span>REF: #{selectedSyndicate.id}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-stone-950 dark:text-white font-serif pt-1">
                  LOG FIELD CLUE & EVIDENCE NOTE
                </h3>
                <p className="text-xs italic text-stone-700 dark:text-stone-300">
                  Target Syndicate: <strong className="not-italic font-bold text-stone-950 dark:text-white">{selectedSyndicate.name}</strong>
                </p>
              </div>

              <form onSubmit={handleAddCustomPin} className="space-y-5 text-xs font-mono">
                {/* Observation Lined Textarea */}
                <div className="space-y-2">
                  <label className="text-stone-900 dark:text-stone-100 font-bold flex items-center justify-between text-xs uppercase tracking-wide">
                    <span>Field Observation / Evidence Lead *</span>
                    <span className="text-[10px] text-red-700 dark:text-red-400 font-bold">REQUIRED</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Sighted suspect switching to Bajaj Pulsar (KA-01-MJ-8821) near Balay Circle at 23:40 hrs..."
                    value={newPinNote.text}
                    onChange={(e) => setNewPinNote({ ...newPinNote, text: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-stone-900 border-2 border-stone-400 dark:border-stone-600 text-stone-950 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black text-xs leading-relaxed font-sans shadow-inner"
                  />
                </div>

                {/* Classification Chips (Spacious & Generous) */}
                <div className="space-y-2">
                  <label className="text-stone-900 dark:text-stone-100 font-bold block text-xs uppercase tracking-wide">
                    Intel Classification Tag
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: 'ANPR HIT', label: 'ANPR Hit' },
                      { id: 'FIELD SIGHTING', label: 'Field Sighting' },
                      { id: 'WEAPON CLUE', label: 'Weapon / Tool' },
                      { id: 'MULE ACCOUNT', label: 'Mule Bank / Crypto' },
                      { id: 'INFORMER INTEL', label: 'Informer Intel' },
                    ].map(tagItem => {
                      const isSelected = newPinNote.tag === tagItem.id;
                      return (
                        <button
                          key={tagItem.id}
                          type="button"
                          onClick={() => setNewPinNote({ ...newPinNote, tag: tagItem.id })}
                          className={`px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-black dark:border-white font-extrabold scale-102'
                              : 'bg-[#eee8dc] dark:bg-stone-800 border-stone-400 dark:border-stone-600 text-stone-800 dark:text-stone-300 hover:border-black dark:hover:border-white'
                          }`}
                        >
                          {tagItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Officer Sign-off Input */}
                <div className="space-y-2">
                  <label className="text-stone-900 dark:text-stone-100 font-bold block text-xs uppercase tracking-wide">
                    Investigating Officer / Division
                  </label>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-stone-900 border-2 border-stone-400 dark:border-stone-600 shadow-inner">
                    <Shield className="w-4 h-4 text-stone-700 dark:text-stone-300 shrink-0" />
                    <input
                      type="text"
                      value={newPinNote.author}
                      onChange={(e) => setNewPinNote({ ...newPinNote, author: e.target.value })}
                      placeholder="e.g. Insp. V. Sharma (KSP CCB)"
                      className="w-full bg-transparent text-stone-950 dark:text-stone-100 text-xs focus:outline-none placeholder:text-stone-400 font-mono"
                    />
                  </div>
                </div>

                {/* Actions (Spacious & Clean) */}
                <div className="pt-4 border-t-2 border-stone-400 dark:border-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] text-stone-600 dark:text-stone-400 font-serif italic">
                    * Clue will pin organically with pushpins on the evidence wall
                  </span>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsAddPinModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border-2 border-stone-400 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                      <span>Pin to Gazette Wall</span>
                    </button>
                  </div>
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
