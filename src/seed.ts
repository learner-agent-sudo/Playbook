import type { Payload } from 'payload'

/**
 * Seed three example Limitation of Liability playbook entries plus two
 * synthetic counterparty drafts so the review screen has something to work
 * with on first deploy.
 *
 * Runs from payload.config.ts onInit. Idempotent: if any playbook entries
 * already exist, the seed is skipped entirely. Delete the seeded records
 * via the admin once you have your own — the seed won't recreate them as
 * long as the playbook-entries table isn't empty.
 */
export async function seed(payload: Payload): Promise<void> {
  const existing = await payload.count({ collection: 'playbook-entries' })
  if (existing.totalDocs > 0) {
    return
  }

  payload.logger.info('[seed] Empty playbook-entries table — seeding initial records.')

  const lol = await getOrCreateNamed(payload, 'clause-families', 'Limitation of Liability')
  const generalCap = await getOrCreateNamed(payload, 'sub-clauses', 'General cap')

  await payload.create({
    collection: 'playbook-entries',
    data: {
      clauseFamily: lol.id,
      subClause: generalCap.id,
      tier: 'ideal',
      positionDescription:
        'Aggregate liability for each party capped at 12 months of fees paid in the 12 months preceding the event giving rise to the claim. Mutual cap. Standard exclusions for confidentiality breach, IP indemnity, and gross negligence / wilful misconduct.',
      approvalLevelRequired: 'self',
      rationale:
        '12-month fees cap is market for mid-market SaaS. Mutual cap keeps negotiation symmetric and avoids precedent for one-sided liability.',
      version: 1,
    },
  })

  await payload.create({
    collection: 'playbook-entries',
    data: {
      clauseFamily: lol.id,
      subClause: generalCap.id,
      tier: 'acceptable',
      positionDescription:
        'Aggregate liability capped at 24 months of fees paid in the 24 months preceding the claim. Same exclusions as ideal tier.',
      approvalLevelRequired: 'senior_counsel',
      rationale:
        'Acceptable when counterparty is enterprise and deal value justifies the additional exposure. Still well within insured limits.',
      version: 1,
    },
  })

  await payload.create({
    collection: 'playbook-entries',
    data: {
      clauseFamily: lol.id,
      subClause: generalCap.id,
      tier: 'fallback_1',
      positionDescription:
        'Aggregate liability capped at 2x annual fees. Confidentiality breach carved out up to a separate super-cap of 3x annual fees. IP indemnity and gross negligence remain uncapped.',
      approvalLevelRequired: 'gc',
      rationale:
        'Reserved for strategic deals (>$1M ARR) or counterparties with strong leverage. Requires GC sign-off to manage precedent risk.',
      version: 1,
    },
  })

  // Example counterparty drafts so the review workflow has something to chew on.
  await payload.create({
    collection: 'counterparty-drafts',
    data: {
      industry: 'finserv',
      counterpartyType: 'customer',
      counterpartySize: 'ent',
      dealValueBand: 'gt_1m',
      termLength: '2_3y',
      urgency: 'medium',
      clauseFamily: lol.id,
      subClause: generalCap.id,
      clauseText:
        "Each party's aggregate liability under this Agreement is limited to the fees paid by Customer to Vendor in the 24 months preceding the event giving rise to the claim. The foregoing limitation does not apply to a party's breach of confidentiality, indemnification obligations, or gross negligence or wilful misconduct.",
      source: 'synthetic',
    },
  })

  await payload.create({
    collection: 'counterparty-drafts',
    data: {
      industry: 'saas',
      counterpartyType: 'customer',
      counterpartySize: 'mid',
      dealValueBand: '250k_1m',
      termLength: '1y',
      urgency: 'high',
      clauseFamily: lol.id,
      subClause: generalCap.id,
      clauseText:
        "Vendor's aggregate liability shall not exceed three (3) times the total fees paid in the preceding twelve (12) months. Customer's liability is uncapped. Liability for breach of confidentiality, IP indemnification, and gross negligence shall be uncapped on both sides.",
      source: 'synthetic',
    },
  })

  payload.logger.info('[seed] Done.')
}

async function getOrCreateNamed(
  payload: Payload,
  collection: 'clause-families' | 'sub-clauses',
  name: string,
) {
  const found = await payload.find({
    collection,
    where: { name: { equals: name } },
    limit: 1,
  })
  if (found.docs[0]) return found.docs[0]
  return payload.create({ collection, data: { name } })
}
