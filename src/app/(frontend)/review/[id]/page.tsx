import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import {
  counterpartySizeOptions,
  counterpartyTypeOptions,
  dealValueBandOptions,
  industryOptions,
  termLengthOptions,
  urgencyOptions,
} from '@/collections/options'

import { ReviewForm } from './ReviewForm'
import { submitReview } from './actions'
import '../review.css'

const labelFor = (
  options: readonly { label: string; value: string }[],
  value: string,
) => options.find((o) => o.value === value)?.label ?? value

const tierLabel = (tier: string) =>
  ({
    ideal: 'Ideal',
    acceptable: 'Acceptable',
    fallback_1: 'Fallback 1',
    fallback_2: 'Fallback 2',
    walk_away: 'Walk-away',
  })[tier] ?? tier

const approvalLabel = (level: string) =>
  ({
    self: 'Self',
    senior_counsel: 'Senior counsel',
    gc: 'GC',
    cfo: 'CFO',
    ceo: 'CEO',
  })[level] ?? level

export default async function ReviewDraftPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  if (!user) redirect(`/admin/login?redirect=/review/${id}`)

  let draft
  try {
    draft = await payload.findByID({
      collection: 'counterparty-drafts',
      id,
      depth: 1,
    })
  } catch {
    notFound()
  }

  const familyId =
    typeof draft.clauseFamily === 'object'
      ? draft.clauseFamily.id
      : draft.clauseFamily
  const subId =
    typeof draft.subClause === 'object' ? draft.subClause.id : draft.subClause
  const familyName =
    typeof draft.clauseFamily === 'object' ? draft.clauseFamily.name : ''
  const subName =
    typeof draft.subClause === 'object' ? draft.subClause.name : ''

  // Match the draft to playbook entries with the same clause family + sub-clause.
  // Sort by tier so the ideal position appears first.
  const tierOrder = ['ideal', 'acceptable', 'fallback_1', 'fallback_2', 'walk_away']
  const playbookResult = await payload.find({
    collection: 'playbook-entries',
    where: {
      and: [
        { clauseFamily: { equals: familyId } },
        { subClause: { equals: subId } },
      ],
    },
    depth: 0,
    limit: 100,
  })
  const playbookEntries = [...playbookResult.docs].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier),
  )

  // Has this draft already been reviewed? If yes, surface that instead of the form.
  const existingLog = await payload.find({
    collection: 'negotiation-log-entries',
    where: { counterpartyDraft: { equals: id } },
    limit: 1,
    depth: 0,
  })
  const alreadyReviewed = existingLog.docs[0]

  return (
    <div className="review-page">
      <div className="crumb">
        <Link href="/">Home</Link> &nbsp;·&nbsp;{' '}
        <Link href="/review">Review</Link> &nbsp;·&nbsp; Draft #{draft.id}
      </div>
      <h1>
        {familyName} · {subName}
      </h1>

      <div className="panels">
        <div className="panel">
          <h2>Counterparty draft</h2>
          <dl className="context-grid">
            <dt>Industry</dt>
            <dd>{labelFor(industryOptions, draft.industry)}</dd>
            <dt>Counterparty type</dt>
            <dd>{labelFor(counterpartyTypeOptions, draft.counterpartyType)}</dd>
            <dt>Size</dt>
            <dd>{labelFor(counterpartySizeOptions, draft.counterpartySize)}</dd>
            <dt>Deal value</dt>
            <dd>{labelFor(dealValueBandOptions, draft.dealValueBand)}</dd>
            <dt>Term</dt>
            <dd>{labelFor(termLengthOptions, draft.termLength)}</dd>
            <dt>Urgency</dt>
            <dd>{labelFor(urgencyOptions, draft.urgency)}</dd>
          </dl>
          <div className="clause-text">{draft.clauseText}</div>
        </div>

        <div className="panel">
          <h2>Playbook positions</h2>
          {playbookEntries.length === 0 ? (
            <p style={{ color: 'rgb(120,120,120)' }}>
              No playbook entries for this clause yet.{' '}
              <Link href="/admin/collections/playbook-entries/create">
                Add one
              </Link>
              .
            </p>
          ) : (
            <div className="tier-cards">
              {playbookEntries.map((entry) => (
                <div key={entry.id} className={`tier-card tier-${entry.tier}`}>
                  <div className="tier-header">
                    <span className="tier-name">{tierLabel(entry.tier)}</span>
                    <span className="approval">
                      Approval: {approvalLabel(entry.approvalLevelRequired)}
                    </span>
                  </div>
                  <p className="position">{entry.positionDescription}</p>
                  {entry.rationale && (
                    <p className="rationale">{entry.rationale}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {alreadyReviewed ? (
        <div className="banner-success">
          This draft has already been reviewed.{' '}
          <Link href={`/admin/collections/negotiation-log-entries/${alreadyReviewed.id}`}>
            View the log entry
          </Link>{' '}
          or <Link href="/review">return to the queue</Link>.
        </div>
      ) : (
        <ReviewForm
          draftId={draft.id}
          draftClauseText={draft.clauseText}
          playbookEntries={playbookEntries.map((e) => ({
            id: e.id,
            tier: e.tier,
            approvalLevelRequired: e.approvalLevelRequired,
          }))}
          submitAction={submitReview}
        />
      )}
    </div>
  )
}
