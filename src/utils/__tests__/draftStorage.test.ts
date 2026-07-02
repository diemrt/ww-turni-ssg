import { describe, it, expect, beforeEach } from 'vitest'
import { saveDraft, loadDraft, clearDraft, draftKey } from '../draftStorage'
import type { MonthData } from '../../types'

// Minimal in-memory localStorage stub. The vitest environment is 'node', so
// there is no real localStorage global; draftStorage must work against
// whatever is assigned to globalThis.localStorage (or gracefully no-op if
// absent), which this stub + tests exercise directly.
class MemoryStorage {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage() as unknown as Storage
})

const month: MonthData = {
  title: 'Turni di Giugno 2026',
  month: '2026-06',
  shifts: [
    {
      date: '2026-06-05',
      team: [{ name: 'Diego', role: 'guitar' }],
    },
  ],
  absences: { '2026-06-12': ['Alberto'] },
}

describe('draftStorage', () => {
  it('round-trips a saved draft: loadDraft returns an object equal to what was saved', () => {
    saveDraft(month)

    const loaded = loadDraft(month.month)

    expect(loaded).toEqual(month)
  })

  it('stores the draft under a key derived from month.month', () => {
    saveDraft(month)

    expect(localStorage.getItem(draftKey('2026-06'))).not.toBeNull()
    expect(draftKey('2026-06')).toBe('ww-turni-draft-2026-06')
  })

  it('returns null when no draft exists for the given month', () => {
    expect(loadDraft('2099-01')).toBeNull()
  })

  it('returns null when the stored value is corrupt JSON', () => {
    localStorage.setItem(draftKey('2026-07'), '{not valid json')

    expect(loadDraft('2026-07')).toBeNull()
  })

  it('clearDraft removes a previously saved draft', () => {
    saveDraft(month)
    expect(loadDraft(month.month)).not.toBeNull()

    clearDraft(month.month)

    expect(loadDraft(month.month)).toBeNull()
  })
})
