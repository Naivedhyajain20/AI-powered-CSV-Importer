'use client';

import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Users,
  MessageSquare,
  UserCheck,
  Link2,
  MonitorDot,
  MessageCircle,
  PhoneCall,
  Settings2,
  Code2,
  Building2,
  ChevronRight,
} from 'lucide-react';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

type SidebarProps = {
  activePage?: string;
};

const MAIN_NAV: NavItem[] = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { icon: <Zap size={16} />, label: 'Generate Leads' },
  { icon: <Users size={16} />, label: 'Manage Leads' },
  { icon: <MessageSquare size={16} />, label: 'Engage Leads' },
];

const CONTROL_NAV: NavItem[] = [
  { icon: <UserCheck size={16} />, label: 'Team Members' },
  { icon: <Link2 size={16} />, label: 'Lead Sources', active: true },
  { icon: <MonitorDot size={16} />, label: 'Ad Accounts' },
  { icon: <MessageCircle size={16} />, label: 'WhatsApp Account' },
  { icon: <PhoneCall size={16} />, label: 'Tele Calling' },
  { icon: <Settings2 size={16} />, label: 'CRM Fields' },
  { icon: <Code2 size={16} />, label: 'API Center' },
];

const BOTTOM_NAV: NavItem[] = [
  { icon: <Building2 size={16} />, label: 'Business Center' },
];

export default function Sidebar({ activePage = 'Lead Sources' }: SidebarProps) {
  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">GE</div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
          GrowEasy
        </span>
      </div>

      {/* Profile */}
      <div className="sidebar-profile">
        <div className="sidebar-profile-avatar">VK</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            VK Test
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Owner
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>

      {/* Main Nav */}
      <div style={{ padding: '8px 0 4px', flex: 1 }}>
        <div className="sidebar-section-label">Main</div>
        {MAIN_NAV.map((item) => (
          <div
            key={item.label}
            className={`sidebar-nav-item${item.label === activePage ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Control Center</div>
        {CONTROL_NAV.map((item) => (
          <div
            key={item.label}
            className={`sidebar-nav-item${item.label === activePage ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
        {BOTTOM_NAV.map((item) => (
          <div
            key={item.label}
            className={`sidebar-nav-item${item.label === activePage ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}
