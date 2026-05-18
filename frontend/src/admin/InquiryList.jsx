import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth, API } from './useAdminAuth'
import AdminBrief from './AdminBrief'
import styles from './Admin.module.css'

const STATUS_COLORS = {
  ny:          '#e8f4fd',
  kontaktet:   '#fff8e1',
  bekræftet:   '#e8f5e9',
  annulleret:  '#fce4ec',
}

const STATUS_TEXT = {
  ny:          'Ny',
  kontaktet:   'Kontaktet',
  bekræftet:   'Bekræftet',
  annulleret:  'Annulleret',
}

const SERVICE_LABELS = {
  wedding:      'Bryllup',
  party:        'Fest & Fejring',
  conference:   'Konference',
  hunting:      'Jagt',
  summer_house: 'Sommerhus',
  other:        'Anden henvendelse',
}

export default function InquiryList() {
  const [inquiries, setInquiries] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const { authHeaders, logout } = useAdminAuth()
  const navigate = useNavigate()

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const url = filter === 'all'
        ? `${API}/api/admin/inquiries`
        : `${API}/api/admin/inquiries?status=${filter}`
      const [inqRes, statsRes] = await Promise.all([
        fetch(url, { headers: authHeaders() }),
        fetch(`${API}/api/admin/stats`, { headers: authHeaders() }),
      ])

      // If token expired, redirect to login
      if (inqRes.status === 401) {
        logout()
        navigate('/admin/login')
        return
      }

      const inqData = await inqRes.json()
      const statsData = await statsRes.json()
      setInquiries(Array.isArray(inqData) ? inqData : [])
      setStats(typeof statsData === 'object' && !Array.isArray(statsData) ? statsData : {})
      setLastUpdated(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 15000)
    return () => clearInterval(interval)
  }, [filter])

  const total = inquiries.length
  const nyCount = stats.ny || 0

  return (
    <div className={styles.listPage}>
      <AdminBrief />

      <div className={styles.listHeader}>
        <div>
          <h1 className={styles.pageTitle}>Forespørgsler</h1>
          <p className={styles.pageSub}>
            {total} {filter === 'all' ? 'total' : STATUS_TEXT[filter]?.toLowerCase()}
            {nyCount > 0 && filter === 'all' && (
              <span className={styles.newBadge}>{nyCount} nye</span>
            )}
          </p>
        </div>
        <div className={styles.refreshRow}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Opdateret {lastUpdated.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button className={styles.refreshBtn} onClick={() => fetchData()}>↻ Opdater nu</button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className={styles.filterTabs}>
        {['all', 'ny', 'kontaktet', 'bekræftet', 'annulleret'].map((s) => (
          <button
            key={s}
            className={`${styles.filterTab} ${filter === s ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Alle' : STATUS_TEXT[s]}
            {s !== 'all' && stats[s] ? ` (${stats[s]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Indlæser…</div>
      ) : inquiries.length === 0 ? (
        <div className={styles.empty}>Ingen forespørgsler fundet</div>
      ) : (
        <div className={styles.inquiryList}>
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={styles.inquiryCard}
              onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
            >
              <div className={styles.inquiryCardLeft}>
                <span className={styles.inquiryRef}>{inq.reference}</span>
                <span className={styles.inquiryName}>{inq.contact?.name || '—'}</span>
                <span className={styles.inquiryService}>{SERVICE_LABELS[inq.service] || inq.service}</span>
              </div>
              <div className={styles.inquiryCardRight}>
                {inq.estimated_price ? (
                  <span className={styles.inquiryPrice}>
                    fra {new Intl.NumberFormat('da-DK').format(inq.estimated_price)} kr.
                  </span>
                ) : (
                  <span className={styles.inquiryPrice}>Pris på forespørgsel</span>
                )}
                <span
                  className={styles.statusBadge}
                  style={{ background: STATUS_COLORS[inq.status] }}
                >
                  {STATUS_TEXT[inq.status] || inq.status}
                </span>
                <span className={styles.inquiryDate}>
                  {new Date(inq.created_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
