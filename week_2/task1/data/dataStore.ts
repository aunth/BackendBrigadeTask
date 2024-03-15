import { HolidayRule, Department } from '../src/types/types';

export const holidayRulesByDepartment: { [key in Department]: HolidayRule } = {
  [Department.IT]: {
    maxConsecutiveDays: 10,
    blackoutPeriods: [
      { start: new Date(2024, 2, 14), end: new Date(2024, 2, 16) }
    ]
  },
  [Department.HR]: {
    maxConsecutiveDays: 12,
    blackoutPeriods: [
      { start: new Date(2024, 6, 1), end: new Date(2024, 6, 15) }
    ]
  },
  [Department.FINANCE]: {
    maxConsecutiveDays: 15,
    blackoutPeriods: [
      { start: new Date(2024, 2, 1), end: new Date(2024, 2, 15) }
    ]
  },
  [Department.MARKETING]: {
    maxConsecutiveDays: 8,
    blackoutPeriods: [
      { start: new Date(2024, 4, 1), end: new Date(2024, 4, 7) }
    ]
  },
  [Department.SALES]: {
    maxConsecutiveDays: 7,
    blackoutPeriods: [
      { start: new Date(2024, 9, 1), end: new Date(2024, 9, 7) }
    ]
  },
};