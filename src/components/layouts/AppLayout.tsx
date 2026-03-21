// ============================================================
// App Layout â€” Sidebar + Header + Content
// ============================================================
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileCog, Settings, Calendar, Clock, FileText,
    ChevronLeft, ChevronRight, Bell, Search, CheckCircle,
    XCircle, AlertTriangle, Info, X, Building2
} from 'lucide-react';
import { useUIStore } from '../../stores';
import heroLogo from '../../assets/hero.jpg';
import './Layout.css';

const navItems = [
    {
        section: 'Rules', items: [
            { to: '/', icon: LayoutDashboard, label: 'Rule Library' },
            { to: '/rules/new', icon: FileCog, label: 'New Rule' },
            { to: '/debug', icon: Settings, label: 'Case Debugger' },
        ]
    },
    {
        section: 'Provider Settings', items: [
            { to: '/settings/providers', icon: Building2, label: 'Provider Registry' },
            { to: '/settings/schedules', icon: Clock, label: 'Work Schedules' },
            { to: '/settings/holidays', icon: Calendar, label: 'Holiday Calendars' },
        ]
    },
    {
        section: 'Audit', items: [
            { to: '/audit', icon: FileText, label: 'Audit Log' },
        ]
    },
];

const toastIcons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

export default function AppLayout() {
    const { sidebarCollapsed, toggleSidebar, toasts, removeToast } = useUIStore();
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname === '/') return 'TAT Clock Engine';
        if (location.pathname.startsWith('/rules/new')) return 'Create New Rule';
        if (location.pathname.startsWith('/rules/') && location.pathname.includes('/edit')) return 'Edit Rule';
        if (location.pathname.startsWith('/rules/')) return 'Rule Details';
        if (location.pathname.includes('/schedules')) return 'Work Schedules';
        if (location.pathname.includes('/holidays')) return 'Holiday Calendars';
        if (location.pathname.includes('/audit')) return 'Audit Log';
        return 'TAT Rule Engine';
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon" style={{ width: sidebarCollapsed ? 36 : 160, height: 40, padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', transition: 'all var(--transition-slow)' }}>
                        <img src={heroLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: sidebarCollapsed ? 'center' : 'left center', borderRadius: 'inherit', display: 'block', transition: 'object-position var(--transition-slow)' }} />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.section}>
                            <div className="sidebar-section-title">{section.section}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                >
                                    <span className="sidebar-link-icon"><item.icon size={18} /></span>
                                    <span className="sidebar-link-text">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <header className="header">
                    <div className="header-left">
                        <h1 className="header-title">{getPageTitle()}</h1>
                    </div>
                    <div className="header-right">
                        <button className="sidebar-toggle" style={{ width: 36, height: 36, border: 'none', background: 'var(--color-bg-secondary)' }}>
                            <Search size={16} />
                        </button>
                        <button className="sidebar-toggle" style={{ width: 36, height: 36, border: 'none', background: 'var(--color-bg-secondary)', position: 'relative' }}>
                            <Bell size={16} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="header-avatar">CA</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Config Analyst</span>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Acme Healthcare</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="page-container">
                    <Outlet />
                </main>
            </div>

            {/* Toast Notifications */}
            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map((toast) => {
                        const Icon = toastIcons[toast.type];
                        return (
                            <div key={toast.id} className={`toast ${toast.type}`}>
                                <Icon size={18} className="toast-icon" />
                                <span className="toast-message">{toast.message}</span>
                                <button className="toast-close" onClick={() => removeToast(toast.id)}>
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
