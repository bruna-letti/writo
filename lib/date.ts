import { formatInTimeZone } from 'date-fns-tz'

export function getBrasiliaDate() {
  return formatInTimeZone(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd')
}
