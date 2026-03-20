// ============================================================
// Step 1 — Matching Criteria (SCR-002) 
// ============================================================
import { useState, useRef, useEffect, useMemo } from 'react';
import { AlertTriangle, X, ChevronDown, Search, Calendar, Info } from 'lucide-react';
import { useWizardStore, useRuleStore } from '../../../stores';
import { IP_SERVICE_TYPES, OP_SERVICE_TYPES, REQUEST_TYPES } from '../../../types';
import type { CaseType, RequestType } from '../../../types';
import '../../ui/ui.css';

interface Props {
    effectiveFrom?: string;
    effectiveTo?: string;
    onEffectiveDatesChange?: (from: string, to: string) => void;
}

export default function Step1MatchingCriteria({ effectiveFrom = '', effectiveTo = '', onEffectiveDatesChange }: Props) {
    const { ruleName, setRuleName, matchCriteria, setMatchCriteria, editingRuleId } = useWizardStore();
    const { rules } = useRuleStore();
    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');
    const [nameTouched, setNameTouched] = useState(false);
    const [autoSuggested, setAutoSuggested] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const availableServiceTypes = useMemo(() => {
        if (matchCriteria.caseType === 'IP') return [...IP_SERVICE_TYPES];
        if (matchCriteria.caseType === 'OP') return [...OP_SERVICE_TYPES];
        return [...IP_SERVICE_TYPES, ...OP_SERVICE_TYPES];
    }, [matchCriteria.caseType]);

    const filteredServiceTypes = useMemo(() => {
        return availableServiceTypes.filter((st) =>
            st.toLowerCase().includes(serviceSearch.toLowerCase())
        );
    }, [availableServiceTypes, serviceSearch]);

    // Conflict detection
    const conflicts = useMemo(() => {
        return rules.filter((r) => {
            if (r.id === editingRuleId) return false;
            if (r.status !== 'active') return false;
            if (matchCriteria.serviceTypes.length === 0 || matchCriteria.requestTypes.length === 0) return false;
            const caseMatch = matchCriteria.caseType === 'Both' || r.matchCriteria.caseType === 'Both' || matchCriteria.caseType === r.matchCriteria.caseType;
            const serviceOverlap = matchCriteria.serviceTypes.some((st) => r.matchCriteria.serviceTypes.includes(st));
            const requestOverlap = matchCriteria.requestTypes.some((rt) => r.matchCriteria.requestTypes.includes(rt));
            return caseMatch && serviceOverlap && requestOverlap;
        });
    }, [rules, matchCriteria, editingRuleId]);

    // Auto-suggest rule name (only if user hasn't typed their own yet)
    useEffect(() => {
        if (!editingRuleId && matchCriteria.serviceTypes.length > 0 && matchCriteria.requestTypes.length > 0 && (!nameTouched || autoSuggested)) {
            const caseLabel = matchCriteria.caseType;
            const reqLabel = matchCriteria.requestTypes.length === 1
                ? matchCriteria.requestTypes[0]
                : `${matchCriteria.requestTypes.length} Types`;
            const svcLabel = matchCriteria.serviceTypes.length <= 2
                ? matchCriteria.serviceTypes.join(', ')
                : `${matchCriteria.serviceTypes.length} Services`;
            const suggested = `${caseLabel} ${reqLabel} — ${svcLabel}`;
            setRuleName(suggested);
            setAutoSuggested(true);
        }
    }, [matchCriteria, editingRuleId, nameTouched, autoSuggested, setRuleName]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setServiceDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleServiceType = (st: string) => {
        const current = matchCriteria.serviceTypes;
        if (current.includes(st)) {
            setMatchCriteria({ serviceTypes: current.filter((s) => s !== st) });
        } else {
            setMatchCriteria({ serviceTypes: [...current, st] });
        }
    };

    const toggleRequestType = (rt: RequestType) => {
        const current = matchCriteria.requestTypes;
        if (current.includes(rt)) {
            setMatchCriteria({ requestTypes: current.filter((r) => r !== rt) });
        } else {
            setMatchCriteria({ requestTypes: [...current, rt] });
        }
    };

    const requestTypeDescriptions: Record<string, string> = {
        'Admission': 'Standard inpatient admission review',
        'Prior Auth': 'Pre-authorization before service',
        'Retrospective': 'Review after service rendered',
        'Reconsideration': 'Appeal of prior decision',
        'Expedited': 'Urgent 72-hour review required',
    };

    return (
        <div style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                When does this rule apply?
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
                Define the matching criteria that determine which cases trigger this clock rule.
            </p>

            {/* Rule Name */}
            <div className="form-group">
                <label className="form-label">
                    Rule Name <span className="form-label-required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., IP Standard — Inpatient Admission"
                        value={ruleName}
                        onChange={(e) => { setRuleName(e.target.value); setNameTouched(true); setAutoSuggested(false); }}
                        maxLength={100}
                        style={{ borderColor: !ruleName.trim() && nameTouched ? 'var(--color-danger)' : undefined }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="form-helper" style={{ color: autoSuggested && !nameTouched ? 'var(--color-primary)' : undefined }}>
                        {autoSuggested && !nameTouched ? '✨ Auto-suggested from your selections' : `${ruleName.length}/100 characters`}
                    </span>
                    {!ruleName.trim() && nameTouched && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>Required</span>
                    )}
                </div>
            </div>

            {/* Case Type */}
            <div className="form-group">
                <label className="form-label">
                    Case Type <span className="form-label-required">*</span>
                </label>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                    The category of the prior authorization case this rule will match.
                </p>
                <div className="radio-pills">
                    {(['IP', 'OP', 'Both'] as CaseType[]).map((ct) => (
                        <button
                            key={ct}
                            className={`radio-pill ${matchCriteria.caseType === ct ? 'selected' : ''}`}
                            onClick={() => {
                                setMatchCriteria({ caseType: ct, serviceTypes: [] });
                            }}
                        >
                            {ct === 'IP' ? '🏥 Inpatient (IP)' : ct === 'OP' ? '🏢 Outpatient (OP)' : '🔄 Both'}
                        </button>
                    ))}
                </div>
                {matchCriteria.caseType === 'Both' && (
                    <div className="callout callout-info" style={{ marginTop: 'var(--space-2)' }}>
                        <Info size={14} className="callout-icon" />
                        <div className="callout-text">
                            "Both" matches all cases regardless of type. Use sparingly to avoid broad conflicts.
                        </div>
                    </div>
                )}
            </div>

            {/* Service Types — Multi-select */}
            <div className="form-group">
                <label className="form-label">
                    Service Type(s) <span className="form-label-required">*</span>
                </label>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                    Select all service types this rule applies to. You can search within the list.
                </p>
                <div className="multi-select-container" ref={dropdownRef}>
                    <div
                        className="multi-select-trigger"
                        onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                        style={{ borderColor: matchCriteria.serviceTypes.length === 0 ? undefined : 'var(--color-primary)' }}
                    >
                        <div className="multi-select-tags">
                            {matchCriteria.serviceTypes.length === 0 ? (
                                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                    Select service types...
                                </span>
                            ) : (
                                matchCriteria.serviceTypes.slice(0, 3).map((st) => (
                                    <span key={st} className="multi-select-tag">
                                        {st}
                                        <button
                                            className="multi-select-tag-remove"
                                            onClick={(e) => { e.stopPropagation(); toggleServiceType(st); }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))
                            )}
                            {matchCriteria.serviceTypes.length > 3 && (
                                <span className="multi-select-tag">
                                    +{matchCriteria.serviceTypes.length - 3} more
                                </span>
                            )}
                        </div>
                        <ChevronDown size={16} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, transition: 'transform 0.2s', transform: serviceDropdownOpen ? 'rotate(180deg)' : undefined }} />
                    </div>

                    {serviceDropdownOpen && (
                        <div className="multi-select-dropdown">
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-tertiary)' }} />
                                <input
                                    type="text"
                                    className="multi-select-search"
                                    style={{ paddingLeft: 32 }}
                                    placeholder="Search service types..."
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="multi-select-actions">
                                <button className="multi-select-action" onClick={() => setMatchCriteria({ serviceTypes: [...availableServiceTypes] })}>
                                    Select All ({availableServiceTypes.length})
                                </button>
                                <button className="multi-select-action" onClick={() => setMatchCriteria({ serviceTypes: [] })}>
                                    Clear All
                                </button>
                            </div>
                            {filteredServiceTypes.length === 0 ? (
                                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                    No service types match "{serviceSearch}"
                                </div>
                            ) : (
                                filteredServiceTypes.map((st) => (
                                    <div
                                        key={st}
                                        className={`multi-select-option ${matchCriteria.serviceTypes.includes(st) ? 'selected' : ''}`}
                                        onClick={() => toggleServiceType(st)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={matchCriteria.serviceTypes.includes(st)}
                                            onChange={() => { }}
                                            style={{ accentColor: 'var(--color-primary)' }}
                                        />
                                        {st}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                {matchCriteria.serviceTypes.length > 0 && (
                    <span className="form-helper">{matchCriteria.serviceTypes.length} of {availableServiceTypes.length} selected</span>
                )}
            </div>

            {/* Request Types — Chip Group with descriptions */}
            <div className="form-group">
                <label className="form-label">
                    Request Type(s) <span className="form-label-required">*</span>
                </label>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                    Select the types of authorization requests this rule handles.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {REQUEST_TYPES.map((rt) => {
                        const selected = matchCriteria.requestTypes.includes(rt);
                        return (
                            <div
                                key={rt}
                                onClick={() => toggleRequestType(rt)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    background: selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                    transition: 'all 0.15s ease',
                                    userSelect: 'none',
                                }}
                            >
                                <div style={{
                                    width: 18, height: 18,
                                    borderRadius: 'var(--radius-sm)',
                                    border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: selected ? 'var(--color-primary)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    transition: 'all 0.15s ease',
                                }}>
                                    {selected && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✓</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: selected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                                        {rt}
                                        {rt === 'Expedited' && (
                                            <span style={{ marginLeft: 8, fontSize: 'var(--font-size-xs)', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                                                72h Flat Hours
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                        {requestTypeDescriptions[rt]}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Effective Dates */}
            <div className="form-group" style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Calendar size={14} /> Effective Dates <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(optional)</span>
                </label>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    Leave blank for the rule to be effective indefinitely.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
                            Effective From
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={effectiveFrom}
                            onChange={(e) => onEffectiveDatesChange?.(e.target.value, effectiveTo)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
                            Effective To
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={effectiveTo}
                            min={effectiveFrom}
                            onChange={(e) => onEffectiveDatesChange?.(effectiveFrom, e.target.value)}
                        />
                    </div>
                </div>
                {effectiveFrom && effectiveTo && new Date(effectiveTo) < new Date(effectiveFrom) && (
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', display: 'flex', gap: 4, alignItems: 'center' }}>
                        <AlertTriangle size={12} /> Effective To cannot be before Effective From.
                    </div>
                )}
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
                <div className="callout callout-warning" style={{ marginTop: 'var(--space-6)' }}>
                    <AlertTriangle size={16} className="callout-icon" />
                    <div className="callout-content">
                        <div className="callout-title">⚡ Overlap Detected with Active Rule(s)</div>
                        <div className="callout-text">
                            This rule's criteria overlap with:{' '}
                            {conflicts.map((c, i) => (
                                <span key={c.id}>
                                    <strong>{c.ruleName}</strong>
                                    {i < conflicts.length - 1 ? ', ' : ''}
                                </span>
                            ))}.
                            {' '}Cases matching both rules may produce unexpected results. Review before activating.
                        </div>
                    </div>
                </div>
            )}

            {/* Live Rule Preview */}
            {(matchCriteria.serviceTypes.length > 0 || matchCriteria.requestTypes.length > 0) && (
                <div
                    className="condition-preview"
                    style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}
                >
                    <strong>Rule applies when:</strong> Case Type is{' '}
                    <strong>{matchCriteria.caseType === 'IP' ? 'Inpatient' : matchCriteria.caseType === 'OP' ? 'Outpatient' : 'Both'}</strong>
                    {matchCriteria.serviceTypes.length > 0 && (
                        <> AND Service Type is <strong>{matchCriteria.serviceTypes.length <= 2 ? matchCriteria.serviceTypes.join(' or ') : `one of ${matchCriteria.serviceTypes.length} types`}</strong></>
                    )}
                    {matchCriteria.requestTypes.length > 0 && (
                        <> AND Request Type is <strong>{matchCriteria.requestTypes.join(' or ')}</strong></>
                    )}
                </div>
            )}
        </div>
    );
}
