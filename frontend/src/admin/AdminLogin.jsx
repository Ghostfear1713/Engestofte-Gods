import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth, API } from './useAdminAuth'
import styles from './Admin.module.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login fejlede'); return }
      login(data.token)
      navigate('/admin')
    } catch {
      setError('Kunne ikke forbinde til serveren')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>Engestofte Gods</div>
        <p className={styles.loginSub}>Medarbejderportal</p>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.loginField}>
            <label>Brugernavn</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="engestofte"
              autoComplete="username"
              required
            />
          </div>
          <div className={styles.loginField}>
            <label>Adgangskode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Logger ind…' : 'Log ind'}
          </button>
        </form>
      </div>
    </div>
  )
}
