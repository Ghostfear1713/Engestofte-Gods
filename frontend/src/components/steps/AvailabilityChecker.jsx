import { useEffect, useState, useRef } from 'react'
import styles from './AvailabilityChecker.module.css'

const API = 'http://localhost:5000'

const MONTH_NAMES = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']

function fmtDate(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${parseInt(d)}. ${MONTH_NAMES[parseInt(m) - 1]}`
}

export default function AvailabilityChecker({ date, onSelectDate }) {
  const [status, setStatus] = useState(null) // null | 'checking' | 'available' | 'taken'
  const [suggestions, setSuggestions] = useState([])
  const [aiMessage, setAiMessage] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!date) { setStatus(null); return }

    setStatus('checking')
    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/availability?date=${date}`)
        const data = await res.json()

        if (data.available) {
          setStatus('available')
          setSuggestions([])
          setAiMessage('')
        } else {
          setStatus('taken')
          setSuggestions(data.suggestions || [])
          setAiMessage(data.ai_message || '')
        }
      } catch {
        setStatus(null)
      }
    }, 600)

    return () => clearTimeout(timerRef.current)
  }, [date])

  if (!status || !date) return null

  if (status === 'checking') {
    return (
      <div className={styles.checking}>
        <span className={styles.spinner} />
        Tjekker tilgængelighed…
      </div>
    )
  }

  if (status === 'available') {
    return (
      <div className={styles.available}>
        <span className={styles.iconOk}>✓</span>
        Datoen ser ledig ud — godt valg!
      </div>
    )
  }

  // taken
  return (
    <div className={styles.taken}>
      <div className={styles.takenHeader}>
        <span className={styles.iconWarn}>!</span>
        <span>
          {aiMessage || `Den ${fmtDate(date)} er allerede reserveret.`}
        </span>
      </div>

      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <span className={styles.suggestLabel}>Ledige datoer i nærheden:</span>
          <div className={styles.suggestionBtns}>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className={styles.suggestionBtn}
                onClick={() => onSelectDate && onSelectDate(s)}
              >
                {fmtDate(s)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
