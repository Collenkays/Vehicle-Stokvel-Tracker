export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''))
}