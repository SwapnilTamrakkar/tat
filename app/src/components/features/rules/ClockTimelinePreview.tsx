// ============================================================
// Clock Timeline SVG Preview
// ============================================================
import type { ClockConfig } from '../../../types';
import { THRESHOLD_COLORS, UNIT_LABELS, PATTERN_LABELS } from '../../../constants';
import '../../ui/ui.css';

interface Props {
    clock: ClockConfig;
    label: string;
}

export default function ClockTimelinePreview({ clock, label }: Props) {
    const totalDuration = clock.duration;
    const unit = UNIT_LABELS[clock.durationUnit];
    const hasThresholds = clock.thresholds.filter((t) => t.enabled && t.offsetValue > 0);

    const getPosition = (offset: number) => {
        const pct = ((totalDuration - offset) / totalDuration) * 100;
        return Math.min(Math.max(pct, 0), 100);
    };

    return (
        <div className="timeline-preview">
            <div className="timeline-title">🕐 {label} Preview</div>

            {/* Summary */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: 800,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.03em',
                }}>
                    {totalDuration} <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>{unit}</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {PATTERN_LABELS[clock.pattern]} · {clock.startMode === 'same_day' ? 'Same Day' : 'Next Day'} Start
                </div>
            </div>

            {/* SVG Timeline */}
            <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="xMidYMid meet">
                {/* Background track */}
                <rect x="10" y="30" width="280" height="20" rx="10" fill="#e2e8f0" />

                {/* Progress bar gradient */}
                <defs>
                    <linearGradient id={`gradient-${clock.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
                <rect x="10" y="30" width="280" height="20" rx="10" fill={`url(#gradient-${clock.id})`} opacity="0.3" />

                {/* Start marker */}
                <circle cx="10" cy="40" r="5" fill="#6366f1" />
                <text x="10" y="65" textAnchor="start" fontSize="8" fill="#64748b" fontWeight="600">START</text>

                {/* End marker */}
                <circle cx="290" cy="40" r="5" fill="#ef4444" />
                <text x="290" y="65" textAnchor="end" fontSize="8" fill="#64748b" fontWeight="600">DEADLINE</text>

                {/* Threshold markers */}
                {hasThresholds.map((t) => {
                    const pos = getPosition(t.offsetValue);
                    const x = 10 + (pos / 100) * 280;
                    return (
                        <g key={t.id}>
                            <line x1={x} y1="26" x2={x} y2="54" stroke={THRESHOLD_COLORS[t.level]} strokeWidth="2" strokeDasharray="3,2" />
                            <circle cx={x} cy="40" r="4" fill={THRESHOLD_COLORS[t.level]} />
                            <text x={x} y="20" textAnchor="middle" fontSize="7" fill={THRESHOLD_COLORS[t.level]} fontWeight="600">
                                {t.offsetValue}{t.offsetUnit === 'hours' ? 'h' : 'd'}
                            </text>
                        </g>
                    );
                })}

                {/* Pause indicator */}
                {clock.pauseEvent && clock.pauseEvent.conditions.length > 0 && (
                    <g>
                        <rect x="120" y="30" width="40" height="20" rx="2" fill="#94a3b8" opacity="0.3" />
                        <text x="140" y="18" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="600">PAUSE</text>
                    </g>
                )}
            </svg>

            {/* Event Summary */}
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {clock.startEvent.conditions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                        <strong>Start:</strong>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                            {clock.startEvent.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                        </span>
                    </div>
                )}
                {clock.stopEvent.conditions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                        <strong>Stop:</strong>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                            {clock.stopEvent.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                        </span>
                    </div>
                )}
                {clock.pauseEvent && clock.pauseEvent.conditions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }} />
                        <strong>Pause:</strong>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                            {clock.pauseEvent.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                        </span>
                    </div>
                )}
            </div>

            {/* Exclusion info */}
            <div style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-tertiary)',
            }}>
                {clock.pattern === 'flat_hours'
                    ? '⚡ Flat Hours — runs continuously, exclusions disabled'
                    : '📅 Calendar counting mode — exclusions configurable'
                }
            </div>
        </div>
    );
}
