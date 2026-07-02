import { describe, it, expect } from 'vitest'
import { monthDates, monthTitle } from '../monthDates'

describe('monthDates', () => {
  it('returns the ordered Friday/Sunday dates for June 2026', () => {
    expect(monthDates('2026-06', ['Friday', 'Sunday'])).toEqual([
      '2026-06-05',
      '2026-06-07',
      '2026-06-12',
      '2026-06-14',
      '2026-06-19',
      '2026-06-21',
      '2026-06-26',
      '2026-06-28',
    ])
  })

  it('handles a month boundary where the 1st and last day are both valid weekdays (May 2026, Fri/Sun)', () => {
    expect(monthDates('2026-05', ['Friday', 'Sunday'])).toEqual([
      '2026-05-01',
      '2026-05-03',
      '2026-05-08',
      '2026-05-10',
      '2026-05-15',
      '2026-05-17',
      '2026-05-22',
      '2026-05-24',
      '2026-05-29',
      '2026-05-31',
    ])
  })

  it('handles a short month (February) with a single valid weekday', () => {
    expect(monthDates('2026-02', ['Sunday'])).toEqual([
      '2026-02-01',
      '2026-02-08',
      '2026-02-15',
      '2026-02-22',
    ])
  })

  it('returns an empty array when no weekday matches', () => {
    expect(monthDates('2026-06', [])).toEqual([])
  })
})

describe('monthTitle', () => {
  it('builds the Italian title for a given month', () => {
    expect(monthTitle('2026-06')).toBe('Turni di Giugno 2026')
  })

  it('handles other months correctly', () => {
    expect(monthTitle('2026-01')).toBe('Turni di Gennaio 2026')
    expect(monthTitle('2026-12')).toBe('Turni di Dicembre 2026')
  })
})
