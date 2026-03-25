import { useState } from 'react';
import { useProviderStore, useUIStore, useRuleStore } from '../../../stores';
import { Search, Plus, Building2, CheckCircle2, Trash2, X } from 'lucide-react';
import { Select } from '../../ui/Select';
import '../../ui/ui.css';

export default function ProviderRegistry() {
    const { providers, updateProviderStatus, addProvider, addAuditEntry } = useProviderStore();
    const { addToast } = useUIStore();
    const { deactivateRulesForProvider } = useRuleStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: '', code: '', timezone: 'America/New_York', effectiveStartDate: new Date().toISOString().split('T')[0] });

    const filteredProviders = providers.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeactivate = (id: string, currentStatus: 'active' | 'inactive') => {
        if (currentStatus === 'active') {
            if (window.confirm('Deactivating this provider will move all of their active rules to Drafting status. Continue?')) {
                updateProviderStatus(id, 'inactive');
                deactivateRulesForProvider(id);
                addToast('Provider deactivated. Active rules moved to draft.', 'warning');
                addAuditEntry({
                    userId: 'u-1', userName: 'Super Admin',
                    providerId: id, actionType: 'deactivated',
                    entityType: 'provider', entityName: 'Provider Deactivation', entityId: id,
                    changeSummary: 'Deactivated provider and cascaded rules to draft.'
                });
            }
        } else {
            updateProviderStatus(id, 'active');
            addToast('Provider reactivated.', 'success');
        }
    };

    const handleAddProvider = () => {
        if (!newProvider.name || !newProvider.code) return;
        
        const isDuplicate = providers.some(p => p.code.toUpperCase() === newProvider.code.toUpperCase() || p.name.toLowerCase() === newProvider.name.toLowerCase());
        if (isDuplicate) {
             addToast('A provider with this Name or Code already exists.', 'error');
             return;
        }

        addProvider({ 
            name: newProvider.name, 
            code: newProvider.code.toUpperCase(), 
            timezone: newProvider.timezone,
            effectiveStartDate: newProvider.effectiveStartDate
        });
        
        addToast(`Provider ${newProvider.name} registered.`, 'success');
        setShowAddModal(false);
        setNewProvider({ name: '', code: '', timezone: 'America/New_York', effectiveStartDate: new Date().toISOString().split('T')[0] });
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Provider Registry</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Manage organizations and their standalone configurations.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Register Provider
                </button>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)', padding: '16px 24px' }}>
                    <div style={{ width: 300, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-tertiary)' }} />
                        <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '36px' }}
                            placeholder="Search providers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Timezone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProviders.length > 0 ? (
                                filteredProviders.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                                                {t.name}
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{t.code}</td>
                                        <td>{t.timezone}</td>
                                        <td>
                                            {t.status === 'active' ? (
                                                <span className="badge badge-success"><CheckCircle2 size={12} /> Active</span>
                                            ) : (
                                                <span className="badge badge-error">Inactive</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDeactivate(t.id, t.status)}>
                                                {t.status === 'active' ? <><Trash2 size={14} /> Deactivate</> : 'Reactivate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        No providers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Provider Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Register New Provider</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Provider Name <span className="form-label-required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Acme Healthcare"
                                    value={newProvider.name}
                                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Provider Code <span className="form-label-required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., ACME"
                                    value={newProvider.code}
                                    style={{ textTransform: 'uppercase' }}
                                    onChange={(e) => setNewProvider({ ...newProvider, code: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Timezone</label>
                                <Select
                                    className="form-select"
                                    value={newProvider.timezone}
                                    onChange={(e) => setNewProvider({ ...newProvider, timezone: e.target.value })}
                                >
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Effective Start Date <span className="form-label-required">*</span></label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newProvider.effectiveStartDate}
                                    onChange={(e) => setNewProvider({ ...newProvider, effectiveStartDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddProvider} disabled={!newProvider.name || !newProvider.code}>
                                <Plus size={14} /> Register
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
