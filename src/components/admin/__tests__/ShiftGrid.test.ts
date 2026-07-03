import { describe, it, expect } from 'vitest'
import { buildGridRows, buildSelectionKey, selectionsFromShifts, shiftsFromSelections } from '../ShiftGrid'
import type { AppConfig, Shift } from '../../../types'

const config: AppConfig = {
  validDayOfWeek: ['Friday', 'Sunday'],
  availableRoles: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
  roleSlots: { guitar: 1, keyboard: 1, drums: 1, bass: 1, vocals: 2 },
  availableTeamMembers: [
    { name: 'Diego', roles: ['guitar'], color: 'yellow' },
    { name: 'Samuele', roles: ['keyboard'], color: 'blue' },
    { name: 'Alberto', roles: ['drums'], color: 'red' },
    { name: 'Marco', roles: ['bass'], color: 'green' },
    { name: 'Anna', roles: ['vocals'], color: 'pink' },
    { name: 'Elisa', roles: ['vocals'], color: 'purple' },
  ],
}

describe('selectionsFromShifts', () => {
  it('round-trips with shiftsFromSelections: shifts -> selections -> shifts yields the original shifts', () => {
    const dateColumns = ['2026-06-05', '2026-06-07']
    // Team order matches buildGridRows' row order (config.availableRoles, then
    // slotIndex) so the rebuilt array compares equal including order.
    const shifts: Shift[] = [
      {
        date: '2026-06-05',
        team: [
          { name: 'Diego', role: 'guitar' },
          { name: 'Marco', role: 'bass' },
          { name: 'Alberto', role: 'drums' },
          { name: 'Anna', role: 'vocals' },
          { name: 'Elisa', role: 'vocals' },
          { name: 'Samuele', role: 'keyboard' },
        ],
      },
      {
        date: '2026-06-07',
        team: [{ name: 'Diego', role: 'guitar' }],
      },
    ]

    const selections = selectionsFromShifts(config, shifts)
    const rebuilt = shiftsFromSelections(dateColumns, buildGridRows(config), selections)

    expect(rebuilt).toEqual(shifts)
  })

  it('fills the first free slot per role, in row order', () => {
    const shifts: Shift[] = [
      {
        date: '2026-06-05',
        team: [
          { name: 'Anna', role: 'vocals' },
          { name: 'Elisa', role: 'vocals' },
        ],
      },
    ]

    const selections = selectionsFromShifts(config, shifts)

    expect(selections[buildSelectionKey('2026-06-05', 'vocals', 1)]).toBe('Anna')
    expect(selections[buildSelectionKey('2026-06-05', 'vocals', 2)]).toBe('Elisa')
  })

  it('drops an assignment when there is no free slot left for that role/date', () => {
    const shifts: Shift[] = [
      {
        date: '2026-06-05',
        team: [
          { name: 'Anna', role: 'vocals' },
          { name: 'Elisa', role: 'vocals' },
          { name: 'Anna', role: 'vocals' }, // 3rd vocals assignment: only 2 slots configured
        ],
      },
    ]

    const selections = selectionsFromShifts(config, shifts)

    expect(Object.values(selections).filter((name) => name === 'Anna')).toHaveLength(1)
  })

  it('returns an empty map for an empty shifts array', () => {
    expect(selectionsFromShifts(config, [])).toEqual({})
  })
})
