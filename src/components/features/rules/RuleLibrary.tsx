// ============================================================
// Rule Library Page — SCR-001
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, MoreHorizontal, Copy, Edit,
    Archive, Power, PowerOff, Filter, FileCog
} from 'lucide-react';
import { useRuleStore, useUIStore } from '../../../stores';
import { STATUS_LABELS, PATTERN_LABELS, UNIT_LABELS } from '../../../constants';
import type { TATRule, RuleStatus } from '../../../types';
import { formatDistanceToNow } from 'date-fns';
import '../../ui/ui.css';

const statusFilters: { label: string; value: RuleStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Archived', value: 'archived' },
];

export default function RuleLibrary() {
    const { rules, cloneRule, activateRule, deactivateRule, archiveRule } = useRuleStore();
    const { addToast } = useUIStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<RuleStatus | 'all'>('all');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filteredRules = useMemo(() => {
        return rules.filter((rule) => {
            const matchesSearch =
                rule.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rule.matchCriteria.serviceTypes.some((st) =>
                    st.toLowerCase().includes(searchQuery.toLowerCase())
                );
            const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rules, searchQuery, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: rules.length };
        rules.forEach((r) => {
            counts[r.status] = (counts[r.status] || 0) + 1;
        });
        return counts;
    }, [rules]);

    const handleClone = (ruleId: string) => {
        const cloned = cloneRule(ruleId);
        addToast('Rule cloned — now editing draft.', 'success');
        navigate(`/rules/${cloned.id}/edit`);
        setOpenMenuId(null);
    };

    const handleActivate = (ruleId: string) => {
        activateRule(ruleId);
        addToast('Rule activated successfully.', 'success');
        setOpenMenuId(null);
    };

    const handleDeactivate = (ruleId: string) => {
        deactivateRule(ruleId);
        addToast('Rule deactivated.', 'warning');
        setOpenMenuId(null);
    };

    const handleArchive = (ruleId: string) => {
        archiveRule(ruleId);
        addToast('Rule archived.', 'info');
        setOpenMenuId(null);
    };

    const formatTAT = (rule: TATRule) => {
        return `${rule.primaryClock.duration} ${UNIT_LABELS[rule.primaryClock.durationUnit]}`;
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Rule Library</h1>
                    <p className="page-subtitle">Manage and configure TAT rules for prior authorization workflows</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/rules/new')}>
                    <Plus size={18} /> New Rule
                </button>
            </div>

            {/* Stat Chips (Redesigned) */}
            <div 
                style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginBottom: 'var(--space-8)', 
                    overflowX: 'auto', 
                    padding: '6px 4px 12px 4px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {statusFilters.map((f) => {
                    const isActive = statusFilter === f.value;
                    const count = statusCounts[f.value] || 0;
                    
                    // Build semantic coloring for active states
                    let colorVar = 'var(--color-text-secondary)';
                    let bgVar = 'var(--color-bg-secondary)';
                    let glowColor = 'transparent';

                    if (isActive) {
                        if (f.value === 'active') { colorVar = 'var(--color-success-dark)'; bgVar = 'var(--color-success-light)'; glowColor = 'rgba(16, 185, 129, 0.25)'; }
                        else if (f.value === 'draft') { colorVar = 'var(--color-text-primary)'; bgVar = 'var(--color-border)'; glowColor = 'rgba(148, 163, 184, 0.25)'; }
                        else if (f.value === 'inactive') { colorVar = 'var(--color-warning-dark)'; bgVar = 'var(--color-warning-light)'; glowColor = 'rgba(245, 158, 11, 0.25)'; }
                        else if (f.value === 'archived') { colorVar = 'var(--color-text-tertiary)'; bgVar = 'var(--color-bg-secondary)'; glowColor = 'transparent'; }
                        else { colorVar = 'var(--color-primary-dark)'; bgVar = 'var(--color-primary-100)'; glowColor = 'rgba(34, 197, 94, 0.25)'; }
                    }

                    return (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 16px 8px 8px',
                                borderRadius: 'var(--radius-full)',
                                border: isActive ? '1px solid currentColor' : '1px solid var(--color-border)',
                                backgroundColor: isActive ? bgVar : 'var(--color-surface)',
                                color: isActive ? colorVar : 'var(--color-text-secondary)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: isActive ? `0 4px 12px ${glowColor}` : '0 1px 2px rgba(0,0,0,0.05)',
                                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                                opacity: count === 0 && !isActive ? 0.6 : 1,
                            }}
                            onMouseOver={(e) => {
                                if (!isActive) e.currentTarget.style.borderColor = 'var(--color-text-tertiary)';
                            }}
                            onMouseOut={(e) => {
                                if (!isActive) e.currentTarget.style.borderColor = 'var(--color-border)';
                            }}
                        >
                            <span 
                                style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? 'var(--color-surface)' : 'var(--color-bg-secondary)',
                                    color: isActive ? colorVar : 'var(--color-text-primary)',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {count}
                            </span>
                            {f.label}
                        </button>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search rules by name, service type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary btn-sm">
                    <Filter size={14} /> Filters
                </button>
            </div>

            {/* Data Table */}
            {filteredRules.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FileCog size={32} />
                    </div>
                    <h3 className="empty-state-title">
                        {searchQuery || statusFilter !== 'all' ? 'No rules match' : 'No rules yet'}
                    </h3>
                    <p className="empty-state-desc">
                        {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your filters or search query.'
                            : 'Create your first TAT rule to get started with clock management.'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                        <button className="btn btn-primary" onClick={() => navigate('/rules/new')}>
                            <Plus size={16} /> Create Your First Rule
                        </button>
                    )}
                </div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rule Name</th>
                                <th>Case Type</th>
                                <th>Request Types</th>
                                <th>Primary TAT</th>
                                <th>Pattern</th>
                                <th>Status</th>
                                <th>Last Modified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRules.map((rule) => (
                                <tr key={rule.id}>
                                    <td>
                                        <button
                                            onClick={() => navigate(`/rules/${rule.id}`)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--color-primary)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-sm)',
                                                textAlign: 'left',
                                                padding: 0,
                                            }}
                                        >
                                            {rule.ruleName}
                                        </button>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                                            {rule.matchCriteria.serviceTypes.length} service type{rule.matchCriteria.serviceTypes.length !== 1 ? 's' : ''}
                                            {rule.secondaryClockEnabled && ' · Chained'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`pill-label pill-${rule.matchCriteria.caseType.toLowerCase()}`}>
                                            {rule.matchCriteria.caseType}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="chip-group" style={{ gap: '4px' }}>
                                            {rule.matchCriteria.requestTypes.map((rt) => (
                                                <span key={rt} style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    padding: '1px 6px',
                                                    background: 'var(--color-bg-secondary)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--color-text-secondary)',
                                                }}>
                                                    {rt}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                        {formatTAT(rule)}
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: 'var(--font-size-xs)',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            background: rule.primaryClock.pattern === 'flat_hours' ? '#dcfce7' : '#dbeafe',
                                            color: rule.primaryClock.pattern === 'flat_hours' ? '#166534' : '#1d4ed8',
                                            fontWeight: 500,
                                        }}>
                                            {PATTERN_LABELS[rule.primaryClock.pattern]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${rule.status}`}>
                                            <span className="badge-dot" />
                                            {STATUS_LABELS[rule.status]}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                        {formatDistanceToNow(new Date(rule.updatedAt), { addSuffix: true })}
                                        <div style={{ marginTop: 2 }}>by {rule.createdBy}</div>
                                    </td>
                                    <td>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => setOpenMenuId(openMenuId === rule.id ? null : rule.id)}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {openMenuId === rule.id && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: '100%',
                                                        background: 'var(--color-surface)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: 'var(--radius-md)',
                                                        boxShadow: 'var(--shadow-lg)',
                                                        zIndex: 50,
                                                        minWidth: 180,
                                                        animation: 'scaleIn 0.15s ease-out',
                                                    }}
                                                    onMouseLeave={() => setOpenMenuId(null)}
                                                >
                                                    <button
                                                        className="sidebar-link"
                                                        style={{ padding: '8px 16px' }}
                                                        onClick={() => { navigate(`/rules/${rule.id}/edit`); setOpenMenuId(null); }}
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className="sidebar-link"
                                                        style={{ padding: '8px 16px' }}
                                                        onClick={() => handleClone(rule.id)}
                                                    >
                                                        <Copy size={14} /> Clone
                                                    </button>
                                                    {rule.status === 'draft' || rule.status === 'inactive' ? (
                                                        <button
                                                            className="sidebar-link"
                                                            style={{ padding: '8px 16px', color: 'var(--color-success)' }}
                                                            onClick={() => handleActivate(rule.id)}
                                                        >
                                                            <Power size={14} /> Activate
                                                        </button>
                                                    ) : rule.status === 'active' ? (
                                                        <button
                                                            className="sidebar-link"
                                                            style={{ padding: '8px 16px', color: 'var(--color-warning)' }}
                                                            onClick={() => handleDeactivate(rule.id)}
                                                        >
                                                            <PowerOff size={14} /> Deactivate
                                                        </button>
                                                    ) : null}
                                                    {rule.status !== 'archived' && (
                                                        <button
                                                            className="sidebar-link"
                                                            style={{ padding: '8px 16px', color: 'var(--color-danger)' }}
                                                            onClick={() => handleArchive(rule.id)}
                                                        >
                                                            <Archive size={14} /> Archive
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
