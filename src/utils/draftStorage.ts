// Draft persistence for MonthData in localStorage, keyed per month (see docs/
// superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 6.6).
// Lets the admin editor autosave in-progress edits and resume/discard them on
// reopen, without any server-side storage.

import type { MonthData } from '../types'

const DRAFT_KEY_PREFIX = 'ww-turni-draft-'

/** Builds the localStorage key for a given month string (e.g. "2026-06"). */
export const draftKey = (monthStr: string): string => `${DRAFT_KEY_PREFIX}${monthStr}`

/**
 * Saves a MonthData draft under a key derived from `month.month`.
 * Fails silently (no throw) if localStorage is unavailable (e.g. disabled,
 * private browsing quota exceeded, or not present in the environment).
 */
export const saveDraft = (month: MonthData): void => {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(draftKey(month.month), JSON.stringify(month))
  } catch {
    // Storage unavailable or quota exceeded: silently skip the autosave.
  }
}

/**
 * Loads the MonthData draft for the given month string. Returns null if no
 * draft exists, localStorage is unavailable, or the stored value is not
 * valid JSON.
 */
export const loadDraft = (monthStr: string): MonthData | null => {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(draftKey(monthStr))
    if (raw == null) return null
    return JSON.parse(raw) as MonthData
  } catch {
    return null
  }
}

/** Removes the draft for the given month string, if any. */
export const clearDraft = (monthStr: string): void => {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(draftKey(monthStr))
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
