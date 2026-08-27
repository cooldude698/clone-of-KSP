'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, Shield, ArrowLeft, Plus, Trash2, CheckCircle2,
  AlertTriangle, MapPin, User, Scale, Building2, Send, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewFIRPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedCrimeNo, setGeneratedCrimeNo] = useState('');

  // Form State
  const [category, setCategory] = useState('1'); // 1: FIR, 3: UDR, 4: PAR, 8: Zero FIR
  const [gravity, setGravity] = useState('1'); // 1: Heinous, 2: Non-Heinous
  const [districtId, setDistrictId] = useState('443'); // 443: Bengaluru Urban, 102: Mysuru
  const [unitId, setUnitId] = useState('6'); // 6: Silk Board, 12: MG Road, 18: Whitefield CEN
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('14:30');
  const [lat, setLat] = useState('12.9352');
  const [lng, setLng] = useState('77.6245');
  const [briefFacts, setBriefFacts] = useState('');
  const [courtId, setCourtId] = useState('1');
  const [ioId, setIoId] = useState('1001');

  // Complainant
  const [complainant, setComplainant] = useState({
    name: '',
    age: '35',
    gender: 'Male',
    occupation: 'Private Sector Employee',
    religion: 'Hindu'
  });

  // Victims
  const [victims, setVictims] = useState([
    { name: '', age: '30', gender: 'Male', isPolice: false }
  ]);

  // Accused
  const [accusedList, setAccusedList] = useState([
    { personId: 'A1', name: '', age: '28', gender: 'Male', role: 'Prime Accused / Mastermind' }
  ]);

  // Acts & Sections
  const [acts, setActs] = useState([
    { act: 'IPC', section: '379', desc: 'Punishment for Theft' }
  ]);

  // Helpers to add/remove rows
  const addVictim = () => setVictims([...victims, { name: '', age: '30', gender: 'Male', isPolice: false }]);
  const removeVictim = (index) => setVictims(victims.filter((_, i) => i !== index));

  const addAccused = () => {
    const nextTag = `A${accusedList.length + 1}`;
    setAccusedList([...accusedList, { personId: nextTag, name: '', age: '25', gender: 'Male', role: 'Accomplice' }]);
  };
  const removeAccused = (index) => setAccusedList(accusedList.filter((_, i) => i !== index));

  const addActSection = () => setActs([...acts, { act: 'IPC', section: '392', desc: 'Punishment for Robbery' }]);
  const removeActSection = (index) => setActs(acts.filter((_, i) => i !== index));

  // Compute 18-digit CrimeNo Preview
  const previewCrimeNo = `${category}${districtId.padStart(4, '0')}${unitId.padStart(4, '0')}2026${'00049'}`;
  const previewCaseNo = `202600049`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setGeneratedCrimeNo(previewCrimeNo);
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/fir"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Register Official KSP FIR</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                20-Table ERD Compliant
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              Karnataka State Police — Statutory Crime Incident & Case Registration Portal
            </p>
          </div>
        </div>

        {/* 18-Digit Crime No Preview Pill */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated Crime No (18 Digits)</span>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50/80 px-3 py-1 rounded-lg border border-blue-200">
            {previewCrimeNo}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">FIR Successfully Registered in KSP Data Store!</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Relational records committed to <code className="text-emerald-700 font-semibold">CaseMaster</code>, <code className="text-emerald-700 font-semibold">ComplainantDetails</code>, <code className="text-emerald-700 font-semibold">Accused</code>, and <code className="text-emerald-700 font-semibold">ActSectionAssociation</code>.
            </p>
            <div className="inline-block p-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-xs text-gray-800">
              <p><strong>Crime No:</strong> {generatedCrimeNo}</p>
              <p><strong>Case No:</strong> {previewCaseNo}</p>
              <p><strong>Status:</strong> Under Investigation (Assigned to IO)</p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/dashboard/fir"
                className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-all"
              >
                Return to FIR Registry
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all"
              >
                Register Another FIR
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Case Identity & Station Jurisdiction */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  1. Jurisdiction & Case Master Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Case Category Code</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="1">1 — Regular FIR</option>
                    <option value="3">3 — Unnatural Death Report (UDR)</option>
                    <option value="4">4 — Petty Act (PAR)</option>
                    <option value="8">8 — Zero FIR (Inter-district transfer)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">District Jurisdiction</label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="443">District 0443 — Bengaluru Urban / City</option>
                    <option value="102">District 0102 — Mysuru District</option>
                    <option value="103">District 0103 — Mangaluru / DK</option>
                    <option value="104">District 0104 — Belagavi District</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Police Unit (Station)</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="6">Unit 0006 — Silk Board & Madiwala PS</option>
                    <option value="12">Unit 0012 — MG Road & Cubbon Park PS</option>
                    <option value="18">Unit 0018 — Whitefield Cyber Crime / CEN PS</option>
                    <option value="24">Unit 0024 — Koramangala 80ft Road PS</option>
                    <option value="42">Unit 0042 — Mysuru Central PS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Gravity of Offence</label>
                  <select
                    value={gravity}
                    onChange={(e) => setGravity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="1">1 — Heinous (Murder, Armed Robbery, Kidnapping)</option>
                    <option value="2">2 — Non-Heinous (Theft, Simple Assault, Cheating)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Incident Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:outline-none"
                    />
                    <input
                      type="time"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Investigating Officer (IO)</label>
                  <select
                    value={ioId}
                    onChange={(e) => setIoId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none"
                  >
                    <option value="1001">Insp. Vikram Sharma (KGID: KSP-4092)</option>
                    <option value="1002">Insp. Ananya Hegde (KGID: KSP-5120)</option>
                    <option value="1003">Insp. Rajesh Gowda (KGID: KSP-6304)</option>
                    <option value="1004">DSP Siddharth Rao (KGID: KSP-3011)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Complainant Details */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  2. Complainant Details (ComplainantDetails Table)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1.5">Complainant Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Murthy"
                    value={complainant.name}
                    onChange={(e) => setComplainant({ ...complainant, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Age (Years)</label>
                  <input
                    type="number"
                    value={complainant.age}
                    onChange={(e) => setComplainant({ ...complainant, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select
                    value={complainant.gender}
                    onChange={(e) => setComplainant({ ...complainant, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Transgender / Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Accused Roster (A1, A2...) */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    3. Accused Roster (Accused Table — PersonID A1/A2)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addAccused}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Co-Accused</span>
                </button>
              </div>

              <div className="space-y-3">
                {accusedList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
                    <span className="font-mono font-bold text-red-700 bg-red-100/70 px-2 py-1 rounded-lg">
                      {item.personId}
                    </span>
                    <input
                      type="text"
                      placeholder="Accused Full Name"
                      value={item.name}
                      onChange={(e) => {
                        const copy = [...accusedList];
                        copy[idx].name = e.target.value;
                        setAccusedList(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={item.age}
                      onChange={(e) => {
                        const copy = [...accusedList];
                        copy[idx].age = e.target.value;
                        setAccusedList(copy);
                      }}
                      className="w-16 px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-center"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Mastermind)"
                      value={item.role}
                      onChange={(e) => {
                        const copy = [...accusedList];
                        copy[idx].role = e.target.value;
                        setAccusedList(copy);
                      }}
                      className="w-48 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900"
                    />
                    {accusedList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAccused(idx)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Legal Acts & Sections Framed */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    4. Statutory Acts & Sections Framed (ActSectionAssociation Table)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addActSection}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="space-y-3">
                {acts.map((actItem, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
                    <select
                      value={actItem.act}
                      onChange={(e) => {
                        const copy = [...acts];
                        copy[idx].act = e.target.value;
                        setActs(copy);
                      }}
                      className="w-28 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-bold text-purple-700"
                    >
                      <option value="IPC">IPC / BNS</option>
                      <option value="NDPS">NDPS Act</option>
                      <option value="ITACT">IT Act 2000</option>
                      <option value="ARMS">Arms Act</option>
                      <option value="POCSO">POCSO Act</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Section (e.g. 379)"
                      value={actItem.section}
                      onChange={(e) => {
                        const copy = [...acts];
                        copy[idx].section = e.target.value;
                        setActs(copy);
                      }}
                      className="w-24 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-mono text-center font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Section Description"
                      value={actItem.desc}
                      onChange={(e) => {
                        const copy = [...acts];
                        copy[idx].desc = e.target.value;
                        setActs(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700"
                    />
                    {acts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActSection(idx)}
                        className="p-1 text-gray-400 hover:text-purple-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Coordinates & Brief Facts */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  5. Incident Location Coordinates & Brief Facts
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">GPS Latitude Coordinate</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">GPS Longitude Coordinate</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1.5">Brief Facts / FIR Summary (BriefFacts Column)</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter official brief statement of facts narrated by the complainant..."
                    value={briefFacts}
                    onChange={(e) => setBriefFacts(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Submission Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">
                Record will be indexed in Catalyst Data Store & ANPR Watchlist.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
              >
                {submitting ? (
                  <span>Registering FIR...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit & Register Official FIR</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
