import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { ClauseFamilies } from './collections/ClauseFamilies'
import { CounterpartyDrafts } from './collections/CounterpartyDrafts'
import { NegotiationLogEntries } from './collections/NegotiationLogEntries'
import { PlaybookEntries } from './collections/PlaybookEntries'
import { SubClauses } from './collections/SubClauses'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Contract Playbook',
    },
  },
  collections: [
    Users,
    ClauseFamilies,
    SubClauses,
    PlaybookEntries,
    CounterpartyDrafts,
    NegotiationLogEntries,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
