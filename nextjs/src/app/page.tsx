'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldAlert, Shield, KeyRound, UserCheck, Eye, EyeOff, 
  Activity, Radio, Cpu, Bot, ArrowRight, Zap, CheckCircle2, Lock,
  Sparkles, Sliders, ChevronRight, User
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Previews
import ChatHeatmapMockup from '@/components/landing/ChatHeatmapMockup';
import GeoTrailMockup from '@/components/landing/GeoTrailMockup';
import ChronoNetworkMockup from '@/components/landing/ChronoNetworkMockup';

const DEMO_TIERS = [
  { 
    role: 'Inspector', 
    empId: 'inspector',
    officerName: 'V. Sharma',
    icon: UserCheck, 
    desc: 'Field Operations & ANPR Alerts'
  },
  { 
    role: 'Crime Analyst', 
    empId: 'analyst',
    officerName: 'R. Deshmukh',
    icon: Activity, 
    desc: 'Hotspot Mapping & Pattern Recognition'
  },
  { 
    role: 'Supervisor', 
    empId: 'supervisor',
    officerName: 'K. Patil',
    icon: Shield, 
    desc: 'District Command & Force Allocation'
  },
  { 
    role: 'Policymaker', 
    empId: 'policymaker',
    officerName: 'M. Reddy',
    icon: Sliders, 
    desc: 'Strategic Crime Trends & Analytics'
  },
];

const ROLES = ['Inspector', 'Crime Analyst', 'Supervisor', 'Policymaker'];

export default function LandingPage() {
  const router = useRouter();
  
  // Login Panel States
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // System configurations
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [timeString, setTimeString] = useState('');

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    const timer = setInterval(() => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    }, 1000);
    return () => {
      mediaQuery.removeEventListener('change', listener);
      clearInterval(timer);
    };
  }, []);

  const handleSignInSubmit = async (overrideId?: string, overridePwd?: string, overrideRole?: string) => {
    setError('');
    const finalId = overrideId !== undefined ? overrideId : employeeId;
    const finalPwd = overridePwd !== undefined ? overridePwd : password;
    const finalRole = overrideRole !== undefined ? overrideRole : role;

    if (!finalId.trim() || !finalPwd.trim() || !finalRole) {
      setError('Please provide your Officer ID, Password, and Clearance Tier.');
      return;
    }

    setLoading(true);
    try {
      const email = finalId.includes('@') ? finalId : `${finalId}@drishti.ksp`;
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: finalPwd, role: finalRole }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('role', finalRole);
        localStorage.setItem('userName', data.user?.name || 'V. Sharma');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('drishti_role', finalRole);
        localStorage.setItem('drishti_employee_id', finalId);
        router.push('/dashboard');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('Connection timeout. Unable to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleName: string, empId: string, officerName?: string) => {
    localStorage.setItem('role', roleName);
    localStorage.setItem('userName', officerName || 'V. Sharma');
    localStorage.setItem('userEmail', `${empId}@drishti.ksp`);
    localStorage.setItem('drishti_role', roleName);
    localStorage.setItem('drishti_employee_id', empId);
    router.push('/dashboard');
  };

  const scrollAnimation = prefersReducedMotion 
    ? {} 
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-100px' },
        transition: { duration: 0.6 }
      };

  return (
    <main 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] flex flex-col font-sans relative overflow-hidden transition-colors duration-200"
    >
      {/* ── TOP MODERN NAVIGATION BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--surface-0)]/85 border-b border-[var(--border)]/40 px-6 sm:px-10 py-4 flex items-center justify-between shadow-sm">
        {/* Left: Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/25 border border-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-sm text-[var(--text-primary)] font-sans">
                DRISHTI AI
              </span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                KSP v2.4
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] tracking-wide font-medium">
              KARNATAKA STATE POLICE CO-PILOT
            </span>
          </div>
        </div>

        {/* Center: System Status Indicator */}
        <div className="hidden md:flex items-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
            <span className="beacon-dot" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              NETWORK ONLINE
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="font-mono">12,500+ FEEDS ACTIVE</span>
          </div>
          <div className="text-[var(--text-secondary)] font-mono text-[11px]">
            {timeString || '13:00:00 IST'}
          </div>
        </div>

        {/* Right: Visible Rounded Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSigningIn(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
          >
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>OFFICER LOGIN</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── SECTION 1: HERO & LOGIN PORTAL ────────────────────────────── */}
      <section className="min-h-[calc(100vh-73px)] w-full relative flex items-center justify-center p-6 border-b border-[var(--border)]/30 overflow-hidden select-none">
        
        {/* Soft Modern Glow Spotlight */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.12), transparent 50%)`
          }}
        />

        {/* Ambient Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        {/* Subtle Geometric Mesh Background */}
        <div className="absolute inset-0 cyber-grid-bg opacity-20 z-0 pointer-events-none" />

        {/* Floating System Badges */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
          <div className="absolute top-[18%] left-[6%] flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--surface-1)]/80 border border-[var(--border)]/50 backdrop-blur-xl shadow-xl hover:scale-105 transition-all">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[var(--text-secondary)] font-bold tracking-wider">CCTNS Database</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">1,25,000+ FIR Records</span>
            </div>
          </div>

          <div className="absolute top-[20%] right-[6%] flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--surface-1)]/80 border border-[var(--border)]/50 backdrop-blur-xl shadow-xl hover:scale-105 transition-all">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[var(--text-secondary)] font-bold tracking-wider">Precinct Coverage</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">12,500+ ANPR Cameras</span>
            </div>
          </div>

          <div className="absolute bottom-[18%] right-[8%] flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--surface-1)]/80 border border-[var(--border)]/50 backdrop-blur-xl shadow-xl hover:scale-105 transition-all">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[var(--text-secondary)] font-bold tracking-wider">Traffic Telemetry</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">240+ BATCS Signals</span>
            </div>
          </div>
        </div>

        {/* Hero Title & Main Actions */}
        <div className="relative z-30 text-center max-w-3xl mx-auto flex flex-col items-center gap-8 py-10 px-4">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide">
              NEXT-GEN CRIME INTELLIGENCE PLATFORM
            </span>
          </div>

          {/* Title Stack */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-baseline justify-center gap-4 flex-wrap">
              <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-[var(--text-primary)] font-sans drop-shadow-sm">
                DRISHTI
              </h1>
              <span className="text-4xl sm:text-5xl text-blue-600 dark:text-blue-400 font-bold font-kannada">
                ದೃಷ್ಟಿ
              </span>
            </div>
            <p className="mt-1 text-sm sm:text-base text-[var(--text-secondary)] font-medium tracking-wide leading-relaxed max-w-xl">
              Intelligence that sees what others miss — Empowering Karnataka Officers with Spatial & Chronological Awareness.
            </p>
          </div>

          {/* Mobile Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 lg:hidden text-xs">
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-3 py-1.5 rounded-full text-[var(--text-primary)] font-medium shadow-sm">1,25,000+ FIRs</span>
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-3 py-1.5 rounded-full text-[var(--text-primary)] font-medium shadow-sm">12,500+ Cameras</span>
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-3 py-1.5 rounded-full text-[var(--text-primary)] font-medium shadow-sm">240+ BATCS</span>
          </div>

          {/* Main Interactive CTA & Authentication Card */}
          <div className="w-full flex items-center justify-center mt-2">
            <AnimatePresence mode="wait">
              {!isSigningIn ? (
                <div className="flex flex-col items-center gap-6 w-full max-w-xl">
                  {/* Primary Button — Balanced, Sleek & Professional */}
                  <motion.button
                    key="cta-button"
                    layoutId="authPanel"
                    onClick={() => setIsSigningIn(true)}
                    className="group px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer border border-white/20"
                  >
                    <Lock className="w-4 h-4 text-white" />
                    <span>ENTER CONTROL ROOM</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Clean, Refined Quick Demo Login Tiers */}
                  <div className="flex flex-col items-center gap-3 w-full bg-[var(--surface-1)]/90 backdrop-blur-md border border-[var(--border)]/60 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Quick Demo Access Tiers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                      {DEMO_TIERS.map((tier) => {
                        const IconComp = tier.icon;
                        return (
                          <button
                            key={tier.role}
                            onClick={() => handleQuickLogin(tier.role, tier.empId, tier.officerName)}
                            className="group p-3 rounded-xl bg-[var(--surface-0)] hover:bg-[var(--surface-2)] border border-[var(--border)]/50 text-left transition-all duration-200 shadow-sm flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                  {tier.role}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)]">
                                  {tier.desc}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Round-Cornered Officer Auth Card */
                <motion.div
                  key="auth-panel"
                  layoutId="authPanel"
                  className="w-full max-w-md rounded-3xl bg-[var(--surface-1)]/95 backdrop-blur-2xl border border-[var(--border)] p-7 shadow-2xl text-[var(--text-primary)] flex flex-col gap-5 text-left relative"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)]/50 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <KeyRound className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold uppercase text-[var(--text-primary)] tracking-wide">
                          Officer Authentication
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                          DRISHTI Secure Police Portal
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsSigningIn(false); setError(''); }}
                      className="w-8 h-8 rounded-full bg-[var(--surface-0)] hover:bg-rose-500 hover:text-white flex items-center justify-center text-[var(--text-secondary)] transition-colors outline-none cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {error && (
                    <div className="text-xs text-[var(--status-critical)] bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 animate-slide-in">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Employee ID */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="employee-id" className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 pl-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Officer Handle / Employee ID</span>
                    </label>
                    <input
                      id="employee-id"
                      type="text"
                      placeholder="e.g. inspector"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="px-4 py-3 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)]/70 placeholder-[var(--text-secondary)]/50 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-[var(--text-primary)] font-sans shadow-inner"
                    />
                  </div>

                  {/* Passcode */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 pl-1">
                      <Lock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Passcode</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)]/70 placeholder-[var(--text-secondary)]/50 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-[var(--text-primary)] font-sans shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Clearance Tier */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="role" className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 pl-1">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      <span>Clearance Tier</span>
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="px-4 py-3 rounded-2xl bg-[var(--surface-0)] border border-[var(--border)]/70 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-sans text-[var(--text-primary)] shadow-inner"
                    >
                      <option value="" disabled className="bg-[var(--surface-0)] text-[var(--text-secondary)]">Select Officer Role Tier...</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-[var(--surface-0)] text-[var(--text-primary)]">{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Main Auth Submit Button */}
                  <button
                    onClick={() => handleSignInSubmit()}
                    disabled={loading}
                    className="mt-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-blue-600/35 active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Lock className="w-4 h-4 text-white" />
                    <span>{loading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ACCESS'}</span>
                  </button>

                  {/* Quick Bypasses inside Auth Modal */}
                  <div className="pt-3 border-t border-[var(--border)]/50 flex flex-col gap-2">
                    <span className="text-[11px] text-[var(--text-secondary)] font-semibold text-center">
                      Quick Demo Access Shortcuts:
                    </span>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {DEMO_TIERS.map((tier) => (
                        <button
                          key={tier.role}
                          type="button"
                          onClick={() => handleQuickLogin(tier.role, tier.empId, tier.officerName)}
                          className="px-3 py-1.5 rounded-full bg-[var(--surface-0)] hover:bg-blue-600 hover:text-white border border-[var(--border)] text-[11px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
                        >
                          {tier.role} →
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PROBLEM & SOLUTION STATS ────────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-b border-[var(--border)]/30">
        <motion.div {...scrollAnimation} className="flex flex-col gap-6">
          <div className="inline-flex items-center justify-center gap-2 mx-auto px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5" /> CRIME DATA SILOS RESOLVED
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] font-sans max-w-3xl mx-auto leading-tight">
            1,25,000+ FIRs. 31 Districts. Instant AI Correlation.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto font-medium tracking-wide leading-relaxed">
            DRISHTI correlates live surveillance feeds, CCTNS record filings, and traffic ANPR logs in real time—giving Karnataka State Police complete situational awareness.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/50 text-left shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-sans">&lt; 1s</span>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mt-1">Multilingual RAG Search</p>
            </div>
            <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/50 text-left shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans">31</span>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mt-1">Districts Integrated</p>
            </div>
            <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/50 text-left shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-sans">94.2%</span>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mt-1">ANPR Precision Rate</p>
            </div>
            <div className="p-5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/50 text-left shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-sans">1,100+</span>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mt-1">Police Stations Synced</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 3: CAPABILITY PREVIEWS ─────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.div {...scrollAnimation} className="flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              DRISHTI INTELLIGENCE SUITE
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-1 font-sans">
              Tactical Co-Pilot Capabilities
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card A: Chat + Heatmap */}
            <div className="flex flex-col gap-3 group">
              <div className="p-1.5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/60 shadow-lg group-hover:border-blue-500 transition-all">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]/40">
                  <div className="absolute top-3 right-3 z-20">
                    <span className="badge badge-critical font-bold text-[10px] px-3 py-1 rounded-full">FIR-2026-BL-4921</span>
                  </div>
                  <ChatHeatmapMockup />
                </div>
              </div>
              <div className="text-center mt-1">
                <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Spatial Crime Analytics</h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                  AI interface — inline hotspot maps and natural language query.
                </p>
              </div>
            </div>

            {/* Card B: Geo-trail Map */}
            <div className="flex flex-col gap-3 group">
              <div className="p-1.5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/60 shadow-lg group-hover:border-blue-500 transition-all">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]/40">
                  <div className="absolute top-3 right-3 z-20">
                    <span className="badge badge-warning font-bold text-[10px] px-3 py-1 rounded-full">KA-01-MJ-8821</span>
                  </div>
                  <GeoTrailMockup />
                </div>
              </div>
              <div className="text-center mt-1">
                <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Geo-Trail Vehicle Tracker</h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                  Suspect geo-trail — multi-camera trajectory reconstruction.
                </p>
              </div>
            </div>

            {/* Card C: Chrono-criminal Network Graph */}
            <div className="flex flex-col gap-3 group">
              <div className="p-1.5 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)]/60 shadow-lg group-hover:border-blue-500 transition-all">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)]/40">
                  <div className="absolute top-3 right-3 z-20">
                    <span className="badge badge-success font-bold text-[10px] px-3 py-1 rounded-full">NET-WHITEFIELD-04</span>
                  </div>
                  <ChronoNetworkMockup />
                </div>
              </div>
              <div className="text-center mt-1">
                <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Criminal Network Link Graph</h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                  Accomplice dynamics — chronological relationship mapping.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 4: FOOTER ─────────────────────────────────────────────── */}
      <footer className="mt-auto py-10 px-6 bg-[var(--surface-1)] border-t border-[var(--border)]/40 text-xs text-[var(--text-secondary)] select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs">Karnataka State Police</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">State Crime Records Bureau (SCRB) • DRISHTI Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] px-3 py-1.5 rounded-full bg-[var(--surface-0)] border border-[var(--border)]/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>AES-256 SECURED ENVIRONMENT</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </footer>

    </main>
  );
}
