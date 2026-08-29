'use client';

import { useState } from 'react';
import {
  Scale, BookOpen, Search, Shield, Filter,
  FileCheck, AlertTriangle, ChevronRight, CheckCircle2, Bookmark, Gavel,
  Copy, Check, Sparkles, X, ArrowUpRight, ShieldAlert, Award, FileText,
  HelpCircle, AlertCircle, Info, Lock, Unlock, ArrowRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTES_DATA = [
  {
    id: 'ipc-379',
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita, 2023',
    section: '379',
    bnsSection: '303(2)',
    title: 'Theft & Motor Vehicle Larceny',
    crimeHead: 'Property Offenses',
    crimeSubHead: 'Vehicle Theft',
    gravity: 'Non-Heinous',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Magistrate First Class (JMFC)',
    maxPunishment: 'Up to 3 years imprisonment, or fine, or both',
    avgConvictionRate: 68,
    totalCasesActive: 1420,
    arrestGuideline: 'Section 41A CrPC / Sec 35 BNSS Notice mandatory unless recorded flight risk or repeat habitual offender.',
    essentialIngredients: [
      'Dishonest intention to take movable property out of possession.',
      'Property taken without the lawful possessor’s consent.',
      'Actual moving of the property in order to effect such taking.',
      'Ownership or lawful possession established via RC / Invoice.'
    ],
    investigationChecklist: [
      'Seizure Panchanama (Mahazar) under Sec 100 CrPC / 105 BNSS at recovery locus.',
      'Vehicle Chassis & Engine number verification via VAHAN database.',
      'CCTV / ANPR trajectory footage extraction & Sec 65B IEA / 63 BSA certificate.',
      'Statement of complainant & eyewitnesses under Sec 161 CrPC / 180 BNSS.'
    ],
    landmarkPrecedent: 'State of Maharashtra v. Vishwanath (AIR 1980 SC 697) — Transfer of physical possession constitutes theft even if temporary.'
  },
  {
    id: 'ipc-392',
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita, 2023',
    section: '392',
    bnsSection: '309(4)',
    title: 'Robbery & Highway Dacoity',
    crimeHead: 'Property Offenses',
    crimeSubHead: 'Armed Robbery',
    gravity: 'Heinous Offense',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Court of Session / JMFC',
    maxPunishment: 'Rigorous imprisonment up to 10 yrs (highway robbery up to 14 yrs)',
    avgConvictionRate: 74,
    totalCasesActive: 890,
    arrestGuideline: 'Immediate arrest under Sec 41(1) CrPC. Mandatory custodial interrogation for recovery of weapon and looted property.',
    essentialIngredients: [
      'Theft or extortion with wrongful restraint or fear of instant death/hurt.',
      'Force or threat applied for committing theft or carrying away stolen goods.',
      'Active participation of offender with overt aggressive act.'
    ],
    investigationChecklist: [
      'Scene of Crime examination with Forensic Fingerprint Expert.',
      'Test Identification Parade (TIP) of suspects before Judicial Magistrate.',
      'Recovery of stolen property / weapon under Sec 27 Evidence Act / Sec 23 BSA.',
      'Call Detail Records (CDR) & Tower dump analysis for gang movement.'
    ],
    landmarkPrecedent: 'Rajesh Govind Jagesha v. State of Maharashtra (1999) 8 SCC 428 — Identification in TIP is substantive corroborative evidence.'
  },
  {
    id: 'ipc-302',
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita, 2023',
    section: '302',
    bnsSection: '103(1)',
    title: 'Murder & First-Degree Homicide',
    crimeHead: 'Bodily Offenses',
    crimeSubHead: 'Homicide',
    gravity: 'Capital Offense',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Court of Session Exclusively',
    maxPunishment: 'Death penalty or imprisonment for life, and liability to fine',
    avgConvictionRate: 81,
    totalCasesActive: 310,
    arrestGuideline: 'Immediate non-bailable arrest. Bail exclusively in High Court or Supreme Court on exceptional merits.',
    essentialIngredients: [
      'Death of a human being caused by the act of the accused.',
      'Act done with intention of causing death or bodily injury sufficient to cause death.',
      'Knowledge that act is so imminently dangerous that it must cause death.'
    ],
    investigationChecklist: [
      'Inquest Panchanama (Sec 174 CrPC / 194 BNSS) and Post-Mortem Request to Govt Forensic Surgeon.',
      'Seizure of crime weapon, blood-stained clothes, and earth sample with FSL seal.',
      'DNA profiling & chain of custody preservation for blood spatter.',
      'Dying declaration recording before Executive Magistrate if victim was conscious.'
    ],
    landmarkPrecedent: 'Bachan Singh v. State of Punjab (1980) 2 SCC 684 — "Rarest of Rare" doctrine for capital punishment.'
  },
  {
    id: 'ipc-307',
    actCode: 'IPC',
    actName: 'Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita, 2023',
    section: '307',
    bnsSection: '109(1)',
    title: 'Attempt to Murder & Grievous Assault',
    crimeHead: 'Bodily Offenses',
    crimeSubHead: 'Assault & Weapon Attack',
    gravity: 'Heinous Offense',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Court of Session',
    maxPunishment: 'Imprisonment up to 10 years and fine; if hurt caused, life imprisonment',
    avgConvictionRate: 71,
    totalCasesActive: 460,
    arrestGuideline: 'Immediate custodial arrest. Weapon recovery under Sec 27 Evidence Act critical for conviction.',
    essentialIngredients: [
      'Act done with intention or knowledge that if death had occurred, it would be murder.',
      'Execution of act goes beyond mere preparation and reaches attempt stage.',
      'Causation of bodily injury or dangerous weapon usage.'
    ],
    investigationChecklist: [
      'Wound Certificate with Medico-Legal Opinion on Nature of Injury (Grievous vs Simple).',
      'Recovery and seizure of sharp-edged/blunt weapon with blood stains.',
      'FSL examination of biological stains on weapon and clothing.',
      'Eyewitness identification and electronic surveillance corroboration.'
    ],
    landmarkPrecedent: 'State of Maharashtra v. Balram Bama Patil (1983) 2 SCC 28 — Bodily injury not mandatory; intention and capability suffice.'
  },
  {
    id: 'it-66d',
    actCode: 'IT Act',
    actName: 'Information Technology Act, 2000 (Amended 2008)',
    section: '66D',
    bnsSection: 'IT 66D',
    title: 'Cyber Cheating & Digital Impersonation',
    crimeHead: 'Cyber & Financial',
    crimeSubHead: 'Phishing & Fraud',
    gravity: 'Cyber Offense',
    bailable: true,
    cognizable: true,
    compoundable: false,
    triableBy: 'Magistrate First Class / Cyber Court',
    maxPunishment: 'Imprisonment up to 3 years and fine up to 1 lakh rupees',
    avgConvictionRate: 59,
    totalCasesActive: 620,
    arrestGuideline: 'Notice under Section 41A CrPC applicable. Immediate lien / freezing of beneficiary bank accounts under Sec 102 CrPC.',
    essentialIngredients: [
      'Cheating by personating another person or entity.',
      'Usage of computer resource, mobile communication device, or network endpoint.',
      'Inducement causing financial or reputational loss to victim.'
    ],
    investigationChecklist: [
      '1930 Cyber Helpline & CFCFRMS portal beneficiary lien freeze.',
      'IPDR / CDR logs requisition from ISPs and Telecom operators.',
      'Bank Account KYC, beneficiary trails, and ATM CCTV extraction.',
      'Certificate under Section 65B Indian Evidence Act / Section 63 BSA.'
    ],
    landmarkPrecedent: 'Shreya Singhal v. Union of India (2015) 5 SCC 1 — Strict procedural safeguards for digital evidence admissibility.'
  },
  {
    id: 'ndps-20b',
    actCode: 'NDPS Act',
    actName: 'Narcotic Drugs and Psychotropic Substances Act, 1985',
    section: '20(b)',
    bnsSection: 'NDPS 20(b)',
    title: 'Contraband Possession & Narcotics Trafficking',
    crimeHead: 'Narcotics & Drugs',
    crimeSubHead: 'Commercial Trafficking',
    gravity: 'Special Act Heinous',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Special NDPS Court / Sessions',
    maxPunishment: 'Commercial: Rigorous imprisonment 10 to 20 yrs, fine 1 to 2 lakh',
    avgConvictionRate: 86,
    totalCasesActive: 280,
    arrestGuideline: 'Strict non-bailable bar under Section 37 NDPS for commercial quantity. Strict compliance with Sec 42 & 50 search mandates.',
    essentialIngredients: [
      'Unlawful possession, transportation, sale, or trafficking of contraband.',
      'Weight quantification into Small vs Commercial Quantity.',
      'Conscious possession established beyond reasonable doubt.'
    ],
    investigationChecklist: [
      'Compliance with Section 50 NDPS: Notice to suspect offering search before Gazetted Officer.',
      'Field Drug Detection Kit (FDDK) primary positive chemical test.',
      'Sampling & Sealing with brass seal in presence of independent panch witnesses.',
      'Inventory Certification before Judicial Magistrate under Section 52A NDPS within 24 hours.'
    ],
    landmarkPrecedent: 'State of Punjab v. Baldev Singh (1999) 6 SCC 172 — Strict compliance with Section 50 search mandate is mandatory.'
  },
  {
    id: 'arms-25',
    actCode: 'Arms Act',
    actName: 'The Arms Act, 1959 (Amended 2019)',
    section: '25',
    bnsSection: 'Arms 25(1B)',
    title: 'Unlicensed Firearms & Arms Trafficking',
    crimeHead: 'Arms & Weapons',
    crimeSubHead: 'Illegal Firearms',
    gravity: 'Armed Offense',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Court of Session / JMFC',
    maxPunishment: 'Imprisonment 7 years extending to life imprisonment, and fine',
    avgConvictionRate: 79,
    totalCasesActive: 195,
    arrestGuideline: 'Immediate non-bailable arrest. Interrogation for illicit arms supply chain and interstate procurement.',
    essentialIngredients: [
      'Acquisition, possession, or carrying of prohibited arms without license.',
      'Manufacture, conversion, or sale of illicit country-made firearms.',
      'Proof of functioning firing mechanism via Ballistic Expert report.'
    ],
    investigationChecklist: [
      'Recovery Panchanama recording serial numbers and proof of make.',
      'Dispatch of weapon and fired cartridge cases to Forensic Ballistics Division.',
      'Sanction for Prosecution from District Magistrate under Section 39 Arms Act.',
      'Interstate arms trafficking nexus interrogation.'
    ],
    landmarkPrecedent: 'Paras Ram v. State of Haryana (1992) Supp (1) SCC 671 — Possession must be conscious and physical for Section 25.'
  },
  {
    id: 'pocso-4',
    actCode: 'POCSO Act',
    actName: 'Protection of Children from Sexual Offences Act, 2012',
    section: '4',
    bnsSection: 'BNS 65',
    title: 'Penetrative Sexual Assault on Minor',
    crimeHead: 'Child Protection',
    crimeSubHead: 'POCSO Special',
    gravity: 'Severe Heinous',
    bailable: false,
    cognizable: true,
    compoundable: false,
    triableBy: 'Special POCSO Court',
    maxPunishment: 'Rigorous imprisonment 20 years extending to life, and fine',
    avgConvictionRate: 89,
    totalCasesActive: 140,
    arrestGuideline: 'Immediate non-bailable arrest. Statutory presumption of guilt under Section 29 & 30 POCSO Act.',
    essentialIngredients: [
      'Victim verified to be child below 18 years of age.',
      'Penetrative sexual act committed without lawful consent.',
      'Age proof established via School Admission Register or Birth Certificate.'
    ],
    investigationChecklist: [
      'Medical examination of child victim within 24 hours under Sec 164A CrPC / Sec 27 POCSO.',
      'Statement recording before Judicial Magistrate under Section 164 CrPC / 183 BNSS.',
      'Child Welfare Committee (CWC) immediate notification and child-friendly counseling.',
      'Charge-sheet filing strictly within 60 days of FIR registration.'
    ],
    landmarkPrecedent: 'Independent Thought v. Union of India (2017) 10 SCC 800 — Strict child protection principles apply universally.'
  }
];

const ACT_FILTERS = [
  { id: 'all', label: 'All Enactments' },
  { id: 'IPC', label: 'IPC / BNS' },
  { id: 'NDPS Act', label: 'NDPS Act' },
  { id: 'IT Act', label: 'Cyber IT' },
  { id: 'Arms Act', label: 'Arms Act' },
  { id: 'POCSO Act', label: 'POCSO' }
];

export default function StatutesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAct, setSelectedAct] = useState('all');
  const [selectedBailFilter, setSelectedBailFilter] = useState('all');
  const [activeStatuteModal, setActiveStatuteModal] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopyCitation = (statute) => {
    const text = `${statute.actCode} § ${statute.section} (BNS § ${statute.bnsSection}) - ${statute.title} [${statute.actName}]`;
    navigator.clipboard.writeText(text);
    setCopiedKey(statute.id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredStatutes = STATUTES_DATA.filter(s => {
    const matchesSearch = s.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.bnsSection.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.crimeSubHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.crimeHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.actCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAct = selectedAct === 'all' || s.actCode === selectedAct;
    
    let matchesBail = true;
    if (selectedBailFilter === 'non-bailable') matchesBail = !s.bailable;
    if (selectedBailFilter === 'bailable') matchesBail = s.bailable;

    return matchesSearch && matchesAct && matchesBail;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* ─── COMMAND BAR HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Statutory Acts & Legal Decision Repository
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
              IPC ⇄ BNS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bail eligibility, procedural arrest mandates, and IO investigation standards.
          </p>
        </div>

        {/* Search & Bail Filter */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by section, act, or offense..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setSelectedBailFilter('all')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${selectedBailFilter === 'all' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedBailFilter('non-bailable')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${selectedBailFilter === 'non-bailable' ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Non-Bailable
            </button>
            <button
              onClick={() => setSelectedBailFilter('bailable')}
              className={`px-2.5 py-1 rounded-md transition text-xs ${selectedBailFilter === 'bailable' ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Bailable
            </button>
          </div>
        </div>
      </div>

      {/* Act Filter Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {ACT_FILTERS.map(act => (
          <button
            key={act.id}
            onClick={() => setSelectedAct(act.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedAct === act.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            {act.label}
          </button>
        ))}
      </div>

      {/* ─── PRECISION ARCHITECTED STATUTE CARDS ─── */}
      {filteredStatutes.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
          No matching statutory provisions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStatutes.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition flex flex-col justify-between overflow-hidden shadow-2xs group"
            >
              {/* Structured Header Row */}
              <div className="p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                  {/* Clean Section Tag Ribbon */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                      {item.actCode} § {item.section}
                    </span>
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-zinc-700/60">
                      BNS § {item.bnsSection}
                    </span>
                  </div>

                  {/* Clean Bail Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    item.bailable
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.bailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{item.bailable ? 'Bailable' : 'Non-Bailable'}</span>
                  </span>
                </div>

                {/* Title & Classification */}
                <div>
                  <h2 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.crimeHead} · <span className="font-medium text-slate-700 dark:text-slate-300">{item.crimeSubHead}</span>
                  </p>
                </div>

                {/* Structured Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 dark:bg-zinc-800/40 rounded-lg p-2.5 border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Trial Forum</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{item.triableBy.split('/')[0]}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Offense Gravity</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{item.gravity}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Statutory Penalty</span>
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-snug line-clamp-1 block mt-0.5">{item.maxPunishment}</span>
                  </div>
                </div>

                {/* Conviction Benchmark */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Conviction Benchmark</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{item.avgConvictionRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-white"
                      style={{ width: `${item.avgConvictionRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Active Case Volume</span>
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{item.totalCasesActive} Cases</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50/50 dark:bg-zinc-800/20 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyCitation(item)}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 transition"
                >
                  {copiedKey === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveStatuteModal(item)}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                >
                  <span>Legal Guide</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── WIDE 2-COLUMN LEGAL GUIDE MODAL (NO SCROLLING NEEDED) ─── */}
      <AnimatePresence>
        {activeStatuteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full shadow-2xl p-5 sm:p-6 space-y-4 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveStatuteModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Top Header */}
              <div className="space-y-1 pr-8 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-slate-100 border border-slate-200 dark:border-zinc-700">
                    {activeStatuteModal.actCode} § {activeStatuteModal.section}
                  </span>
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700">
                    BNS § {activeStatuteModal.bnsSection}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeStatuteModal.bailable 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50' 
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50'
                  }`}>
                    {activeStatuteModal.bailable ? 'Bailable' : 'Non-Bailable'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    • Triable by: {activeStatuteModal.triableBy}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {activeStatuteModal.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {activeStatuteModal.actName}
                </p>
              </div>

              {/* 2-Column Wide Content Layout (No scroll needed) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Procedure & Precedents */}
                <div className="space-y-3">
                  {/* Arrest & Procedure Rules */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 space-y-1 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      Arrest & BNSS Procedure Rules
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {activeStatuteModal.arrestGuideline}
                    </p>
                  </div>

                  {/* Landmark Precedent */}
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-1 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      Landmark Judicial Precedent
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium leading-relaxed">
                      {activeStatuteModal.landmarkPrecedent}
                    </p>
                  </div>

                  {/* Penalty Limit Summary */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-[11px] space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Statutory Penalty Limit</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{activeStatuteModal.maxPunishment}</p>
                  </div>
                </div>

                {/* Right Column: Essential Ingredients & Investigation Checklist */}
                <div className="space-y-3">
                  {/* Essential Ingredients */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Essential Ingredients of Offense
                    </h4>
                    <div className="space-y-1">
                      {activeStatuteModal.essentialIngredients.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-zinc-800">
                          <span className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Investigation Checklist */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      Investigation Checklist for IOs
                    </h4>
                    <div className="space-y-1">
                      {activeStatuteModal.investigationChecklist.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-zinc-800">
                          <span className="text-slate-700 dark:text-slate-300 font-bold text-[10px] mt-0.5">✓</span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Action Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                <button
                  onClick={() => handleCopyCitation(activeStatuteModal)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Citation</span>
                </button>

                <button
                  onClick={() => setActiveStatuteModal(null)}
                  className="px-5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
