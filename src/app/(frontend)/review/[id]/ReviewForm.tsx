'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import {
  approvalLevelOptions,
  matchTypeOptions,
} from '@/collections/options'

type PlaybookEntrySummary = {
  id: number | string
  tier: string
  approvalLevelRequired: string
}

type Props = {
  draftId: number | string
  draftClauseText: string
  playbookEntries: PlaybookEntrySummary[]
  submitAction: (formData: FormData) => Promise<{ error?: string } | void>
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Review form for one draft.
 *
 * matchType drives both:
 *  - which playbook entry the log links to (tier name = matchType value,
 *    except "out_of_playbook" which links to none),
 *  - whether the commercial justification section is required (anything
 *    that isn't "ideal" is a concession).
 *
 * We pre-fill finalPosition with the draft text since the most common case
 * is "we accepted what they sent". The user can edit before submitting.
 */
export function ReviewForm({
  draftId,
  draftClauseText,
  playbookEntries,
  submitAction,
}: Props) {
  const [matchType, setMatchType] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isConcession = matchType !== '' && matchType !== 'ideal'
  const isOutOfPlaybook = matchType === 'out_of_playbook'

  const matchingEntryId = useMemo(() => {
    if (!matchType || isOutOfPlaybook) return ''
    const entry = playbookEntries.find((e) => e.tier === matchType)
    return entry ? String(entry.id) : ''
  }, [matchType, isOutOfPlaybook, playbookEntries])

  const suggestedApproval = useMemo(() => {
    if (!matchType || isOutOfPlaybook) return ''
    const entry = playbookEntries.find((e) => e.tier === matchType)
    return entry?.approvalLevelRequired ?? ''
  }, [matchType, isOutOfPlaybook, playbookEntries])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    if (matchingEntryId) formData.set('playbookEntry', matchingEntryId)
    const result = await submitAction(formData)
    if (result && 'error' in result && result.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  // Warn the user if they picked a tier we don't have a playbook entry for.
  const missingEntryWarning =
    matchType &&
    !isOutOfPlaybook &&
    !playbookEntries.find((e) => e.tier === matchType)

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h2>Review decision</h2>
      <input type="hidden" name="draftId" value={String(draftId)} />

      <div className="field">
        <label htmlFor="matchType">Outcome</label>
        <div className="help">
          How does the final position relate to the playbook?
        </div>
        <select
          id="matchType"
          name="matchType"
          required
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
        >
          <option value="">Select…</option>
          {matchTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {missingEntryWarning && (
          <div className="help" style={{ color: 'rgb(180, 60, 30)' }}>
            No playbook entry exists for this tier. The log will be saved
            without a playbook link.
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="finalPosition">Final position</label>
        <div className="help">
          The actual wording or substance we landed on. Pre-filled with the
          draft text — edit if the final language differs.
        </div>
        <textarea
          id="finalPosition"
          name="finalPosition"
          required
          defaultValue={draftClauseText}
          rows={4}
        />
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="approvalLevelUsed">Approval level used</label>
          <select
            id="approvalLevelUsed"
            name="approvalLevelUsed"
            required
            defaultValue={suggestedApproval}
            key={suggestedApproval || 'empty'}
          >
            <option value="">Select…</option>
            {approvalLevelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dateClosed">Date closed</label>
          <input
            type="date"
            id="dateClosed"
            name="dateClosed"
            required
            defaultValue={today()}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="whatWasTraded">What was traded (optional)</label>
        <div className="help">What did we give up in exchange?</div>
        <textarea id="whatWasTraded" name="whatWasTraded" rows={2} />
      </div>

      {isConcession && (
        <div className="justification">
          <h3>Commercial justification</h3>
          <p className="help">
            Required because this is a concession (not the ideal tier). All
            four fields feed the pattern analysis later.
          </p>
          <div className="field">
            <label htmlFor="leverage">Counterparty leverage</label>
            <textarea id="leverage" name="leverage" rows={2} required />
          </div>
          <div className="field">
            <label htmlFor="riskAssessment">Risk assessment</label>
            <textarea
              id="riskAssessment"
              name="riskAssessment"
              rows={2}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="tradeOrContext">Trade or context</label>
            <textarea
              id="tradeOrContext"
              name="tradeOrContext"
              rows={2}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="precedentManagement">Precedent management</label>
            <textarea
              id="precedentManagement"
              name="precedentManagement"
              rows={2}
              required
            />
          </div>
        </div>
      )}

      {error && (
        <div
          className="help"
          style={{
            color: 'rgb(180, 30, 30)',
            marginBottom: '12px',
            marginTop: '8px',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save negotiation log'}
        </button>
        <Link href="/review" className="button secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
