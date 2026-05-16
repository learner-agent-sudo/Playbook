import type { CollectionConfig } from 'payload'

/**
 * Reference list of sub-clauses (e.g. "General cap", "IP indemnity carve-out").
 * Independent of clause families — any sub-clause can pair with any family.
 */
export const SubClauses: CollectionConfig = {
  slug: 'sub-clauses',
  labels: {
    singular: 'Sub-clause',
    plural: 'Sub-clauses',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}
