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

            {/* Stat Chips */}
            <div className="stat-chips" style={{ marginBottom: 'var(--space-6)' }}>
                {statusFilters.map((f) => (
                    <button
                        key={f.value}
                        className={`stat-chip ${statusFilter === f.value ? 'active' : ''}`}
                        onClick={() => setStatusFilter(f.value)}
                    >
                        <span className="stat-chip-count">{statusCounts[f.value] || 0}</span>
                        {f.label}
                    </button>
                ))}
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
