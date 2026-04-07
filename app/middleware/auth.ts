export default defineNuxtRouteMiddleware((to) => {
  // Only run on client — localStorage is not available on server
  if (process.server) return

  // Allow access when the OAuth callback just redirected here with a token in
  // the URL — onMounted will save it to localStorage via setAuth()
  if (to.query.token) return

  const token = localStorage.getItem('auth_token')
  if (!token) {
    return navigateTo('/login')
  }
})

