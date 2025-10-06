export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatShortDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const getCurrentMonth = (): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
  }).format(new Date())
}

export const getMonthKey = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: '2-digit',
  }).format(date).replace('/', '-')
}