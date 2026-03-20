// ============================================================
// Work Schedule Editor
// ============================================================
import { useState } from 'react';
import { Save, Clock } from 'lucide-react';
import { useTenantStore, useUIStore } from '../../../stores';
import type { DaySlot, WorkSchedule } from '../../../types';
import '../../ui/ui.css';

export default function WorkScheduleEditor() {
    const { workSchedules } = useTenantStore();
    const { addToast } = useUIStore();
    const [schedule, setSchedule] = useState<WorkSchedule>(workSchedules[0]);

    const updateSlot = (day: string, field: keyof DaySlot, value: string | boolean) => {
        setSchedule({
            ...schedule,
            daySlots: schedule.daySlots.map((slot) =>
                slot.day === day ? { ...slot, [field]: value } : slot
            ),
        });
    };

    const totalHours = schedule.daySlots
        .filter((s) => s.isWorkingDay)
        .reduce((acc, s) => {
            const [sh, sm] = s.startTime.split(':').map(Number);
            const [eh, em] = s.endTime.split(':').map(Number);
            return acc + (eh + em / 60 - (sh + sm / 60));
        }, 0);

    const handleSave = () => {
        addToast('Work schedule saved successfully.', 'success');
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Work Schedules</h1>
                    <p className="page-subtitle">Configure business hours for clock calculations</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save Schedule
                </button>
            </div>

            {/* Schedule Name */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Schedule Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={schedule.name}
                                onChange={(e) => setSchedule({ ...schedule, name: e.target.value })}
                            />
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
