import { useState } from 'react';
import { useTenantStore, useUIStore } from '../../../stores';
import { Search, Plus, Building2, CheckCircle2, Trash2 } from 'lucide-react';
import '../../ui/ui.css';

export default function TenantRegistry() {
    const { tenants } = useTenantStore();
    const { addToast } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeactivate = (_id: string) => {
        addToast('Tenant deactivated. All active rules moved to draft.', 'warning');
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Tenant Registry</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Manage organizations and their standalone configurations.</p>
                </div>
                <button className="btn btn-primary" onClick={() => addToast('Not implemented in prototype', 'info')}>
                    <Plus size={16} /> Register Tenant
                </button>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)', padding: '16px 24px' }}>
                    <div className="search-bar" style={{ width: 300 }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tenants..."
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
                            {filteredTenants.length > 0 ? (
                                filteredTenants.map((t) => (
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
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDeactivate(t.id)}>
                                                <Trash2 size={14} /> Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        No tenants found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
