// ============================================================
// TAT Rule Engine â€” Core Type Definitions
// ============================================================

// --- Enums ---
export type RuleStatus = 'draft' | 'active' | 'inactive' | 'archived' | 'scheduled';
export type CaseType = 'IP' | 'OP' | 'Both';
export type ClockPattern = 'calendar_days' | 'flat_hours' | 'business_hours';
export type StartMode = 'same_day' | 'next_day';
export type DurationUnit = 'hours' | 'days';
export type ThresholdLevel = 'warning' | 'attention' | 'overdue';
export type ClockName = 'Primary' | 'Secondary';
export type HolidayType = 'client' | 'provider' | 'custom' | 'federal';
export type ExclusionOption = 'none' | 'client' | 'provider' | 'both';
export type EventOperator = '=' | '!=' | 'contains';

export const REQUEST_TYPES = [
    'Admission',
    'Prior Auth',
    'Retrospective',
    'Reconsideration',
    'Expedited',
] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const IP_SERVICE_TYPES = [
    'Inpatient Admission',
    'Inpatient Psychiatric',
    'Intensive Rehabilitation',
    'MH Extended Bed - 45 Day',
] as const;

export const OP_SERVICE_TYPES = [
    'Ambulance',
    'Chiropractic',
    'CMOE',
    'Dental - Office',
    'DME',
    'EDBI',
    'Hearing Aids',
    'Home Care Nursing',
    'Home Health',
    'Imaging Studies',
    'Laboratory',
    'Mental Health Services',
    'Occupational Therapy',
    'Physical Therapy',
    'Physician Services',
    'Prosthetics',
    'Substance Abuse',
    'Vision Care',
] as const;

export const EVENT_FIELDS = [
    'Line Status',
    'Certified Reason',
    'Task Name',
    'Task Status',
] as const;

export const EVENT_FIELD_VALUES: Record<string, string[]> = {
    'Line Status': ['Submitted', 'Pending', 'Approved', 'Denied', 'Cancelled'],
    'Certified Reason': ['Additional Info - pend', 'Medical Review', 'Admin Review', 'Peer Review'],
    'Task Name': ['Request Additional Info', 'Additional Information Received', 'Medical Review', 'Admin Review'],
    'Task Status': ['Open', 'Closed', 'In Progress', 'Completed'],
};

// --- Event Condition ---
export interface EventCondition {
    id: string;
    field: string;
    operator: EventOperator;
    value: string;
}

// --- Clock Event ---
export interface ClockEvent {
    conditions: EventCondition[];
}

// --- Threshold ---
export interface Threshold {
    id: string;
    level: ThresholdLevel;
    offsetValue: number;
    offsetUnit: DurationUnit;
    beforeDeadline: boolean;
    colorCode: string;
    enabled: boolean;
}

// --- Clock Config ---
export interface ClockConfig {
    id: string;
    clockName: ClockName;
    duration: number;
    durationUnit: DurationUnit;
    pattern: ClockPattern;
    startMode: StartMode;
    offsetMinutes: number;
    startEvent: ClockEvent;
    stopEvent: ClockEvent;
    pauseEvent: ClockEvent | null;
    resumeEvent: ClockEvent | null;
    thresholds: Threshold[];
}

// --- Match Criteria ---
export interface MatchCriteria {
    caseType: CaseType;
    serviceTypes: string[];
    requestTypes: RequestType[];
    intakeMethod?: string;
}

// --- TAT Rule ---
export interface TATRule {
    id: string;
    providerId: string;
    ruleName: string;
    status: RuleStatus;
    version: number;
    matchCriteria: MatchCriteria;
    primaryClock: ClockConfig;
    secondaryClock: ClockConfig | null;
    secondaryClockEnabled: boolean;
    holidayExclusion: ExclusionOption;
    weekendExclusion: boolean;
    effectiveFrom: string | null;
    effectiveTo: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

// --- Rule Version ---
export interface RuleVersion {
    id: string;
    ruleId: string;
    versionNumber: number;
    snapshot: TATRule;
    changedBy: string;
    changeSummary: string;
    createdAt: string;
}

// --- Provider ---
export interface Provider {
    id: string;
    name: string;
    code: string;
    status: 'active' | 'inactive';
    timezone: string;
    workScheduleId: string;
    holidayCalendarIds: string[];
    createdAt: string;
    effectiveStartDate?: string;
}

// --- Work Schedule ---
export interface DaySlot {
    day: string;
    isWorkingDay: boolean;
    startTime: string;
    endTime: string;
}

export interface WorkSchedule {
    id: string;
    providerId: string;
    name: string;
    isDefault: boolean;
    daySlots: DaySlot[];
}

// --- Holiday ---
export interface Holiday {
    id: string;
    date: string;
    name: string;
    category: HolidayType;
    isActive: boolean;
}

export interface HolidayCalendar {
    id: string;
    providerId: string;
    type: HolidayType;
    name: string;
    holidays: Holiday[];
    year: number;
}

// --- Test Scenario ---
export interface SimulationEvent {
    id: string;
    eventName: string;
    timestamp: string;
    conditions: EventCondition[];
}

export interface SimulationResult {
    clockName: ClockName;
    startTime: string;
    deadline: string;
    warningAt: string | null;
    attentionAt: string | null;
    overdueAt: string | null;
    pausedAt: string | null;
    resumedAt: string | null;
    totalElapsed: string;
    remaining: string;
    status: 'running' | 'paused' | 'completed' | 'overdue';
}

export interface TestScenario {
    id: string;
    ruleId: string;
    name: string;
    referenceDate: string;
    caseInputs: MatchCriteria;
    eventSequence: SimulationEvent[];
    expectedOutput: SimulationResult[] | null;
    lastRunPassed: boolean | null;
    lastRunAt: string | null;
}

// --- Audit Log ---
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    providerId: string;
    actionType: 'created' | 'updated' | 'activated' | 'deactivated' | 'archived' | 'cloned' | 'restored';
    entityType: 'rule' | 'schedule' | 'holiday' | 'provider';
    entityName: string;
    entityId: string;
    changeSummary: string;
    beforeSnapshot?: Record<string, unknown>;
    afterSnapshot?: Record<string, unknown>;
}

// --- Wizard Step ---
export type WizardStep = 1 | 2 | 3 | 4;

// --- Form State ---
export interface RuleFormState {
    currentStep: WizardStep;
    ruleName: string;
    matchCriteria: MatchCriteria;
    primaryClock: ClockConfig;
    secondaryClock: ClockConfig | null;
    secondaryClockEnabled: boolean;
    holidayExclusion: ExclusionOption;
    weekendExclusion: boolean;
    isDirty: boolean;
    errors: Record<string, string>;
}
