export const useAuth = () => {
  const user = useState('auth_user', () => null)
  const token = useState('auth_token', () => null)

  const isLoggedIn = computed(() => !!token.value)

  // Call on app/page mount to hydrate from localStorage
  const init = () => {
    if (!process.client) return
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (storedToken) token.value = storedToken
    if (storedUser) {
      try { user.value = JSON.parse(storedUser) } catch {}
    }
  }

  // Store JWT from OAuth callback and decode user info
  const setAuth = (jwt) => {
    if (!process.client) return
    try {
      // Decode base64url payload (middle part of JWT)
      const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      const userData = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        image: payload.picture,
      }
      localStorage.setItem('auth_token', jwt)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      token.value = jwt
      user.value = userData
    } catch (e) {
      console.error('Failed to decode JWT', e)
    }
  }

  const login = () => {
    window.location.href = '/api/auth/google'
  }

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  return { user, token, isLoggedIn, init, setAuth, login, logout }
}

