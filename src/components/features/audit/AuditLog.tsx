// ============================================================
// Audit Log Page
// ============================================================
import { useState } from 'react';
import { Search, Download, FileCog, Clock, Calendar, Building2, X } from 'lucide-react';
import { Select } from '../../ui/Select';
import '../../ui/ui.css';

// Mock audit log data
const MOCK_AUDIT_LOG = [
    { id: '1', timestamp: '2025-03-18T16:45:00Z', userName: 'Mike Chen', actionType: 'updated', entityType: 'rule', entityName: 'OP Expedited - Physician Services', changeSummary: 'Updated threshold: Red Alert changed from 24h to 18h' },
    { id: '2', timestamp: '2025-03-15T14:30:00Z', userName: 'Sarah Johnson', actionType: 'updated', entityType: 'rule', entityName: 'IP Standard - Inpatient Admission', changeSummary: 'Added pause/resume conditions for additional info pend' },
    { id: '3', timestamp: '2025-03-10T11:00:00Z', userName: 'Sarah Johnson', actionType: 'activated', entityType: 'rule', entityName: 'OP Standard - Outpatient Services', changeSummary: 'Rule activated for production use' },
    { id: '4', timestamp: '2025-03-05T09:00:00Z', userName: 'Mike Chen', actionType: 'created', entityType: 'rule', entityName: 'OP Expedited - Physician Services', changeSummary: 'New rule created from OP Standard template' },
    { id: '5', timestamp: '2025-02-28T09:15:00Z', userName: 'Admin User', actionType: 'updated', entityType: 'schedule', entityName: 'Default Schedule', changeSummary: 'Friday end time changed from 17:00 to 16:00' },
    { id: '6', timestamp: '2025-02-15T10:00:00Z', userName: 'Admin User', actionType: 'created', entityType: 'holiday', entityName: "Presidents' Day", changeSummary: 'Added federal holiday: February 17' },
    { id: '7', timestamp: '2025-01-14T12:00:00Z', userName: 'Sarah Johnson', actionType: 'created', entityType: 'rule', entityName: 'OP Standard - Outpatient Services', changeSummary: 'Initial creation from TAT matrix' },
    { id: '8', timestamp: '2025-01-12T10:00:00Z', userName: 'Mike Chen', actionType: 'created', entityType: 'rule', entityName: 'IP Expedited - Inpatient Urgent', changeSummary: '72-hour expedited rule created' },
    { id: '9', timestamp: '2025-01-10T08:00:00Z', userName: 'Sarah Johnson', actionType: 'created', entityType: 'rule', entityName: 'IP Standard - Inpatient Admission', changeSummary: 'Initial IP standard rule from TAT matrix' },
    { id: '10', timestamp: '2025-01-05T09:00:00Z', userName: 'Admin User', actionType: 'created', entityType: 'provider', entityName: 'Acme Healthcare', changeSummary: 'Provider registered with EST timezone' },
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

const ENTITY_ICONS: Record<string, any> = {
    rule: FileCog,
    schedule: Clock,
    holiday: Calendar,
    provider: Building2,
};

export default function AuditLog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

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
                <Select
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
                </Select>
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
                                transition: 'all var(--transition-fast)',
                                cursor: 'pointer',
                            }}
                            onClick={() => setSelectedEntry(entry)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--color-bg-secondary)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'none';
                            }}
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
                                    {(() => {
                                        const IconComponent = ENTITY_ICONS[entry.entityType];
                                        return IconComponent ? <IconComponent size={16} color={ACTION_COLORS[entry.actionType]} /> : null;
                                    })()}
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

            {/* Detailed View Modal */}
            {selectedEntry && (
                <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    background: `${ACTION_COLORS[selectedEntry.actionType]}15`,
                                    color: ACTION_COLORS[selectedEntry.actionType],
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {selectedEntry.actionType}
                                </span>
                                Audit Record Details
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedEntry(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            {/* Header Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Performed By</div>
                                    <div style={{ fontWeight: 600 }}>{selectedEntry.userName}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Timestamp</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                                        {new Date(selectedEntry.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' })}
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Target Entity</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        {(() => {
                                            const IconComponent = ENTITY_ICONS[selectedEntry.entityType];
                                            return IconComponent ? <IconComponent size={16} color="var(--color-text-secondary)" /> : null;
                                        })()}
                                        <span style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{selectedEntry.entityType}:</span>
                                        <span style={{ fontWeight: 600 }}>{selectedEntry.entityName}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Change Summary</h4>
                                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                                    {selectedEntry.changeSummary}
                                </div>
                            </div>

                            {/* Mock Diff / State Change */}
                            {(selectedEntry.actionType === 'updated' || selectedEntry.actionType === 'created') && (
                                <div>
                                    <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Payload Changes (JSON)</h4>
                                    <div style={{ 
                                        background: '#0f172a', 
                                        padding: 'var(--space-4)', 
                                        borderRadius: 'var(--radius-md)', 
                                        fontFamily: 'var(--font-mono)', 
                                        fontSize: 'var(--font-size-xs)',
                                        color: '#e2e8f0',
                                        overflowX: 'auto'
                                    }}>
                                        <pre style={{ margin: 0 }}>
{`{
  "entityId": "obj_${selectedEntry.id}x89",
  "eventType": "${selectedEntry.actionType.toUpperCase()}",
  "mutations": [
    {
      "field": "configuration.parameters",
      "oldValue": ${selectedEntry.actionType === 'created' ? 'null' : '"previous_state_value"'},
      "newValue": "applied_state_value"
    }
  ],
  "requestIp": "192.168.1.104",
  "sessionId": "ses_${Math.random().toString(36).substr(2, 9)}"
}`}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedEntry(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
