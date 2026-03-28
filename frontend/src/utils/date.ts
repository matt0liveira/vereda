export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate  // return as-is if not a valid ISO date
  const [year, month, day] = parts
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}
