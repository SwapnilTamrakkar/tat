// ============================================================
// Step 4 — Review & Simulate (SCR-005)
// ============================================================
import { Edit, Play, CheckCircle, Clock, Link2, Calendar, Timer, AlertTriangle } from 'lucide-react';
import { useWizardStore } from '../../../stores';
import { PATTERN_LABELS, UNIT_LABELS, THRESHOLD_COLORS } from '../../../constants';
import { useState } from 'react';
import { format, addDays, addHours } from 'date-fns';
import '../../ui/ui.css';

interface Props {
    effectiveFrom?: string;
    effectiveTo?: string;
}

interface SimResult {
    primaryDeadline: Date;
    secondaryDeadline: Date | null;
    thresholds: { level: string; alertAt: Date; color: string }[];
    patternNote: string;
    durationMs: number;
}

function runSimulation(wizard: ReturnType<typeof useWizardStore.getState>, refDate: Date): SimResult {
    const { primaryClock, secondaryClock, secondaryClockEnabled } = wizard;

    const computeDeadline = (duration: number, unit: string, from: Date): Date => {
        if (unit === 'hours') return addHours(from, duration);
        return addDays(from, duration);
    };

    const primaryDeadline = computeDeadline(primaryClock.duration, primaryClock.durationUnit, refDate);

    const secondaryDeadline = secondaryClockEnabled && secondaryClock
        ? computeDeadline(secondaryClock.duration, secondaryClock.durationUnit, refDate)
        : null;

    // Compute threshold alerts from deadline
    const thresholds = primaryClock.thresholds
        .filter(t => t.enabled && t.offsetValue > 0)
        .map(t => {
            const alertAt = t.offsetUnit === 'hours'
                ? addHours(primaryDeadline, -t.offsetValue)
                : addDays(primaryDeadline, -t.offsetValue);
            return { level: t.level, alertAt, color: THRESHOLD_COLORS[t.level] };
        })
        .sort((a, b) => a.alertAt.getTime() - b.alertAt.getTime());

    const patternNote = primaryClock.pattern === 'flat_hours'
        ? '⚡ Flat Hours — runs 24/7 continuously'
        : primaryClock.pattern === 'business_hours'
            ? '🏢 Business Hours — only counting during work schedule'
            : '📅 Calendar Days — all days counted';

    return { primaryDeadline, secondaryDeadline, thresholds, patternNote, durationMs: primaryDeadline.getTime() - refDate.getTime() };
}

export default function Step4Review({ effectiveFrom = '', effectiveTo = '' }: Props) {
    const wizard = useWizardStore();
    const [simulationRun, setSimulationRun] = useState(false);
    const [simResult, setSimResult] = useState<SimResult | null>(null);
    const [refDateStr, setRefDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [simRunning, setSimRunning] = useState(false);

    const hasRequiredFields = wizard.ruleName.trim() &&
        wizard.matchCriteria.serviceTypes.length > 0 &&
        wizard.matchCriteria.requestTypes.length > 0 &&
        wizard.primaryClock.startEvent.conditions.length > 0 &&
        wizard.primaryClock.stopEvent.conditions.length > 0;

    const handleRunSimulation = () => {
        setSimRunning(true);
        setSimulationRun(false);
        setTimeout(() => {
            const refDate = new Date(refDateStr);
            if (wizard.primaryClock.startMode === 'next_day') refDate.setDate(refDate.getDate() + 1);
            const result = runSimulation(wizard, refDate);
            setSimResult(result);
            setSimulationRun(true);
            setSimRunning(false);
        }, 900);
    };

    const SectionBadge = ({ step, label }: { step: number; label: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0,
            }}>{step}</span>
            <span className="card-title">{label}</span>
        </div>
    );

    return (
        <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Review & Verify
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                Review your rule configuration and run a simulation before activating.
            </p>

            {!hasRequiredFields && (
                <div className="callout callout-warning" style={{ marginBottom: 'var(--space-6)' }}>
                    <AlertTriangle size={14} className="callout-icon" />
                    <div className="callout-content">
                        <div className="callout-title">Incomplete Rule</div>
                        <div className="callout-text">
                            Required fields are missing. Go back and complete: Rule Name, Service Types, Request Types, and Start/Stop events.
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {/* Matching Criteria */}
                <div className="card">
                    <div className="card-header">
                        <SectionBadge step={1} label="Matching Criteria" />
                        <button className="btn btn-ghost btn-sm" onClick={() => wizard.setStep(1)}>
                            <Edit size={14} /> Edit
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="summary-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="summary-item">
                                <span className="summary-item-label">Rule Name</span>
                                <span className="summary-item-value" style={{ fontWeight: 700 }}>{wizard.ruleName || '—'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Case Type</span>
                                <span className="summary-item-value">
                                    <span className={`pill-label pill-${wizard.matchCriteria.caseType.toLowerCase()}`}>
                                        {wizard.matchCriteria.caseType}
                                    </span>
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Request Types</span>
                                <span className="summary-item-value">
                                    <div className="chip-group" style={{ gap: 4 }}>
                                        {wizard.matchCriteria.requestTypes.map(rt => (
                                            <span key={rt} className="chip selected" style={{ fontSize: 'var(--font-size-xs)', cursor: 'default' }}>{rt}</span>
                                        ))}
                                    </div>
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Service Types</span>
                                <span className="summary-item-value">
                                    {wizard.matchCriteria.serviceTypes.length === 0
                                        ? '—'
                                        : wizard.matchCriteria.serviceTypes.length <= 2
                                            ? wizard.matchCriteria.serviceTypes.join(', ')
                                            : `${wizard.matchCriteria.serviceTypes.length} types`}
                                </span>
                            </div>
                            {(effectiveFrom || effectiveTo) && (
                                <div className="summary-item">
                                    <span className="summary-item-label">Effective Period</span>
                                    <span className="summary-item-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                                        {effectiveFrom || '∞'} → {effectiveTo || '∞'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Primary Clock */}
                <div className="card">
                    <div className="card-header">
                        <SectionBadge step={2} label="Primary Clock" />
                        <button className="btn btn-ghost btn-sm" onClick={() => wizard.setStep(2)}>
                            <Edit size={14} /> Edit
                        </button>
                    </div>
                    <div className="card-body">
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
                            {wizard.primaryClock.duration}
                            <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}> {UNIT_LABELS[wizard.primaryClock.durationUnit]}</span>
                        </div>
                        <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 'var(--space-3)' }}>
                            <div className="summary-item">
                                <span className="summary-item-label">Pattern</span>
                                <span className="summary-item-value">{PATTERN_LABELS[wizard.primaryClock.pattern]}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Start Mode</span>
                                <span className="summary-item-value">{wizard.primaryClock.startMode === 'same_day' ? 'Same Day' : 'Next Day'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Events</span>
                                <span className="summary-item-value">
                                    {[
                                        wizard.primaryClock.startEvent.conditions.length > 0 && '✓ Start',
                                        wizard.primaryClock.stopEvent.conditions.length > 0 && '✓ Stop',
                                        wizard.primaryClock.pauseEvent?.conditions?.length && '✓ Pause',
                                        wizard.primaryClock.resumeEvent?.conditions?.length && '✓ Resume',
                                    ].filter(Boolean).join(' · ') || '—'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                            {wizard.primaryClock.thresholds.filter(t => t.enabled).map((t) => (
                                <span key={t.id} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                    background: `${THRESHOLD_COLORS[t.level]}15`, border: `1px solid ${THRESHOLD_COLORS[t.level]}40`,
                                    fontSize: 'var(--font-size-xs)', fontWeight: 600, color: THRESHOLD_COLORS[t.level],
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: THRESHOLD_COLORS[t.level] }} />
                                    {t.level}: {t.offsetValue}{t.offsetUnit === 'hours' ? 'h' : 'd'}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secondary Clock */}
                <div className="card">
                    <div className="card-header">
                        <SectionBadge step={3} label="Secondary Clock & Exclusions" />
                        <button className="btn btn-ghost btn-sm" onClick={() => wizard.setStep(3)}>
                            <Edit size={14} /> Edit
                        </button>
                    </div>
                    <div className="card-body">
                        {wizard.secondaryClockEnabled ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                    <Link2 size={14} style={{ color: 'var(--color-primary)' }} />
                                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                        {wizard.secondaryClock.duration} {UNIT_LABELS[wizard.secondaryClock.durationUnit]}
                                    </span>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>Chained</span>
                                </div>
                                <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="summary-item">
                                        <span className="summary-item-label">Holiday Exclusion</span>
                                        <span className="summary-item-value" style={{ textTransform: 'capitalize' }}>{wizard.holidayExclusion}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-item-label">Weekends</span>
                                        <span className="summary-item-value">{wizard.weekendExclusion ? 'Excluded' : 'Included'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic', marginBottom: 'var(--space-3)' }}>
                                    No secondary clock
                                </div>
                                <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="summary-item">
                                        <span className="summary-item-label">Holiday Exclusion</span>
                                        <span className="summary-item-value" style={{ textTransform: 'capitalize' }}>{wizard.holidayExclusion}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-item-label">Weekends</span>
                                        <span className="summary-item-value">{wizard.weekendExclusion ? 'Excluded' : 'Included'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Plain-English Summary */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Timer size={16} /> Rule Summary
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="condition-preview" style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                            When a case is <strong>{wizard.matchCriteria.caseType === 'IP' ? 'Inpatient' : wizard.matchCriteria.caseType === 'OP' ? 'Outpatient' : 'IP/OP'}</strong>
                            {wizard.matchCriteria.requestTypes.length > 0 && (
                                <> with request type <strong>{wizard.matchCriteria.requestTypes.join(' or ')}</strong></>
                            )}, start a {PATTERN_LABELS[wizard.primaryClock.pattern]} clock for{' '}
                            <strong>{wizard.primaryClock.duration} {UNIT_LABELS[wizard.primaryClock.durationUnit]}</strong>
                            {' '}({wizard.primaryClock.startMode === 'same_day' ? 'same day' : 'next day'} start).
                            {wizard.secondaryClockEnabled && (
                                <> On pause, chain to a secondary clock of <strong>{wizard.secondaryClock.duration} {UNIT_LABELS[wizard.secondaryClock.durationUnit]}</strong>.</>
                            )}
                            {' '}Holidays: {wizard.holidayExclusion === 'none' ? 'not excluded' : `${wizard.holidayExclusion} excluded`}.
                            {' '}Weekends: {wizard.weekendExclusion ? 'excluded' : 'not excluded'}.
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Panel */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        🧪 Simulation Sandbox
                    </span>
                </div>
                <div className="card-body">
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                        Enter a case start date to simulate how this rule would calculate deadlines and alert timestamps.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                                Case Start Date (trigger date)
                            </label>
                            <input
                                type="date"
                                className="form-input"
                                value={refDateStr}
                                onChange={(e) => { setRefDateStr(e.target.value); setSimulationRun(false); }}
                                style={{ maxWidth: 200 }}
                            />
                        </div>
                        <div style={{ paddingTop: 22 }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleRunSimulation}
                                disabled={simRunning}
                            >
                                {simRunning ? (
                                    <>
                                        <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                        Running...
                                    </>
                                ) : (
                                    <><Play size={14} /> Run Simulation</>
                                )}
                            </button>
                        </div>
                    </div>

                    {simulationRun && simResult && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* Timeline visual */}
                            <div style={{
                                padding: 'var(--space-5)',
                                background: 'var(--color-success-light)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-success)',
                                marginBottom: 'var(--space-4)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                    <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                                    <span style={{ fontWeight: 700, color: 'var(--color-success-dark)' }}>Simulation Complete</span>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{simResult.patternNote}</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Calendar size={10} style={{ display: 'inline' }} /> Trigger Date
                                        </div>
                                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                                            {format(new Date(refDateStr), 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Clock size={10} style={{ display: 'inline' }} /> Primary Deadline
                                        </div>
                                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-success-dark)' }}>
                                            {format(simResult.primaryDeadline, 'MMM d, yyyy')}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                            {wizard.primaryClock.duration} {wizard.primaryClock.durationUnit} later
                                        </div>
                                    </div>
                                    {simResult.secondaryDeadline && (
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <Link2 size={10} style={{ display: 'inline' }} /> Pend Deadline
                                            </div>
                                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-info)' }}>
                                                {format(simResult.secondaryDeadline, 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Alert Timeline */}
                            {simResult.thresholds.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                                        Alert Timeline
                                    </div>
                                    <div style={{ position: 'relative', paddingLeft: 20 }}>
                                        <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: 'var(--color-border)' }} />
                                        {simResult.thresholds.map((t) => (
                                            <div key={t.level} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', position: 'relative' }}>
                                                <div style={{
                                                    position: 'absolute', left: -14, width: 10, height: 10,
                                                    borderRadius: '50%', background: t.color, border: '2px solid white', flexShrink: 0,
                                                }} />
                                                <div style={{ background: `${t.color}15`, border: `1px solid ${t.color}40`, borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', flex: 1 }}>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: t.color, textTransform: 'capitalize' }}>
                                                        {t.level} Alert
                                                    </span>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>
                                                        {format(t.alertAt, 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute', left: -14, width: 10, height: 10,
                                                borderRadius: '50%', background: '#ef4444', border: '2px solid white', flexShrink: 0,
                                            }} />
                                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', flex: 1 }}>
                                                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: '#ef4444' }}>
                                                    ☠️ DEADLINE
                                                </span>
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginLeft: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>
                                                    {format(simResult.primaryDeadline, 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
