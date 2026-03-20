// ============================================================
// Step 3 — Secondary Clock & Exclusions (SCR-004)
// ============================================================
import { ArrowRight, Info, AlertTriangle, Link2, Lock } from 'lucide-react';
import { useWizardStore } from '../../../stores';
import { UNIT_LABELS, THRESHOLD_COLORS } from '../../../constants';
import type { DurationUnit, ThresholdLevel } from '../../../types';
import ClockTimelinePreview from './ClockTimelinePreview';
import '../../ui/ui.css';

export default function Step3SecondaryClock() {
    const {
        primaryClock,
        secondaryClock, setSecondaryClock,
        secondaryClockEnabled, setSecondaryClockEnabled,
        holidayExclusion, setHolidayExclusion,
        weekendExclusion, setWeekendExclusion,
    } = useWizardStore();

    const isFlatHours = primaryClock.pattern === 'flat_hours';

    const handleToggleSecondary = (enabled: boolean) => {
        setSecondaryClockEnabled(enabled);
        if (enabled && primaryClock.pauseEvent && primaryClock.pauseEvent.conditions.length > 0) {
            // Auto-fill secondary start from primary pause
            setSecondaryClock({
                startEvent: { conditions: [...primaryClock.pauseEvent.conditions] },
            });
        }
    };

    const updateThreshold = (level: ThresholdLevel, field: string, value: number | boolean | string) => {
        setSecondaryClock({
            thresholds: secondaryClock.thresholds.map((t) =>
                t.level === level ? { ...t, [field]: value } : t
            ),
        });
    };

    return (
        <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Clock Chaining & Exclusions
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
                Configure a secondary (pend) clock that chains from the primary, and set holiday/weekend exclusion rules.
            </p>

            {/* Secondary Clock Toggle */}
            <div style={{
                padding: 'var(--space-5)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-6)',
            }}>
                <div className="toggle-wrapper" onClick={() => !isFlatHours && handleToggleSecondary(!secondaryClockEnabled)}>
                    <button
                        className={`toggle ${secondaryClockEnabled && !isFlatHours ? 'active' : ''} ${isFlatHours ? 'disabled' : ''}`}
                        disabled={isFlatHours}
                    />
                    <div>
                        <div className="toggle-label" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
                            Enable Secondary (Pend) Clock
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                            Automatically starts when the primary clock is paused
                        </div>
                    </div>
                </div>
                {isFlatHours && (
                    <div className="callout callout-info" style={{ marginTop: 'var(--space-3)' }}>
                        <Info size={14} className="callout-icon" />
                        <div className="callout-text">Expedited (Flat Hours) requests do not use a secondary clock.</div>
                    </div>
                )}
            </div>

            {/* Chain Diagram */}
            {secondaryClockEnabled && !isFlatHours && (
                <>
                    {/* Auto-fill banner */}
                    <div className="callout callout-success" style={{ marginBottom: 'var(--space-4)' }}>
                        <Link2 size={14} className="callout-icon" />
                        <div className="callout-content">
                            <div className="callout-title">Clock Chaining Active</div>
                            <div className="callout-text">
                                Secondary clock start event auto-set from Primary pause event.
                                Editing the handoff event auto-propagates to both clocks.
                            </div>
                        </div>
                    </div>

                    {/* Visual Chain Diagram */}
                    <div className="chain-diagram">
                        <div className="chain-block">
                            <span className="chain-block-label" style={{ color: 'var(--color-primary)' }}>Primary Clock</span>
                            <span className="chain-block-value">{primaryClock.duration} {UNIT_LABELS[primaryClock.durationUnit]}</span>
                        </div>
                        <div className="chain-arrow">
                            <ArrowRight size={16} />
                            <span>Pause</span>
                        </div>
                        <div className="chain-block secondary">
                            <span className="chain-block-label" style={{ color: 'var(--color-info)' }}>Secondary Clock</span>
                            <span className="chain-block-value">{secondaryClock.duration} {UNIT_LABELS[secondaryClock.durationUnit]}</span>
                        </div>
                        <div className="chain-arrow">
                            <ArrowRight size={16} />
                            <span>Resume</span>
                        </div>
                        <div className="chain-block">
                            <span className="chain-block-label" style={{ color: 'var(--color-primary)' }}>Primary Continues</span>
                            <span className="chain-block-value">Remaining time</span>
                        </div>
                    </div>

                    {/* Secondary Clock Config */}
                    <div className="two-col-layout" style={{ marginTop: 'var(--space-6)' }}>
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                                Secondary Clock Configuration
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Duration</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min={1}
                                        value={secondaryClock.duration}
                                        onChange={(e) => setSecondaryClock({ duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Unit</label>
                                    <select
                                        className="form-select"
                                        value={secondaryClock.durationUnit}
                                        onChange={(e) => setSecondaryClock({ durationUnit: e.target.value as DurationUnit })}
                                    >
                                        {Object.entries(UNIT_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Secondary Thresholds */}
                            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                                Alert Thresholds
                            </h4>
                            {secondaryClock.thresholds.map((threshold) => (
                                <div
                                    key={threshold.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderLeft: `4px solid ${THRESHOLD_COLORS[threshold.level]}`,
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-2)',
                                    }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, minWidth: 80, textTransform: 'capitalize' }}>
                                        {threshold.level}
                                    </span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ width: 80 }}
                                        min={0}
                                        value={threshold.offsetValue}
                                        onChange={(e) => updateThreshold(threshold.level, 'offsetValue', parseInt(e.target.value) || 0)}
                                    />
                                    <select
                                        className="form-select"
                                        style={{ width: 100 }}
                                        value={threshold.offsetUnit}
                                        onChange={(e) => updateThreshold(threshold.level, 'offsetUnit', e.target.value)}
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>before deadline</span>
                                </div>
                            ))}
                        </div>

                        <ClockTimelinePreview clock={secondaryClock} label="Secondary Clock" />
                    </div>
                </>
            )}

            {/* Exclusions Panel */}
            <div style={{
                marginTop: 'var(--space-8)',
                padding: 'var(--space-6)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
            }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    Exclusion Settings
                    {isFlatHours && <Lock size={14} style={{ color: 'var(--color-text-tertiary)' }} />}
                </h3>

                {isFlatHours && (
                    <div className="callout callout-warning" style={{ marginBottom: 'var(--space-4)' }}>
                        <AlertTriangle size={14} className="callout-icon" />
                        <div className="callout-text">
                            Flat Hours clocks run continuously and cannot exclude holidays or weekends.
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    <div className="form-group">
                        <label className="form-label">Holiday Exclusion</label>
                        <select
                            className={`form-select ${isFlatHours ? 'disabled' : ''}`}
                            disabled={isFlatHours}
                            value={holidayExclusion}
                            onChange={(e) => setHolidayExclusion(e.target.value as 'none' | 'client' | 'provider' | 'both')}
                        >
                            <option value="none">None — No holidays excluded</option>
                            <option value="client">Client Holidays</option>
                            <option value="provider">Provider Holidays</option>
                            <option value="both">Client + Provider Holidays</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Weekend Exclusion</label>
                        <div className="toggle-wrapper" onClick={() => !isFlatHours && setWeekendExclusion(!weekendExclusion)}>
                            <button
                                className={`toggle ${weekendExclusion && !isFlatHours ? 'active' : ''} ${isFlatHours ? 'disabled' : ''}`}
                                disabled={isFlatHours}
                            />
                            <span className="toggle-label">{weekendExclusion ? 'Skip weekends' : 'Include weekends'}</span>
                        </div>
                    </div>
                </div>

                {/* Plain-English summary */}
                <div className="condition-preview" style={{ marginTop: 'var(--space-4)' }}>
                    Clock runs {primaryClock.duration} {UNIT_LABELS[primaryClock.durationUnit].toLowerCase()}.
                    {' '}Weekends {weekendExclusion && !isFlatHours ? 'ARE' : 'are NOT'} excluded.
                    {' '}Holidays: {isFlatHours ? 'not applicable' : holidayExclusion === 'none' ? 'not excluded' : `${holidayExclusion} holidays excluded`}.
                </div>
            </div>
        </div>
    );
}
