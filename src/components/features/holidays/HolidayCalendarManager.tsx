// ============================================================
// Holiday Calendar Manager (SCR-006)
// ============================================================
import { useState } from 'react';
import { Plus, Download, Upload, Trash2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProviderStore, useUIStore } from '../../../stores';
import { Select } from '../../ui/Select';
import type { HolidayType } from '../../../types';
import '../../ui/ui.css';

const CALENDAR_TABS: { label: string; value: HolidayType }[] = [
    { label: 'Client', value: 'client' },
    { label: 'Provider', value: 'provider' },
    { label: 'Custom', value: 'custom' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HolidayCalendarManager() {
    const { holidayCalendars, addHoliday, deleteHoliday } = useProviderStore();
    const { addToast } = useUIStore();
    const [activeTab, setActiveTab] = useState<HolidayType>('client');
    const [year, setYear] = useState(2025);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '', category: 'federal' as HolidayType });

    const calendar = holidayCalendars.find(c => c.type === activeTab && c.year === year);
    const holidays = calendar?.holidays || [];

    const handleAddHoliday = () => {
        if (newHoliday.name && newHoliday.date) {
            addHoliday(activeTab, year, { name: newHoliday.name, date: newHoliday.date, category: newHoliday.category });
            addToast(`Holiday "${newHoliday.name}" added.`, 'success');
            setShowAddModal(false);
            setNewHoliday({ name: '', date: '', category: 'federal' });
        }
    };

    const getMonthHolidays = (monthIdx: number) => {
        return holidays.filter((h) => new Date(h.date).getMonth() === monthIdx);
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Holiday Calendars</h1>
                    <p className="page-subtitle">Manage holidays for clock exclusion calculations</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary">
                        <Upload size={14} /> Import CSV
                    </button>
                    <button className="btn btn-secondary">
                        <Download size={14} /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add Holiday
                    </button>
                </div>
            </div>

            {/* Calendar Type Tabs */}
            <div className="radio-pills" style={{ marginBottom: 'var(--space-6)' }}>
                {CALENDAR_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        className={`radio-pill ${activeTab === tab.value ? 'selected' : ''}`}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Year Navigation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
            }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setYear(year - 1)}>
                    <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    {year}
                </span>
                <button className="btn btn-ghost btn-icon" onClick={() => setYear(year + 1)}>
                    <ChevronRight size={18} />
                </button>
                <span style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-tertiary)',
                    padding: '2px 10px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-full)',
                }}>
                    {holidays.length} holidays
                </span>
            </div>

            {/* Month Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--space-4)',
            }}>
                {MONTHS.map((month, idx) => {
                    const monthHolidays = getMonthHolidays(idx);
                    return (
                        <div key={month} className="card" style={{ minHeight: 120 }}>
                            <div className="card-header" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{month}</span>
                                {monthHolidays.length > 0 && (
                                    <span style={{
                                        background: 'var(--color-primary-50)',
                                        color: 'var(--color-primary)',
                                        padding: '1px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 600,
                                    }}>
                                        {monthHolidays.length}
                                    </span>
                                )}
                            </div>
                            <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                                {monthHolidays.length === 0 ? (
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                                        No holidays
                                    </div>
                                ) : (
                                    monthHolidays.map((h) => (
                                        <div
                                            key={h.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '4px 0',
                                                borderBottom: '1px solid var(--color-border-light)',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                                                    {new Date(h.date + 'T00:00:00').getDate()} - {h.name}
                                                </div>
                                            </div>
                                            <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => deleteHoliday(activeTab, year, h.id)}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Holiday List Table */}
            <div style={{ marginTop: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                    All Holidays ({year})
                </h3>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holidays.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--space-8)' }}>
                                        No holidays configured for {year}
                                    </td>
                                </tr>
                            ) : (
                                holidays.map((h) => (
                                    <tr key={h.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                                            {new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{h.name}</td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 500,
                                                background: 'var(--color-bg-secondary)',
                                                textTransform: 'capitalize',
                                            }}>
                                                {h.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${h.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                                <span className="badge-dot" />
                                                {h.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" onClick={() => deleteHoliday(activeTab, year, h.id)}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Holiday Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Holiday</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Date <span className="form-label-required">*</span></label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={newHoliday.date}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Holiday Name <span className="form-label-required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Independence Day"
                                    value={newHoliday.name}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <Select
                                    className="form-select"
                                    value={newHoliday.category}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, category: e.target.value as HolidayType })}
                                >
                                    <option value="federal">Federal Holiday</option>
                                    <option value="client">Client Holiday</option>
                                    <option value="provider">Provider Holiday</option>
                                    <option value="custom">Custom</option>
                                </Select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddHoliday}>
                                <Calendar size={14} /> Add Holiday
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
