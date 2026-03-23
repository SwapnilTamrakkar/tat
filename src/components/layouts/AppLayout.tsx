// ============================================================
// App Layout â€” Sidebar + Header + Content
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileCog, Settings, Calendar, Clock, FileText,
    ChevronLeft, ChevronRight, Bell, Search, CheckCircle,
    XCircle, AlertTriangle, Info, X, Building2
} from 'lucide-react';
import { useUIStore, useProviderStore } from '../../stores';
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
    const { addAuditEntry } = useProviderStore();
    const location = useLocation();
    const navigate = useNavigate();

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { 
            id: 1, 
            title: 'Action Required: Provider Request',
            message: 'Provider asked for further docs - Secondary Clock gets ON.', 
            isRead: false,
            time: 'Just now'
        }
    ]);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notif: typeof notifications[0]) => {
        if (!notif.isRead) {
            addAuditEntry({
                userId: 'admin',
                userName: 'Config Analyst',
                providerId: 'provider-1',
                actionType: 'updated',
                entityType: 'rule',
                entityName: 'Secondary Clock',
                entityId: 'rule-event',
                changeSummary: 'Secondary Clock ON: Provider requested further documentation.',
            });
            setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setShowNotifications(false);
            useUIStore.getState().addToast('Notification processed. Audit log updated.', 'success');
            navigate('/audit');
        }
    };

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
                        
                        <div ref={notifRef} style={{ position: 'relative' }}>
                            <button 
                                className="sidebar-toggle" 
                                style={{ width: 36, height: 36, border: 'none', background: 'var(--color-bg-secondary)', position: 'relative' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={16} />
                                {notifications.some(n => !n.isRead) && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 6,
                                        right: 8,
                                        width: 8,
                                        height: 8,
                                        backgroundColor: 'var(--color-danger)',
                                        borderRadius: '50%'
                                    }}></span>
                                )}
                            </button>
                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '120%',
                                    right: 0,
                                    width: 320,
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 100,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>
                                        Notifications
                                    </div>
                                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => handleNotificationClick(notif)}
                                                    style={{ 
                                                        padding: 'var(--space-3) var(--space-4)', 
                                                        borderBottom: '1px solid var(--color-border-light)',
                                                        cursor: notif.isRead ? 'default' : 'pointer',
                                                        backgroundColor: notif.isRead ? 'var(--color-bg)' : 'var(--color-primary-50)',
                                                        transition: 'background-color var(--transition-fast)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{notif.title}</span>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{notif.time}</span>
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                        {notif.message}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

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
