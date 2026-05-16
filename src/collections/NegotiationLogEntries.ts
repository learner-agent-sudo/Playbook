import type { CollectionConfig } from 'payload'

import { approvalLevelOptions, matchTypeOptions } from './options'

/**
 * One closed negotiation on one clause.
 *
 * Links to the counterparty draft we reviewed and (usually) to the playbook
 * entry whose tier we landed on. Leave `playbookEntry` blank for novel
 * positions that didn't match any existing playbook tier (set
 * `matchType` to `out_of_playbook`).
 *
 * The commercial justification is four separate fields rather than one
 * free-text blob — this is what makes the pattern view in chunk 3 useful.
 * Justification is only required when `matchType` is not `ideal`
 * (i.e. when we conceded from our preferred position).
 */
export const NegotiationLogEntries: CollectionConfig = {
  slug: 'negotiation-log-entries',
  labels: {
    singular: 'Negotiation log entry',
    plural: 'Negotiation log entries',
  },
  admin: {
    useAsTitle: 'finalPosition',
    defaultColumns: [
      'counterpartyDraft',
      'matchType',
      'playbookEntry',
      'approvalLevelUsed',
      'dateClosed',
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'counterpartyDraft',
          type: 'relationship',
          relationTo: 'counterparty-drafts',
          required: true,
        },
        {
          name: 'matchType',
          type: 'select',
          required: true,
          options: [...matchTypeOptions],
        },
      ],
    },
    {
      name: 'playbookEntry',
      type: 'relationship',
      relationTo: 'playbook-entries',
      admin: {
        description:
          'Leave blank only if matchType is "Out of playbook".',
      },
    },
    {
      name: 'finalPosition',
      type: 'textarea',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'approvalLevelUsed',
          type: 'select',
          required: true,
          options: [...approvalLevelOptions],
        },
        {
          name: 'dateClosed',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'whatWasTraded',
      type: 'textarea',
      admin: {
        description: 'What did we give up in exchange for landing here?',
      },
    },
    {
      type: 'collapsible',
      label: 'Commercial justification (required for concessions)',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'leverage',
          label: 'Counterparty leverage',
          type: 'textarea',
          admin: {
            description:
              "Why the counterparty had (or didn't have) the power to push this position.",
          },
        },
        {
          name: 'riskAssessment',
          label: 'Risk assessment',
          type: 'textarea',
          admin: {
            description: 'How material the residual risk is in this deal.',
          },
        },
        {
          name: 'tradeOrContext',
          label: 'Trade or context',
          type: 'textarea',
          admin: {
            description:
              'What was exchanged or the commercial context driving the decision.',
          },
        },
        {
          name: 'precedentManagement',
          label: 'Precedent management',
          type: 'textarea',
          admin: {
            description: 'How this affects precedent across future deals.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
