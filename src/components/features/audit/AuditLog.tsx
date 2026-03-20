// ============================================================
// Audit Log Page
// ============================================================
import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import '../../ui/ui.css';

// Mock audit log data
const MOCK_AUDIT_LOG = [
    { id: '1', timestamp: '2025-03-18T16:45:00Z', userName: 'Mike Chen', actionType: 'updated', entityType: 'rule', entityName: 'OP Expedited — Physician Services', changeSummary: 'Updated threshold: Red Alert changed from 24h to 18h' },
    { id: '2', timestamp: '2025-03-15T14:30:00Z', userName: 'Sarah Johnson', actionType: 'updated', entityType: 'rule', entityName: 'IP Standard — Inpatient Admission', changeSummary: 'Added pause/resume conditions for additional info pend' },
    { id: '3', timestamp: '2025-03-10T11:00:00Z', userName: 'Sarah Johnson', actionType: 'activated', entityType: 'rule', entityName: 'OP Standard — Outpatient Services', changeSummary: 'Rule activated for production use' },
    { id: '4', timestamp: '2025-03-05T09:00:00Z', userName: 'Mike Chen', actionType: 'created', entityType: 'rule', entityName: 'OP Expedited — Physician Services', changeSummary: 'New rule created from OP Standard template' },
    { id: '5', timestamp: '2025-02-28T09:15:00Z', userName: 'Admin User', actionType: 'updated', entityType: 'schedule', entityName: 'Default Schedule', changeSummary: 'Friday end time changed from 17:00 to 16:00' },
    { id: '6', timestamp: '2025-02-15T10:00:00Z', userName: 'Admin User', actionType: 'created', entityType: 'holiday', entityName: "Presidents' Day", changeSummary: 'Added federal holiday: February 17' },
    { id: '7', timestamp: '2025-01-14T12:00:00Z', userName: 'Sarah Johnson', actionType: 'created', entityType: 'rule', entityName: 'OP Standard — Outpatient Services', changeSummary: 'Initial creation from TAT matrix' },
    { id: '8', timestamp: '2025-01-12T10:00:00Z', userName: 'Mike Chen', actionType: 'created', entityType: 'rule', entityName: 'IP Expedited — Inpatient Urgent', changeSummary: '72-hour expedited rule created' },
    { id: '9', timestamp: '2025-01-10T08:00:00Z', userName: 'Sarah Johnson', actionType: 'created', entityType: 'rule', entityName: 'IP Standard — Inpatient Admission', changeSummary: 'Initial IP standard rule from TAT matrix' },
    { id: '10', timestamp: '2025-01-05T09:00:00Z', userName: 'Admin User', actionType: 'created', entityType: 'tenant', entityName: 'Acme Healthcare', changeSummary: 'Tenant registered with EST timezone' },
];

const ACTION_COLORS: Record<string, string> = {
    created: '#10b981',
    updated: '#3b82f6',
    activated: '#6366f1',
    deactivated: '#f59e0b',
    archived: '#6b7280',
    cloned: '#8b5cf6',
    restored: '#14b8a6',
};

const ENTITY_ICONS: Record<string, string> = {
    rule: '📋',
    schedule: '📅',
    holiday: '🎉',
    tenant: '🏢',
};

export default function AuditLog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    const filteredLog = MOCK_AUDIT_LOG.filter((entry) => {
        const matchesSearch = entry.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.changeSummary.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = actionFilter === 'all' || entry.actionType === actionFilter;
        return matchesSearch && matchesAction;
    });

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Audit Log</h1>
                    <p className="page-subtitle">Complete history of all configuration changes</p>
                </div>
                <button className="btn btn-secondary">
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by entity, user, or summary..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="form-select"
                    style={{ width: 160 }}
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                >
                    <option value="all">All Actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="activated">Activated</option>
                    <option value="deactivated">Deactivated</option>
                    <option value="archived">Archived</option>
                    <option value="cloned">Cloned</option>
                </select>
            </div>

            {/* Audit Timeline */}
            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    {filteredLog.map((entry, idx) => (
                        <div
                            key={entry.id}
                            style={{
                                display: 'flex',
                                gap: 'var(--space-4)',
                                padding: 'var(--space-4) var(--space-6)',
                                borderBottom: idx < filteredLog.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                                transition: 'background var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-secondary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            {/* Time */}
                            <div style={{
                                minWidth: 120,
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-tertiary)',
                                fontFamily: 'var(--font-mono)',
                                paddingTop: 2,
                            }}>
                                {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                <br />
                                {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {/* Icon + Line */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 'var(--radius-full)',
                                    background: `${ACTION_COLORS[entry.actionType]}15`,
                                    border: `2px solid ${ACTION_COLORS[entry.actionType]}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    flexShrink: 0,
                                }}>
                                    {ENTITY_ICONS[entry.entityType]}
                                </div>
                                {idx < filteredLog.length - 1 && (
                                    <div style={{
                                        width: 2,
                                        flex: 1,
                                        background: 'var(--color-border)',
                                        marginTop: 4,
                                    }} />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{entry.userName}</span>
                                    <span style={{
                                        padding: '1px 6px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 600,
                                        background: `${ACTION_COLORS[entry.actionType]}15`,
                                        color: ACTION_COLORS[entry.actionType],
                                        textTransform: 'capitalize',
                                    }}>
                                        {entry.actionType}
                                    </span>
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        {entry.entityType}: <strong>{entry.entityName}</strong>
                                    </span>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                                    {entry.changeSummary}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
