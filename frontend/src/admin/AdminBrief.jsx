import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminAuth, API } from './useAdminAuth'
import styles from './AdminBrief.module.css'

export default function AdminBrief() {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const { authHeaders } = useAdminAuth()

  useEffect(() => {
    fetch(`${API}/api/admin/brief`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setBrief(data.brief)
        setStats(data.stats || null)
      })
      .catch(() => setBrief('Velkommen til administrationen.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loading"
            className={styles.skeleton}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
            <div className={styles.skeletonLine} style={{ width: '45%' }} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className={styles.content}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className={styles.briefText}>{brief}</p>

            {stats && (
              <motion.div
                className={styles.statRow}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              >
                <Stat label="Nye" value={stats.ny} highlight={stats.ny > 0} />
                <Stat label="Kontaktet" value={stats.kontaktet} />
                <Stat label="Bekræftet" value={stats.bekræftet} />
                <Stat label="Seneste 24t" value={stats.recent} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`${styles.stat} ${highlight ? styles.statHighlight : ''}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
