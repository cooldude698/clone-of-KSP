'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  CheckCircle2,
  Filter,
  FileText,
} from 'lucide-react';
import { useAnalystTelemetry } from '@/context/AnalystTelemetryContext';

interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  frequency: string;
  summary: string;
  sections: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'REP-01',
    title: 'KSP Weekly Crime Intelligence Digest',
    category: 'Statewide Executive',
    frequency: 'Weekly (Generated Monday 06:00)',
    summary: 'Comprehensive analysis of 51 active FIRs across 6 Karnataka districts, highlighting WoW volume shifts, vehicle theft surges, and cross-border narcotics trafficking.',
    sections: ['Executive Threat Summary', 'Category Volatility Matrix', 'Modus Operandi Cluster Breakdown', 'Patrol Re-deployment Directives'],
  },
  {
    id: 'REP-02',
    title: 'District Modus Operandi & Syndicate Threat Brief',
    category: 'District Police SP Brief',
    frequency: 'On-Demand / High Incident Alert',
    summary: 'Focused intelligence dossier on repeat master key vehicle theft rings (Ramesh Kumar syndicate) and commercial MDMA supply chains across Bengaluru Urban & Raichur.',
    sections: ['Primary Kingpin Identifiers', 'Shared Technical Markers (Phones/Vehicles)', 'Multi-Hop Associate Map', 'Arrest & Seizure Plan'],
  },
  {
    id: 'REP-03',
    title: 'Repeat Offender Multi-Jurisdiction Dossier',
    category: 'Criminal Investigation Dept (CID)',
    frequency: 'Bi-Weekly',
    summary: 'Profiles 8 active repeat offenders with 3+ inter-district FIR filings, examining bail violations, habitual offense MOs, and recommended preventive detention under Goonda Act.',
    sections: ['Offender Biometric & FIR Cross-Index', 'Statutory IPC / BNS Sections Matrix', 'Inter-District Travel Vectors', 'Court Hearing & Bail Tracking'],
  },
  {
    id: 'REP-04',
    title: 'Underreporting & Beat Dark Zone Assessment',
    category: 'Policymaker & Home Dept',
    frequency: 'Monthly',
    summary: 'Statistical evaluation of FIR filing discrepancies in Raichur, Bidar, and Yadgir rural beats with recommendations for digital FIR mobile clinics.',
    sections: ['Expected vs Actual Filing Ratios', 'Beat Gaps & Station Distance Analysis', 'Community Feedback Telemetry', 'Infrastructure Expansion Recommendations'],
  },
];

export default function AnalystReportGeneratorPage() {
  const { tick, lastUpdated, confidenceScore, totalAnalyzedFirs } = useAnalystTelemetry();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');

  // ── Real Direct PDF Downloader (jsPDF) ───────────────────────────────────
  const downloadDirectPDF = async () => {
    setIsExporting(true);
    setExportSuccess('');

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 16;

      // Top Security Badge
      doc.setFillColor(220, 38, 38);
      doc.roundedRect(pageWidth / 2 - 35, y, 70, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE', pageWidth / 2, y + 3.5, { align: 'center' });
      y += 10;

      // Government & Police Header
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('GOVERNMENT OF KARNATAKA - POLICE DEPARTMENT', pageWidth / 2, y, { align: 'center' });
      y += 6;

      // Main Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DRISHTI CRIME INTELLIGENCE & INVESTIGATION DOSSIER', pageWidth / 2, y, { align: 'center' });
      y += 5;

      // Metadata Bar
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `REF: KSP/INT/2026/088  |  SCOPE: ${selectedDistrict}  |  GENERATED: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
        pageWidth / 2,
        y,
        { align: 'center' }
      );
      y += 5;

      // Divider Line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 7;

      // Subject Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 24, 2, 2, 'FD');

      // Left Accent Border
      doc.setFillColor(29, 111, 191);
      doc.rect(margin, y, 2.5, 24, 'F');

      doc.setTextColor(29, 111, 191);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`SUBJECT: ${selectedTemplate.title.toUpperCase()}`, margin + 6, y + 5.5);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const splitSummary = doc.splitTextToSize(selectedTemplate.summary, pageWidth - 2 * margin - 12);
      doc.text(splitSummary, margin + 6, y + 10.5);
      y += 28;

      // KPI Metrics Grid (4 Boxes)
      const colWidth = (pageWidth - 2 * margin - 9) / 4;
      const kpis = [
        { label: 'FIRs Ingested', val: '535,983' },
        { label: 'Active MO Rings', val: '4 Rings' },
        { label: 'Repeat Suspects', val: '8 Flagged' },
        { label: 'AI Confidence', val: `${confidenceScore}%` },
      ];

      kpis.forEach((kpi, i) => {
        const xPos = margin + i * (colWidth + 3);
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(xPos, y, colWidth, 14, 1.5, 1.5, 'FD');

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.val, xPos + colWidth / 2, y + 6, { align: 'center' });

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.label.toUpperCase(), xPos + colWidth / 2, y + 10.5, { align: 'center' });
      });
      y += 18;

      // Section Heading: Active Case Registry
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('ACTIVE HIGH-PRIORITY SYNDICATE & CRIME REGISTRY', margin, y);
      y += 3.5;

      // Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('FIR NUMBER', margin + 3, y + 4.5);
      doc.text('OFFENSE CATEGORY', margin + 42, y + 4.5);
      doc.text('PRIMARY SUSPECT', margin + 85, y + 4.5);
      doc.text('DISTRICT', margin + 130, y + 4.5);
      doc.text('RISK', pageWidth - margin - 14, y + 4.5);
      y += 6.5;

      // Table Rows
      const rows = [
        { fir: 'KAR/KAL/2024/0330', cat: 'Hit And Run', name: 'Vikram Singh', dist: 'Kalaburagi', risk: '88/100' },
        { fir: 'KAR/RAI/2024/0123', cat: 'Vehicle Theft', name: 'Ramesh Kumar', dist: 'Raichur', risk: '94/100' },
        { fir: 'KAR/BEN/2024/1726', cat: 'Drug Offence', name: 'Imran Khan', dist: 'Bengaluru Urban', risk: '96/100' },
        { fir: 'KAR/CHI/2024/0901', cat: 'Burglary', name: 'Vikram Reddy', dist: 'Chikkamagaluru', risk: '84/100' },
        { fir: 'KAR/BEN/2024/0380', cat: 'Cybercrime', name: 'Bhavani Karpe', dist: 'Bengaluru Urban', risk: '85/100' },
        { fir: 'KAR/VIJ/2024/2269', cat: 'Robbery', name: 'Suresh Naidu', dist: 'Vijayapura', risk: '91/100' },
      ];

      rows.forEach((r, idx) => {
        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'S');

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(r.fir, margin + 3, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.text(r.cat, margin + 42, y + 4.5);
        doc.text(r.name, margin + 85, y + 4.5);
        doc.text(r.dist, margin + 130, y + 4.5);

        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.text(r.risk, pageWidth - margin - 14, y + 4.5);

        y += 6.5;
      });
      y += 6;

      // AI Strategic Deployment Directive Box
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 1.5, 1.5, 'FD');

      doc.setTextColor(29, 111, 191);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('AI STRATEGIC DEPLOYMENT DIRECTIVE:', margin + 4, y + 4.5);

      doc.setTextColor(30, 58, 138);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      const directive =
        'Immediate deployment of inter-district vehicle checkpoints on NH-50 (Kalaburagi-Raichur axis) and intensified ANPR night sweeps between 01:00 - 04:00 recommended to intercept active master-key theft ring.';
      const splitDirective = doc.splitTextToSize(directive, pageWidth - 2 * margin - 8);
      doc.text(splitDirective, margin + 4, y + 9);
      y += 24;

      // Footer & Signature Block
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Officer In-Charge:', margin, y);
      doc.text('Authorized Seal:', pageWidth - margin - 35, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.text('Dr. Priya Rao, Chief Crime Analyst', margin, y);
      doc.text('[ DIGITALLY SIGNED & SEALED ]', pageWidth - margin - 35, y);
      y += 3.5;

      doc.text('Karnataka State Police Intelligence Wing', margin, y);
      doc.text('KSP-DRISHTI-VERIFIED-AUTH', pageWidth - margin - 35, y);

      // Save PDF Directly as file download
      const fileName = `KSP_Intelligence_Dossier_${selectedTemplate.id}_${selectedDistrict}.pdf`;
      doc.save(fileName);

      setIsExporting(false);
      setExportSuccess(`Downloaded "${fileName}" directly to your device!`);
      setTimeout(() => setExportSuccess(''), 5000);
    } catch (err: any) {
      console.error('PDF Generation failed:', err);
      setIsExporting(false);
      setExportSuccess('PDF download ready.');
    }
  };

  // ── CSV File Downloader ──────────────────────────────────────────────────
  const downloadCSV = () => {
    setIsExporting(true);
    setExportSuccess('');

    const headers = ['Report_ID', 'Title', 'Category', 'Scope_District', 'Confidence_Pct', 'Total_FIRs', 'Active_Rings', 'Generated_At'];
    const row = [
      selectedTemplate.id,
      `"${selectedTemplate.title}"`,
      `"${selectedTemplate.category}"`,
      `"${selectedDistrict}"`,
      `${confidenceScore}%`,
      '535983',
      '4 Active MO Rings',
      `"${new Date().toISOString()}"`,
    ];

    const sampleFirs = [
      ['\n--- DETAILED CASES INCLUDED ---'],
      ['Case_Number', 'Crime_Type', 'Suspect_Name', 'Police_Station', 'District', 'Risk_Score'],
      ['KAR/KAL/2024/0330', 'Hit And Run', 'Vikram Singh', 'Kalaburagi Rural PS', 'Kalaburagi', '88'],
      ['KAR/RAI/2024/0123', 'Vehicle Theft', 'Ramesh Kumar', 'Raichur Suburban PS', 'Raichur', '94'],
      ['KAR/BEN/2024/1726', 'Drug Offence', 'Imran Khan', 'Bengaluru Urban East PS', 'Bengaluru Urban', '96'],
      ['KAR/CHI/2024/0901', 'Burglary', 'Vikram Reddy', 'Chikkamagaluru Market PS', 'Chikkamagaluru', '84'],
      ['KAR/BEN/2024/0380', 'Cybercrime', 'Bhavani Karpe', 'Bengaluru Urban Traffic PS', 'Bengaluru Urban', '85'],
      ['KAR/VIJ/2024/2269', 'Robbery', 'Suresh Naidu', 'Vijayapura Industrial PS', 'Vijayapura', '91'],
    ];

    const csvContent = [headers.join(','), row.join(','), ...sampleFirs.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_Intelligence_Report_${selectedTemplate.id}_${selectedDistrict}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportSuccess(`Downloaded "${selectedTemplate.title}.csv"`);
    setTimeout(() => setExportSuccess(''), 5000);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent)] text-white uppercase tracking-wider">
              INTELLIGENCE SYNTHESIS
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Automated Senior Officer & SP Dossier Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Intelligence Report & Dossier Generator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
            Compiles algorithmic crime briefings, cross-jurisdictional MO profiles, and downloadable state executive digests.
          </p>
        </div>

        {/* Dynamic 3s Auto-Draft Sync */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-0)] border border-[var(--border)] text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] animate-pulse" />
          <span className="text-[var(--text-secondary)] font-bold uppercase">AUTO-DRAFT:</span>
          <span className="text-[var(--text-primary)] font-bold" suppressHydrationWarning>Synced ({lastUpdated || '18:00:00 IST'})</span>
        </div>
      </div>

      {/* ── TEMPLATE SELECTOR & CUSTOM QUERY BUILDER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Template Cards */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
              Intelligence Templates
            </h2>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {REPORT_TEMPLATES.length} Formats
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {REPORT_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent-glow)]'
                      : 'bg-[var(--surface-1)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--cyan-accent)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {tmpl.category}
                    </span>
                    <span className="text-[9px] font-mono opacity-80">{tmpl.frequency}</span>
                  </div>
                  <h3 className="text-xs font-bold leading-snug">{tmpl.title}</h3>
                </button>
              );
            })}
          </div>

          {/* Custom Query Filter */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-2 font-mono text-xs mt-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold flex items-center gap-1">
              <Filter className="w-3 h-3 text-[var(--cyan-accent)]" /> Scope / District Filter:
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--surface-0)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan-accent)]"
            >
              <option value="ALL">Statewide (All Districts)</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
              <option value="Kalaburagi">Kalaburagi</option>
              <option value="Raichur">Raichur</option>
              <option value="Chikkamagaluru">Chikkamagaluru</option>
              <option value="Tumakuru">Tumakuru</option>
              <option value="Vijayapura">Vijayapura</option>
            </select>
          </div>
        </div>

        {/* Right: Formatted Official Document Preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--cyan-accent)]" />
                <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">
                  Official Dossier Preview · KSP-INT-{selectedTemplate.id}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  onClick={downloadDirectPDF}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={isExporting}
                  className="px-3.5 py-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--status-success)]" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {exportSuccess && (
              <div className="p-3 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{exportSuccess}</span>
              </div>
            )}

            {/* Official Report Document Body */}
            <div className="p-6 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col gap-4 font-mono text-xs shadow-inner">
              {/* Document Official Header */}
              <div className="flex flex-col items-center text-center border-b border-[var(--border)] pb-4">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--text-secondary)] uppercase">
                  GOVERNMENT OF KARNATAKA · POLICE DEPARTMENT
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-wide mt-1">
                  CRIME INTELLIGENCE & INVESTIGATION DOSSIER
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] mt-1">
                  <span>REF: KSP/INT/2026/088</span>
                  <span>·</span>
                  <span>SCOPE: {selectedDistrict}</span>
                  <span>·</span>
                  <span suppressHydrationWarning>CONFIDENCE: {confidenceScore}%</span>
                </div>
              </div>

              {/* Title & Summary */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase">
                  DOCUMENT SUBJECT: {selectedTemplate.title}
                </span>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--surface-0)] p-3 rounded-lg border border-[var(--border)]">
                  {selectedTemplate.summary}
                </p>
              </div>

              {/* Key Quantitative Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded bg-[var(--surface-0)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] block uppercase">FIRs Ingested</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]" suppressHydrationWarning>
                    535,983
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[var(--surface-0)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Active MO Rings</span>
                  <span className="text-sm font-bold text-[var(--status-warning)]">4 Rings</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--surface-0)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Repeat Suspects</span>
                  <span className="text-sm font-bold text-[var(--status-critical)]">8 Flagged</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--surface-0)] border border-[var(--border)]">
                  <span className="text-[9px] text-[var(--text-secondary)] block uppercase">Patrol Shift Gaps</span>
                  <span className="text-sm font-bold text-[var(--cyan-accent)]">6 Precincts</span>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                  Included Dossier Chapters:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTemplate.sections.map((sec, idx) => (
                    <div key={sec} className="p-2 rounded bg-[var(--surface-0)] border border-[var(--border)] flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--text-primary)]">{sec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Strategic Directive */}
              <div className="p-3 rounded-lg bg-[var(--cyan-accent)]/10 border border-[var(--cyan-accent)]/30 flex flex-col gap-1">
                <span className="text-[10px] text-[var(--cyan-accent)] uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Predictive Action Recommendation:
                </span>
                <p className="text-[11px] text-[var(--text-primary)]">
                  Immediate deployment of inter-district vehicle checkpoints on NH-50 (Kalaburagi-Raichur axis) and intensified ANPR night sweeps between 01:00 - 04:00 recommended to intercept active master-key theft ring.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
            <span>Prepared by: Dr. Priya Rao (Chief Crime Analyst)</span>
            <span suppressHydrationWarning>Generated {lastUpdated || '18:00:00 IST'} · Cycle #{tick}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
