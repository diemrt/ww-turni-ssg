import { describe, it, expect } from 'vitest'
import { mergeConfig, FALLBACK_COLOR } from '../mergeConfig'
import type { AppConfig, MonthData } from '../../types'

const config: AppConfig = {
  validDayOfWeek: ['Friday', 'Sunday'],
  availableRoles: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
  roleSlots: { guitar: 1, keyboard: 1, drums: 1, bass: 1, vocals: 5 },
  availableTeamMembers: [
    { name: 'Diego', roles: ['guitar'], color: 'yellow' },
    { name: 'Samuele', roles: ['keyboard'], color: 'blue' },
  ],
}

describe('mergeConfig', () => {
  it('resolves the color for a known member by name', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [{ name: 'Diego', role: 'guitar' }],
        },
      ],
      absences: {},
    }

    const result = mergeConfig(config, month)

    expect(result.shifts[0].team[0]).toEqual({
      name: 'Diego',
      role: 'guitar',
      color: 'yellow',
    })
  })

  it('falls back to a neutral color and does not throw for a name missing from config', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [{ name: 'Sconosciuto', role: 'guitar' }],
        },
      ],
      absences: {},
    }

    expect(() => mergeConfig(config, month)).not.toThrow()

    const result = mergeConfig(config, month)
    expect(result.shifts[0].team[0]).toEqual({
      name: 'Sconosciuto',
      role: 'guitar',
      color: FALLBACK_COLOR,
    })
  })

  it('preserves title, month and absences unchanged', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [],
      absences: { '2026-06-12': ['Alberto', 'Magdy'] },
    }

    const result = mergeConfig(config, month)

    expect(result.title).toBe(month.title)
    expect(result.month).toBe(month.month)
    expect(result.absences).toEqual(month.absences)
  })
})
