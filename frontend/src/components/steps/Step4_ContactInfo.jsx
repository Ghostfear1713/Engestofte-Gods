import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Step4_ContactInfo.module.css'

const PHONE_RE = /^[+\d][\d\s\-().]*$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Step4_ContactInfo({ data, onChange, errors, isOther }) {
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value })
  }

  const handlePhoneChange = (value) => {
    // Only allow digits, +, spaces, dashes, dots, parentheses
    if (value && !PHONE_RE.test(value)) {
      setPhoneError('Telefonnummer må kun indeholde tal og + tegn')
    } else {
      setPhoneError('')
    }
    handleChange('phone', value)
  }

  const handleEmailBlur = (value) => {
    if (value && !EMAIL_RE.test(value)) {
      setEmailError('Emailadressen ser ikke rigtig ud — tjek venligst formatet')
    } else {
      setEmailError('')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isOther ? 'Skriv til os' : 'Jeres kontaktoplysninger'}
        </h2>
        <p className={styles.sub}>
          {isOther
            ? 'Intet er for stort eller for lille — Mette læser personligt jeres besked'
            : 'Så vi kan tage en personlig kontakt til jer hurtigst muligt'}
        </p>
      </div>

      <motion.div
        className={styles.fields}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.row}>
          <Field label="Navn" error={errors?.name}>
            <input
              type="text"
              className={`${styles.input} ${errors?.name ? styles.inputError : ''}`}
              value={data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Jeres navn"
              autoComplete="name"
            />
          </Field>

          <Field label="Telefon" hint="(anbefalet)" error={phoneError}>
            <input
              type="tel"
              className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
              value={data.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+45 12 34 56 78"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
        </div>

        <Field label="Email" error={errors?.email || emailError}>
          <input
            type="email"
            className={`${styles.input} ${errors?.email || emailError ? styles.inputError : ''}`}
            value={data.email || ''}
            onChange={(e) => {
              handleChange('email', e.target.value)
              if (emailError) handleEmailBlur(e.target.value)
            }}
            onBlur={(e) => handleEmailBlur(e.target.value)}
            placeholder="jeres@email.dk"
            autoComplete="email"
            inputMode="email"
          />
          {data.email && !errors?.email && !emailError && (
            <motion.p
              className={styles.emailHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Vi svarer typisk inden for én hverdag på {data.email}
            </motion.p>
          )}
        </Field>

        <Field label="Besked" hint="(valgfri)">
          <textarea
            className={styles.textarea}
            value={data.message || ''}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder={isOther
              ? 'Fortæl os om jeres idé, spørgsmål eller ønske — vi glæder os til at høre fra jer…'
              : 'Fortæl os gerne mere om jeres drøm og hvad der er vigtigt for jer…'}
            rows={4}
          />
        </Field>

        <div className={styles.gdprField}>
          <label className={`${styles.gdprLabel} ${errors?.gdpr ? styles.gdprError : ''}`}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={data.gdpr_consent || false}
              onChange={(e) => handleChange('gdpr_consent', e.target.checked)}
            />
            <span>
              Jeg accepterer, at Engestofte Gods opbevarer mine oplysninger for at
              besvare min forespørgsel, i overensstemmelse med GDPR.{' '}
              <a
                href="https://www.engestofte.com/da/privatlivspolitik"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.gdprLink}
              >
                Læs privatlivspolitik
              </a>
            </span>
          </label>
          {errors?.gdpr && (
            <p className={styles.errorMsg}>Du skal acceptere for at sende forespørgslen</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {hint && <span className={styles.hint}>{hint}</span>}
      </label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}
