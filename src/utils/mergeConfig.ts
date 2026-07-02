// Pure utility to merge the stable AppConfig with a month's MonthData for the
// public view: resolves each shift assignment's `color` by looking up its
// `name` in config.availableTeamMembers (see docs/superpowers/specs/
// 2026-07-02-admin-editor-turni-design.md sez. 5 + 3.3).

import type { AppConfig, MonthData, Role } from '../types'

/** Fallback color used when a shift assignment's name is not found in config. */
export const FALLBACK_COLOR = 'gray'

/** A shift assignment with its `color` resolved (never missing/undefined). */
export interface ResolvedShiftAssignment {
  name: string
  role: Role
  color: string
}

/** A shift whose team assignments have resolved colors. */
export interface ResolvedShift {
  date: string
  team: ResolvedShiftAssignment[]
}

/** View-ready result of merging AppConfig + MonthData. */
export interface MergedMonth {
  title: string
  month: string
  shifts: ResolvedShift[]
  absences: Record<string, string[]>
}

/**
 * Merges an AppConfig with a month's MonthData, resolving each shift
 * assignment's `color` by looking up its `name` in
 * config.availableTeamMembers. Names not found in config fall back to
 * FALLBACK_COLOR instead of throwing.
 */
export const mergeConfig = (config: AppConfig, month: MonthData): MergedMonth => {
  const colorByName = new Map(
    config.availableTeamMembers.map((member) => [member.name, member.color]),
  )

  const shifts: ResolvedShift[] = month.shifts.map((shift) => ({
    date: shift.date,
    team: shift.team.map((assignment) => ({
      name: assignment.name,
      role: assignment.role,
      color: colorByName.get(assignment.name) ?? FALLBACK_COLOR,
    })),
  }))

  return {
    title: month.title,
    month: month.month,
    shifts,
    absences: month.absences,
  }
}
