import { createHmac } from 'crypto'

function createJWT(payload: object, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })
  ).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    return sendRedirect(event, '/?error=no_code', 302)
  }

  const config = useRuntimeConfig()
  const clientId = config.public.googleClientId as string
  const clientSecret = config.googleClientSecret as string
  const secret = process.env.AUTH_SECRET || 'change-this-secret'

  // Recover the exact redirectUri and returnPath from state param
  const stateParam = query.state as string | undefined
  let redirectUri: string
  let returnPath = '/dashboard'

  try {
    if (stateParam) {
      const stateData = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'))
      redirectUri = stateData.redirectUri || `${process.env.AUTH_ORIGIN || 'http://localhost:3000'}/api/auth/callback`
      returnPath = stateData.returnPath || '/dashboard'
    } else {
      redirectUri = `${process.env.AUTH_ORIGIN || 'http://localhost:3000'}/api/auth/callback`
    }
  } catch {
    redirectUri = `${process.env.AUTH_ORIGIN || 'http://localhost:3000'}/api/auth/callback`
  }

  try {
    // Exchange auth code for access token
    const tokenRes = await $fetch<any>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    // Get user profile from Google
    const profile = await $fetch<any>('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` },
    })

    // Check allowed email domains
    const allowedDomains = ['lsu.edu.ph', 'gmail.com', 'yahoo.com', 'aptitudeentertainment.com', 'outlook.com', 'microsoft.com', 'techsavvies.space']
    const emailDomain = (profile.email || '').split('@')[1]
    if (!allowedDomains.includes(emailDomain)) {
      return sendRedirect(event, '/?error=unauthorized', 302)
    }

    // Create JWT
    const jwt = createJWT(
      { id: profile.sub, name: profile.name, email: profile.email, picture: profile.picture },
      secret
    )

    // Always redirect to /dashboard on successful login
    return sendRedirect(event, `/dashboard?token=${jwt}`, 302)
  } catch (err) {
    console.error('OAuth callback error:', err)
    return sendRedirect(event, '/?error=oauth_failed', 302)
  }
})

