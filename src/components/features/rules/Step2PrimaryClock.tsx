// ============================================================
// Step 2 — Primary Clock Configuration (SCR-003)
// ============================================================
import { Plus, Trash2, Info, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useWizardStore } from '../../../stores';
import { EVENT_FIELDS, EVENT_FIELD_VALUES } from '../../../types';
import type { EventCondition, ClockPattern, DurationUnit, StartMode, ThresholdLevel } from '../../../types';
import { PATTERN_LABELS, UNIT_LABELS, THRESHOLD_COLORS } from '../../../constants';
import ClockTimelinePreview from './ClockTimelinePreview';
import { Select } from '../../ui/Select';
import '../../ui/ui.css';

const PATTERN_DESCRIPTIONS: Record<string, string> = {
    calendar_days: 'Counts calendar days including nights and weekends (subject to exclusion settings)',
    flat_hours: 'Counts wall-clock hours continuously — 24/7, no exclusions apply',
    business_hours: 'Counts only configured business hours per the work schedule',
};

export default function Step2PrimaryClock() {
    const { primaryClock, setPrimaryClock } = useWizardStore();

    const addCondition = (eventType: 'start' | 'stop' | 'pause' | 'resume') => {
        const newCondition: EventCondition = {
            id: crypto.randomUUID(),
            field: 'Line Status',
            operator: '=',
            value: 'Submitted',
        };
        if (eventType === 'start' || eventType === 'stop') {
            const event = eventType === 'start' ? primaryClock.startEvent : primaryClock.stopEvent;
            setPrimaryClock({ [eventType === 'start' ? 'startEvent' : 'stopEvent']: { conditions: [...event.conditions, newCondition] } });
        } else {
            const key = eventType === 'pause' ? 'pauseEvent' : 'resumeEvent';
            const event = primaryClock[key] || { conditions: [] };
            setPrimaryClock({ [key]: { conditions: [...event.conditions, newCondition] } });
        }
    };

    const removeCondition = (eventType: 'start' | 'stop' | 'pause' | 'resume', condId: string) => {
        const getKey = () => eventType === 'start' ? 'startEvent' : eventType === 'stop' ? 'stopEvent' : eventType === 'pause' ? 'pauseEvent' : 'resumeEvent';
        const key = getKey();
        const event = primaryClock[key];
        if (!event) return;
        setPrimaryClock({ [key]: { conditions: event.conditions.filter((c) => c.id !== condId) } });
    };

    const updateCondition = (eventType: 'start' | 'stop' | 'pause' | 'resume', condId: string, field: keyof EventCondition, value: string) => {
        const getKey = () => eventType === 'start' ? 'startEvent' : eventType === 'stop' ? 'stopEvent' : eventType === 'pause' ? 'pauseEvent' : 'resumeEvent';
        const key = getKey();
        const event = primaryClock[key];
        if (!event) return;
        const updates: Record<string, string | object> = { [key]: { conditions: event.conditions.map((c) => c.id === condId ? { ...c, [field]: value, ...(field === 'field' ? { value: '' } : {}) } : c) } };
        setPrimaryClock(updates);
    };

    const renderConditionBuilder = (label: string, hint: string, eventType: 'start' | 'stop' | 'pause' | 'resume', required: boolean, colorIndicator: string) => {
        const getKey = () => eventType === 'start' ? 'startEvent' : eventType === 'stop' ? 'stopEvent' : eventType === 'pause' ? 'pauseEvent' : 'resumeEvent';
        const key = getKey();
        const event = primaryClock[key];
        const conditions = event?.conditions || [];
        const isEmpty = conditions.length === 0;

        return (
            <div style={{
                marginBottom: 'var(--space-5)',
                padding: 'var(--space-4)',
                border: `1.5px solid ${isEmpty && required ? 'var(--color-danger-light)' : 'var(--color-border)'}`,
                borderLeft: `4px solid ${colorIndicator}`,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <div>
                        <label className="form-label" style={{ marginBottom: 2 }}>
                            {label} Event {required && <span className="form-label-required">*</span>}
                        </label>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{hint}</div>
                    </div>
                    {isEmpty && required && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={12} /> Required
                        </span>
                    )}
                </div>
                {conditions.map((cond, idx) => (
                    <div key={cond.id} className="condition-row">
                        {idx > 0 && (
                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', width: 30, textAlign: 'center', background: 'var(--color-primary-50)', borderRadius: 4, padding: '2px 0' }}>
                                AND
                            </span>
                        )}
                        <Select
                            className="form-select"
                            value={cond.field}
                            onChange={(e) => updateCondition(eventType, cond.id, 'field', e.target.value)}
                        >
                            {EVENT_FIELDS.map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </Select>
                        <Select
                            className="form-select"
                            style={{ maxWidth: 90 }}
                            value={cond.operator}
                            onChange={(e) => updateCondition(eventType, cond.id, 'operator', e.target.value)}
                        >
                            <option value="=">equals</option>
                            <option value="!=">≠ not</option>
                            <option value="contains">contains</option>
                        </Select>
                        <Select
                            className="form-select"
                            value={cond.value}
                            style={{ borderColor: !cond.value ? 'var(--color-danger)' : undefined }}
                            onChange={(e) => updateCondition(eventType, cond.id, 'value', e.target.value)}
                        >
                            <option value="">Select value...</option>
                            {(EVENT_FIELD_VALUES[cond.field] || []).map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </Select>
                        <button
                            className="condition-remove"
                            onClick={() => removeCondition(eventType, cond.id)}
                            title="Remove condition"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 'var(--space-2)' }}
                    onClick={() => addCondition(eventType)}
                >
                    <Plus size={14} /> Add Condition
                </button>
                {conditions.length > 0 && conditions.every(c => c.value) && (
                    <div className="condition-preview" style={{ marginTop: 'var(--space-2)' }}>
                        {conditions.map((c, i) => (
                            <span key={c.id}>
                                {i > 0 ? ' AND ' : ''}
                                <strong>{c.field}</strong> {c.operator} <em>{c.value}</em>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const updateThreshold = (level: ThresholdLevel, field: string, value: number | boolean | string) => {
        setPrimaryClock({
            thresholds: primaryClock.thresholds.map((t) =>
                t.level === level ? { ...t, [field]: value } : t
            ),
        });
    };

    // Threshold ordering validation
    const warning = primaryClock.thresholds.find(t => t.level === 'warning');
    const attention = primaryClock.thresholds.find(t => t.level === 'attention');
    const thresholdOrderError = warning && attention && warning.enabled && attention.enabled &&
        warning.offsetUnit === attention.offsetUnit &&
        warning.offsetValue <= attention.offsetValue;

    return (
        <div className="two-col-layout">
            {/* Left: Form */}
            <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                    How should the clock behave?
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
                    Configure the primary compliance clock: duration, pattern, events, and alert thresholds.
                </p>

                {/* Duration + Unit */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Duration <span className="form-label-required">*</span></label>
                        <input
                            type="number"
                            className="form-input"
                            min={1}
                            value={primaryClock.duration}
                            onChange={(e) => setPrimaryClock({ duration: parseInt(e.target.value) || 0 })}
                            style={{ borderColor: primaryClock.duration <= 0 ? 'var(--color-danger)' : undefined }}
                        />
                        {primaryClock.duration <= 0 && (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>Must be greater than 0</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Unit</label>
                        <Select
                            className="form-select"
                            value={primaryClock.durationUnit}
                            onChange={(e) => setPrimaryClock({ durationUnit: e.target.value as DurationUnit })}
                        >
                            {Object.entries(UNIT_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Pattern */}
                <div className="form-group">
                    <label className="form-label">Pattern <span className="form-label-required">*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {(Object.entries(PATTERN_LABELS) as [ClockPattern, string][]).map(([key, label]) => (
                            <div
                                key={key}
                                onClick={() => setPrimaryClock({ pattern: key })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    border: `1.5px solid ${primaryClock.pattern === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    background: primaryClock.pattern === key ? 'var(--color-primary-50)' : 'var(--color-surface)',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{
                                    width: 16, height: 16, borderRadius: '50%',
                                    border: `2px solid ${primaryClock.pattern === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: primaryClock.pattern === key ? 'var(--color-primary)' : 'transparent',
                                    flexShrink: 0,
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: primaryClock.pattern === key ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                        {PATTERN_DESCRIPTIONS[key]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {primaryClock.pattern === 'flat_hours' && (
                        <div className="callout callout-info" style={{ marginTop: 'var(--space-3)' }}>
                            <Info size={14} className="callout-icon" />
                            <div className="callout-text">
                                Flat Hours clocks run continuously — holiday and weekend exclusions will be disabled. Secondary (pend) clock is also unavailable.
                            </div>
                        </div>
                    )}
                </div>

                {/* Start Mode */}
                <div className="form-group">
                    <label className="form-label">Start Mode</label>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        When the start event fires, does the clock begin the same day or the following day?
                    </p>
                    <div className="radio-pills">
                        {([['same_day', 'Same Day'], ['next_day', 'Next Business Day']] as [StartMode, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                className={`radio-pill ${primaryClock.startMode === key ? 'selected' : ''}`}
                                onClick={() => setPrimaryClock({ startMode: key })}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event Builders */}
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        Clock Events
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            Start & Stop required
                        </span>
                    </h3>
                    {renderConditionBuilder('Start', 'Conditions that trigger the clock to begin counting', 'start', true, '#6366f1')}
                    {renderConditionBuilder('Stop', 'Conditions that freeze or complete the clock', 'stop', true, '#ef4444')}
                    {renderConditionBuilder('Pause', 'Optional: conditions that temporarily pause counting', 'pause', false, '#94a3b8')}
                    {renderConditionBuilder('Resume', 'Optional: conditions that resume a paused clock', 'resume', false, '#10b981')}
                </div>

                {/* Alert Thresholds */}
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                        Alert Thresholds
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
                        Define when to alert reviewers before the deadline. Warning must be larger than Attention.
                    </p>

                    {thresholdOrderError && (
                        <div className="callout callout-error" style={{ marginBottom: 'var(--space-4)' }}>
                            <AlertTriangle size={14} className="callout-icon" />
                            <div className="callout-text">Warning threshold must be greater than Attention threshold (farther from deadline).</div>
                        </div>
                    )}

                    {primaryClock.thresholds.map((threshold) => (
                        <div
                            key={threshold.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                background: threshold.enabled ? 'var(--color-surface)' : 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderLeft: `4px solid ${threshold.enabled ? THRESHOLD_COLORS[threshold.level] : '#cbd5e1'}`,
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-2)',
                                opacity: threshold.enabled ? 1 : 0.6,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <button
                                onClick={() => updateThreshold(threshold.level, 'enabled', !threshold.enabled)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: threshold.enabled ? THRESHOLD_COLORS[threshold.level] : '#94a3b8' }}
                                title={threshold.enabled ? 'Disable this alert' : 'Enable this alert'}
                            >
                                {threshold.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </button>
                            <div style={{
                                width: 10, height: 10,
                                borderRadius: 'var(--radius-full)',
                                background: threshold.enabled ? THRESHOLD_COLORS[threshold.level] : '#cbd5e1',
                            }} />
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, minWidth: 80, textTransform: 'capitalize', color: threshold.enabled ? THRESHOLD_COLORS[threshold.level] : 'var(--color-text-tertiary)' }}>
                                {threshold.level}
                            </span>
                            <input
                                type="number"
                                className="form-input"
                                style={{ width: 80 }}
                                min={0}
                                disabled={!threshold.enabled}
                                value={threshold.offsetValue}
                                onChange={(e) => updateThreshold(threshold.level, 'offsetValue', parseInt(e.target.value) || 0)}
                            />
                            <Select
                                className="form-select"
                                style={{ width: 100 }}
                                disabled={!threshold.enabled}
                                value={threshold.offsetUnit}
                                onChange={(e) => updateThreshold(threshold.level, 'offsetUnit', e.target.value as DurationUnit)}
                            >
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </Select>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                before deadline
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Clock Timeline Preview */}
            <ClockTimelinePreview clock={primaryClock} label="Primary Clock" />
        </div>
    );
}
