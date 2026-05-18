import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProgressBar from './ProgressBar'
import Step1_ServiceSelect from './steps/Step1_ServiceSelect'
import Step2_EventDetails, { SidePanelContent } from './steps/Step2_EventDetails'
import Step3_PriceEstimate from './steps/Step3_PriceEstimate'
import Step4_ContactInfo from './steps/Step4_ContactInfo'
import Step5_Confirmation from './steps/Step5_Confirmation'
import styles from './InquiryWizard.module.css'

// Full flow for all services except 'other'
const FULL_STEPS = [0, 1, 2, 3, 4]
// Short flow for 'other': service → contact → confirmation
const SHORT_STEPS = [0, 3, 4]

function generateRef() {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 9000) + 1000)
  return `ENQ-${year}-${num}`
}

function validateStep(realStep, state) {
  const errors = {}

  if (realStep === 0) {
    if (!state.service) errors.service = 'Vælg venligst en ydelse'
  }

  if (realStep === 1) {
    const { service, details } = state
    if (['wedding', 'party', 'conference'].includes(service)) {
      if (!details.guests || parseInt(details.guests) < 1) {
        errors.guests = 'Angiv venligst antal gæster'
      }
    }
    if (service === 'summer_house') {
      if (!details.arrival) errors.arrival = 'Angiv ankomstdato'
      if (!details.guests || parseInt(details.guests) < 1) {
        errors.guests = 'Angiv venligst antal gæster'
      }
    }
  }

  if (realStep === 3) {
    if (!state.contact.name?.trim()) errors.name = 'Glem ikke at udfylde dit navn'
    if (!state.contact.email?.trim()) {
      errors.email = 'Glem ikke at udfylde din email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.contact.email)) {
      errors.email = 'Emailadressen ser ikke rigtig ud'
    }
    if (!state.contact.gdpr_consent) errors.gdpr = 'Du skal acceptere for at sende'
  }

  return errors
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

export default function InquiryWizard() {
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState('')

  const [state, setState] = useState({
    service: '',
    details: { venue: 'barn', ceremony: 'none', extra_course: false, package: 'full_day', bow_hunting: false },
    contact: { name: '', email: '', phone: '', message: '', gdpr_consent: false },
  })

  const isOther = state.service === 'other'
  const flow = isOther ? SHORT_STEPS : FULL_STEPS
  const realStep = flow[stepIndex] ?? 0
  const isDone = stepIndex === flow.length - 1

  const goNext = async () => {
    const errs = validateStep(realStep, state)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    if (realStep === 3) {
      setSubmitting(true)
      const ref = generateRef()
      setReference(ref)
      try {
        await fetch('http://localhost:5000/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: state.service,
            details: state.details,
            contact: state.contact,
            reference: ref,
          }),
        })
      } catch {
        // Proceed to confirmation even if email fails in dev
      }
      setSubmitting(false)
    }

    setDirection(1)
    setStepIndex((i) => Math.min(i + 1, flow.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setErrors({})
    setDirection(-1)
    setStepIndex((i) => Math.max(i - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextLabel = () => {
    if (submitting) return 'Sender…'
    if (realStep === 3) return 'Send besked'
    if (realStep === 2) return 'Fortsæt til kontaktoplysninger'
    if (realStep === 1) return 'Se estimeret pris'
    return 'Fortsæt'
  }

  const showSidePanel = realStep === 1 && state.service !== 'other' && state.service !== ''

  return (
    <div className={`${styles.container} ${showSidePanel ? styles.containerWide : ''}`}>
      <div className={styles.card}>
        {!isDone && <ProgressBar current={stepIndex} flow={flow} />}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className={styles.stepWrapper}
          >
            {realStep === 0 && (
              <Step1_ServiceSelect
                value={state.service}
                onChange={(s) => {
                  setState((prev) => ({
                    ...prev,
                    service: s,
                    details: { venue: 'barn', ceremony: 'none', extra_course: false, package: 'full_day', bow_hunting: false },
                  }))
                }}
              />
            )}
            {realStep === 1 && (
              <Step2_EventDetails
                service={state.service}
                data={state.details}
                onChange={(d) => setState((prev) => ({ ...prev, details: d }))}
                errors={errors}
              />
            )}
            {realStep === 2 && (
              <Step3_PriceEstimate
                service={state.service}
                details={state.details}
              />
            )}
            {realStep === 3 && (
              <Step4_ContactInfo
                data={state.contact}
                onChange={(c) => setState((prev) => ({ ...prev, contact: c }))}
                errors={errors}
                isOther={isOther}
              />
            )}
            {realStep === 4 && (
              <Step5_Confirmation
                service={state.service}
                details={state.details}
                contact={state.contact}
                reference={reference}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {errors.service && (
          <p className={styles.serviceBanner}>{errors.service}</p>
        )}

        {!isDone && (
          <div className={styles.nav}>
            {stepIndex > 0 && (
              <button className={styles.backBtn} onClick={goBack} disabled={submitting}>
                ← Tilbage
              </button>
            )}
            <button
              className={styles.nextBtn}
              onClick={goNext}
              disabled={submitting || (realStep === 0 && !state.service)}
            >
              {nextLabel()}
            </button>
          </div>
        )}
      </div>

      {/* Service info panel floats outside the white card in the grey background */}
      {showSidePanel && (
        <div className={styles.sidePanelSlot}>
          <SidePanelContent service={state.service} details={state.details} />
        </div>
      )}

      <p className={`${styles.footer} ${showSidePanel ? styles.footerWide : ''}`}>
        Engestofte Gods · Søvej 10, 4930 Maribo · +45 26 22 04 04
      </p>
    </div>
  )
}
