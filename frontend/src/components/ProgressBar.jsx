import styles from './ProgressBar.module.css'

const STEP_LABELS = {
  0: 'Ydelse',
  1: 'Detaljer',
  2: 'Pris',
  3: 'Kontakt',
  4: 'Bekræftelse',
}

export default function ProgressBar({ current, flow }) {
  const steps = flow.map((realStep) => STEP_LABELS[realStep])
  const total = steps.length

  return (
    <div className={styles.wrapper} role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current

        return (
          <>
            {/* Step: dot stacked above label */}
            <div key={`step-${i}`} className={styles.stepItem}>
              <div className={`${styles.dot} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`${styles.label} ${active ? styles.labelActive : ''}`}>{label}</span>
            </div>

            {/* Connector line — only between steps, never after the last */}
            {i < total - 1 && (
              <div key={`line-${i}`} className={`${styles.line} ${done ? styles.lineDone : ''}`} />
            )}
          </>
        )
      })}
    </div>
  )
}
