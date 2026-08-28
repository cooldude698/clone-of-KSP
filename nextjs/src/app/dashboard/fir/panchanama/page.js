'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mic, MicOff, Sparkles, FileText, CheckCircle2, Copy, Check,
  Printer, ArrowLeft, Shield, Scale, MapPin, User, Calendar,
  Clock, AlertTriangle, RefreshCw, Upload, Send, Eye, ShieldAlert,
  Car, Layers, Globe, Download, AlertCircle, Info, Edit3, Save, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { DrishtiEmblem } from '@/components/DrishtiLogo';

const DEMO_PRESETS = [
  {
    id: 'vehicle_theft',
    label: '🏍️ Silk Board Bike Theft & Key Seizure',
    badge: 'IPC 379 / BNS 303',
    transcript: 'Crime scene inspection at Silk Board Junction near parking bay. Complainant Sri Pradeep Kumar, resident of Bellandur, reports his black Bajaj Pulsar 220cc bearing registration KA-01-HF-4092 was stolen at 14:30 hrs. Suspect Ramesh Kumar alias Bullet Ramesh intercepted at Hosur Road exit checkpoint. Seized the stolen Bajaj Pulsar vehicle chassis MD2A22DY7N valued at rupees one lakh ten thousand, along with 3 modified master keys recovered from accused right pocket. Panchanama conducted in presence of Panch Basavaraj Gowda and Anand Kumar. Vehicle sealed and taken into custody u/s 303(2) BNS and 379 IPC.',
    lang: 'en'
  },
  {
    id: 'kannada_robbery',
    label: '🗡️ ಎಂ.ಜಿ. ರಸ್ತೆ ಸರಗಳ್ಳತನ & ಚಾಕು ಜಪ್ತಿ (ಕನ್ನಡ)',
    badge: 'BNS 309 / IPC 392',
    transcript: 'ಸ್ಥಳ ಮಹಜರು ವರದಿ: ದಿನಾಂಕ 28 ಜುಲೈ 2026 ಸಂಜೆ 18:30 ಗಂಟೆಗೆ ಎಂ.ಜಿ. ರಸ್ತೆ ಮೆಟ್ರೋ ನಿಲ್ದಾಣದ ಬಳಿ ದೂರುದಾರೆ ಶ್ರೀಮತಿ ರಾಜೇಶ್ವರಿ ಅವರ ಕೊರಳಿನಲ್ಲಿದ್ದ 24 ಗ್ರಾಂ ಚಿನ್ನದ ಸರವನ್ನು ಕಸಿದು ಪರಾರಿಯಾಗಲು ಯತ್ನಿಸಿದ ಶಂಕಿತ ಆನಂದ್ ಗೌಡ ಮತ್ತು ಇಮ್ರಾನ್ ಖಾನ್‌ರನ್ನು ಹೊಯ್ಸಳ ಗಸ್ತು ಸಿಬ್ಬಂದಿ ವಶಕ್ಕೆ ಪಡೆದಿದ್ದಾರೆ. ಸ್ಥಳದಲ್ಲಿ 24 ಗ್ರಾಂ ಬಂಗಾರದ ಸರ ಮತ್ತು ಅಪರಾಧಕ್ಕೆ ಬಳಸಿದ ಬಟನ್ ಚಾಕುವನ್ನು ಪಂಚರಾದ ಆರ್. ವೆಂಕಟೇಶ್ ಮತ್ತು ಮಹಮ್ಮದ್ ಫಾರೂಕ್ ಅವರ ಸಮ್ಮುಖದಲ್ಲಿ ಜಪ್ತಿ ಪಂಚನಾಮೆ ಮಾಡಿ ಅಮಾನತುಪಡಿಸಿಕೊಳ್ಳಲಾಗಿದೆ. ಬಿಎನ್‌ಎಸ್ ಕಲಂ 309 ಹಾಗೂ ಐಪಿಸಿ 392 ಅನ್ವಯ ಪ್ರಕರಣ ದಾಖಲಿಸಲಾಗಿದೆ.',
    lang: 'kn'
  },
  {
    id: 'cyber_extortion',
    label: '💻 Whitefield Crypto Extortion & Laptop Seizure',
    badge: 'IT Act 66D / IPC 384',
    transcript: 'Spot panchanama at ITPB Tech Park Whitefield. Investigating cyber extortion complaint against accused Vikram Malhotra alias Vicky Blade. Seized 1 Apple MacBook Pro Space Gray M3 Serial C02G99XY used for unauthorized database intrusion and crypto ransomware demands of 2.5 Bitcoin from fintech firm. Panch witnesses Sri Kiran Rao and Smt. Deepa Sundaram present. Digital evidence hashed with SHA-256 and seized under Section 66D IT Act and 318 BNS.',
    lang: 'en'
  }
];

export default function VoicePanchanamaPage() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('voice'); // 'voice', 'fir_form', 'panchanama_memo'
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [committed, setCommitted] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = selectedLang === 'kn' ? 'kn-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setTranscript(text.trim());
      };

      rec.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedLang]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      try { recognitionRef.current.stop(); } catch (_) {}
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLang === 'kn' ? 'kn-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const handleApplyPreset = (preset) => {
    setTranscript(preset.transcript);
    setSelectedLang(preset.lang);
  };

  // Run AI Auto-Extraction
  const handleGenerateDrafter = async () => {
    if (!transcript.trim()) return;
    setParsing(true);

    try {
      const res = await fetch('/api/ai/panchanama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language: selectedLang,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setExtractedData(json.data);
          if (json.data.is_valid_incident) {
            setActiveTab('fir_form');
          }
        }
      }
    } catch (err) {
      console.error('Panchanama extraction failed:', err);
    } finally {
      setParsing(false);
    }
  };

  // Update handlers for editing fields
  const updateField = (field, value) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  const updateComplainant = (field, value) => {
    setExtractedData(prev => ({
      ...prev,
      complainant: { ...prev.complainant, [field]: value }
    }));
  };

  const updateAccused = (index, field, value) => {
    setExtractedData(prev => {
      const list = [...(prev.accused || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, accused: list };
    });
  };

  const addAccusedRow = () => {
    setExtractedData(prev => ({
      ...prev,
      accused: [
        ...(prev.accused || []),
        { id: `A${(prev.accused || []).length + 1}`, name: 'New Suspect', role: 'Accomplice', physical_marks: '' }
      ]
    }));
  };

  const removeAccusedRow = (index) => {
    setExtractedData(prev => ({
      ...prev,
      accused: (prev.accused || []).filter((_, i) => i !== index)
    }));
  };

  const updateActSection = (index, field, value) => {
    setExtractedData(prev => {
      const list = [...(prev.acts_sections || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, acts_sections: list };
    });
  };

  const addActSectionRow = () => {
    setExtractedData(prev => ({
      ...prev,
      acts_sections: [
        ...(prev.acts_sections || []),
        { act: 'BNS 2023', section: '303', desc: 'Punishment for Theft' }
      ]
    }));
  };

  const removeActSectionRow = (index) => {
    setExtractedData(prev => ({
      ...prev,
      acts_sections: (prev.acts_sections || []).filter((_, i) => i !== index)
    }));
  };

  const updateSeizedArticle = (index, field, value) => {
    setExtractedData(prev => {
      const list = [...(prev.panchanama?.seized_articles || [])];
      list[index] = { ...list[index], [field]: value };
      return {
        ...prev,
        panchanama: { ...prev.panchanama, seized_articles: list }
      };
    });
  };

  const addSeizedArticleRow = () => {
    setExtractedData(prev => {
      const list = prev.panchanama?.seized_articles || [];
      return {
        ...prev,
        panchanama: {
          ...prev.panchanama,
          seized_articles: [
            ...list,
            { item_no: list.length + 1, description: 'Seized Evidence Item', estimated_value: '₹1,000', recovery_place: 'Crime Spot' }
          ]
        }
      };
    });
  };

  const removeSeizedArticleRow = (index) => {
    setExtractedData(prev => ({
      ...prev,
      panchanama: {
        ...prev.panchanama,
        seized_articles: (prev.panchanama?.seized_articles || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updatePanch = (index, field, value) => {
    setExtractedData(prev => {
      const list = [...(prev.panchanama?.panch_witnesses || [])];
      list[index] = { ...list[index], [field]: value };
      return {
        ...prev,
        panchanama: { ...prev.panchanama, panch_witnesses: list }
      };
    });
  };

  const handleCopyDraft = () => {
    if (!extractedData) return;
    const textToCopy = `KARNATAKA STATE POLICE — OFFICIAL FIR & SPOT PANCHANAMA
Case Number: ${extractedData.case_number || 'N/A'}
Crime Number: ${extractedData.crime_number || 'N/A'}
Police Station: ${extractedData.police_station || 'N/A'}
Sections: ${extractedData.acts_sections?.map(a => `${a.act} §${a.section}`).join(', ') || 'N/A'}
Complainant: ${extractedData.complainant?.name || 'Not Disclosed'}
Accused: ${extractedData.accused?.map(a => `${a.name} (${a.alias || 'No alias'})`).join(', ') || 'None'}
Seized Property: ${extractedData.panchanama?.seized_articles?.map(s => `${s.description} (${s.estimated_value})`).join(', ') || 'None'}
Spot Panchanama Summary: ${extractedData.panchanama?.spot_observations_english || 'N/A'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommitToCctns = () => {
    if (!extractedData || !extractedData.is_valid_incident) return;
    setCommitted(true);

    // Save to local storage active store
    try {
      const existing = JSON.parse(localStorage.getItem('drishti_uploaded_firs') || '[]');
      const newRecord = {
        case_number: extractedData.case_number,
        crime_no: extractedData.crime_number,
        police_station: extractedData.police_station,
        crime_type: extractedData.crime_category,
        date_filed: extractedData.incident_date,
        status: 'under_investigation',
        suspect_name: extractedData.accused?.[0]?.name || 'Under Identification',
        description: `Official FIR registered under ${extractedData.acts_sections?.map(a => `${a.act} §${a.section}`).join(', ') || 'Statutory Sections'}. Panchanama Seizure: ${extractedData.panchanama?.seized_articles?.map(s => s.description).join(', ') || 'Nil'}.`,
      };
      localStorage.setItem('drishti_uploaded_firs', JSON.stringify([newRecord, ...existing]));
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    setTimeout(() => setCommitted(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans text-slate-900 dark:text-slate-100">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/dashboard/fir"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Voice Panchanama & Court-Ready FIR Auto-Drafter
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                BNS 2023 + CCTNS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              ದೃಷ್ಟಿ ಧ್ವನಿ ಸ್ಥಳ ಮಹಜರು & ನ್ಯಾಯಾಲಯದ ಎಫ್‌ಐಆರ್ ನಮೂನೆ ಜನರೇಟರ್
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          {extractedData && extractedData.is_valid_incident && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isEditing
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                <span>{isEditing ? 'Save & Lock Form' : 'Edit FIR & Panchanama'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Print Official Court Copy"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Print Legal Copy</span>
              </button>

              <button
                onClick={handleCopyDraft}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={handleCommitToCctns}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {committed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Shield className="w-3.5 h-3.5" />}
                <span>{committed ? 'Synced to CCTNS ✓' : 'Commit to CCTNS'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('voice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'voice'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>1. Voice Dictation & AI Parser</span>
        </button>

        <button
          onClick={() => setActiveTab('fir_form')}
          disabled={!extractedData || !extractedData.is_valid_incident}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'fir_form'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Court-Ready FIR (Form No. 1)</span>
          {extractedData?.is_valid_incident && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        <button
          onClick={() => setActiveTab('panchanama_memo')}
          disabled={!extractedData || !extractedData.is_valid_incident}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'panchanama_memo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>3. Spot Panchanama / ಮಹಜರು (Seizure Memo)</span>
          {extractedData?.is_valid_incident && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
      </div>

      {/* ── TAB 1: VOICE DICTATION & AI PARSER ── */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Audio Dictation Workspace */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Dictation Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Officer Crime Scene Voice Dictation
                  </span>
                  {isRecording && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      LISTENING (LIVE SPEECH)
                    </span>
                  )}
                </div>

                {/* Language Select Pill */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {[
                    { id: 'en', label: 'EN' },
                    { id: 'kn', label: 'ಕನ್ನಡ' },
                    { id: 'hi', label: 'हिंदी' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLang(l.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        selectedLang === l.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Press the mic or choose a preset to dictate crime scene observations, complainant details, place of occurrence, suspect descriptions, and seized articles..."
                  rows={8}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed resize-none"
                />
                {transcript && (
                  <button
                    onClick={() => { setTranscript(''); setExtractedData(null); }}
                    className="absolute right-3 top-3 text-[10px] font-mono text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>

              {/* Mic & Action Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={toggleRecording}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Voice Dictation'}</span>
                </button>

                <button
                  onClick={handleGenerateDrafter}
                  disabled={parsing || !transcript.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  {parsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
                  <span>{parsing ? 'Analyzing Incident Facts...' : '⚡ Auto-Draft FIR & Panchanama'}</span>
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                Benchmark Demonstration Scenarios (Click to Load)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all shadow-xs group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 block w-max mb-1.5">
                        {p.badge}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.label}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-mono">Load Scenario →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live AI Extraction Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <DrishtiEmblem className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold font-mono uppercase text-slate-900 dark:text-white">
                    Live Extracted Intelligence
                  </span>
                </div>
                {extractedData && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    extractedData.is_valid_incident
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
                  }`}>
                    {extractedData.is_valid_incident ? 'Verified Incident ✓' : 'General / Incomplete Audio'}
                  </span>
                )}
              </div>

              {parsing ? (
                <div className="py-16 text-center space-y-3 font-mono text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  <p>Analyzing speech text & verifying grounded incident facts...</p>
                </div>
              ) : extractedData ? (
                extractedData.is_valid_incident ? (
                  /* Valid Incident State */
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Assigned Crime Number</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">{extractedData.crime_number}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Police Station</span>
                        <span className="font-bold truncate block">{extractedData.police_station}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Category</span>
                        <span className="font-bold truncate block text-blue-600 dark:text-blue-400">{extractedData.crime_category}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Statutes Mapped</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extractedData.acts_sections?.length > 0 ? (
                          extractedData.acts_sections.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                              {a.act} §{a.section}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None determined from text</span>
                        )}
                      </div>
                    </div>

                    {extractedData.missing_fields?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                        <span className="font-bold flex items-center gap-1 font-mono text-[10px] uppercase">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          Missing Details in Dictation:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {extractedData.missing_fields.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Seized Property Count</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {extractedData.panchanama?.seized_articles?.length || 0} Evidence Articles Seized & Sealed
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveTab('fir_form')}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Court-Ready FIR & Panchanama Memo →</span>
                    </button>
                  </div>
                ) : (
                  /* Invalid / Nonsense / General Definition Feedback */
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-200">
                          No Specific Crime Incident Detected
                        </h4>
                        <p className="text-amber-700 dark:text-amber-300 text-[11.5px] mt-1 leading-relaxed">
                          {extractedData.validation_message}
                        </p>
                      </div>
                    </div>

                    {extractedData.missing_fields?.length > 0 && (
                      <div className="p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-800/30">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">
                          Missing Essential Case Fields:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {extractedData.missing_fields.map((mf, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-semibold">
                              ❌ {mf}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>How to fix:</strong> Speak or type a real incident statement containing: complainant name, place of occurrence (e.g. Silk Board), suspect identity, and any stolen or recovered items.
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-mono space-y-2">
                  <Mic className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-700" />
                  <p>No dictation analyzed yet.</p>
                  <p className="text-[11px] text-slate-400">Click <strong>Start Voice Dictation</strong> or choose a test scenario below.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COURT-READY FIR FORM (FORM NO. 1) ── */}
      {activeTab === 'fir_form' && extractedData && extractedData.is_valid_incident && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg max-w-4xl mx-auto space-y-6 print:p-0 print:border-none print:shadow-none">
          
          {/* Edit Mode Notice Banner */}
          {isEditing && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Edit3 className="w-4 h-4" />
                EDIT MODE ACTIVE: You can modify, add, or remove any field below. Changes save instantly.
              </span>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all cursor-pointer"
              >
                Save & Lock
              </button>
            </div>
          )}

          {/* Government Official Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
            <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
              <DrishtiEmblem className="w-full h-full text-slate-900 dark:text-white" />
            </div>
            <h2 className="text-sm font-black tracking-widest uppercase font-serif text-slate-900 dark:text-white">
              GOVERNMENT OF KARNATAKA — POLICE DEPARTMENT
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              FIRST INFORMATION REPORT (FORM NO. 1)
            </h3>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              (Under Section 154 Cr.P.C / Section 173 Bharatiya Nagarik Suraksha Sanhita, 2023)
            </p>
          </div>

          {/* Top FIR Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">1. District / Division</span>
              {isEditing ? (
                <input
                  type="text"
                  value={extractedData.district || ''}
                  onChange={(e) => updateField('district', e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">{extractedData.district}</span>
              )}
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">2. Police Station</span>
              {isEditing ? (
                <input
                  type="text"
                  value={extractedData.police_station || ''}
                  onChange={(e) => updateField('police_station', e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">{extractedData.police_station}</span>
              )}
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">3. FIR Number & Year</span>
              {isEditing ? (
                <input
                  type="text"
                  value={extractedData.case_number || ''}
                  onChange={(e) => updateField('case_number', e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-blue-600"
                />
              ) : (
                <span className="font-bold text-blue-600 dark:text-blue-400">{extractedData.case_number} / 2026</span>
              )}
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">4. CCTNS Crime No.</span>
              {isEditing ? (
                <input
                  type="text"
                  value={extractedData.crime_number || ''}
                  onChange={(e) => updateField('crime_number', e.target.value)}
                  className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">{extractedData.crime_number}</span>
              )}
            </div>
          </div>

          {/* Acts and Sections */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px]">
                5. Statutory Acts & Sections Applicable:
              </span>
              {isEditing && (
                <button
                  onClick={addActSectionRow}
                  className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Section
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {extractedData.acts_sections?.length > 0 ? (
                extractedData.acts_sections.map((act, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2 justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      {isEditing ? (
                        <div className="space-y-1.5 flex-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={act.act || ''}
                              onChange={(e) => updateActSection(i, 'act', e.target.value)}
                              placeholder="Act (e.g. BNS 2023)"
                              className="w-24 p-1 text-xs rounded border border-slate-300 dark:border-slate-700 font-bold"
                            />
                            <input
                              type="text"
                              value={act.section || ''}
                              onChange={(e) => updateActSection(i, 'section', e.target.value)}
                              placeholder="Section (e.g. 303)"
                              className="w-20 p-1 text-xs rounded border border-slate-300 dark:border-slate-700 font-bold"
                            />
                          </div>
                          <input
                            type="text"
                            value={act.desc || ''}
                            onChange={(e) => updateActSection(i, 'desc', e.target.value)}
                            placeholder="Section Description"
                            className="w-full p-1 text-xs rounded border border-slate-300 dark:border-slate-700"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[10px] shrink-0">
                            {act.act} §{act.section}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{act.desc}</span>
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeActSectionRow(i)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No specific statutory section mentioned in dictation</p>
              )}
            </div>
          </div>

          {/* Occurrence of Offence & Place */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
                6. Occurrence of Offence:
              </span>
              <div>
                <span className="font-semibold text-slate-500">Date of Incident:</span>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    value={extractedData.incident_date || ''}
                    onChange={(e) => updateField('incident_date', e.target.value)}
                    className="p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                  />
                ) : (
                  <span>{extractedData.incident_date}</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-500">Time of Incident:</span>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={extractedData.incident_time || ''}
                    onChange={(e) => updateField('incident_time', e.target.value)}
                    className="p-1 rounded border border-slate-300 dark:border-slate-700 text-xs w-20"
                  />
                ) : (
                  <span>{extractedData.incident_time} hrs</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-500">Gravity:</span>{' '}
                {isEditing ? (
                  <select
                    value={extractedData.gravity || 'Non-Heinous'}
                    onChange={(e) => updateField('gravity', e.target.value)}
                    className="p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    <option value="Heinous Crime">Heinous Crime</option>
                    <option value="Non-Heinous">Non-Heinous</option>
                  </select>
                ) : (
                  <span>{extractedData.gravity}</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
                7. Place of Occurrence:
              </span>
              <div>
                <span className="font-semibold text-slate-500">Location:</span>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={extractedData.location_name || ''}
                    onChange={(e) => updateField('location_name', e.target.value)}
                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs mt-1"
                  />
                ) : (
                  <span>{extractedData.location_name}</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-500">Geo Coordinates:</span>{' '}
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={extractedData.latitude || ''}
                      onChange={(e) => updateField('latitude', e.target.value)}
                      placeholder="Lat"
                      className="w-24 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="text"
                      value={extractedData.longitude || ''}
                      onChange={(e) => updateField('longitude', e.target.value)}
                      placeholder="Lng"
                      className="w-24 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                ) : (
                  <span>{extractedData.latitude}, {extractedData.longitude}</span>
                )}
              </div>
            </div>
          </div>

          {/* Complainant & Accused */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
                8. Complainant / Informant Details:
              </span>
              {isEditing ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={extractedData.complainant?.name || ''}
                    onChange={(e) => updateComplainant('name', e.target.value)}
                    placeholder="Complainant Name"
                    className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={extractedData.complainant?.age || ''}
                      onChange={(e) => updateComplainant('age', e.target.value)}
                      placeholder="Age"
                      className="w-16 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="text"
                      value={extractedData.complainant?.gender || ''}
                      onChange={(e) => updateComplainant('gender', e.target.value)}
                      placeholder="Gender"
                      className="w-20 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                    />
                    <input
                      type="text"
                      value={extractedData.complainant?.contact || ''}
                      onChange={(e) => updateComplainant('contact', e.target.value)}
                      placeholder="Contact Phone"
                      className="flex-1 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={extractedData.complainant?.address || ''}
                    onChange={(e) => updateComplainant('address', e.target.value)}
                    placeholder="Full Address"
                    className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                  />
                </div>
              ) : (
                <>
                  <p><span className="font-semibold text-slate-500">Name:</span> {extractedData.complainant?.name}</p>
                  <p><span className="font-semibold text-slate-500">Age / Gender:</span> {extractedData.complainant?.age || 'N/A'}, {extractedData.complainant?.gender || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-500">Contact:</span> {extractedData.complainant?.contact || 'N/A'}</p>
                  <p><span className="font-semibold text-slate-500">Address:</span> {extractedData.complainant?.address || 'N/A'}</p>
                </>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
                  9. Details of Known / Suspected Accused:
                </span>
                {isEditing && (
                  <button
                    onClick={addAccusedRow}
                    className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Accused
                  </button>
                )}
              </div>
              {extractedData.accused?.length > 0 ? (
                extractedData.accused.map((acc, i) => (
                  <div key={i} className="border-b border-slate-200 dark:border-slate-800 pb-1.5 last:border-none">
                    {isEditing ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={acc.id || `A${i+1}`}
                            onChange={(e) => updateAccused(i, 'id', e.target.value)}
                            className="w-12 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                          />
                          <input
                            type="text"
                            value={acc.name || ''}
                            onChange={(e) => updateAccused(i, 'name', e.target.value)}
                            placeholder="Accused Name"
                            className="flex-1 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold"
                          />
                          <button
                            onClick={() => removeAccusedRow(i)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={acc.alias || ''}
                            onChange={(e) => updateAccused(i, 'alias', e.target.value)}
                            placeholder="Alias if any"
                            className="flex-1 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                          />
                          <input
                            type="text"
                            value={acc.role || ''}
                            onChange={(e) => updateAccused(i, 'role', e.target.value)}
                            placeholder="Role (e.g. Rider / Thief)"
                            className="flex-1 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                          />
                        </div>
                        <input
                          type="text"
                          value={acc.physical_marks || ''}
                          onChange={(e) => updateAccused(i, 'physical_marks', e.target.value)}
                          placeholder="Physical Identifying Marks"
                          className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-slate-900 dark:text-white">[{acc.id || `A${i+1}`}] {acc.name} {acc.alias ? `(Alias: "${acc.alias}")` : ''}</p>
                        <p><span className="font-semibold text-slate-500">Role:</span> {acc.role || 'Suspect'}</p>
                        {acc.physical_marks && <p className="text-[11px] text-slate-500">Marks: {acc.physical_marks}</p>}
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No specific accused named in the recording</p>
              )}
            </div>
          </div>

          {/* FIR Brief Narrative */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
              10. First Information Contents (Substance of Complaint):
            </span>
            {isEditing ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 font-sans text-xs leading-relaxed resize-none"
              />
            ) : (
              <p className="font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {transcript}
              </p>
            )}
          </div>

          {/* Officer Verification & Signatures */}
          <div className="pt-6 border-t-2 border-slate-900 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">CCTNS DIGITAL AUTHENTICATION</span>
              <span className="text-emerald-600 font-bold">DIGITALLY VERIFIED ✓</span>
            </div>
            <div className="text-right space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white">{extractedData.investigating_officer?.name || 'V. Sharma'}</p>
              <p className="text-slate-500">{extractedData.investigating_officer?.rank || 'Inspector of Police'}</p>
              <p className="text-[10px] text-slate-400">Badge ID: {extractedData.investigating_officer?.badge_id || 'KSP-4092'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SPOT PANCHANAMA / MAHAJARU SEIZURE MEMO ── */}
      {activeTab === 'panchanama_memo' && extractedData && extractedData.is_valid_incident && (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg max-w-4xl mx-auto space-y-6 print:p-0 print:border-none print:shadow-none">
          
          {/* Edit Mode Notice Banner */}
          {isEditing && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Edit3 className="w-4 h-4" />
                EDIT MODE ACTIVE: You can modify or add Panchanama witnesses and seized property below.
              </span>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all cursor-pointer"
              >
                Save & Lock
              </button>
            </div>
          )}

          {/* Government Official Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
            <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
              <DrishtiEmblem className="w-full h-full text-slate-900 dark:text-white" />
            </div>
            <h2 className="text-sm font-black tracking-widest uppercase font-serif text-slate-900 dark:text-white">
              ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ — ಸ್ಥಳ ಹಾಗೂ ಜಪ್ತಿ ಮಹಜರು
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              OFFICIAL SPOT PANCHANAMA & SEIZURE MEMORANDUM
            </h3>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              (Under Section 100 / 102 Cr.P.C & Section 105 Bharatiya Nagarik Suraksha Sanhita, 2023)
            </p>
          </div>

          {/* Panchanama Reference Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">Panchanama Memo No</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{extractedData.panchanama?.panchanama_no || 'PAN-2026-0049'}</span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">Connected FIR Case</span>
              <span className="font-bold text-slate-900 dark:text-white">{extractedData.case_number}</span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">Date & Time of Spot Search</span>
              <span className="font-bold text-slate-900 dark:text-white">{extractedData.incident_date} at {extractedData.incident_time} hrs</span>
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 uppercase block">Police Station</span>
              <span className="font-bold text-slate-900 dark:text-white">{extractedData.police_station}</span>
            </div>
          </div>

          {/* Panch Witnesses */}
          <div className="space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
              Independent Panch Witnesses Present at Spot (ಪಂಚರ ವಿವರಗಳು):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extractedData.panchanama?.panch_witnesses?.length > 0 ? (
                extractedData.panchanama.panch_witnesses.map((panch, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={panch.name || ''}
                          onChange={(e) => updatePanch(idx, 'name', e.target.value)}
                          placeholder={`Panch #${idx + 1} Name`}
                          className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={panch.age || ''}
                            onChange={(e) => updatePanch(idx, 'age', e.target.value)}
                            placeholder="Age"
                            className="w-16 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                          />
                          <input
                            type="text"
                            value={panch.occupation || ''}
                            onChange={(e) => updatePanch(idx, 'occupation', e.target.value)}
                            placeholder="Occupation"
                            className="flex-1 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                          />
                        </div>
                        <input
                          type="text"
                          value={panch.address || ''}
                          onChange={(e) => updatePanch(idx, 'address', e.target.value)}
                          placeholder="Residential Address"
                          className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-slate-900 dark:text-white">Panch #{idx + 1}: {panch.name}</p>
                        <p className="text-slate-500">Age: {panch.age || 'N/A'} yrs | Occupation: {panch.occupation || 'N/A'}</p>
                        <p className="text-slate-500 text-[11px]">Address: {panch.address || 'Local Resident'}</p>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 italic">
                  No independent panch witnesses mentioned in speech dictation.
                </div>
              )}
            </div>
          </div>

          {/* Seized Articles Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-500 font-mono text-[10px] block">
                Schedule of Physical Property / Evidentiary Articles Seized & Sealed (ಜಪ್ತಿ ಮಾಡಿದ ವಸ್ತುಗಳ ಪಟ್ಟಿ):
              </span>
              {isEditing && (
                <button
                  onClick={addSeizedArticleRow}
                  className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Seized Property
                </button>
              )}
            </div>
            {extractedData.panchanama?.seized_articles?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Item #</th>
                      <th className="p-2.5">Property Description & Serial/Chassis Marks</th>
                      <th className="p-2.5">Estimated Value</th>
                      <th className="p-2.5">Exact Spot of Recovery</th>
                      {isEditing && <th className="p-2.5">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {extractedData.panchanama.seized_articles.map((art, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                        <td className="p-2.5 font-bold">{art.item_no || idx + 1}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">
                          {isEditing ? (
                            <input
                              type="text"
                              value={art.description || ''}
                              onChange={(e) => updateSeizedArticle(idx, 'description', e.target.value)}
                              className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                            />
                          ) : (
                            art.description
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={art.estimated_value || ''}
                              onChange={(e) => updateSeizedArticle(idx, 'estimated_value', e.target.value)}
                              className="w-24 p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                            />
                          ) : (
                            art.estimated_value || 'Undetermined'
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {isEditing ? (
                            <input
                              type="text"
                              value={art.recovery_place || ''}
                              onChange={(e) => updateSeizedArticle(idx, 'recovery_place', e.target.value)}
                              className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs"
                            />
                          ) : (
                            art.recovery_place || 'Spot'
                          )}
                        </td>
                        {isEditing && (
                          <td className="p-2.5">
                            <button
                              onClick={() => removeSeizedArticleRow(idx)}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs">
                No physical property or seizure articles reported in the dictation.
              </div>
            )}
          </div>

          {/* Kannada Official Spot Narrative */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 font-mono text-[10px] block">
              ಸ್ಥಳ ಮಹಜರು ವರದಿ (Official Kannada Spot Observation Narrative):
            </span>
            {isEditing ? (
              <textarea
                value={extractedData.panchanama?.spot_observations_kannada || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setExtractedData(prev => ({
                    ...prev,
                    panchanama: { ...prev.panchanama, spot_observations_kannada: val }
                  }));
                }}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-sans text-xs leading-relaxed"
              />
            ) : (
              <p className="font-sans leading-relaxed text-slate-800 dark:text-slate-200">
                {extractedData.panchanama?.spot_observations_kannada || 'ಘಟನಾ ಸ್ಥಳದಲ್ಲಿ ಪಂಚರ ಸಮ್ಮುಖದಲ್ಲಿ ತಪಾಸಣೆ ನಡೆಸಿ ಸಾಕ್ಷ್ಯಗಳನ್ನು ವಶಪಡಿಸಿಕೊಳ್ಳಲಾಯಿತು.'}
              </p>
            )}
          </div>

          {/* Signatures Grid */}
          <div className="pt-8 border-t-2 border-slate-900 dark:border-slate-700 grid grid-cols-3 gap-4 text-center text-xs font-mono">
            <div className="space-y-4">
              <div className="h-8 border-b border-dashed border-slate-400 w-32 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Signature of Panch #1</p>
            </div>
            <div className="space-y-4">
              <div className="h-8 border-b border-dashed border-slate-400 w-32 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Signature of Panch #2</p>
            </div>
            <div className="space-y-4">
              <div className="h-8 border-b border-dashed border-slate-400 w-32 mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white">Investigating Officer (I.O)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
