export function formatMoney(amount: number | null | undefined, currency: string): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

export const formatUsd = (amount: number | null | undefined) => formatMoney(amount, 'USD')

export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
