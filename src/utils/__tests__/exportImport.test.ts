import { describe, it, expect } from 'vitest'
import { serializeMonthData, parseMonthData, importMonthData } from '../exportImport'
import type { MonthData } from '../../types'

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
  ],
  absences: { '2026-06-12': ['Alberto', 'Magdy'] },
}

describe('exportImport', () => {
  it('serialize -> parse round-trip yields an identical MonthData object', () => {
    const json = serializeMonthData(month)
    const parsed = parseMonthData(json)

    expect(parsed).toEqual(month)
  })

  it('serialize -> importMonthData round-trip yields an identical MonthData object', () => {
    const json = serializeMonthData(month)
    const imported = importMonthData(json)

    expect(imported).toEqual(month)
  })

  it('serializes to pretty-printed JSON', () => {
    const json = serializeMonthData(month)

    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })

  it('throws a clear Error for invalid JSON', () => {
    expect(() => importMonthData('{not valid json')).toThrow(/not valid JSON/i)
  })

  it('throws a clear Error when a required field is missing (title)', () => {
    const invalid = JSON.stringify({
      month: '2026-06',
      shifts: [],
      absences: {},
    })

    expect(() => importMonthData(invalid)).toThrow(/title/i)
  })

  it('throws a clear Error when "shifts" is missing', () => {
    const invalid = JSON.stringify({
      title: 'Turni',
      month: '2026-06',
      absences: {},
    })

    expect(() => importMonthData(invalid)).toThrow(/shifts/i)
  })

  it('throws a clear Error when "absences" is missing', () => {
    const invalid = JSON.stringify({
      title: 'Turni',
      month: '2026-06',
      shifts: [],
    })

    expect(() => importMonthData(invalid)).toThrow(/absences/i)
  })

  it('throws a clear Error when a shift is malformed (missing team)', () => {
    const invalid = JSON.stringify({
      title: 'Turni',
      month: '2026-06',
      shifts: [{ date: '2026-06-05' }],
      absences: {},
    })

    expect(() => importMonthData(invalid)).toThrow(/shifts/i)
  })

  it('throws when given a JSON array instead of an object', () => {
    expect(() => importMonthData('[]')).toThrow(/expected a JSON object/i)
  })
})
