// ============================================================
// Rule Detail Page
// ============================================================
import { useParams, useNavigate } from 'react-router-dom';
import {
    Edit, Copy, Power, PowerOff, Archive, ArrowLeft,
    Clock, Link2, Calendar, History
} from 'lucide-react';
import { useRuleStore, useUIStore } from '../../../stores';
import { STATUS_LABELS, PATTERN_LABELS, UNIT_LABELS, THRESHOLD_COLORS } from '../../../constants';
import '../../ui/ui.css';

export default function RuleDetail() {
    const { ruleId } = useParams();
    const navigate = useNavigate();
    const { getRule, cloneRule, activateRule, deactivateRule, archiveRule } = useRuleStore();
    const { addToast } = useUIStore();

    const rule = getRule(ruleId!);

    if (!rule) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Rule not found</h3>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> Back to Library
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')}>
                    <ArrowLeft size={18} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{rule.ruleName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                        <span className={`badge badge-${rule.status}`}>
                            <span className="badge-dot" />
                            {STATUS_LABELS[rule.status]}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                            Version {rule.version} · Created by {rule.createdBy}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-secondary" onClick={() => navigate(`/rules/${rule.id}/edit`)}>
                        <Edit size={14} /> Edit
                    </button>
                    <button className="btn btn-secondary" onClick={() => { const c = cloneRule(rule.id); addToast('Rule cloned.', 'success'); navigate(`/rules/${c.id}/edit`); }}>
                        <Copy size={14} /> Clone
                    </button>
                    {rule.status === 'draft' ? (
                        <button className="btn btn-success" onClick={() => { activateRule(rule.id); addToast('Rule activated!', 'success'); }}>
                            <Power size={14} /> Activate
                        </button>
                    ) : rule.status === 'active' ? (
                        <button className="btn btn-secondary" onClick={() => { deactivateRule(rule.id); addToast('Rule deactivated.', 'warning'); }}>
                            <PowerOff size={14} /> Deactivate
                        </button>
                    ) : null}
                    {rule.status !== 'archived' && (
                        <button className="btn btn-ghost" onClick={() => { archiveRule(rule.id); addToast('Rule archived.', 'info'); navigate('/'); }}>
                            <Archive size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                {/* Matching Criteria */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Calendar size={16} /> Matching Criteria
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="summary-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="summary-item">
                                <span className="summary-item-label">Case Type</span>
                                <span className="summary-item-value">
                                    <span className={`pill-label pill-${rule.matchCriteria.caseType.toLowerCase()}`}>
                                        {rule.matchCriteria.caseType === 'IP' ? 'Inpatient' : 'Outpatient'}
                                    </span>
                                </span>
                            </div>
                            <div className="summary-item" style={{ marginTop: 'var(--space-3)' }}>
                                <span className="summary-item-label">Service Types</span>
                                <div className="chip-group" style={{ marginTop: 'var(--space-1)' }}>
                                    {rule.matchCriteria.serviceTypes.map((st) => (
                                        <span key={st} className="chip" style={{ cursor: 'default', fontSize: 'var(--font-size-xs)' }}>
                                            {st}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="summary-item" style={{ marginTop: 'var(--space-3)' }}>
                                <span className="summary-item-label">Request Types</span>
                                <div className="chip-group" style={{ marginTop: 'var(--space-1)' }}>
                                    {rule.matchCriteria.requestTypes.map((rt) => (
                                        <span key={rt} className="chip selected" style={{ cursor: 'default', fontSize: 'var(--font-size-xs)' }}>
                                            {rt}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Clock */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Clock size={16} /> Primary Clock
                        </span>
                    </div>
                    <div className="card-body">
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                            {rule.primaryClock.duration} <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 500 }}>{UNIT_LABELS[rule.primaryClock.durationUnit]}</span>
                        </div>
                        <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="summary-item">
                                <span className="summary-item-label">Pattern</span>
                                <span className="summary-item-value">{PATTERN_LABELS[rule.primaryClock.pattern]}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Start Mode</span>
                                <span className="summary-item-value">{rule.primaryClock.startMode === 'same_day' ? 'Same Day' : 'Next Day'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                            {rule.primaryClock.thresholds.filter(t => t.enabled).map((t) => (
                                <div
                                    key={t.id}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-full)',
                                        background: `${THRESHOLD_COLORS[t.level]}15`,
                                        border: `1px solid ${THRESHOLD_COLORS[t.level]}40`,
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 600,
                                        color: THRESHOLD_COLORS[t.level],
                                        display: 'flex', alignItems: 'center', gap: 4,
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: THRESHOLD_COLORS[t.level] }} />
                                    {t.level}: {t.offsetValue}{t.offsetUnit === 'hours' ? 'h' : 'd'}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secondary Clock */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Link2 size={16} /> Secondary Clock
                        </span>
                    </div>
                    <div className="card-body">
                        {rule.secondaryClockEnabled && rule.secondaryClock ? (
                            <>
                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                                    {rule.secondaryClock.duration} <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 500 }}>{UNIT_LABELS[rule.secondaryClock.durationUnit]}</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', fontWeight: 500 }}>
                                    ✓ Chained to Primary
                                </div>
                            </>
                        ) : (
                            <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Not configured</div>
                        )}
                    </div>
                </div>

                {/* Exclusions & History */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <History size={16} /> Metadata
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="summary-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="summary-item">
                                <span className="summary-item-label">Holiday Exclusion</span>
                                <span className="summary-item-value" style={{ textTransform: 'capitalize' }}>{rule.holidayExclusion}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Weekend Exclusion</span>
                                <span className="summary-item-value">{rule.weekendExclusion ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Effective From</span>
                                <span className="summary-item-value">{rule.effectiveFrom || 'Not set'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Version</span>
                                <span className="summary-item-value">v{rule.version}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
