'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, KeyRound, UserCheck, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Card from '@/components/ui/Card';

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

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    // Detect prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
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
      // Map user id into email structure if it doesn't contain domain
      const email = finalId.includes('@') ? finalId : `${finalId}@drishti.ksp`;
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: finalPwd, role: finalRole }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('role', finalRole);
        localStorage.setItem('userName', data.user?.name || `${finalRole} Officer`);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('drishti_role', finalRole);
        localStorage.setItem('drishti_employee_id', finalId);
        router.push('/dashboard');
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

  // Scroll animations mapping
  const scrollAnimation = prefersReducedMotion 
    ? {} 
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-100px' },
        transition: { duration: 0.6, ease: 'easeOut' }
      };

  return (
    <main 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] flex flex-col font-sans relative overflow-hidden transition-colors duration-200"
    >
      
      {/* ── SECTION 1: HERO (100vh) ────────────────────────────────────────── */}
      <section className="h-screen w-full relative flex items-center justify-center p-6 border-b border-[var(--border)] overflow-hidden select-none">
        
        {/* Interactive Mouse Spotlight */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, var(--border), transparent 40%)`
          }}
        />
        
        <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1 p-2 bg-[var(--surface-0)] z-0">
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
                {/* Visual live scanline animation only for lit cameras */}
                {tile.isLit && (
                  <div className="absolute inset-0 live-scanline opacity-30 pointer-events-none z-0" />
                )}

                <div className="flex items-center justify-between z-10 opacity-70">
                  <span className="text-[var(--text-secondary)] tracking-wider font-semibold">{tile.label}</span>
                  {tile.isLit && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[var(--status-critical)] animate-pulse" />
                      <span className="text-[5px] text-[var(--status-critical)] font-bold uppercase tracking-widest">LIVE</span>
                    </div>
                  )}
                </div>

                <span className="text-[5px] text-[var(--text-secondary)]/50 font-mono z-10 select-none tracking-widest">
                  {tile.isLit ? '00:00:00 / REC' : 'STBY'}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Ambient Dark radial overlay for foreground contrast */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[var(--surface-0)]/60 to-[var(--surface-0)] z-10 pointer-events-none" />

        {/* Floating annotations with technical leader lines */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
          
          {/* Annotation 1 (Top Left) */}
          <div className="absolute top-[20%] left-[8%] flex flex-col items-start font-mono text-[9px] tracking-widest select-none">
            <span className="text-[var(--text-secondary)] uppercase">SYSTEM FEED INDEX</span>
            <span className="text-[var(--text-primary)] font-bold border border-[var(--border)] bg-[var(--surface-1)] backdrop-blur-sm px-2.5 py-1 rounded-sm mt-1.5 shadow-sm">
              5,35,815+ MCCTNS
            </span>
            <svg width="150" height="60" className="opacity-30 mt-1">
              <path d="M 0 0 Q 30 40 130 50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-[var(--text-secondary)]" />
              <circle cx="130" cy="50" r="1.5" fill="currentColor" className="text-[var(--text-secondary)]" />
            </svg>
          </div>

          {/* Annotation 2 (Top Right) */}
          <div className="absolute top-[22%] right-[10%] flex flex-col items-end font-mono text-[9px] tracking-widest select-none">
            <span className="text-[var(--text-secondary)] uppercase">PRECINCT COVERAGE</span>
            <span className="text-[var(--text-primary)] font-bold border border-[var(--border)] bg-[var(--surface-1)] backdrop-blur-sm px-2.5 py-1 rounded-sm mt-1.5 shadow-sm">
              7,000+ Safe City
            </span>
            <svg width="150" height="60" className="opacity-30 mt-1">
              <path d="M 150 0 Q 120 40 20 50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-[var(--text-secondary)]" />
              <circle cx="20" cy="50" r="1.5" fill="currentColor" className="text-[var(--text-secondary)]" />
            </svg>
          </div>

          {/* Annotation 3 (Bottom Right) */}
          <div className="absolute bottom-[20%] right-[12%] flex flex-col items-end font-mono text-[9px] tracking-widest select-none">
            <span className="text-[var(--text-secondary)] uppercase">INTELLIGENT JUNCTIONS</span>
            <span className="text-[var(--text-primary)] font-bold border border-[var(--border)] bg-[var(--surface-1)] backdrop-blur-sm px-2.5 py-1 rounded-sm mt-1.5 shadow-sm">
              169+ BATCS JUNCTIONS
            </span>
            <svg width="120" height="80" className="opacity-30 mt-1">
              <path d="M 120 80 Q 90 20 10 10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-[var(--text-secondary)]" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" className="text-[var(--text-secondary)]" />
            </svg>
          </div>
        </div>

        {/* Foreground Content Stack */}
        <div className="relative z-30 text-center max-w-xl mx-auto flex flex-col items-center gap-6">
          
          {/* Header Title */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-baseline gap-4">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-[0.2em] text-[var(--text-primary)] font-sans">
                DRISHTI
              </h1>
              <span className="text-2xl sm:text-3xl text-[var(--text-secondary)] font-mono font-light font-kannada">
                ದೃಷ್ಟಿ
              </span>
            </div>
            {/* Tagline */}
            <p className="mt-4 text-xs sm:text-sm text-[var(--text-secondary)] font-mono tracking-[0.3em] uppercase leading-relaxed">
              Intelligence that sees what others miss
            </p>
          </div>

          {/* Stature annotation tags for mobile */}
          <div className="flex flex-wrap justify-center gap-3 lg:hidden text-[9px] font-mono tracking-wider">
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-2 py-1 rounded text-[var(--text-primary)]">5,35,815+ MCCTNS</span>
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-2 py-1 rounded text-[var(--text-primary)]">7,000+ Safe City</span>
            <span className="bg-[var(--surface-1)] border border-[var(--border)] px-2 py-1 rounded text-[var(--text-primary)]">169+ BATCS</span>
          </div>

          {/* Expandable CTA Panel Wrapper */}
          <div className="w-full min-h-[200px] flex items-center justify-center mt-6">
            <AnimatePresence mode="wait">
              {!isSigningIn ? (
                <div className="flex justify-center items-center">
                  <motion.button
                    key="cta-button"
                    layoutId="authPanel"
                    onClick={() => setIsSigningIn(true)}
                    className="px-8 py-3.5 rounded bg-[var(--accent)] text-white font-mono text-xs font-semibold uppercase tracking-[0.2em] transition-all border border-[var(--accent)] hover:opacity-90 focus:outline-none shadow-sm"
                  >
                    SIGN IN TO CONTROL ROOM
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  key="auth-panel"
                  layoutId="authPanel"
                  className="w-full max-w-md rounded bg-[var(--surface-1)] border border-[var(--border)] p-7 text-[var(--text-primary)] flex flex-col gap-5 text-left"
                >
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] tracking-[0.2em]">SYSTEM AUTHENTICATION</span>
                    <button
                      onClick={() => { setIsSigningIn(false); setError(''); }}
                      aria-label="Back to landing menu"
                      className="w-8 h-8 rounded-full bg-[var(--surface-0)] hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] transition-colors outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Panel Error Display */}
                  {error && (
                    <div className="text-[10px] font-mono text-[var(--status-critical)] bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/20 px-3 py-2 rounded flex items-center gap-1.5 animate-slide-in">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Employee ID */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="employee-id" className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.1em] pl-1">Employee ID / User Name</label>
                    <input
                      id="employee-id"
                      type="text"
                      placeholder="e.g. inspector"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="px-4 py-3 rounded bg-[var(--surface-0)] border border-[var(--border)] placeholder-[var(--text-secondary)]/40 text-xs focus:border-[var(--accent)] focus:outline-none transition-all font-mono text-[var(--text-primary)]"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.1em] pl-1">Security Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded bg-[var(--surface-0)] border border-[var(--border)] placeholder-[var(--text-secondary)]/40 text-xs focus:border-[var(--accent)] focus:outline-none transition-all font-mono text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* System Role dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="role" className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.1em] pl-1">Role Access Clearence</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="px-4 py-3 rounded bg-[var(--surface-0)] border border-[var(--border)] text-xs focus:border-[var(--accent)] focus:outline-none transition-all cursor-pointer font-sans text-[var(--text-primary)] appearance-none"
                    >
                      <option value="" disabled className="bg-[var(--surface-0)] text-[var(--text-secondary)]/50">Select Clearence Tier...</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-[var(--surface-0)] text-[var(--text-primary)]">{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sign In Button */}
                  <button
                    onClick={() => handleSignInSubmit()}
                    disabled={loading}
                    className="mt-3 w-full py-3.5 rounded bg-[var(--accent)] text-white font-mono text-xs font-bold uppercase tracking-[0.1em] transition-all disabled:opacity-50 select-none hover:opacity-90 active:scale-[0.98] focus:outline-none"
                  >
                    {loading ? 'Authenticating Access...' : 'Authenticate Access'}
                  </button>

                  {/* Developer Quick Demo Bypass Button */}
                  <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => {
                        // True bypass: skip network call entirely, write session directly
                        localStorage.setItem('role', 'Inspector');
                        localStorage.setItem('userName', 'Inspector Officer');
                        localStorage.setItem('userEmail', 'inspector@drishti.ksp');
                        localStorage.setItem('drishti_role', 'Inspector');
                        localStorage.setItem('drishti_employee_id', 'inspector');
                        router.push('/dashboard');
                      }}
                      className="w-full py-2 rounded border border-[var(--border)] bg-transparent hover:bg-[var(--surface-0)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-[9px] font-bold uppercase tracking-wider transition-all select-none active:scale-[0.98] focus:outline-none"
                    >
                      ⚡ Quick Bypass: Login as Inspector
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Small floating Theme Toggle top-right */}
        <div className="absolute top-6 right-6 z-30">
          <ThemeToggle />
        </div>
      </section>

      {/* ── SECTION 2: THE GAP (Scroll Fade In) ────────────────────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center border-b border-[var(--border)]">
        <motion.div {...scrollAnimation} className="flex flex-col gap-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] font-sans">
            5 lakh cameras. Thousands of FIRs. Zero connection.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto font-mono tracking-wide leading-relaxed">
            An investigator still checks three systems by hand to find what should already be obvious.
          </p>
        </motion.div>
      </section>

      {/* ── SECTION 3: CAPABILITY PREVIEWS (Staggered Fade In) ─────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div {...scrollAnimation} className="flex flex-col gap-12">
          <div className="text-center">
            <span className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase tracking-widest">DRISHTI INTELLIGENCE TOOLS</span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-2 font-mono">Precision Analytical Suite</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card A: Chat + Heatmap */}
            <div className="flex flex-col gap-3 group">
              <Card className="relative overflow-hidden border-[var(--border)]">
                {/* Official CASE STAMP rotated badge */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="case-stamp">CASE: CHAT-AI</div>
                </div>
                <ChatHeatmapMockup />
              </Card>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] text-center uppercase tracking-wider block mt-1">
                AI interface — inline hotspot maps, instant query.
              </span>
            </div>

            {/* Card B: Geo-trail Map */}
            <div className="flex flex-col gap-3 group">
              <Card className="relative overflow-hidden border-[var(--border)]">
                {/* Official CASE STAMP rotated badge */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="case-stamp">CASE: GEO-09</div>
                </div>
                <GeoTrailMockup />
              </Card>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] text-center uppercase tracking-wider block mt-1">
                Suspect geo-trail — 5 camera hops, one click.
              </span>
            </div>

            {/* Card C: Chrono-criminal Network Graph */}
            <div className="flex flex-col gap-3 group">
              <Card className="relative overflow-hidden border-[var(--border)]">
                {/* Official CASE STAMP rotated badge */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="case-stamp">CASE: NET-32</div>
                </div>
                <ChronoNetworkMockup />
              </Card>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] text-center uppercase tracking-wider block mt-1">
                Accomplice formations — chronological relationship maps.
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 4: FOOTER ─────────────────────────────────────────────── */}
      <footer className="mt-auto py-12 px-6 bg-[var(--surface-1)] border-t border-[var(--border)] text-xs text-[var(--text-secondary)] select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span className="font-mono font-bold text-[var(--text-primary)] uppercase tracking-widest">Karnataka State Police</span>
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">State Crime Records Bureau</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-[var(--text-secondary)]/50 tracking-widest uppercase">Technology Partner</span>
              <span className="text-[10px] text-[var(--text-primary)] font-mono font-bold">Catalyst by Zoho</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </footer>

    </main>
  );
}
