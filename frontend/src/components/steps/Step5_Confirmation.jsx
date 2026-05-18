import { motion } from 'framer-motion'
import { formatDKK, STAFF, calculatePrice } from '../../utils/pricing'
import styles from './Step5_Confirmation.module.css'

const SERVICE_LABELS = {
  wedding:      'Bryllup',
  party:        'Fest & Fejring',
  conference:   'Konference',
  hunting:      'Jagt',
  summer_house: 'Sommerhus',
}

export default function Step5_Confirmation({ service, details, contact, reference }) {
  const staff = STAFF[service]
  const firstName = contact?.name?.split(' ')[0] || ''
  const priceResult = calculatePrice(service, details)

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.checkCircle}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
      >
        <svg viewBox="0 0 52 52" className={styles.checkSvg}>
          <motion.path
            d="M14 27 L22 35 L38 18"
            stroke="white"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h1 className={styles.title}>
          Tak{firstName ? `, ${firstName}` : ''} — vi glæder os til at høre mere!
        </h1>
        <p className={styles.body}>
          Jeres forespørgsel er modtaget. <strong>{staff?.name}</strong> kontakter jer på{' '}
          <strong>{contact?.email}</strong> inden for én hverdag.
        </p>

        <div className={styles.refBadge}>
          Reference: <strong>{reference}</strong>
        </div>

        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Opsummering</h3>

          <div className={styles.summaryRows}>
            <SummaryRow label="Ydelse" value={SERVICE_LABELS[service]} />
            {details.date && (
              <SummaryRow label="Dato" value={new Intl.DateTimeFormat('da-DK', { dateStyle: 'long' }).format(new Date(details.date))} />
            )}
            {details.guests && (
              <SummaryRow
                label={service === 'hunting' ? 'Skytter' : service === 'summer_house' ? 'Gæster' : 'Gæster'}
                value={details.guests}
              />
            )}
            {details.venue && (
              <SummaryRow
                label="Lokale"
                value={details.venue === 'barn' ? 'Den Gamle Lade' : 'Værkstedet'}
              />
            )}
            {details.birds && (
              <SummaryRow label="Fugle" value={`${details.birds} stk.`} />
            )}
            {!priceResult.priceOnRequest && priceResult.total > 0 && (
              <SummaryRow
                label="Estimeret pris"
                value={`fra ${formatDKK(priceResult.total)}`}
                highlight
              />
            )}
            {priceResult.priceOnRequest && (
              <SummaryRow label="Pris" value="Aftales individuelt" />
            )}
          </div>
        </div>

        <div className={styles.staffNote}>
          <div className={styles.staffAvatar}>
            {staff?.name?.split(' ').map(w => w[0]).slice(0,2).join('')}
          </div>
          <p>
            <strong>{staff?.name}</strong> er klar til at hjælpe og kan også nås på{' '}
            <a href={`tel:${staff?.phone?.replace(/\s/g,'')}`} className={styles.link}>
              {staff?.phone}
            </a>
          </p>
        </div>

        <div className={styles.socialRow}>
          <p className={styles.socialText}>Følg Engestofte Gods og lad jer inspirere</p>
          <div className={styles.socialLinks}>
            <a
              href="https://www.instagram.com/engestoftegods"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/engestofte"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
            >
              Facebook
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className={`${styles.summaryRow} ${highlight ? styles.summaryHighlight : ''}`}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={styles.summaryValue}>{value}</span>
    </div>
  )
}
