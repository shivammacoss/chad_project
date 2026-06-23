export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type Tier = 'standard' | 'premium'
export type VoPlan = 'basic' | 'premium'

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

export function virtualOfficeAddon(plan?: VoPlan): number {
  if (plan === 'basic') return 20000
  if (plan === 'premium') return 50000
  return 0
}

export function totalPrice(
  entityType: EntityType,
  tier: Tier,
  vo?: { wanted: boolean; plan?: VoPlan },
): number {
  const addon = vo?.wanted ? virtualOfficeAddon(vo.plan) : 0
  return priceFor(entityType, tier) + addon
}
