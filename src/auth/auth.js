// Simple auth mock using localStorage

const AUTH_KEY = 'barber_auth'

// Hardcoded credentials for MVP
const VALID_EMAIL = 'admin@admin.com'
const VALID_PASSWORD = 'admin'

export function login(email, password) {
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    localStorage.setItem(AUTH_KEY, '1')
    return { success: true }
  }
  return { success: false, error: 'Email ou senha inválidos' }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === '1'
}
