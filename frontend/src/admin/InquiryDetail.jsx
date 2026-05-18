import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminAuth, API } from './useAdminAuth'
import { SNIPPET_CATEGORIES, applyTokens } from './snippets'
import styles from './Admin.module.css'

const STATUS_OPTIONS = [
  { value: 'ny',         label: 'Ny',         color: '#1976d2' },
  { value: 'kontaktet',  label: 'Kontaktet',  color: '#f57c00' },
  { value: 'bekræftet',  label: 'Bekræftet',  color: '#2e7d32' },
  { value: 'annulleret', label: 'Annulleret', color: '#c62828' },
]

const SERVICE_LABELS = {
  wedding: 'Bryllup', party: 'Fest & Fejring', conference: 'Konference',
  hunting: 'Jagt', summer_house: 'Sommerhus', other: 'Anden henvendelse',
}

const VENUE_LABELS = { barn: 'Den Gamle Lade', workshop: 'Værkstedet' }
const PKG_LABELS = { full_day: 'Heldagsmøde', extended: 'Forlænget dag', evening: 'Aftenarrangement' }

export default function InquiryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { authHeaders } = useAdminAuth()

  const [inq, setInq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [editedDetails, setEditedDetails] = useState({})
  const [savingDetails, setSavingDetails] = useState(false)
  const [detailsSaved, setDetailsSaved] = useState(false)

  const downloadPdf = async () => {
    setPdfLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/inquiries/${id}/pdf`, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Ordrebekraeftelse-${inq?.reference || id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Kunne ikke generere PDF: ' + e.message)
    } finally {
      setPdfLoading(false)
    }
  }

  const fetch_ = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/inquiries/${id}`, { headers: authHeaders() })
      const data = await res.json()
      setInq(data)
      setNotes(data.notes || '')
      setEditedDetails(data.details || {})
      setEmailSubject(`Svar på din forespørgsel — ${data.reference}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [id])

  const updateStatus = async (status) => {
    await fetch(`${API}/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setInq((prev) => ({ ...prev, status }))
  }

  const saveDetails = async () => {
    setSavingDetails(true)
    const res = await fetch(`${API}/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ details: editedDetails }),
    })
    const data = await res.json()
    setInq(data)
    setDetailsSaved(true)
    setTimeout(() => setDetailsSaved(false), 2500)
    setSavingDetails(false)
  }

  const saveNotes = async () => {
    setSaving(true)
    await fetch(`${API}/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSaving(false)
  }

  const addSnippet = (snippet) => {
    const resolved = applyTokens(snippet.text, inq)
    setEmailBody((prev) => prev ? prev + '\n\n' + resolved : resolved)
  }

  const sendReply = async () => {
    if (!emailBody.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch(`${API}/api/admin/inquiries/${id}/send-reply`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult({ ok: true, msg: 'Email sendt!' })
        setInq((prev) => ({ ...prev, status: data.status }))
        setEmailBody('')
      } else {
        setSendResult({ ok: false, msg: data.error || 'Noget gik galt' })
      }
    } catch {
      setSendResult({ ok: false, msg: 'Serverfejl' })
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className={styles.loading}>Indlæser…</div>
  if (!inq) return <div className={styles.empty}>Forespørgsel ikke fundet</div>

  const contact = inq.contact || {}
  const details = inq.details || {}
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === inq.status)

  return (
    <div className={styles.detailPage}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/admin')}>← Tilbage</button>
        <div>
          <h1 className={styles.pageTitle}>{contact.name || '—'}</h1>
          <span className={styles.detailRef}>{inq.reference} · {SERVICE_LABELS[inq.service] || inq.service}</span>
        </div>
        {/* Status pipeline */}
        <div className={styles.statusPipeline}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              className={`${styles.statusPipeBtn} ${inq.status === s.value ? styles.statusPipeBtnActive : ''}`}
              style={inq.status === s.value ? { borderColor: s.color, color: s.color } : {}}
              onClick={() => updateStatus(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* LEFT: Inquiry info */}
        <div className={styles.detailLeft}>
          {/* Customer */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Kontaktoplysninger</h3>
            <InfoRow label="Navn" value={contact.name} />
            <InfoRow label="Email" value={<a href={`mailto:${contact.email}`}>{contact.email}</a>} />
            <InfoRow label="Telefon" value={contact.phone || '—'} />
            {contact.message && (
              <div className={styles.customerMessage}>
                <span className={styles.infoLabel}>Besked</span>
                <p className={styles.messageText}>{contact.message}</p>
              </div>
            )}
          </section>

          {/* Event details */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Arrangementdetaljer</h3>
            <InfoRow label="Ydelse" value={SERVICE_LABELS[inq.service] || inq.service} />
            {details.date && <InfoRow label="Dato" value={new Date(details.date).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })} />}
            {details.guests && <InfoRow label="Gæster" value={details.guests} />}
            {details.venue && <InfoRow label="Lokale" value={VENUE_LABELS[details.venue] || details.venue} />}
            {details.package && <InfoRow label="Pakke" value={PKG_LABELS[details.package] || details.package} />}
            {details.birds && <InfoRow label="Fugle" value={`${details.birds} stk.`} />}
            {details.hunt_type && <InfoRow label="Jagttype" value={details.hunt_type === 'pheasant' ? 'Fasanjagt' : 'Bukkejagt'} />}
            {details.house && details.house !== 'none' && <InfoRow label="Hus" value={details.house} />}
            {details.arrival && <InfoRow label="Ankomst" value={details.arrival} />}
            {details.departure && <InfoRow label="Afrejse" value={details.departure} />}
            <InfoRow
              label="Estimeret pris"
              value={inq.estimated_price
                ? `fra ${new Intl.NumberFormat('da-DK').format(inq.estimated_price)} kr.`
                : 'Pris på forespørgsel'}
              highlight
            />
          </section>

          {/* Editable details */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Opdater detaljer</h3>
            <p style={{ fontSize: '0.78rem', color: '#6b6b65', marginBottom: '0.75rem' }}>
              Ret oplysninger efter aftale med kunden — opdaterer PDF ved næste download.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {('date' in (inq.details || {})) && (
                <EditField label="Dato">
                  <input type="date" className={styles.notesArea} style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                    value={editedDetails.date || ''}
                    onChange={(e) => setEditedDetails(p => ({ ...p, date: e.target.value }))} />
                </EditField>
              )}
              {('arrival' in (inq.details || {})) && (
                <EditField label="Ankomst">
                  <input type="date" className={styles.notesArea} style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                    value={editedDetails.arrival || ''}
                    onChange={(e) => setEditedDetails(p => ({ ...p, arrival: e.target.value }))} />
                </EditField>
              )}
              {('departure' in (inq.details || {})) && (
                <EditField label="Afrejse">
                  <input type="date" className={styles.notesArea} style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                    value={editedDetails.departure || ''}
                    onChange={(e) => setEditedDetails(p => ({ ...p, departure: e.target.value }))} />
                </EditField>
              )}
              {('guests' in (inq.details || {})) && (
                <EditField label={inq.service === 'hunting' ? 'Skytter' : 'Gæster'}>
                  <input type="number" className={styles.notesArea} style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                    value={editedDetails.guests || ''}
                    min="1"
                    onChange={(e) => setEditedDetails(p => ({ ...p, guests: e.target.value }))} />
                </EditField>
              )}
              {('birds' in (inq.details || {})) && (
                <EditField label="Fugle (antal)">
                  <input type="number" className={styles.notesArea} style={{ resize: 'none', height: 'auto', padding: '0.5rem 0.75rem' }}
                    value={editedDetails.birds || ''}
                    min="150"
                    onChange={(e) => setEditedDetails(p => ({ ...p, birds: e.target.value }))} />
                </EditField>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className={styles.saveNotesBtn} onClick={saveDetails} disabled={savingDetails}>
                {savingDetails ? 'Gemmer…' : 'Gem ændringer'}
              </button>
              {detailsSaved && <span style={{ fontSize: '0.78rem', color: '#2e7d32' }}>✓ Gemt — PDF opdateret</span>}
            </div>
          </section>

          {/* Internal notes */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Interne noter</h3>
            <textarea
              className={styles.notesArea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tilføj interne noter her — ikke synlige for kunden…"
              rows={4}
            />
            <button className={styles.saveNotesBtn} onClick={saveNotes} disabled={saving}>
              {saving ? 'Gemmer…' : 'Gem noter'}
            </button>
          </section>

          {/* PDF download */}
          <section className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>Ordrebekræftelse</h3>
            <p style={{ fontSize: '0.82rem', color: '#6b6b65', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Genererer en PDF med alle detaljer og prisestimat.
              Sendes automatisk til kunden når status sættes til <strong>Bekræftet</strong>.
            </p>
            <button
              className={styles.pdfBtn}
              onClick={downloadPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Genererer…' : '⬇ Download PDF'}
            </button>
          </section>
        </div>

        {/* RIGHT: Snippet composer */}
        <div className={styles.detailRight}>
          <section className={styles.composeSection}>
            <h3 className={styles.sectionTitle}>Svar til {contact.name?.split(' ')[0] || 'kunden'}</h3>

            {/* Snippet picker */}
            <div className={styles.snippetCategories}>
              {SNIPPET_CATEGORIES.map((cat) => (
                <div key={cat.label} className={styles.snippetCat}>
                  <span className={styles.snippetCatLabel}>{cat.icon} {cat.label}</span>
                  <div className={styles.snippetBtns}>
                    {cat.snippets.map((s) => (
                      <button
                        key={s.id}
                        className={styles.snippetBtn}
                        onClick={() => addSnippet(s)}
                        title={applyTokens(s.text, inq).substring(0, 80) + '…'}
                      >
                        + {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Subject */}
            <div className={styles.composeField}>
              <label className={styles.composeLabel}>Emne</label>
              <input
                type="text"
                className={styles.composeSubject}
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            {/* Body */}
            <div className={styles.composeField}>
              <label className={styles.composeLabel}>Besked</label>
              <textarea
                className={styles.composeBody}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Klik på et snippet ovenfor for at tilføje tekst, eller skriv direkte her…"
                rows={12}
              />
            </div>

            <div className={styles.composeActions}>
              <button
                className={styles.clearBtn}
                onClick={() => setEmailBody('')}
                disabled={!emailBody}
              >
                Ryd
              </button>
              <button
                className={styles.sendBtn}
                onClick={sendReply}
                disabled={sending || !emailBody.trim()}
              >
                {sending ? 'Sender…' : `Send til ${contact.email || 'kunden'}`}
              </button>
            </div>

            {sendResult && (
              <div className={`${styles.sendResult} ${sendResult.ok ? styles.sendOk : styles.sendError}`}>
                {sendResult.msg}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function EditField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b6b65', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${highlight ? styles.infoHighlight : ''}`}>{value}</span>
    </div>
  )
}
