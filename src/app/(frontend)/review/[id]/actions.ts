'use server'

import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Server action: take the review form's FormData, validate that the user is
 * signed in, and create a NegotiationLogEntry linked to the draft (and, if
 * the outcome matches a known tier, to the playbook entry for that tier).
 *
 * Returns { error } on failure. On success, redirects back to /review.
 */
export async function submitReview(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const payload = await getPayload({ config: await config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) {
    return { error: 'You must be signed in to submit a review.' }
  }

  const draftId = formData.get('draftId')?.toString()
  const matchType = formData.get('matchType')?.toString()
  const finalPosition = formData.get('finalPosition')?.toString()?.trim()
  const approvalLevelUsed = formData.get('approvalLevelUsed')?.toString()
  const dateClosed = formData.get('dateClosed')?.toString()
  const playbookEntryRaw = formData.get('playbookEntry')?.toString()
  const whatWasTraded = formData.get('whatWasTraded')?.toString()?.trim() || undefined

  if (!draftId || !matchType || !finalPosition || !approvalLevelUsed || !dateClosed) {
    return { error: 'Missing required fields.' }
  }

  const isConcession = matchType !== 'ideal'
  const leverage = formData.get('leverage')?.toString()?.trim()
  const riskAssessment = formData.get('riskAssessment')?.toString()?.trim()
  const tradeOrContext = formData.get('tradeOrContext')?.toString()?.trim()
  const precedentManagement = formData
    .get('precedentManagement')
    ?.toString()
    ?.trim()

  if (
    isConcession &&
    (!leverage || !riskAssessment || !tradeOrContext || !precedentManagement)
  ) {
    return {
      error:
        'Commercial justification is required when the outcome is not the ideal tier.',
    }
  }

  try {
    await payload.create({
      collection: 'negotiation-log-entries',
      data: {
        counterpartyDraft: Number(draftId),
        matchType: matchType as
          | 'ideal'
          | 'acceptable'
          | 'fallback_1'
          | 'fallback_2'
          | 'out_of_playbook',
        playbookEntry: playbookEntryRaw ? Number(playbookEntryRaw) : undefined,
        finalPosition,
        approvalLevelUsed: approvalLevelUsed as
          | 'self'
          | 'senior_counsel'
          | 'gc'
          | 'cfo'
          | 'ceo',
        dateClosed,
        whatWasTraded,
        leverage,
        riskAssessment,
        tradeOrContext,
        precedentManagement,
      },
    })
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Could not save log entry: ${err.message}`
          : 'Could not save log entry.',
    }
  }

  redirect('/review?saved=1')
}
