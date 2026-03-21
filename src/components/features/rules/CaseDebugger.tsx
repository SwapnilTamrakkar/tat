import { useState } from 'react';
import { useRuleStore, useUIStore } from '../../../stores';
import { PATTERN_LABELS, UNIT_LABELS } from '../../../constants';
import type { TATRule } from '../../../types';
import { Search, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Select } from '../../ui/Select';
import '../../ui/ui.css';

export default function CaseDebugger() {
    const { rules } = useRuleStore();
    const { addToast } = useUIStore();
    
    const [caseType, setCaseType] = useState('IP');
    const [serviceType, setServiceType] = useState('');
    const [requestType, setRequestType] = useState('');

    const [results, setResults] = useState<{ match: boolean, rule: TATRule | null, reason: string } | null>(null);

    const activeRules = rules.filter((r: TATRule) => r.status === 'active');

    const handleDebug = () => {
        if (!serviceType || !requestType) {
            addToast('Please enter Service Type and Request Type to debug.', 'warning');
            return;
        }
        
        // Find matching rules
        const matchedRules = activeRules.filter((r: TATRule) => {
            if (r.matchCriteria.caseType !== 'Both' && r.matchCriteria.caseType !== caseType) return false;
            
            // In reality, this would be exactly checking the arrays
            if (r.matchCriteria.serviceTypes.length > 0 && !r.matchCriteria.serviceTypes.some((t: string) => serviceType.toLowerCase().includes(t.toLowerCase()))) return false;
            if (r.matchCriteria.requestTypes.length > 0 && !r.matchCriteria.requestTypes.some((t: string) => requestType.toLowerCase().includes(t.toLowerCase()))) return false;
            
            return true;
        });

        if (matchedRules.length === 0) {
            setResults({ match: false, rule: null, reason: 'No TAT rule matched this case. Consider adding a rule for this criteria combination.' });
        } else if (matchedRules.length > 1) {
            setResults({ match: true, rule: matchedRules[0], reason: `Conflict! Multi-match detected with ${matchedRules.length} rules. Rule "${matchedRules[0].ruleName}" will be chosen by precedence.` });
        } else {
            setResults({ match: true, rule: matchedRules[0], reason: `Exact match found.` });
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Case Debugger</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Test a mock case against active rules to detect compliance gaps and conflicts.</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-header">
                    <h4>Test Scenario Inputs</h4>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label>Case Type</label>
                            <Select className="form-select" value={caseType} onChange={(e) => setCaseType(e.target.value)}>
                                <option value="IP">Inpatient (IP)</option>
                                <option value="OP">Outpatient (OP)</option>
                            </Select>
                        </div>
                        <div className="form-group">
                            <label>Service Type (e.g., Intensive Rehabilitation)</label>
                            <input 
                                className="form-input" 
                                type="text"
                                placeholder="Service Type..."
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Request Type (e.g., Expedited)</label>
                            <input 
                                className="form-input" 
                                type="text"
                                placeholder="Request Type..."
                                value={requestType}
                                onChange={(e) => setRequestType(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleDebug}>
                            <Search size={16} /> Debug Rule Matching
                        </button>
                    </div>
                </div>
            </div>

            {results && (
                <div className="card">
                    <div className="card-header">
                        <h4>Debug Results</h4>
                    </div>
                    <div className="card-body">
                        {results.match && results.rule ? (
                            <div style={{ padding: 'var(--space-4)', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-3)' }}>
                                <CheckCircle size={24} style={{ color: 'var(--color-success-dark)' }} />
                                <div>
                                    <h4 style={{ color: 'var(--color-success-dark)', marginBottom: 'var(--space-1)' }}>Rule Matched: {results.rule.ruleName}</h4>
                                    <p style={{ color: 'var(--color-success-dark)', fontSize: 'var(--font-size-sm)' }}>
                                        {results.reason}
                                    </p>
                                    <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        <strong>TAT Output:</strong> {results.rule.primaryClock.duration} {UNIT_LABELS[results.rule.primaryClock.durationUnit as keyof typeof UNIT_LABELS]} ({PATTERN_LABELS[results.rule.primaryClock.pattern as keyof typeof PATTERN_LABELS]})
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: 'var(--space-4)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-3)' }}>
                                <AlertTriangle size={24} style={{ color: 'var(--color-danger-dark)' }} />
                                <div>
                                    <h4 style={{ color: 'var(--color-danger-dark)', marginBottom: 'var(--space-1)' }}>No Matching Rule Gap</h4>
                                    <p style={{ color: 'var(--color-danger-dark)', fontSize: 'var(--font-size-sm)' }}>
                                        {results.reason}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                <Info size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>This simulates how the rule engine would evaluate an incoming prior authorization case in production based on active rules.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
