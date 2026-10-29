import { formatMoney, formatUsd, formatCount } from './format'

describe('format', () => {
  it('formats money in the given currency with no decimals', () => {
    expect(formatUsd(1234567)).toBe('$1,234,567')
    expect(formatMoney(1500000, 'INR')).toContain('1,500,000')
  })
  it('renders a dash for missing values', () => {
    expect(formatUsd(null)).toBe('—')
  })
  it('formats counts with separators', () => {
    expect(formatCount(10000)).toBe('10,000')
  })
})
