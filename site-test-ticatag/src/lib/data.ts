export type ProductId = 'tibib' | 'om1s' | 'tg100' | 'tg230' | 'sensors'
export type TechId = 'ble' | 'gps' | 'lte' | 'sensor'
export type IndId = 'medical' | 'logistics' | 'btp' | 'sport' | 'cold'
export type StatusId = 'live' | 'active' | 'new' | 'sunset'

export interface Product {
  id: ProductId
  techs: TechId[]
  inds: IndId[]
  status: StatusId
  color: string
  featured?: boolean
}

export const STATUS_COLOR: Record<StatusId, string> = {
  live: '#00D2FF',
  active: '#10B981',
  new: '#8B5CF6',
  sunset: '#F59E0B',
}

export const PRODUCTS: Product[] = [
  { id: 'tibib', techs: ['ble'], inds: ['sport'], status: 'live', color: STATUS_COLOR.live },
  { id: 'om1s', techs: ['ble'], inds: ['medical', 'logistics'], status: 'active', color: STATUS_COLOR.active, featured: true },
  { id: 'tg100', techs: ['gps'], inds: ['btp', 'logistics'], status: 'sunset', color: STATUS_COLOR.sunset },
  { id: 'tg230', techs: ['gps', 'lte'], inds: ['btp', 'logistics'], status: 'new', color: STATUS_COLOR.new, featured: true },
  { id: 'sensors', techs: ['sensor', 'ble'], inds: ['cold', 'logistics', 'medical'], status: 'active', color: STATUS_COLOR.active },
]

export const SECTOR_COLOR = {
  medical: '#00D2FF',
  logistics: '#0066FF',
  btp: '#F59E0B',
  sport: '#8B5CF6',
} as const
export type SectorId = keyof typeof SECTOR_COLOR
