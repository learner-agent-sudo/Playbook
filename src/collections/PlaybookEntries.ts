import type { CollectionConfig } from 'payload'

import { approvalLevelOptions, tierOptions } from './options'

/**
 * One position on one clause family + sub-clause at one tier.
 *
 * Tiers run from "ideal" (the position we'd love to land) to "walk-away"
 * (we'd rather not sign than concede past this). Each entry carries its
 * own approval level so we know who has to sign off when landing here.
 */
export const PlaybookEntries: CollectionConfig = {
  slug: 'playbook-entries',
  labels: {
    singular: 'Playbook entry',
    plural: 'Playbook entries',
  },
  admin: {
    useAsTitle: 'positionDescription',
    defaultColumns: [
      'clauseFamily',
      'subClause',
      'tier',
      'approvalLevelRequired',
      'version',
      'updatedAt',
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'clauseFamily',
          type: 'relationship',
          relationTo: 'clause-families',
          required: true,
        },
        {
          name: 'subClause',
          type: 'relationship',
          relationTo: 'sub-clauses',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tier',
          type: 'select',
          required: true,
          options: [...tierOptions],
        },
        {
          name: 'approvalLevelRequired',
          type: 'select',
          required: true,
          options: [...approvalLevelOptions],
        },
        {
          name: 'version',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 1,
        },
      ],
    },
    {
      name: 'positionDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'rationale',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
