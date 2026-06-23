export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type Tier = 'standard' | 'premium'

const BASE: Record<EntityType, number> = {
  SARL: 49900,
  SARL_U: 39900,
  SA: 99900,
  BRANCH: 79900,
  REP_OFFICE: 59900,
}

export function priceFor(entityType: EntityType, tier: Tier): number {
  const base = BASE[entityType]
  return tier === 'premium' ? base + 30000 : base
}
