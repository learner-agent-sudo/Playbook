import type { CollectionConfig } from 'payload'

import {
  counterpartySizeOptions,
  counterpartyTypeOptions,
  dealValueBandOptions,
  industryOptions,
  termLengthOptions,
  urgencyOptions,
} from './options'

/**
 * One incoming clause to be reviewed, with the deal context that surrounds it.
 * In chunk 2 we'll match each draft to the relevant playbook entries.
 */
export const CounterpartyDrafts: CollectionConfig = {
  slug: 'counterparty-drafts',
  labels: {
    singular: 'Counterparty draft',
    plural: 'Counterparty drafts',
  },
  admin: {
    useAsTitle: 'clauseText',
    defaultColumns: [
      'clauseFamily',
      'subClause',
      'industry',
      'counterpartySize',
      'dealValueBand',
      'createdAt',
    ],
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Deal context',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'industry',
              type: 'select',
              required: true,
              options: [...industryOptions],
            },
            {
              name: 'counterpartyType',
              type: 'select',
              required: true,
              options: [...counterpartyTypeOptions],
            },
            {
              name: 'counterpartySize',
              type: 'select',
              required: true,
              options: [...counterpartySizeOptions],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dealValueBand',
              type: 'select',
              required: true,
              options: [...dealValueBandOptions],
            },
            {
              name: 'termLength',
              type: 'select',
              required: true,
              options: [...termLengthOptions],
            },
            {
              name: 'urgency',
              type: 'select',
              required: true,
              options: [...urgencyOptions],
            },
          ],
        },
      ],
    },
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
      name: 'clauseText',
      type: 'textarea',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'synthetic',
    },
  ],
  timestamps: true,
}
