import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculatePrice, formatDKK, STAFF } from '../../utils/pricing'
import styles from './Step3_PriceEstimate.module.css'

function useCountUp(target, duration = 600) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)
  const raf = useRef(null)

  useEffect(() => {
    if (target === null) { setDisplay(null); return }
    const start = prev.current || 0
    const diff = target - start
    const startTime = performance.now()

    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    })

    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return display
}

const DISCLAIMERS = {
  wedding:      'Johan sender jer et detaljeret tilbud inden for 24 timer.',
  party:        'Johan sender jer et tilbud tilpasset jeres fest inden for 24 timer.',
  conference:   'Johan bekræfter tilgængelighed og sender tilbud inden for én hverdag.',
  hunting:      'Lise kontakter jer personligt for at planlægge jagten i detaljer.',
  summer_house: 'Lise kontakter jer med priser og ledige datoer inden for én hverdag.',
}

const PKG_LABELS = {
  full_day: 'Heldagsmøde (8:30–16:30)',
  extended: 'Forlænget dag (8:30–21:30)',
  evening:  'Aftenarrangement (18:00–02:00)',
}

export default function Step3_PriceEstimate({ service, details }) {
  const result = calculatePrice(service, details)
  const animatedTotal = useCountUp(result.total)
  const staff = STAFF[service]
  const guests = parseInt(details.guests) || 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Estimeret pris</h2>
        <p className={styles.sub}>
          Baseret på jeres valg — det endelige tilbud sendes af {staff?.name?.split(' ')[0]}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {result.priceOnRequest ? (
          <motion.div
            key="por"
            className={styles.porCard}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.porEmoji}>🏡</span>
            <p className={styles.porTitle}>Pris aftales individuelt</p>
            <p className={styles.porText}>
              Sommerhuspriserne varierer efter hus, sæson og varighed. Lise finder det
              perfekte match til jer og sender priser hurtigt.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="price"
            className={styles.priceCard}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.totalRow}>
              <span className={styles.fromLabel}>fra</span>
              <span className={styles.totalAmount}>
                {animatedTotal !== null
                  ? formatDKK(animatedTotal)
                  : '—'}
              </span>
            </div>

            {guests < 1 && (
              <p className={styles.noGuests}>
                Angiv antal gæster for at se en beregning
              </p>
            )}

            {result.breakdown.length > 0 && guests > 0 && (
              <motion.div
                className={styles.breakdown}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {result.breakdown.map((item, i) => (
                  <div key={i} className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>{item.label}</span>
                    <span className={styles.breakdownAmount}>{formatDKK(item.amount)}</span>
                  </div>
                ))}
                <div className={styles.breakdownDivider} />
                <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
                  <span>Estimeret total</span>
                  <span>{formatDKK(result.total)}</span>
                </div>
              </motion.div>
            )}

            {service === 'conference' && details.package && (
              <p className={styles.pkgNote}>
                Pakke: {PKG_LABELS[details.package] || details.package}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.disclaimer}>
        <div className={styles.disclaimerIcon}>ℹ</div>
        <p>
          Dette er et estimat uden moms. {DISCLAIMERS[service]} Alle priser er vejledende og
          kan tilpasses jeres ønsker.
        </p>
      </div>

      <div className={styles.staffCard}>
        <div className={styles.staffAvatar}>
          {staff?.name?.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div className={styles.staffInfo}>
          <span className={styles.staffName}>{staff?.name}</span>
          <span className={styles.staffRole}>
            {['wedding','party','conference'].includes(service)
              ? 'Event Manager — Bryllup, Fest & Konference'
              : 'Event Director — Jagt & Sommerhuse'}
          </span>
          <a href={`mailto:${staff?.email}`} className={styles.staffEmail}>{staff?.email}</a>
        </div>
      </div>
    </div>
  )
}
