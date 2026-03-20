// ============================================================
// TAT Rule Engine — Zustand Store
// ============================================================
import { create } from 'zustand';
import type {
    TATRule, RuleStatus, WizardStep, MatchCriteria, ClockConfig,
    ExclusionOption, WorkSchedule, HolidayCalendar, AuditLogEntry,
    Tenant
} from '../types';
import {
    createDefaultPrimaryClock, createDefaultSecondaryClock,
    createDefaultMatchCriteria, DEFAULT_DAY_SLOTS
} from '../constants';
import { SEED_RULES } from '../services/seedData';

// ---- Rule Store ----
interface RuleStore {
    rules: TATRule[];
    selectedRuleId: string | null;
    addRule: (rule: TATRule) => void;
    updateRule: (id: string, updates: Partial<TATRule>) => void;
    deleteRule: (id: string) => void;
    setSelectedRule: (id: string | null) => void;
    cloneRule: (id: string) => TATRule;
    activateRule: (id: string) => void;
    deactivateRule: (id: string) => void;
    archiveRule: (id: string) => void;
    getRule: (id: string) => TATRule | undefined;
}

export const useRuleStore = create<RuleStore>((set, get) => ({
    rules: SEED_RULES,
    selectedRuleId: null,

    addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),

    updateRule: (id, updates) =>
        set((state) => ({
            rules: state.rules.map((r) =>
                r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString(), version: r.version + 1 } : r
            ),
        })),

    deleteRule: (id) => set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),

    setSelectedRule: (id) => set({ selectedRuleId: id }),

    cloneRule: (id) => {
        const original = get().rules.find((r) => r.id === id);
        if (!original) throw new Error('Rule not found');
        const cloned: TATRule = {
            ...JSON.parse(JSON.stringify(original)),
            id: crypto.randomUUID(),
            ruleName: `${original.ruleName} (Copy)`,
            status: 'draft' as RuleStatus,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ rules: [...state.rules, cloned] }));
        return cloned;
    },

    activateRule: (id) =>
        set((state) => ({
            rules: state.rules.map((r) =>
                r.id === id ? { ...r, status: 'active' as RuleStatus, updatedAt: new Date().toISOString() } : r
            ),
        })),

    deactivateRule: (id) =>
        set((state) => ({
            rules: state.rules.map((r) =>
                r.id === id ? { ...r, status: 'inactive' as RuleStatus, updatedAt: new Date().toISOString() } : r
            ),
        })),

    archiveRule: (id) =>
        set((state) => ({
            rules: state.rules.map((r) =>
                r.id === id ? { ...r, status: 'archived' as RuleStatus, updatedAt: new Date().toISOString() } : r
            ),
        })),

    getRule: (id) => get().rules.find((r) => r.id === id),
}));

// ---- Wizard Store ----
interface WizardStore {
    currentStep: WizardStep;
    ruleName: string;
    matchCriteria: MatchCriteria;
    primaryClock: ClockConfig;
    secondaryClock: ClockConfig;
    secondaryClockEnabled: boolean;
    holidayExclusion: ExclusionOption;
    weekendExclusion: boolean;
    editingRuleId: string | null;
    isDirty: boolean;

    setStep: (step: WizardStep) => void;
    setRuleName: (name: string) => void;
    setMatchCriteria: (criteria: Partial<MatchCriteria>) => void;
    setPrimaryClock: (clock: Partial<ClockConfig>) => void;
    setSecondaryClock: (clock: Partial<ClockConfig>) => void;
    setSecondaryClockEnabled: (enabled: boolean) => void;
    setHolidayExclusion: (option: ExclusionOption) => void;
    setWeekendExclusion: (skip: boolean) => void;
    resetWizard: () => void;
    loadRule: (rule: TATRule) => void;
    buildRule: () => Omit<TATRule, 'id' | 'createdAt' | 'updatedAt'>;
}

const wizardInitialState = {
    currentStep: 1 as WizardStep,
    ruleName: '',
    matchCriteria: createDefaultMatchCriteria(),
    primaryClock: createDefaultPrimaryClock(),
    secondaryClock: createDefaultSecondaryClock(),
    secondaryClockEnabled: false,
    holidayExclusion: 'none' as ExclusionOption,
    weekendExclusion: false,
    editingRuleId: null as string | null,
    isDirty: false,
};

export const useWizardStore = create<WizardStore>((set, get) => ({
    ...wizardInitialState,

    setStep: (step) => set({ currentStep: step }),
    setRuleName: (name) => set({ ruleName: name, isDirty: true }),
    setMatchCriteria: (criteria) =>
        set((s) => ({ matchCriteria: { ...s.matchCriteria, ...criteria }, isDirty: true })),
    setPrimaryClock: (clock) =>
        set((s) => ({ primaryClock: { ...s.primaryClock, ...clock }, isDirty: true })),
    setSecondaryClock: (clock) =>
        set((s) => ({ secondaryClock: { ...s.secondaryClock, ...clock }, isDirty: true })),
    setSecondaryClockEnabled: (enabled) => set({ secondaryClockEnabled: enabled, isDirty: true }),
    setHolidayExclusion: (option) => set({ holidayExclusion: option, isDirty: true }),
    setWeekendExclusion: (skip) => set({ weekendExclusion: skip, isDirty: true }),
    resetWizard: () => set({
        ...wizardInitialState,
        primaryClock: createDefaultPrimaryClock(),
        secondaryClock: createDefaultSecondaryClock(),
        matchCriteria: createDefaultMatchCriteria(),
    }),
    loadRule: (rule) =>
        set({
            editingRuleId: rule.id,
            ruleName: rule.ruleName,
            matchCriteria: { ...rule.matchCriteria },
            primaryClock: { ...rule.primaryClock },
            secondaryClock: rule.secondaryClock ? { ...rule.secondaryClock } : createDefaultSecondaryClock(),
            secondaryClockEnabled: rule.secondaryClockEnabled,
            holidayExclusion: rule.holidayExclusion,
            weekendExclusion: rule.weekendExclusion,
            currentStep: 1,
            isDirty: false,
        }),
    buildRule: () => {
        const s = get();
        return {
            tenantId: 'tenant-1',
            ruleName: s.ruleName,
            status: 'draft' as RuleStatus,
            version: 1,
            matchCriteria: s.matchCriteria,
            primaryClock: s.primaryClock,
            secondaryClock: s.secondaryClockEnabled ? s.secondaryClock : null,
            secondaryClockEnabled: s.secondaryClockEnabled,
            holidayExclusion: s.holidayExclusion,
            weekendExclusion: s.weekendExclusion,
            effectiveFrom: null,
            effectiveTo: null,
            createdBy: 'Config Analyst',
        };
    },
}));

// ---- Tenant Store ----
interface TenantStore {
    tenants: Tenant[];
    currentTenantId: string;
    workSchedules: WorkSchedule[];
    holidayCalendars: HolidayCalendar[];
    auditLog: AuditLogEntry[];
    addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

export const useTenantStore = create<TenantStore>((set) => ({
    tenants: [
        {
            id: 'tenant-1',
            name: 'Acme Healthcare',
            code: 'ACME',
            status: 'active',
            timezone: 'America/New_York',
            workScheduleId: 'ws-1',
            holidayCalendarIds: ['hc-1'],
            createdAt: '2025-01-15T00:00:00Z',
        },
    ],
    currentTenantId: 'tenant-1',
    workSchedules: [
        {
            id: 'ws-1',
            tenantId: 'tenant-1',
            name: 'Default Schedule',
            isDefault: true,
            daySlots: DEFAULT_DAY_SLOTS,
        },
    ],
    holidayCalendars: [
        {
            id: 'hc-1',
            tenantId: 'tenant-1',
            type: 'client',
            name: 'US Federal Holidays 2025',
            year: 2025,
            holidays: [
                { id: '1', date: '2025-01-01', name: "New Year's Day", category: 'federal', isActive: true },
                { id: '2', date: '2025-01-20', name: "Martin Luther King Jr. Day", category: 'federal', isActive: true },
                { id: '3', date: '2025-02-17', name: "Presidents' Day", category: 'federal', isActive: true },
                { id: '4', date: '2025-05-26', name: 'Memorial Day', category: 'federal', isActive: true },
                { id: '5', date: '2025-07-04', name: 'Independence Day', category: 'federal', isActive: true },
                { id: '6', date: '2025-09-01', name: 'Labor Day', category: 'federal', isActive: true },
                { id: '7', date: '2025-11-27', name: 'Thanksgiving Day', category: 'federal', isActive: true },
                { id: '8', date: '2025-12-25', name: 'Christmas Day', category: 'federal', isActive: true },
            ],
        },
    ],
    auditLog: [],
    addAuditEntry: (entry) =>
        set((state) => ({
            auditLog: [
                { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
                ...state.auditLog,
            ],
        })),
}));

// ---- UI Store ----
interface UIStore {
    sidebarCollapsed: boolean;
    toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>;
    toggleSidebar: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarCollapsed: false,
    toasts: [],
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    addToast: (message, type = 'success') => {
        const id = crypto.randomUUID();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
