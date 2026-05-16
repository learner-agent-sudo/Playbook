/**
 * Shared dropdown values used across multiple collections.
 *
 * To add a new option (e.g. a new industry), add an entry below and run
 * `npm run generate:types` (or just redeploy — Payload picks up the change
 * at build time). The admin will show the new option immediately.
 */

export const tierOptions = [
  { label: 'Ideal', value: 'ideal' },
  { label: 'Acceptable', value: 'acceptable' },
  { label: 'Fallback 1', value: 'fallback_1' },
  { label: 'Fallback 2', value: 'fallback_2' },
  { label: 'Walk-away', value: 'walk_away' },
] as const

export const approvalLevelOptions = [
  { label: 'Self', value: 'self' },
  { label: 'Senior counsel', value: 'senior_counsel' },
  { label: 'GC', value: 'gc' },
  { label: 'CFO', value: 'cfo' },
  { label: 'CEO', value: 'ceo' },
] as const

export const industryOptions = [
  { label: 'SaaS', value: 'saas' },
  { label: 'Financial services', value: 'finserv' },
  { label: 'Healthcare', value: 'health' },
  { label: 'Retail / e-commerce', value: 'retail' },
  { label: 'Public sector', value: 'public' },
  { label: 'Other', value: 'other' },
] as const

export const counterpartySizeOptions = [
  { label: 'SMB', value: 'smb' },
  { label: 'Mid-market', value: 'mid' },
  { label: 'Enterprise', value: 'ent' },
] as const

export const dealValueBandOptions = [
  { label: '< $50k', value: 'lt_50k' },
  { label: '$50k – $250k', value: '50k_250k' },
  { label: '$250k – $1M', value: '250k_1m' },
  { label: '> $1M', value: 'gt_1m' },
] as const

export const termLengthOptions = [
  { label: '< 1 year', value: 'lt_1y' },
  { label: '1 year', value: '1y' },
  { label: '2–3 years', value: '2_3y' },
  { label: '3+ years', value: 'gt_3y' },
] as const

export const urgencyOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
] as const

export const counterpartyTypeOptions = [
  { label: 'Customer', value: 'customer' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Partner', value: 'partner' },
] as const

/**
 * Outcome of a review: how the final position relates to the playbook.
 * "ideal" means no concession; the other tier values are concessions to
 * known fallback positions; "out_of_playbook" is a novel decision that
 * didn't fit any existing tier.
 */
export const matchTypeOptions = [
  { label: 'Matches ideal', value: 'ideal' },
  { label: 'Within acceptable', value: 'acceptable' },
  { label: 'Landed at fallback 1', value: 'fallback_1' },
  { label: 'Landed at fallback 2', value: 'fallback_2' },
  { label: 'Out of playbook (novel decision)', value: 'out_of_playbook' },
] as const
