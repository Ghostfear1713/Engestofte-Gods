import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'
import styles from './Admin.module.css'

export default function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.sidebarLogoText}>Engestofte Gods</span>
          <span className={styles.sidebarLogoSub}>Admin</span>
        </div>

        <nav className={styles.sidebarNav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            📋 Forespørgsler
          </NavLink>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log ud
        </button>
      </aside>

      <main className={styles.adminMain}>
        <Outlet />
      </main>
    </div>
  )
}
