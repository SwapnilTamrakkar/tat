// ============================================================
// Rule Builder — 4-Step Wizard (SCR-002…SCR-005)
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, Save, Zap, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useWizardStore, useRuleStore, useUIStore, useTenantStore } from '../../../stores';
import { WIZARD_STEPS } from '../../../constants';
import Step1MatchingCriteria from './Step1MatchingCriteria';
import Step2PrimaryClock from './Step2PrimaryClock';
import Step3SecondaryClock from './Step3SecondaryClock';
import Step4Review from './Step4Review';
import '../../ui/ui.css';

function validateStep(wizard: ReturnType<typeof useWizardStore.getState>, step: number): string[] {
    const errors: string[] = [];
    if (step === 1) {
        if (!wizard.ruleName.trim()) errors.push('Rule name is required.');
        if (wizard.matchCriteria.serviceTypes.length === 0) errors.push('At least one Service Type must be selected.');
        if (wizard.matchCriteria.requestTypes.length === 0) errors.push('At least one Request Type must be selected.');
    }
    if (step === 2) {
        if (!wizard.primaryClock.duration || wizard.primaryClock.duration <= 0)
            errors.push('Primary clock duration must be greater than 0.');
        if (wizard.primaryClock.startEvent.conditions.length === 0)
            errors.push('Primary clock Start event requires at least one condition.');
        if (wizard.primaryClock.stopEvent.conditions.length === 0)
            errors.push('Primary clock Stop event requires at least one condition.');
        // Check thresholds ordering: warning > attention
        const thresholds = wizard.primaryClock.thresholds;
        const warning = thresholds.find(t => t.level === 'warning');
        const attention = thresholds.find(t => t.level === 'attention');
        if (warning && attention && warning.enabled && attention.enabled &&
            warning.offsetUnit === attention.offsetUnit &&
            warning.offsetValue <= attention.offsetValue) {
            errors.push('Warning threshold must be greater than Attention threshold.');
        }
    }
    return errors;
}

export default function RuleBuilderWizard() {
    const { ruleId } = useParams();
    const navigate = useNavigate();
    const wizard = useWizardStore();
    const { addRule, updateRule, getRule } = useRuleStore();
    const { addToast } = useUIStore();
    const { addAuditEntry } = useTenantStore();

    const [stepErrors, setStepErrors] = useState<string[]>([]);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [effectiveFrom, setEffectiveFrom] = useState('');
    const [effectiveTo, setEffectiveTo] = useState('');

    useEffect(() => {
        if (ruleId) {
            const rule = getRule(ruleId);
            if (rule) {
                wizard.loadRule(rule);
                setEffectiveFrom(rule.effectiveFrom || '');
                setEffectiveTo(rule.effectiveTo || '');
            }
        } else {
            wizard.resetWizard();
            setEffectiveFrom('');
            setEffectiveTo('');
        }
        setStepErrors([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ruleId]);

    const handleNext = () => {
        const errors = validateStep(useWizardStore.getState(), wizard.currentStep);
        if (errors.length > 0) {
            setStepErrors(errors);
            return;
        }
        setStepErrors([]);
        if (wizard.currentStep < 4) {
            wizard.setStep((wizard.currentStep + 1) as 1 | 2 | 3 | 4);
        }
    };

    const handleBack = () => {
        setStepErrors([]);
        if (wizard.currentStep > 1) {
            wizard.setStep((wizard.currentStep - 1) as 1 | 2 | 3 | 4);
        }
    };

    const handleSaveDraft = () => {
        if (!wizard.ruleName.trim()) {
            addToast('Please enter a rule name before saving.', 'error');
            return;
        }
        const ruleData = { ...wizard.buildRule(), effectiveFrom: effectiveFrom || null, effectiveTo: effectiveTo || null };
        if (wizard.editingRuleId) {
            updateRule(wizard.editingRuleId, ruleData);
            addAuditEntry({
                userId: 'user-1', userName: 'Config Analyst',
                tenantId: 'tenant-1', actionType: 'updated',
                entityType: 'rule', entityName: wizard.ruleName,
                entityId: wizard.editingRuleId, changeSummary: `Rule "${wizard.ruleName}" updated and saved as draft.`,
            });
            addToast(`"${wizard.ruleName}" saved as draft.`, 'success');
        } else {
            const newRule = { ...ruleData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            addRule(newRule);
            addAuditEntry({
                userId: 'user-1', userName: 'Config Analyst',
                tenantId: 'tenant-1', actionType: 'created',
                entityType: 'rule', entityName: wizard.ruleName,
                entityId: newRule.id, changeSummary: `New rule "${wizard.ruleName}" created as draft.`,
            });
            addToast(`"${wizard.ruleName}" created as draft.`, 'success');
        }
        navigate('/');
    };

    const handleConfirmActivate = () => {
        const ruleData = { ...wizard.buildRule(), effectiveFrom: effectiveFrom || null, effectiveTo: effectiveTo || null, status: 'active' as const };
        let ruleId_: string;
        if (wizard.editingRuleId) {
            ruleId_ = wizard.editingRuleId;
            updateRule(wizard.editingRuleId, ruleData);
        } else {
            const newRule = { ...ruleData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            ruleId_ = newRule.id;
            addRule(newRule);
        }
        addAuditEntry({
            userId: 'user-1', userName: 'Config Analyst',
            tenantId: 'tenant-1', actionType: 'activated',
            entityType: 'rule', entityName: wizard.ruleName,
            entityId: ruleId_, changeSummary: `Rule "${wizard.ruleName}" created and activated with ${wizard.primaryClock.duration} ${wizard.primaryClock.durationUnit} primary clock.`,
        });
        addToast(`"${wizard.ruleName}" is now Active!`, 'success');
        setShowActivateModal(false);
        navigate('/');
    };

    const handleClickActivate = () => {
        const allErrors = [
            ...validateStep(useWizardStore.getState(), 1),
            ...validateStep(useWizardStore.getState(), 2),
        ];
        if (allErrors.length > 0) {
            setStepErrors(allErrors);
            wizard.setStep(1);
            addToast('Please fix validation errors before activating.', 'error');
            return;
        }
        setShowActivateModal(true);
    };

    const getStepStatus = (stepNum: number) => {
        if (stepNum < wizard.currentStep) return 'completed';
        if (stepNum === wizard.currentStep) return 'active';
        return 'pending';
    };

    const renderStep = () => {
        switch (wizard.currentStep) {
            case 1: return <Step1MatchingCriteria effectiveFrom={effectiveFrom} effectiveTo={effectiveTo} onEffectiveDatesChange={(from, to) => { setEffectiveFrom(from); setEffectiveTo(to); }} />;
            case 2: return <Step2PrimaryClock />;
            case 3: return <Step3SecondaryClock />;
            case 4: return <Step4Review effectiveFrom={effectiveFrom} effectiveTo={effectiveTo} />;
            default: return null;
        }
    };

    return (
        <div>
            {/* Activation Confirmation Modal */}
            {showActivateModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-8)', maxWidth: 480, width: '90%',
                        boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.2s ease-out',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Zap size={24} style={{ color: 'var(--color-success)' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                                    Activate Rule?
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    <strong>"{wizard.ruleName}"</strong> will become active immediately and begin matching incoming cases.
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <div>
                                    <div style={{ color: 'var(--color-text-tertiary)', marginBottom: 2, fontSize: 'var(--font-size-xs)' }}>CASE TYPE</div>
                                    <div style={{ fontWeight: 600 }}>{wizard.matchCriteria.caseType}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-tertiary)', marginBottom: 2, fontSize: 'var(--font-size-xs)' }}>PRIMARY TAT</div>
                                    <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{wizard.primaryClock.duration} {wizard.primaryClock.durationUnit}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-tertiary)', marginBottom: 2, fontSize: 'var(--font-size-xs)' }}>REQUEST TYPES</div>
                                    <div style={{ fontWeight: 600 }}>{wizard.matchCriteria.requestTypes.join(', ') || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-text-tertiary)', marginBottom: 2, fontSize: 'var(--font-size-xs)' }}>SECONDARY CLOCK</div>
                                    <div style={{ fontWeight: 600 }}>{wizard.secondaryClockEnabled ? `${wizard.secondaryClock.duration} ${wizard.secondaryClock.durationUnit}` : 'None'}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: '#fffbeb', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-xs)', color: '#92400e' }}>
                            <AlertTriangle size={14} />
                            Once activated, this rule will immediately be applied to new prior authorization cases. Existing in-flight cases are not affected.
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowActivateModal(false)}>
                                <X size={14} /> Cancel
                            </button>
                            <button className="btn btn-success btn-lg" onClick={handleConfirmActivate}>
                                <CheckCircle2 size={16} /> Confirm & Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stepper Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')} title="Back to Rule Library">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                        {wizard.editingRuleId ? `Edit: ${wizard.ruleName || 'Rule'}` : 'Create New Rule'}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Step {wizard.currentStep} of 4 — {WIZARD_STEPS[wizard.currentStep - 1].description}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="stepper">
                {WIZARD_STEPS.map((step, index) => (
                    <div key={step.step} style={{ display: 'flex', alignItems: 'center', flex: index < WIZARD_STEPS.length - 1 ? 1 : 'unset' }}>
                        <div
                            className={`stepper-step ${getStepStatus(step.step)}`}
                            onClick={() => {
                                if (step.step <= wizard.currentStep) { setStepErrors([]); wizard.setStep(step.step); }
                            }}
                            style={{ cursor: step.step <= wizard.currentStep ? 'pointer' : 'default' }}
                        >
                            <div className="stepper-number">
                                {getStepStatus(step.step) === 'completed' ? <Check size={16} /> : step.step}
                            </div>
                            <div className="stepper-info">
                                <span className="stepper-label">{step.label}</span>
                                <span className="stepper-desc">{step.description}</span>
                            </div>
                        </div>
                        {index < WIZARD_STEPS.length - 1 && (
                            <div className={`stepper-connector ${getStepStatus(step.step) === 'completed' ? 'completed' : ''}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Validation Errors Banner */}
            {stepErrors.length > 0 && (
                <div className="callout callout-error" style={{ marginBottom: 'var(--space-4)', animation: 'fadeIn 0.2s ease-out' }}>
                    <AlertTriangle size={16} className="callout-icon" />
                    <div className="callout-content">
                        <div className="callout-title">Please fix the following before continuing:</div>
                        <ul style={{ margin: 'var(--space-2) 0 0 var(--space-4)', padding: 0 }}>
                            {stepErrors.map((e, i) => <li key={i} style={{ fontSize: 'var(--font-size-sm)' }}>{e}</li>)}
                        </ul>
                    </div>
                    <button className="callout-close" onClick={() => setStepErrors([])}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Step Content */}
            <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                {renderStep()}
            </div>

            {/* Wizard Footer */}
            <div className="wizard-footer">
                <div className="wizard-footer-left">
                    {wizard.currentStep > 1 ? (
                        <button className="btn btn-secondary" onClick={handleBack}>
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : (
                        <button className="btn btn-ghost" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                    )}
                </div>
                <div className="wizard-footer-right">
                    <button className="btn btn-secondary" onClick={handleSaveDraft}>
                        <Save size={16} /> Save as Draft
                    </button>
                    {wizard.currentStep < 4 ? (
                        <button className="btn btn-primary" onClick={handleNext}>
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button className="btn btn-success btn-lg" onClick={handleClickActivate}>
                            <Zap size={16} /> Activate Rule
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
