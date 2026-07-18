'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Map, GitBranch,
  Camera, BarChart2, LogOut, Shield, Bell, ChevronLeft,
  ChevronRight, AlertTriangle, User
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import AlertNotification from '@/components/AlertNotification';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', id: 'nav-overview' },
  { href: '/dashboard/chat', icon: MessageSquare, label: 'Co-Pilot Chat', id: 'nav-chat' },
  { href: '/dashboard/map', icon: Map, label: 'Crime Map', id: 'nav-map' },
  { href: '/dashboard/network', icon: GitBranch, label: 'Network Graph', id: 'nav-network' },
  { href: '/dashboard/surveillance', icon: Camera, label: 'Surveillance', id: 'nav-surveillance' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics', id: 'nav-analytics' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState('Inspector');
  const [employeeId, setEmployeeId] = useState('KSP-0000');
  const [alertCount] = useState(3);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const savedRole = localStorage.getItem('drishti_role') || 'Inspector';
    const savedId = localStorage.getItem('drishti_employee_id') || 'KSP-0000';
    setRole(savedRole);
    setEmployeeId(savedId);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('drishti_role');
    localStorage.removeItem('drishti_employee_id');
    router.push('/');
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-void-000 overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside
        className={`flex flex-col transition-all duration-300 ease-in-out border-r border-steel-600/40 bg-steel-700 relative z-20
          ${collapsed ? 'w-16' : 'w-60'}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-steel-600/40 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-phosphor-500/20 border border-phosphor-500/40 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-phosphor-500" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-paper-100 font-bold text-base tracking-wide">DRISHTI</span>
              <p className="text-warn-500 text-xs leading-none">ದೃಷ್ಟಿ</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, id }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                id={id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                  ${active
                    ? 'bg-phosphor-500/20 text-phosphor-500 border border-phosphor-500/30'
                    : 'text-paper-100/60 hover:text-paper-100 hover:bg-steel-600/50'
                  }`}
                title={collapsed ? label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-phosphor-500' : ''}`} />
                {!collapsed && (
                  <span className="text-sm font-medium">{label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-phosphor-500" />
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded bg-steel-700 text-xs text-paper-100
                    whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-steel-600/40">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className={`px-3 py-3 border-t border-steel-600/40 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-steel-600/40 mb-2">
              <div className="w-7 h-7 rounded-full bg-phosphor-500/30 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-phosphor-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-paper-100 truncate">{employeeId}</p>
                <p className="text-xs text-paper-100/50">{role}</p>
              </div>
            </div>
          )}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-paper-100/50
              hover:text-critical-500 hover:bg-critical-500/10 transition-all text-sm
              ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-steel-700 border border-steel-600/60
            flex items-center justify-center text-paper-100/50 hover:text-paper-100 hover:bg-steel-600
            transition-all z-30"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-steel-600/40 bg-steel-700/60 backdrop-blur-sm flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-paper-100">
              {NAV_ITEMS.find((n) => isActive(n.href))?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-paper-100/50">
              Karnataka State Police — Crime Intelligence Platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-steel-600/40 border border-steel-600/40">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500 pulse-phosphor" />
              <span className="text-xs font-mono text-paper-100/70">{currentTime}</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Alert Notification */}
            <AlertNotification />

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-steel-600/40 border border-steel-600/40">
              <AlertTriangle className="w-3 h-3 text-warn-500" />
              <span className="text-xs text-paper-100/70 font-mono">{role.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-void-000">
          {children}
        </main>
      </div>
    </div>
  );
}
