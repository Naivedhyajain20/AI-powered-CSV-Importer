'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Settings2,
  ChevronRight,
  LogOut,
} from 'lucide-react';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  id: string;
};

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onGoToLanding: () => void;
};

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={16} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={16} />, label: 'Leads Directory', id: 'leads' },
  { icon: <Settings2 size={16} />, label: 'API Settings', id: 'settings' },
];

export default function Sidebar({ activeTab, onTabChange, onGoToLanding }: SidebarProps) {
  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={onGoToLanding} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo-icon">GE</div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
          GrowEasy
        </span>
      </div>

      {/* Profile */}
      <div className="sidebar-profile" onClick={onGoToLanding}>
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
      <div style={{ padding: '24px 0 4px', flex: 1 }}>
        <div className="sidebar-section-label">Workspace</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`sidebar-nav-item${item.id === activeTab ? ' active' : ''}`}
            style={{ width: 'calc(100% - 12px)', border: 'none', background: 'none', textAlign: 'left' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
        <button
          onClick={onGoToLanding}
          className="sidebar-nav-item"
          style={{ width: 'calc(100% - 12px)', border: 'none', background: 'none', textAlign: 'left' }}
        >
          <LogOut size={16} />
          <span>Exit Workspace</span>
        </button>
      </div>
    </nav>
  );
}
