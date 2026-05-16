import type { CollectionConfig } from 'payload'

/**
 * Reference list of clause families (e.g. "Limitation of Liability",
 * "IP Indemnity"). Managed entirely through the admin.
 */
export const ClauseFamilies: CollectionConfig = {
  slug: 'clause-families',
  labels: {
    singular: 'Clause family',
    plural: 'Clause families',
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
