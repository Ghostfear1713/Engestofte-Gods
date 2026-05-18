import { motion } from 'framer-motion'
import styles from './Step1_ServiceSelect.module.css'

const services = [
  {
    id: 'wedding',
    label: 'Bryllup',
    emoji: '💍',
    description: 'Ceremoni, middag & dans i historiske rammer',
    staff: 'Johan tager sig personligt af jeres bryllup',
    staffShort: 'Johan Borup Jensen',
    bg: '#2d3a24',
  },
  {
    id: 'party',
    label: 'Fest & Fejring',
    emoji: '🥂',
    description: 'Runde fødselsdage, jubilæer & konfirmationer',
    staff: 'Johan hjælper med at skræddersyr jeres fest',
    staffShort: 'Johan Borup Jensen',
    bg: '#3a2d1e',
  },
  {
    id: 'conference',
    label: 'Konference',
    emoji: '🤝',
    description: 'Møder & firmaarrangementer med naturskøn ramme',
    staff: 'Johan sørger for de perfekte rammer for jeres møde',
    staffShort: 'Johan Borup Jensen',
    bg: '#1e2a35',
  },
  {
    id: 'hunting',
    label: 'Jagt',
    emoji: '🦌',
    description: 'Fasanjagt & stalking i Naturpark Maribosøerne',
    staff: 'Lise arrangerer personligt jeres jagtoplevelse',
    staffShort: 'Lise Egeskov',
    bg: '#24341e',
  },
  {
    id: 'summer_house',
    label: 'Sommerhus',
    emoji: '🏡',
    description: 'Fem unikke boliger direkte på godset',
    staff: 'Lise hjælper jer med at finde det rette hus',
    staffShort: 'Lise Egeskov',
    bg: '#3a2a1a',
  },
  {
    id: 'other',
    label: 'Noget andet?',
    emoji: '✉️',
    description: 'Har I en idé, et spørgsmål eller noget helt unikt i tankerne?',
    note: '— Intet er for stort eller for lille.',
    staff: 'Mette svarer personligt på jeres henvendelse',
    staffShort: 'Mette Egeskov',
    bg: '#2a2a3a',
    isOther: true,
  },
]

export default function Step1_ServiceSelect({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hvad kan vi hjælpe med?</h1>
        <p className={styles.subtitle}>
          Vælg det der passer jer bedst — vi skræddersyr alt til jeres ønsker
        </p>
      </div>

      <div className={styles.grid}>
        {services.map((service, i) => {
          const selected = value === service.id
          return (
            <motion.button
              key={service.id}
              className={`${styles.card} ${selected ? styles.cardSelected : ''} ${service.isOther ? styles.cardOther : ''}`}
              onClick={() => onChange(service.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: 'easeOut' }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={selected}
            >
              <div
                className={styles.cardBg}
                style={{ background: service.bg }}
              />
              <div className={styles.cardContent}>
                <span className={styles.emoji}>{service.emoji}</span>
                <span className={styles.cardLabel}>{service.label}</span>
                <span className={styles.cardDesc}>
                  {service.description}
                  {service.note && (
                    <><br /><span className={styles.cardNote}>{service.note}</span></>
                  )}
                </span>
              </div>

              {selected && (
                <motion.div
                  className={styles.staffBadge}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className={styles.staffDot} />
                  <span>{service.staff}</span>
                </motion.div>
              )}

              {selected && (
                <motion.div
                  className={styles.checkmark}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export { services }
