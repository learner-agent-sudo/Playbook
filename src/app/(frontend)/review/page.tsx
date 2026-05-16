import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import {
  counterpartySizeOptions,
  dealValueBandOptions,
  industryOptions,
} from '@/collections/options'

import './review.css'

const labelFor = (
  options: readonly { label: string; value: string }[],
  value: string,
) => options.find((o) => o.value === value)?.label ?? value

export default async function ReviewListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const { saved } = await searchParams
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  if (!user) redirect('/admin/login?redirect=/review')

  const drafts = await payload.find({
    collection: 'counterparty-drafts',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
  })

  const reviewed = await payload.find({
    collection: 'negotiation-log-entries',
    depth: 0,
    limit: 1000,
  })
  const reviewedDraftIds = new Set(
    reviewed.docs.map((log) =>
      typeof log.counterpartyDraft === 'object'
        ? log.counterpartyDraft.id
        : log.counterpartyDraft,
    ),
  )

  const pending = drafts.docs.filter((d) => !reviewedDraftIds.has(d.id))

  return (
    <div className="review-page">
      <div className="crumb">
        <Link href="/">Home</Link> &nbsp;·&nbsp; Review
      </div>
      <h1>Drafts pending review</h1>
      {saved === '1' && (
        <div className="banner-success">Negotiation log saved.</div>
      )}
      <p>
        Each row is an incoming clause that hasn&rsquo;t been logged yet. Click
        through to compare it against the playbook and record a decision.
      </p>

      {pending.length === 0 ? (
        <div className="empty">
          No drafts pending review. Add one via the{' '}
          <Link href="/admin/collections/counterparty-drafts/create">
            admin
          </Link>
          .
        </div>
      ) : (
        <table className="drafts-table">
          <thead>
            <tr>
              <th>Clause</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Value</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pending.map((draft) => {
              const family =
                typeof draft.clauseFamily === 'object'
                  ? draft.clauseFamily.name
                  : draft.clauseFamily
              const sub =
                typeof draft.subClause === 'object'
                  ? draft.subClause.name
                  : draft.subClause
              return (
                <tr key={draft.id}>
                  <td>
                    <strong>{family}</strong> · {sub}
                  </td>
                  <td>
                    <span className="tag">
                      {labelFor(industryOptions, draft.industry)}
                    </span>
                  </td>
                  <td>
                    <span className="tag">
                      {labelFor(counterpartySizeOptions, draft.counterpartySize)}
                    </span>
                  </td>
                  <td>
                    <span className="tag">
                      {labelFor(dealValueBandOptions, draft.dealValueBand)}
                    </span>
                  </td>
                  <td>
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/review/${draft.id}`}>Review →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
