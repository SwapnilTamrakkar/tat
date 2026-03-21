// ============================================================
// TAT Rule Engine â€” Seed Data (from TAT_Rules_Exact.xlsx)
// ============================================================
import type { TATRule } from '../types';

export const SEED_RULES: TATRule[] = [
    {
        id: 'rule-001',
        providerId: 'provider-1',
        ruleName: 'IP Standard - Inpatient Admission',
        status: 'active',
        version: 3,
        matchCriteria: {
            caseType: 'IP',
            serviceTypes: ['Inpatient Admission', 'Inpatient Psychiatric', 'Intensive Rehabilitation', 'MH Extended Bed - 45 Day'],
            requestTypes: ['Admission', 'Prior Auth', 'Retrospective', 'Reconsideration'],
        },
        primaryClock: {
            id: 'pc-001',
            clockName: 'Primary',
            duration: 7,
            durationUnit: 'days',
            pattern: 'calendar_days',
            startMode: 'next_day',
            offsetMinutes: 0,
            startEvent: {
                conditions: [
                    { id: 'c1', field: 'Line Status', operator: '=', value: 'Submitted' },
                ],
            },
            stopEvent: {
                conditions: [
                    { id: 'c2', field: 'Line Status', operator: '!=', value: 'Pending' },
                ],
            },
            pauseEvent: {
                conditions: [
                    { id: 'c3', field: 'Line Status', operator: '=', value: 'Pending' },
                    { id: 'c4', field: 'Certified Reason', operator: '=', value: 'Additional Info - pend' },
                    { id: 'c5', field: 'Task Name', operator: '=', value: 'Request Additional Info' },
                    { id: 'c6', field: 'Task Status', operator: '=', value: 'Open' },
                ],
            },
            resumeEvent: {
                conditions: [
                    { id: 'c7', field: 'Task Name', operator: '=', value: 'Additional Information Received' },
                ],
            },
            thresholds: [
                { id: 't1', level: 'warning', offsetValue: 2, offsetUnit: 'days', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
                { id: 't2', level: 'attention', offsetValue: 1, offsetUnit: 'days', beforeDeadline: true, colorCode: '#f97316', enabled: true },
                { id: 't3', level: 'overdue', offsetValue: 0, offsetUnit: 'days', beforeDeadline: true, colorCode: '#ef4444', enabled: true },
            ],
        },
        secondaryClock: {
            id: 'sc-001',
            clockName: 'Secondary',
            duration: 10,
            durationUnit: 'days',
            pattern: 'calendar_days',
            startMode: 'same_day',
            offsetMinutes: 0,
            startEvent: {
                conditions: [
                    { id: 'c8', field: 'Line Status', operator: '=', value: 'Pending' },
                    { id: 'c9', field: 'Certified Reason', operator: '=', value: 'Additional Info - pend' },
                    { id: 'c10', field: 'Task Name', operator: '=', value: 'Request Additional Info' },
                    { id: 'c11', field: 'Task Status', operator: '=', value: 'Open' },
                ],
            },
            stopEvent: {
                conditions: [
                    { id: 'c12', field: 'Task Name', operator: '=', value: 'Additional Information Received' },
                ],
            },
            pauseEvent: null,
            resumeEvent: null,
            thresholds: [
                { id: 't4', level: 'warning', offsetValue: 2, offsetUnit: 'days', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
                { id: 't5', level: 'attention', offsetValue: 1, offsetUnit: 'days', beforeDeadline: true, colorCode: '#f97316', enabled: true },
            ],
        },
        secondaryClockEnabled: true,
        holidayExclusion: 'none',
        weekendExclusion: false,
        effectiveFrom: '2025-01-01',
        effectiveTo: null,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-03-15T14:30:00Z',
        createdBy: 'Sarah Johnson',
    },
    {
        id: 'rule-002',
        providerId: 'provider-1',
        ruleName: 'IP Expedited - Inpatient Urgent',
        status: 'active',
        version: 2,
        matchCriteria: {
            caseType: 'IP',
            serviceTypes: ['Inpatient Admission', 'Inpatient Psychiatric', 'Intensive Rehabilitation'],
            requestTypes: ['Expedited'],
        },
        primaryClock: {
            id: 'pc-002',
            clockName: 'Primary',
            duration: 72,
            durationUnit: 'hours',
            pattern: 'flat_hours',
            startMode: 'same_day',
            offsetMinutes: 0,
            startEvent: {
                conditions: [
                    { id: 'c13', field: 'Line Status', operator: '=', value: 'Submitted' },
                ],
            },
            stopEvent: {
                conditions: [
                    { id: 'c14', field: 'Line Status', operator: '!=', value: 'Pending' },
                ],
            },
            pauseEvent: null,
            resumeEvent: null,
            thresholds: [
                { id: 't6', level: 'warning', offsetValue: 36, offsetUnit: 'hours', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
                { id: 't7', level: 'attention', offsetValue: 24, offsetUnit: 'hours', beforeDeadline: true, colorCode: '#f97316', enabled: true },
            ],
        },
        secondaryClock: null,
        secondaryClockEnabled: false,
        holidayExclusion: 'none',
        weekendExclusion: false,
        effectiveFrom: '2025-01-01',
        effectiveTo: null,
        createdAt: '2025-01-12T10:00:00Z',
        updatedAt: '2025-02-28T09:15:00Z',
        createdBy: 'Mike Chen',
    },
    {
        id: 'rule-003',
        providerId: 'provider-1',
        ruleName: 'OP Standard - Outpatient Services',
        status: 'active',
        version: 4,
        matchCriteria: {
            caseType: 'OP',
            serviceTypes: [
                'Ambulance', 'Chiropractic', 'CMOE', 'Dental - Office', 'DME', 'EDBI',
                'Hearing Aids', 'Home Care Nursing', 'Home Health', 'Imaging Studies',
                'Laboratory', 'Mental Health Services', 'Occupational Therapy', 'Physical Therapy',
                'Physician Services', 'Prosthetics', 'Substance Abuse', 'Vision Care',
            ],
            requestTypes: ['Prior Auth', 'Retrospective', 'Reconsideration'],
        },
        primaryClock: {
            id: 'pc-003',
            clockName: 'Primary',
            duration: 7,
            durationUnit: 'days',
            pattern: 'calendar_days',
            startMode: 'next_day',
            offsetMinutes: 0,
            startEvent: {
                conditions: [
                    { id: 'c15', field: 'Line Status', operator: '=', value: 'Submitted' },
                ],
            },
            stopEvent: {
                conditions: [
                    { id: 'c16', field: 'Line Status', operator: '!=', value: 'Pending' },
                ],
            },
            pauseEvent: {
                conditions: [
                    { id: 'c17', field: 'Line Status', operator: '=', value: 'Pending' },
                    { id: 'c18', field: 'Certified Reason', operator: '=', value: 'Additional Info - pend' },
                    { id: 'c19', field: 'Task Name', operator: '=', value: 'Request Additional Info' },
                    { id: 'c20', field: 'Task Status', operator: '=', value: 'Open' },
                ],
            },
            resumeEvent: {
                conditions: [
                    { id: 'c21', field: 'Task Name', operator: '=', value: 'Additional Information Received' },
                ],
            },
            thresholds: [
                { id: 't8', level: 'warning', offsetValue: 2, offsetUnit: 'days', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
                { id: 't9', level: 'attention', offsetValue: 1, offsetUnit: 'days', beforeDeadline: true, colorCode: '#f97316', enabled: true },
            ],
        },
        secondaryClock: {
            id: 'sc-003',
            clockName: 'Secondary',
            duration: 10,
            durationUnit: 'days',
            pattern: 'calendar_days',
            startMode: 'same_day',
            offsetMinutes: 0,
            startEvent: {
                conditions: [
                    { id: 'c22', field: 'Line Status', operator: '=', value: 'Pending' },
                    { id: 'c23', field: 'Task Name', operator: '=', value: 'Request Additional Info' },
                ],
            },
            stopEvent: {
                conditions: [
                    { id: 'c24', field: 'Task Name', operator: '=', value: 'Additional Information Received' },
                ],
            },
            pauseEvent: null,
            resumeEvent: null,
            thresholds: [
                { id: 't10', level: 'warning', offsetValue: 2, offsetUnit: 'days', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
                { id: 't11', level: 'attention', offsetValue: 1, offsetUnit: 'days', beforeDeadline: true, colorCode: '#f97316', enabled: true },
            ],
        },
        secondaryClockEnabled: true,
        holidayExclusion: 'none',
        weekendExclusion: false,
        effectiveFrom: '2025-01-01',
        effectiveTo: null,
        createdAt: '2025-01-14T12:00:00Z',
        updatedAt: '2025-03-10T11:00:00Z',
        createdBy: 'Sarah Johnson',
    },
    {
        id: 'rule-004',
        providerId: 'provider-1',
        ruleName: 'OP Expedited - Physician Services',
        status: 'draft',
        version: 1,
        matchCriteria: {
            caseType: 'OP',
            serviceTypes: ['Physician Services'],
            requestTypes: ['Expedited'],
        },
        primaryClock: {
            id: 'pc-004',
            clockName: 'Primary',
            duration: 72,
            durationUnit: 'hours',
            pattern: 'flat_hours',
            startMode: 'same_day',
            offsetMinutes: 0,
            startEvent: {
                conditions: [
                    { id: 'c25', field: 'Line Status', operator: '=', value: 'Submitted' },
                ],
            },
            stopEvent: {
                conditions: [
                    { id: 'c26', field: 'Line Status', operator: '!=', value: 'Pending' },
                ],
            },
            pauseEvent: null,
            resumeEvent: null,
            thresholds: [
                { id: 't12', level: 'warning', offsetValue: 36, offsetUnit: 'hours', beforeDeadline: true, colorCode: '#fbbf24', enabled: true },
                { id: 't13', level: 'attention', offsetValue: 18, offsetUnit: 'hours', beforeDeadline: true, colorCode: '#f97316', enabled: true },
            ],
        },
        secondaryClock: null,
        secondaryClockEnabled: false,
        holidayExclusion: 'none',
        weekendExclusion: false,
        effectiveFrom: null,
        effectiveTo: null,
        createdAt: '2025-03-01T09:00:00Z',
        updatedAt: '2025-03-18T16:45:00Z',
        createdBy: 'Mike Chen',
    },
];
