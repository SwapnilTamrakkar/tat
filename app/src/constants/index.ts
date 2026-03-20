// ============================================================
// TAT Rule Engine — Constants
// ============================================================
import type { DaySlot, Threshold, ClockConfig, ClockEvent, MatchCriteria } from '../types';

export const THRESHOLD_COLORS: Record<string, string> = {
    warning: '#fbbf24',
    attention: '#f97316',
    overdue: '#ef4444',
};

export const STATUS_COLORS: Record<string, string> = {
    draft: '#94a3b8',
    active: '#10b981',
    inactive: '#f59e0b',
    archived: '#6b7280',
    scheduled: '#3b82f6',
};

export const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    active: 'Active',
    inactive: 'Inactive',
    archived: 'Archived',
    scheduled: 'Scheduled',
};

export const PATTERN_LABELS: Record<string, string> = {
    calendar_days: 'Calendar Days',
    flat_hours: 'Flat Hours',
    business_hours: 'Business Hours',
};

export const UNIT_LABELS: Record<string, string> = {
    hours: 'Hours',
    days: 'Days',
};

export const DEFAULT_DAY_SLOTS: DaySlot[] = [
    { day: 'Monday', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Sunday', isWorkingDay: false, startTime: '09:00', endTime: '17:00' },
];

export const createEmptyEvent = (): ClockEvent => ({
    conditions: [],
});

export const createDefaultThresholds = (): Threshold[] => [
    { id: crypto.randomUUID(), level: 'warning', offsetValue: 2, offsetUnit: 'days', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
    { id: crypto.randomUUID(), level: 'attention', offsetValue: 1, offsetUnit: 'days', beforeDeadline: true, colorCode: '#f97316', enabled: true },
    { id: crypto.randomUUID(), level: 'overdue', offsetValue: 0, offsetUnit: 'days', beforeDeadline: true, colorCode: '#ef4444', enabled: false },
];

export const createDefaultPrimaryClock = (): ClockConfig => ({
    id: crypto.randomUUID(),
    clockName: 'Primary',
    duration: 7,
    durationUnit: 'days',
    pattern: 'calendar_days',
    startMode: 'next_day',
    offsetMinutes: 0,
    startEvent: createEmptyEvent(),
    stopEvent: createEmptyEvent(),
    pauseEvent: null,
    resumeEvent: null,
    thresholds: createDefaultThresholds(),
});

export const createDefaultSecondaryClock = (): ClockConfig => ({
    id: crypto.randomUUID(),
    clockName: 'Secondary',
    duration: 10,
    durationUnit: 'days',
    pattern: 'calendar_days',
    startMode: 'same_day',
    offsetMinutes: 0,
    startEvent: createEmptyEvent(),
    stopEvent: createEmptyEvent(),
    pauseEvent: null,
    resumeEvent: null,
    thresholds: createDefaultThresholds(),
});

export const createDefaultMatchCriteria = (): MatchCriteria => ({
    caseType: 'IP',
    serviceTypes: [],
    requestTypes: [],
});

export const WIZARD_STEPS = [
    { step: 1 as const, label: 'Matching Criteria', description: 'When does this rule apply?' },
    { step: 2 as const, label: 'Primary Clock', description: 'How should the clock behave?' },
    { step: 3 as const, label: 'Secondary Clock & Exclusions', description: 'Chaining & exclusion settings' },
    { step: 4 as const, label: 'Review & Simulate', description: 'Verify and activate' },
];
