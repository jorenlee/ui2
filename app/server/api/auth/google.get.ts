function getOrigin(event: any): string {
  const headers = getRequestHeaders(event)
  // Nginx/proxy sets these headers
  const proto = headers['x-forwarded-proto'] || 'http'
  const host = headers['x-forwarded-host'] || headers['host'] || 'localhost:3000'
  // Use only the first value if comma-separated
  const cleanProto = proto.split(',')[0].trim()
  const cleanHost = host.split(',')[0].trim()
  return `${cleanProto}://${cleanHost}`
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const origin = getOrigin(event)
  const clientId = config.public.googleClientId as string
  const redirectUri = `${origin}/api/auth/callback`

  // Get return path from query params
  const query = getQuery(event)
  const returnPath = (query.return_to as string) || '/dashboard'

  // Create state with both redirectUri and returnPath
  const stateData = JSON.stringify({
    redirectUri,
    returnPath
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account', // Changed to select_account to always show account picker
    // Pass both redirectUri and returnPath in state
    state: Buffer.from(stateData).toString('base64'),
  })

  return sendRedirect(
    event,
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  )
})

