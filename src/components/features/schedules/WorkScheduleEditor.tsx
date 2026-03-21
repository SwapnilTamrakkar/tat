// ============================================================
// Work Schedule Editor
// ============================================================
import { useState, useEffect } from 'react';
import { Save, Clock, Plus, Star } from 'lucide-react';
import { useProviderStore, useUIStore } from '../../../stores';
import { Select } from '../../ui/Select';
import type { DaySlot, WorkSchedule } from '../../../types';
import { DEFAULT_DAY_SLOTS } from '../../../constants';
import '../../ui/ui.css';

export default function WorkScheduleEditor() {
    const { workSchedules, currentProviderId, updateWorkSchedule, addWorkSchedule, setDefaultWorkSchedule } = useProviderStore();
    const { addToast } = useUIStore();
    
    // Filter schedules for current provider
    const providerSchedules = workSchedules.filter(s => s.providerId === currentProviderId);
    
    // Local state for the schedule being edited
    const [schedule, setSchedule] = useState<WorkSchedule | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
        providerSchedules.find(s => s.isDefault)?.id || providerSchedules[0]?.id || ''
    );
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // Sync local state when selected schedule changes
    useEffect(() => {
        if (!isCreatingNew && selectedScheduleId) {
            const match = workSchedules.find(s => s.id === selectedScheduleId);
            if (match) setSchedule({ ...match, daySlots: JSON.parse(JSON.stringify(match.daySlots)) });
        }
    }, [selectedScheduleId, workSchedules, isCreatingNew]);

    const updateSlot = (day: string, field: keyof DaySlot, value: string | boolean) => {
        if (!schedule) return;
        setSchedule({
            ...schedule,
            daySlots: schedule.daySlots.map((slot) => {
                if (slot.day === day) {
                    const newSlot = { ...slot, [field]: value };
                    
                    // Validation: if checking times
                    if (field === 'startTime' || field === 'endTime') {
                        const [sh, sm] = (field === 'startTime' ? value as string : newSlot.startTime).split(':').map(Number);
                        const [eh, em] = (field === 'endTime' ? value as string : newSlot.endTime).split(':').map(Number);
                        if (sh > eh || (sh === eh && sm >= em)) {
                            // If invalid, we could prevent the change, or just show warning. 
                            // For UX, we just let them type but show a warning later.
                            newSlot.endTime = `${String(sh + 1).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
                        }
                    }
                    return newSlot;
                }
                return slot;
            }),
        });
    };

    const totalHours = schedule ? schedule.daySlots
        .filter((s) => s.isWorkingDay)
        .reduce((acc, s) => {
            const [sh, sm] = s.startTime.split(':').map(Number);
            const [eh, em] = s.endTime.split(':').map(Number);
            return acc + (eh + em / 60 - (sh + sm / 60));
        }, 0) : 0;

    const handleSave = () => {
        if (!schedule) return;
        
        if (isCreatingNew) {
            addWorkSchedule({
                providerId: currentProviderId,
                name: schedule.name,
                isDefault: schedule.isDefault,
                daySlots: schedule.daySlots
            });
            setIsCreatingNew(false);
            addToast(`Work schedule "${schedule.name}" created.`, 'success');
            // The effect will re-sync with latest
        } else {
            updateWorkSchedule(schedule.id, {
                name: schedule.name,
                daySlots: schedule.daySlots,
                isDefault: schedule.isDefault
            });
            addToast('Work schedule updated successfully.', 'success');
        }
    };

    const handleSetDefault = () => {
        if (!schedule) return;
        if (isCreatingNew) {
            setSchedule({ ...schedule, isDefault: true });
            addToast('Marked as default. Will apply upon saving.', 'info');
        } else {
            setDefaultWorkSchedule(currentProviderId, schedule.id);
            addToast(`"${schedule.name}" is now the default schedule.`, 'success');
        }
    };

    const handleCreateNew = () => {
        setIsCreatingNew(true);
        setSelectedScheduleId('');
        setSchedule({
            id: 'temp-' + Date.now(),
            providerId: currentProviderId,
            name: 'New Schedule',
            isDefault: providerSchedules.length === 0,
            daySlots: JSON.parse(JSON.stringify(DEFAULT_DAY_SLOTS))
        });
    };

    if (!schedule) return null;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Work Schedules</h1>
                    <p className="page-subtitle">Configure business hours for clock calculations</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={handleCreateNew}>
                        <Plus size={16} /> New Schedule
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            {/* Schedule Name */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Select Schedule</label>
                                <Select 
                                    className="form-select" 
                                    value={isCreatingNew ? '' : selectedScheduleId}
                                    onChange={(e) => {
                                        setIsCreatingNew(false);
                                        setSelectedScheduleId(e.target.value);
                                    }}
                                    disabled={isCreatingNew}
                                >
                                    {isCreatingNew && <option value="">-- Creating New --</option>}
                                    {providerSchedules.map(ps => (
                                        <option key={ps.id} value={ps.id}>{ps.name} {ps.isDefault ? '(Default)' : ''}</option>
                                    ))}
                                </Select>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Schedule Name</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={schedule.name}
                                        onChange={(e) => setSchedule({ ...schedule, name: e.target.value })}
                                    />
                                    {!schedule.isDefault ? (
                                        <button className="btn btn-secondary" onClick={handleSetDefault}>
                                            <Star size={16} /> Set as Default
                                        </button>
                                    ) : (
                                        <div className="badge badge-success" style={{ padding: '8px 12px', fontSize: '13px' }}>
                                            <Star size={14} style={{ fill: 'currentColor' }} /> Current Default
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--color-primary-50)',
                            borderRadius: 'var(--radius-lg)',
                            textAlign: 'center',
                            minWidth: 120,
                        }}>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                                {totalHours.toFixed(1)}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                                hours/week
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Grid */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title"><Clock size={16} /> Weekly Schedule</span>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {schedule.daySlots.map((slot) => (
                            <div
                                key={slot.day}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '140px 60px 1fr 1fr 80px',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    background: slot.isWorkingDay ? 'var(--color-surface)' : 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border-light)',
                                    transition: 'all var(--transition-fast)',
                                    opacity: slot.isWorkingDay ? 1 : 0.6,
                                }}
                            >
                                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{slot.day}</span>

                                <div className="toggle-wrapper" onClick={() => updateSlot(slot.day, 'isWorkingDay', !slot.isWorkingDay)}>
                                    <button className={`toggle ${slot.isWorkingDay ? 'active' : ''}`} />
                                </div>

                                <input
                                    type="time"
                                    className="form-input"
                                    value={slot.startTime}
                                    onChange={(e) => updateSlot(slot.day, 'startTime', e.target.value)}
                                    disabled={!slot.isWorkingDay}
                                />

                                <input
                                    type="time"
                                    className="form-input"
                                    value={slot.endTime}
                                    onChange={(e) => updateSlot(slot.day, 'endTime', e.target.value)}
                                    disabled={!slot.isWorkingDay}
                                />

                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', textAlign: 'right' }}>
                                    {slot.isWorkingDay
                                        ? (() => {
                                            const [sh, sm] = slot.startTime.split(':').map(Number);
                                            const [eh, em] = slot.endTime.split(':').map(Number);
                                            return `${(eh + em / 60 - (sh + sm / 60)).toFixed(1)}h`;
                                        })()
                                        : 'Off'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
