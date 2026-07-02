import { describe, it, expect } from 'vitest'
import { shiftCounts, shiftWarnings, WarningType } from '../shiftStats'
import type { AppConfig, MonthData } from '../../types'

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

describe('shiftCounts', () => {
  it('counts assignments correctly across shifts on a small sample dataset', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [
            { name: 'Diego', role: 'guitar' },
            { name: 'Samuele', role: 'keyboard' },
          ],
        },
        {
          date: '2026-06-07',
          team: [
            { name: 'Diego', role: 'guitar' },
            { name: 'Alberto', role: 'drums' },
          ],
        },
      ],
      absences: {},
    }

    const result = shiftCounts(month)

    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'Diego', count: 2 },
        { name: 'Samuele', count: 1 },
        { name: 'Alberto', count: 1 },
      ]),
    )
    expect(result).toHaveLength(3)
  })

  it('returns an empty array when the month has no shifts', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [],
      absences: {},
    }

    expect(shiftCounts(month)).toEqual([])
  })
})

describe('shiftWarnings', () => {
  it('detects an EMPTY_SLOT warning when a role is under-filled on a date', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [
            { name: 'Diego', role: 'guitar' },
            { name: 'Samuele', role: 'keyboard' },
            { name: 'Alberto', role: 'drums' },
            { name: 'Marco', role: 'bass' },
            { name: 'Anna', role: 'vocals' },
            // vocals requires 2, only 1 assigned -> EMPTY_SLOT
          ],
        },
      ],
      absences: {},
    }

    const warnings = shiftWarnings(config, month)

    expect(warnings).toContainEqual({
      type: WarningType.EMPTY_SLOT,
      date: '2026-06-05',
      role: 'vocals',
      message: expect.any(String),
    })
  })

  it('detects a DUPLICATE_SAME_DAY warning when a person is assigned twice on the same date', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [
            { name: 'Diego', role: 'guitar' },
            { name: 'Diego', role: 'vocals' },
          ],
        },
      ],
      absences: {},
    }

    const warnings = shiftWarnings(config, month)

    expect(warnings).toContainEqual({
      type: WarningType.DUPLICATE_SAME_DAY,
      date: '2026-06-05',
      name: 'Diego',
      message: expect.any(String),
    })
  })

  it('detects an ABSENT_ASSIGNED warning when an absent person is still assigned that date', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [{ name: 'Diego', role: 'guitar' }],
        },
      ],
      absences: {
        '2026-06-05': ['Diego'],
      },
    }

    const warnings = shiftWarnings(config, month)

    expect(warnings).toContainEqual({
      type: WarningType.ABSENT_ASSIGNED,
      date: '2026-06-05',
      name: 'Diego',
      message: expect.any(String),
    })
  })

  it('returns no warnings for a clean, fully-filled, non-conflicting dataset', () => {
    const month: MonthData = {
      title: 'Turni di Giugno 2026',
      month: '2026-06',
      shifts: [
        {
          date: '2026-06-05',
          team: [
            { name: 'Diego', role: 'guitar' },
            { name: 'Samuele', role: 'keyboard' },
            { name: 'Alberto', role: 'drums' },
            { name: 'Marco', role: 'bass' },
            { name: 'Anna', role: 'vocals' },
            { name: 'Elisa', role: 'vocals' },
          ],
        },
      ],
      absences: {
        '2026-06-05': ['Magdy'],
      },
    }

    expect(shiftWarnings(config, month)).toEqual([])
  })
})
