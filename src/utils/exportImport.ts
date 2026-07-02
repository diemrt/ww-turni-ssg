// Export/import of MonthData as turni.json (see docs/superpowers/specs/
// 2026-07-02-admin-editor-turni-design.md sez. 6.6). The admin downloads the
// exported file, commits it to public/, and can re-import it to correct an
// already-published month.
//
// Serialization/parsing are kept as pure, DOM-free functions so they are
// unit-testable; only exportMonthData touches the DOM (Blob + anchor click).

import type { MonthData, Shift, ShiftAssignment } from '../types'

/** Serializes a MonthData to pretty-printed JSON (pure, no DOM). */
export const serializeMonthData = (month: MonthData): string => JSON.stringify(month, null, 2)

const isRecordOfStringArrays = (value: unknown): value is Record<string, string[]> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return Object.values(value as Record<string, unknown>).every(
    (v) => Array.isArray(v) && v.every((item) => typeof item === 'string'),
  )
}

const isShiftAssignment = (value: unknown): value is ShiftAssignment => {
  if (typeof value !== 'object' || value === null) return false
  const assignment = value as Record<string, unknown>
  return typeof assignment.name === 'string' && typeof assignment.role === 'string'
}

const isShift = (value: unknown): value is Shift => {
  if (typeof value !== 'object' || value === null) return false
  const shift = value as Record<string, unknown>
  return (
    typeof shift.date === 'string' &&
    Array.isArray(shift.team) &&
    shift.team.every(isShiftAssignment)
  )
}

/**
 * Parses and validates a turni.json string into a MonthData, throwing a
 * clear Error when the JSON is malformed or required fields are missing/
 * malformed (pure, no DOM).
 */
export const parseMonthData = (jsonText: string): MonthData => {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Invalid turni.json: not valid JSON')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid turni.json: expected a JSON object')
  }

  const data = parsed as Record<string, unknown>

  if (typeof data.title !== 'string') {
    throw new Error('Invalid turni.json: missing or invalid "title" field')
  }
  if (typeof data.month !== 'string') {
    throw new Error('Invalid turni.json: missing or invalid "month" field')
  }
  if (!Array.isArray(data.shifts) || !data.shifts.every(isShift)) {
    throw new Error('Invalid turni.json: missing or invalid "shifts" field')
  }
  if (!isRecordOfStringArrays(data.absences)) {
    throw new Error('Invalid turni.json: missing or invalid "absences" field')
  }

  return {
    title: data.title,
    month: data.month,
    shifts: data.shifts as Shift[],
    absences: data.absences,
  }
}

/**
 * Parses and validates a turni.json string, returning a MonthData with
 * `shifts` + `absences` repopulated. Alias of parseMonthData kept for
 * call-site readability at import boundaries.
 */
export const importMonthData = (jsonText: string): MonthData => parseMonthData(jsonText)

/**
 * Serializes a MonthData to JSON and triggers a browser download of
 * turni.json via a Blob + temporary anchor element. DOM-only; the pure
 * serialization lives in serializeMonthData so it stays unit-testable.
 */
export const exportMonthData = (month: MonthData): void => {
  const json = serializeMonthData(month)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'turni.json'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  URL.revokeObjectURL(url)
}
