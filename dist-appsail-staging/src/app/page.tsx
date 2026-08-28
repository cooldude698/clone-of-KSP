'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldAlert, Shield, KeyRound, UserCheck, Eye, EyeOff,
  Activity, Radio, Cpu, Layers, Bot, ArrowRight, Zap, CheckCircle2, Lock, ChevronRight
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Card from '@/components/ui/Card';
import DrishtiLogo, { DrishtiEmblem } from '@/components/DrishtiLogo';

// Previews
import ChatHeatmapMockup from '@/components/landing/ChatHeatmapMockup';
import GeoTrailMockup from '@/components/landing/GeoTrailMockup';
import ChronoNetworkMockup from '@/components/landing/ChronoNetworkMockup';

interface Tile {
  id: number;
  label: string;
  isLit: boolean;
  litDelay: number;
  spanClass: string;
}

// Fixed set of 48 grid cells
const HERO_TILES: Tile[] = [
  { id: 1, label: 'BLR-ANPR-01', isLit: true, litDelay: 0.2, spanClass: 'col-span-2 row-span-1' },
  { id: 2, label: 'MYS-CCTV-04', isLit: false, litDelay: 0, spanClass: 'col-span-1 row-span-1' },
  { id: 3, label: 'BLR-JNC-12', isLit: true, litDelay: 0.6, spanClass: 'col-span-1' },
  { id: 4, label: 'MYS-JNC-03', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 5, label: 'HB-ANPR-08', isLit: true, litDelay: 1.1, spanClass: 'col-span-1' },
  { id: 6, label: 'BLR-CCTV-88', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 7, label: 'BEL-CCTV-11', isLit: true, litDelay: 1.5, spanClass: 'col-span-2 row-span-2' },
  { id: 8, label: 'MYS-ANPR-02', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 9, label: 'BLR-ANPR-15', isLit: true, litDelay: 0.4, spanClass: 'col-span-1' },
  { id: 10, label: 'KAL-CCTV-09', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 11, label: 'BLR-JNC-45', isLit: true, litDelay: 1.8, spanClass: 'col-span-1' },
  { id: 12, label: 'MYS-JNC-22', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 13, label: 'DVG-ANPR-04', isLit: true, litDelay: 0.9, spanClass: 'col-span-2' },
  { id: 14, label: 'BLR-CCTV-19', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 15, label: 'MYS-CCTV-12', isLit: true, litDelay: 2.2, spanClass: 'col-span-1' },
  { id: 16, label: 'HB-JNC-05', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 17, label: 'BLR-ANPR-27', isLit: true, litDelay: 0.7, spanClass: 'col-span-1' },
  { id: 18, label: 'MYS-ANPR-09', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 19, label: 'DVG-CCTV-02', isLit: true, litDelay: 1.3, spanClass: 'col-span-2' },
  { id: 20, label: 'BLR-JNC-03', isLit: false, litDelay: 0, spanClass: 'col-span-1 row-span-2' },
  { id: 21, label: 'KAL-JNC-18', isLit: true, litDelay: 2.5, spanClass: 'col-span-1' },
  { id: 22, label: 'BEL-ANPR-06', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 23, label: 'BLR-CCTV-55', isLit: true, litDelay: 1.0, spanClass: 'col-span-1' },
  { id: 24, label: 'MYS-CCTV-31', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 25, label: 'HB-ANPR-12', isLit: true, litDelay: 0.3, spanClass: 'col-span-2' },
  { id: 26, label: 'BLR-ANPR-04', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 27, label: 'BEL-CCTV-29', isLit: true, litDelay: 1.6, spanClass: 'col-span-1' },
  { id: 28, label: 'MYS-JNC-08', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 29, label: 'DVG-JNC-01', isLit: true, litDelay: 2.1, spanClass: 'col-span-1' },
  { id: 30, label: 'BLR-CCTV-06', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 31, label: 'KAL-ANPR-05', isLit: true, litDelay: 0.5, spanClass: 'col-span-2' },
  { id: 32, label: 'MYS-ANPR-18', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 33, label: 'HB-CCTV-03', isLit: true, litDelay: 1.2, spanClass: 'col-span-1' },
  { id: 34, label: 'BLR-JNC-09', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 35, label: 'BEL-JNC-15', isLit: true, litDelay: 1.4, spanClass: 'col-span-1' },
  { id: 36, label: 'MYS-CCTV-24', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 37, label: 'DVG-ANPR-09', isLit: true, litDelay: 0.8, spanClass: 'col-span-2 row-span-2' },
  { id: 38, label: 'BLR-ANPR-33', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 39, label: 'KAL-CCTV-12', isLit: true, litDelay: 1.9, spanClass: 'col-span-1' },
  { id: 40, label: 'MYS-JNC-40', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 41, label: 'HB-JNC-11', isLit: true, litDelay: 2.4, spanClass: 'col-span-1' },
  { id: 42, label: 'BLR-CCTV-72', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 43, label: 'BEL-ANPR-20', isLit: true, litDelay: 0.1, spanClass: 'col-span-2' },
  { id: 44, label: 'MYS-ANPR-25', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
  { id: 45, label: 'DVG-CCTV-15', isLit: true, litDelay: 1.7, spanClass: 'col-span-1' },
  { id: 46, label: 'BLR-JNC-28', isLit: false, litDelay: 0, spanClass: 'col-span-2' },
  { id: 47, label: 'KAL-JNC-04', isLit: true, litDelay: 2.0, spanClass: 'col-span-1' },
  { id: 48, label: 'BEL-CCTV-08', isLit: false, litDelay: 0, spanClass: 'col-span-1' },
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
      setError('Required: Employee ID, Password, and System Role.');
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
        const isSupervisor = finalRole.toLowerCase().includes('supervisor') || finalId.toLowerCase().includes('supervisor');
        const isAnalyst = finalRole.toLowerCase().includes('analyst') || finalId.toLowerCase().includes('analyst');
        const officerName = data.user?.name || (isSupervisor ? 'Dr. Rajesh Kumar, IPS' : isAnalyst ? 'Dr. Priya Rao' : 'V. Sharma');

        localStorage.setItem('role', finalRole);
        localStorage.setItem('userName', officerName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('drishti_role', finalRole);
        localStorage.setItem('drishti_employee_id', finalId);

        if (isSupervisor) {
          router.push('/supervisor');
        } else if (isAnalyst) {
          router.push('/analyst');
        } else {
          router.push('/dashboard');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Credentials match failed. Verify input.');
      }
    } catch {
      setError('Connection failure. Authentication server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleName: string, empId: string, officerName?: string) => {
    const isSupervisor = roleName.toLowerCase().includes('supervisor') || empId.toLowerCase().includes('supervisor');
    const isAnalyst = roleName.toLowerCase().includes('analyst') || empId.toLowerCase().includes('analyst');
    const assignedName = officerName || (isSupervisor ? 'Dr. Rajesh Kumar, IPS' : isAnalyst ? 'Dr. Priya Rao' : 'V. Sharma');

    localStorage.setItem('role', roleName);
    localStorage.setItem('userName', assignedName);
    localStorage.setItem('userEmail', `${empId}@drishti.ksp`);
    localStorage.setItem('drishti_role', roleName);
    localStorage.setItem('drishti_employee_id', empId);

    if (isSupervisor) {
      router.push('/supervisor');
    } else if (isAnalyst) {
      router.push('/analyst');
    } else {
      router.push('/dashboard');
    }
  };

  const scrollAnimation = prefersReducedMotion
    ? {}
    : {
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-100px' },
      transition: { duration: 0.6, ease: 'easeOut' as const }
    };

  return (
    <main
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] flex flex-col font-sans relative overflow-hidden transition-colors duration-200"
    >
      {/* ── TOP TACTICAL NAVIGATION BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--surface-0)]/80 border-b border-[var(--border)] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Branding */}
        <DrishtiLogo variant="full" size="md" href="/" />

        {/* Center: System Status Indicator */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--surface-1)] border border-[var(--border)]">
            <span className="beacon-dot" />
            <span className="text-[var(--text-primary)] font-semibold uppercase tracking-wider text-[10px]">
              NETWORK ONLINE
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Radio className="w-3.5 h-3.5 text-[var(--cyan-accent)] animate-pulse" />
            <span>5,35,815 FEEDS ACTIVE</span>
          </div>
          <div className="text-[var(--text-secondary)] font-mono text-[10px]">
            {timeString || '19:28:00 IST'}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSigningIn(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono font-semibold text-[var(--text-primary)] transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
            <span>AUTHENTICATE</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── SECTION 1: HERO (Surveillance Grid) ────────────────────────────── */}
      <section className="min-h-[calc(100vh-60px)] w-full relative flex items-center justify-center p-6 border-b border-[var(--border)] overflow-hidden select-none">

        {/* Interactive Spotlight */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(166, 138, 105, 0.45), transparent 50%)`
          }}
        />

        {/* Cyber Grid Pattern */}
        <div className="absolute inset-0 cyber-grid-bg opacity-40 z-0 pointer-events-none" />

        {/* Dynamic Hero Camera Tiles Grid */}
        <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1 p-2 bg-[var(--surface-0)]/90 z-0">
          {HERO_TILES.map((tile) => {
            const shouldAnimate = tile.isLit && !prefersReducedMotion;
            return (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0.1, backgroundColor: 'transparent', borderColor: 'var(--border)' }}
                animate={shouldAnimate ? {
                  opacity: [0.1, 0.4, 0.15, 1],
                  borderColor: ['var(--border)', 'var(--accent)', 'var(--border)'],
                  backgroundColor: ['transparent', 'var(--surface-1)', 'transparent']
                } : tile.isLit ? {
                  opacity: 1,
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-1)'
                } : {
                  opacity: 0.15,
                  borderColor: 'var(--border)',
                  backgroundColor: 'transparent'
                }}
                transition={shouldAnimate ? {
                  delay: tile.litDelay,
                  duration: 1.2,
                  times: [0, 0.2, 0.5, 1],
                  ease: 'easeInOut'
                } : { duration: 0.2 }}
                className={`relative border rounded-md text-[6px] font-mono p-1.5 flex flex-col justify-between overflow-hidden ${tile.spanClass} transition-colors duration-350 bg-[var(--surface-1)] border-[var(--border)]`}
              >
                {tile.isLit && (
                  <div className="absolute inset-0 live-scanline opacity-30 pointer-events-none z-0" />
                )}

                <div className="flex items-center justify-between z-10 opacity-70">
                  <span className="text-[var(--text-secondary)] tracking-wider font-semibold">{tile.label}</span>
                  {tile.isLit && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-critical)] animate-pulse" />
                      <span className="text-[5px] text-[var(--status-critical)] font-bold uppercase tracking-widest">LIVE</span>
                    </div>
                  )}
                </div>

                <span className="text-[5px] text-[var(--text-secondary)]/60 font-mono z-10 select-none tracking-widest">
                  {tile.isLit ? '00:00:00 / REC' : 'STBY'}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Contrast Radial Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[var(--surface-0)]/70 to-[var(--surface-0)] z-10 pointer-events-none" />

        {/* Floating Annotations */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
          <div className="absolute top-[18%] left-[6%] flex flex-col items-start font-mono text-[9px] tracking-widest select-none">
            <span className="text-[var(--cyan-accent)] font-semibold uppercase flex items-center gap-1">
              <Activity className="w-3 h-3" /> SYSTEM FEED INDEX
            </span>
            <span className="text-[var(--text-primary)] font-bold border border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur-md px-3 py-1.5 rounded mt-1.5 shadow-md">
              5,35,815+ MCCTNS RECORDS
            </span>
          </div>

          <div className="absolute top-[20%] right-[6%] flex flex-col items-end font-mono text-[9px] tracking-widest select-none">
            <span className="text-[var(--cyan-accent)] font-semibold uppercase flex items-center gap-1">
              <Radio className="w-3 h-3" /> PRECINCT COVERAGE
            </span>
            <span className="text-[var(--text-primary)] font-bold border border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur-md px-3 py-1.5 rounded mt-1.5 shadow-md">
              7,000+ SAFE CITY CAMERAS
            </span>
          </div>

          <div className="absolute bottom-[18%] right-[8%] flex flex-col items-end font-mono text-[9px] tracking-widest select-none">
            <span className="text-[var(--accent-light)] font-semibold uppercase flex items-center gap-1">
              <Cpu className="w-3 h-3" /> BATCS JUNCTIONS
            </span>
            <span className="text-[var(--text-primary)] font-bold border border-[var(--border)] bg-[var(--surface-1)]/90 backdrop-blur-md px-3 py-1.5 rounded mt-1.5 shadow-md">
              169+ ADAPTIVE SIGNAL HOPS
            </span>
          </div>
        </div>

        {/* Foreground Title & Hero Actions */}
        <div className="relative z-30 text-center max-w-2xl mx-auto flex flex-col items-center gap-6 py-12">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-1)] border border-[var(--border)] shadow-sm">
            <Bot className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
            <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)] tracking-wider">
              NEXT-GEN CRIME INTELLIGENCE PLATFORM
            </span>
          </div>

          {/* Title Stack */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-baseline justify-center gap-4 flex-wrap">
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-[0.18em] text-[var(--text-primary)] font-sans drop-shadow-sm">
                DRISHTI
              </h1>
              <span className="text-3xl sm:text-4xl text-[var(--accent-light)] font-bold font-kannada">
                ದೃಷ್ಟಿ
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] font-mono tracking-[0.25em] uppercase leading-relaxed max-w-lg">
              Intelligence that sees what others miss
            </p>
          </div>

          {/* Mobile Stature Badges */}
          <div className="flex flex-wrap justify-center gap-2 lg:hidden text-[9px] font-mono tracking-wider">
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-2.5 py-1 rounded text-[var(--text-primary)]">5,35,815+ MCCTNS</span>
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-2.5 py-1 rounded text-[var(--text-primary)]">7,000+ Safe City</span>
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-2.5 py-1 rounded text-[var(--text-primary)]">169+ BATCS</span>
          </div>

          {/* CTA & Sign In Panel */}
          <div className="w-full min-h-[220px] flex items-center justify-center mt-2">
            <AnimatePresence mode="wait">
              {!isSigningIn ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  <motion.button
                    key="cta-button"
                    layoutId="authPanel"
                    onClick={() => setIsSigningIn(true)}
                    className="group relative px-8 py-4 rounded-lg bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all border border-white/10 shadow-lg shadow-[var(--accent-glow)] hover:opacity-95 active:scale-[0.98] flex items-center gap-3"
                  >
                    <span>ENTER CONTROL ROOM</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* 1-Click Quick Demo Login Shortcuts */}
                  <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-md">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">
                      Quick Demo Access Tiers
                    </span>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <button
                        onClick={() => handleQuickLogin('Inspector', 'inspector')}
                        className="px-3 py-2 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono font-semibold text-[var(--text-primary)] transition-all flex flex-col items-center gap-0.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[var(--cyan-accent)]" />
                        <span>Inspector</span>
                      </button>
                      <button
                        onClick={() => handleQuickLogin('Crime Analyst', 'analyst')}
                        className="px-3 py-2 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono font-semibold text-[var(--text-primary)] transition-all flex flex-col items-center gap-0.5"
                      >
                        <Activity className="w-3.5 h-3.5 text-[var(--status-warning)]" />
                        <span>Analyst</span>
                      </button>
                      <button
                        onClick={() => handleQuickLogin('Supervisor', 'supervisor')}
                        className="px-3 py-2 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-mono font-semibold text-[var(--text-primary)] transition-all flex flex-col items-center gap-0.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-[var(--accent-light)]" />
                        <span>Supervisor</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  key="auth-panel"
                  layoutId="authPanel"
                  className="w-full max-w-md rounded-2xl bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border)] p-6 shadow-2xl text-[var(--text-primary)] flex flex-col gap-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <DrishtiLogo variant="compact" size="md" />
                    <button
                      onClick={() => { setIsSigningIn(false); setError(''); }}
                      className="w-8 h-8 rounded-full bg-[var(--surface-0)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors outline-none cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {error && (
                    <div className="text-[10px] font-mono text-[var(--status-critical)] bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/30 px-3 py-2 rounded-md flex items-center gap-2 animate-slide-in">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label htmlFor="employee-id" className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.1em] pl-0.5">Employee ID / Officer Handle</label>
                    <input
                      id="employee-id"
                      type="text"
                      placeholder="e.g. inspector"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="px-3.5 py-2.5 rounded-md bg-[var(--surface-0)] border border-[var(--border)] placeholder-[var(--text-secondary)]/40 text-xs focus:border-[var(--cyan-accent)] focus:outline-none transition-all font-mono text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.1em] pl-0.5">Passcode</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-md bg-[var(--surface-0)] border border-[var(--border)] placeholder-[var(--text-secondary)]/40 text-xs focus:border-[var(--cyan-accent)] focus:outline-none transition-all font-mono text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="role" className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.1em] pl-0.5">Clearance Tier</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="px-3.5 py-2.5 rounded-md bg-[var(--surface-0)] border border-[var(--border)] text-xs focus:border-[var(--cyan-accent)] focus:outline-none transition-all cursor-pointer font-sans text-[var(--text-primary)]"
                    >
                      <option value="" disabled className="bg-[var(--surface-0)] text-[var(--text-secondary)]">Select Tier...</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-[var(--surface-0)] text-[var(--text-primary)]">{r}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleSignInSubmit()}
                    disabled={loading}
                    className="mt-2 w-full py-3 rounded-md bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] shadow-md shadow-[var(--accent-glow)]"
                  >
                    {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE ACCESS'}
                  </button>

                  <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-[10px] font-mono text-[var(--text-secondary)]">
                    <span>Or bypass authentication:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Inspector', 'inspector')}
                      className="text-[var(--cyan-accent)] hover:underline font-bold"
                    >
                      1-Click Demo Login →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: PROBLEM & SOLUTION STATS ────────────────────────────── */}
      <section className="py-20 px-6 sm:px-12 w-full max-w-7xl mx-auto text-center">
        <motion.div {...scrollAnimation} className="flex flex-col gap-6 items-center">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border)] text-[10px] font-mono text-[var(--cyan-accent)] uppercase font-bold tracking-widest shadow-sm">
            <Zap className="w-3.5 h-3.5" /> CRIME DATA SILOS RESOLVED
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans max-w-4xl mx-auto leading-tight">
            5 Lakh Cameras. Thousands of FIRs. Instant Connections.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl mx-auto font-mono tracking-wide leading-relaxed">
            DRISHTI correlates live surveillance feeds, CCTNS record filings, and traffic ANPR logs in milliseconds—giving officers complete situational awareness across Karnataka.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full">
            <div className="glow-card p-6 rounded-xl border border-[var(--border)] text-left hover:scale-[1.02] transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--cyan-accent)]">0.4s</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--cyan-accent)]/10 text-[var(--cyan-accent)] border border-[var(--cyan-accent)]/20 uppercase font-bold">REALTIME</span>
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">NL Query Latency</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 leading-snug">Instant response for complex queries</p>
              </div>
            </div>

            <div className="glow-card p-6 rounded-xl border border-[var(--border)] text-left hover:scale-[1.02] transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--status-success)]">100%</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--status-success)]/10 text-[var(--status-success)] border border-[var(--status-success)]/20 uppercase font-bold">MULTILINGUAL</span>
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">Kannada & EN Speech</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 leading-snug">Full voice speech-to-text recognition</p>
              </div>
            </div>

            <div className="glow-card p-6 rounded-xl border border-[var(--border)] text-left hover:scale-[1.02] transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--status-warning)]">99.8%</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--status-warning)]/10 text-[var(--status-warning)] border border-[var(--status-warning)]/20 uppercase font-bold">ACCURACY</span>
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">ANPR Match Rate</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 leading-snug">High-confidence license plate scanning</p>
              </div>
            </div>

            <div className="glow-card p-6 rounded-xl border border-[var(--border)] text-left hover:scale-[1.02] transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[var(--accent-light)]">169+</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--accent-light)]/10 text-[var(--accent-light)] border border-[var(--accent-light)]/20 uppercase font-bold">TELEM-GRID</span>
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">BATCS Signals</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1 leading-snug">Smart junction telemetry feeds</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 3: CAPABILITY PREVIEWS ─────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-12 w-full max-w-7xl mx-auto">
        <motion.div {...scrollAnimation} className="flex flex-col gap-12">
          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border)] text-[10px] font-mono text-[var(--cyan-accent)] uppercase font-bold tracking-widest shadow-sm mb-3">
              <Bot className="w-3.5 h-3.5" /> DRISHTI INTELLIGENCE SUITE
            </div>
            <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans max-w-4xl mx-auto leading-tight">Tactical Co-Pilot Capabilities</h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl mx-auto font-mono tracking-wide leading-relaxed mt-4">
              AI-assisted spatial mapping, automated suspect vehicle trajectory reconstruction, and chronological gang correlation—built directly for field officers and command centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card A: Chat + Heatmap */}
            <div className="flex flex-col gap-3 group">
              <div className="glow-card p-1">
                <div className="relative overflow-hidden rounded-md border border-[var(--border)]">
                  <ChatHeatmapMockup />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono">Spatial Crime Analytics</h4>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
                  AI interface — inline hotspot maps and natural language query.
                </p>
              </div>
            </div>

            {/* Card B: Geo-trail Map */}
            <div className="flex flex-col gap-3 group">
              <div className="glow-card p-1">
                <div className="relative overflow-hidden rounded-md border border-[var(--border)]">
                  <GeoTrailMockup />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono">Geo-Trail Vehicle Tracker</h4>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
                  Suspect geo-trail — multi-camera trajectory reconstruction.
                </p>
              </div>
            </div>

            {/* Card C: Chrono-criminal Network Graph */}
            <div className="flex flex-col gap-3 group">
              <div className="glow-card p-1">
                <div className="relative overflow-hidden rounded-md border border-[var(--border)]">
                  <ChronoNetworkMockup />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono">Criminal Network Link Graph</h4>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
                  Accomplice dynamics — chronological relationship mapping.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 4: FOOTER ─────────────────────────────────────────────── */}
      <footer className="mt-auto py-10 px-6 bg-[var(--surface-1)] border-t border-[var(--border)] text-xs text-[var(--text-secondary)] select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black border border-gray-800 flex items-center justify-center p-1 shadow-sm">
              <DrishtiEmblem className="w-full h-full" color="#FFFFFF" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono font-bold text-[var(--text-primary)] uppercase tracking-widest text-[11px]">Karnataka State Police</span>
              <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">State Crime Records Bureau (SCRB) • DRISHTI Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--status-success)]" />
              <span>AES-256 SECURED ENVIRONMENT</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </footer>

    </main>
  );
}

