import styles from './SiteHeader.module.css'

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <a
        href="https://www.engestofte.com/da/home"
        className={styles.backLink}
        aria-label="Tilbage til Engestofte Gods"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tilbage
      </a>

      <div className={styles.logo}>
        <span className={styles.logoText}>Engestofte Gods</span>
        <span className={styles.logoDivider}>·</span>
        <span className={styles.logoSub}>Forespørgsel</span>
      </div>

      <a
        href="https://www.engestofte.com/da/kontakt"
        className={styles.contactLink}
      >
        Kontakt
      </a>
    </header>
  )
}
