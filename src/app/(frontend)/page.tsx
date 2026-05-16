import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        <h1>Contract Playbook</h1>
        <p>
          {user
            ? `Signed in as ${user.email}.`
            : 'A dynamic playbook for SaaS contract negotiation.'}
        </p>
        <div className="links">
          <Link className="admin" href={payloadConfig.routes.admin}>
            {user ? 'Open admin' : 'Sign in to admin'}
          </Link>
        </div>
      </div>
    </div>
  )
}
