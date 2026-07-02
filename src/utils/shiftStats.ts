// Pure utilities to derive per-month shift statistics: how many shifts each
// person is assigned, plus non-blocking warnings the admin editor should
// surface (see docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md
// sez. 6.4 + 6.5). Warnings never block export; they are informational only.

import type { AppConfig, MonthData, Role } from '../types'

/** Number of shifts assigned to a single person in the month. */
export interface ShiftCount {
  name: string
  count: number
}

/** Discriminated warning kinds surfaced to the admin editor's WarningsPanel. */
export const WarningType = {
  EMPTY_SLOT: 'EMPTY_SLOT',
  DUPLICATE_SAME_DAY: 'DUPLICATE_SAME_DAY',
  ABSENT_ASSIGNED: 'ABSENT_ASSIGNED',
} as const

export type WarningType = (typeof WarningType)[keyof typeof WarningType]

/** A role/date is under-filled: fewer people assigned than roleSlots[role]. */
export interface EmptySlotWarning {
  type: typeof WarningType.EMPTY_SLOT
  date: string
  role: Role
  message: string
}

/** The same person is assigned more than once on the same date. */
export interface DuplicateSameDayWarning {
  type: typeof WarningType.DUPLICATE_SAME_DAY
  date: string
  name: string
  message: string
}

/** A person listed as absent on a date is nonetheless assigned that date. */
export interface AbsentAssignedWarning {
  type: typeof WarningType.ABSENT_ASSIGNED
  date: string
  name: string
  message: string
}

export type ShiftWarning = EmptySlotWarning | DuplicateSameDayWarning | AbsentAssignedWarning

/**
 * Counts how many shifts each person is assigned across the whole month.
 * Returns one entry per distinct name found in month.shifts, in no
 * particular order.
 */
export const shiftCounts = (month: MonthData): ShiftCount[] => {
  const counts = new Map<string, number>()

  for (const shift of month.shifts) {
    for (const assignment of shift.team) {
      counts.set(assignment.name, (counts.get(assignment.name) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
}

/**
 * Computes non-blocking warnings for a month: under-filled role slots,
 * duplicate same-day assignments, and assigned-while-absent people.
 */
export const shiftWarnings = (config: AppConfig, month: MonthData): ShiftWarning[] => {
  const warnings: ShiftWarning[] = []

  for (const shift of month.shifts) {
    // EMPTY_SLOT: compare assigned-per-role counts against config.roleSlots.
    const countByRole = new Map<Role, number>()
    for (const assignment of shift.team) {
      countByRole.set(assignment.role, (countByRole.get(assignment.role) ?? 0) + 1)
    }

    for (const role of config.availableRoles) {
      const required = config.roleSlots[role] ?? 0
      const assigned = countByRole.get(role) ?? 0
      if (assigned < required) {
        warnings.push({
          type: WarningType.EMPTY_SLOT,
          date: shift.date,
          role,
          message: `${role}: ${assigned}/${required} assegnati il ${shift.date}`,
        })
      }
    }

    // DUPLICATE_SAME_DAY: same name appearing more than once in shift.team.
    const nameCounts = new Map<string, number>()
    for (const assignment of shift.team) {
      nameCounts.set(assignment.name, (nameCounts.get(assignment.name) ?? 0) + 1)
    }
    for (const [name, count] of nameCounts) {
      if (count > 1) {
        warnings.push({
          type: WarningType.DUPLICATE_SAME_DAY,
          date: shift.date,
          name,
          message: `${name} assegnato ${count} volte il ${shift.date}`,
        })
      }
    }

    // ABSENT_ASSIGNED: name is both absent and assigned on the same date.
    const absentOnDate = new Set(month.absences[shift.date] ?? [])
    const assignedNames = new Set(shift.team.map((assignment) => assignment.name))
    for (const name of assignedNames) {
      if (absentOnDate.has(name)) {
        warnings.push({
          type: WarningType.ABSENT_ASSIGNED,
          date: shift.date,
          name,
          message: `${name} è assente ma assegnato il ${shift.date}`,
        })
      }
    }
  }

  return warnings
}

/** Convenience wrapper bundling both counts and warnings for a month. */
export interface ShiftStats {
  counts: ShiftCount[]
  warnings: ShiftWarning[]
}

export const shiftStats = (config: AppConfig, month: MonthData): ShiftStats => ({
  counts: shiftCounts(month),
  warnings: shiftWarnings(config, month),
})
