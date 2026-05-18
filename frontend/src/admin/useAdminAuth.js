const KEY = 'engestofte_admin_token'

export function useAdminAuth() {
  const token = localStorage.getItem(KEY)

  const login = (t) => localStorage.setItem(KEY, t)
  const logout = () => localStorage.removeItem(KEY)

  const authHeaders = () => ({ Authorization: `Bearer ${token}` })

  return { token, login, logout, authHeaders }
}

export const API = 'http://localhost:5000'
