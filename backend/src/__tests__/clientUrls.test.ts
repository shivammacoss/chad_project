import { describe, it, expect, afterEach } from 'vitest'
import { clientUrlList, primaryClientUrl, isAllowedOrigin } from '../lib/clientUrls.js'

const ORIG = process.env.CLIENT_URL
const ORIG_VERCEL = process.env.ALLOW_VERCEL_PREVIEWS
afterEach(() => {
  process.env.CLIENT_URL = ORIG
  process.env.ALLOW_VERCEL_PREVIEWS = ORIG_VERCEL
})

describe('client URL / CORS helpers', () => {
  it('strips trailing slashes and splits a comma list', () => {
    process.env.CLIENT_URL = 'https://a.vercel.app/, https://b.com'
    expect(clientUrlList()).toEqual(['https://a.vercel.app', 'https://b.com'])
    expect(primaryClientUrl()).toBe('https://a.vercel.app')
  })

  it('allows a configured origin regardless of trailing slash', () => {
    process.env.CLIENT_URL = 'https://chad-project-eight.vercel.app/'
    expect(isAllowedOrigin('https://chad-project-eight.vercel.app')).toBe(true)
    expect(isAllowedOrigin('https://evil.com')).toBe(false)
  })

  it('allows *.vercel.app previews only when ALLOW_VERCEL_PREVIEWS=true', () => {
    process.env.CLIENT_URL = 'https://prod.vercel.app'
    process.env.ALLOW_VERCEL_PREVIEWS = 'true'
    expect(isAllowedOrigin('https://chad-project-xyz-123.vercel.app')).toBe(true)
    process.env.ALLOW_VERCEL_PREVIEWS = 'false'
    expect(isAllowedOrigin('https://chad-project-xyz-123.vercel.app')).toBe(false)
  })
})
