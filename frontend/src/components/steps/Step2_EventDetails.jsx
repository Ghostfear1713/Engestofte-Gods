import { motion, AnimatePresence } from 'framer-motion'
import AvailabilityChecker from './AvailabilityChecker'
import styles from './Step2_EventDetails.module.css'

const VENUE_INFO = {
  barn: {
    name: 'Den Gamle Lade',
    tagline: 'Danmarks smukkeste lade ved søens bred',
    includes: [
      'Velkomstdrink',
      '3-retters middag med vinmenu, kaffe & sødt',
      'Soft bar (øl, vin & vand) efter middagen',
      '9 timers arrangement — fest slutter kl. 03:00',
      'Koordinering & udarbejdelse af tidsplan',
      'Overnatning i brudesuite på bryllupsnatten',
    ],
    pricing: [
      { label: 'Per kuvert', value: 'kr. 1.495,-' },
      { label: 'Lokaleleje', value: 'kr. 16.900,-' },
      { label: 'Ekstra ret', value: '+225 kr./kuvert' },
      { label: 'Tillæg u. 60 gæster', value: '+115 kr./pers.' },
    ],
    capacity: 'Op til 450 personer',
  },
  workshop: {
    name: 'Værkstedet',
    tagline: 'Intimt & hyggeligt — perfekt til mindre selskaber',
    includes: [
      'Tapas-menu',
      'Kaffe, te & kage',
      'Øl, vand & crémant inkluderet',
      'Bryllupskage fra 111 kr./pers.',
      'Historisk atmosfære med udsigt til søen',
    ],
    pricing: [
      { label: 'Per kuvert', value: 'kr. 475,-' },
      { label: 'Lokaleleje', value: 'kr. 3.375,-' },
    ],
    capacity: 'Ideelt til under 50 personer',
  },
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
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

function Toggle({ value, onChange, options }) {
  return (
    <div className={styles.toggle}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.toggleBtn} ${value === opt.value ? styles.toggleSelected : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function WeddingFields({ data, onChange, errors }) {
  const venue = data.venue || 'barn'
  return (
    <motion.div className={styles.fields} {...fadeIn}>
        <Field label="Ønsket dato" hint="(valgfri)">
          <input
            type="date"
            className={styles.input}
            value={data.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <AvailabilityChecker date={data.date} onSelectDate={(d) => onChange('date', d)} />
        </Field>

        <Field label="Antal gæster" error={errors?.guests}>
          <input
            type="number"
            className={`${styles.input} ${errors?.guests ? styles.inputError : ''}`}
            value={data.guests || ''}
            onChange={(e) => onChange('guests', e.target.value)}
            placeholder="f.eks. 80"
            min="1"
            max="450"
          />
        </Field>

        <Field label="Lokale">
          <Toggle
            value={venue}
            onChange={(v) => onChange('venue', v)}
            options={[
              { value: 'barn', label: 'Den Gamle Lade' },
              { value: 'workshop', label: 'Værkstedet' },
            ]}
          />
        </Field>

        <Field label="Vielsessted" hint="(valgfri)">
          <Toggle
            value={data.ceremony || 'none'}
            onChange={(v) => onChange('ceremony', v)}
            options={[
              { value: 'none', label: 'Ingen præference' },
              { value: 'church', label: 'Godsets kirke' },
              { value: 'park', label: 'Parken ved søen' },
              { value: 'cathedral', label: 'Maribo Domkirke' },
            ]}
          />
        </Field>

        <Field label="Ekstra ret til middag?">
          <Toggle
            value={data.extra_course ? 'yes' : 'no'}
            onChange={(v) => onChange('extra_course', v === 'yes')}
            options={[
              { value: 'no', label: 'Nej tak' },
              { value: 'yes', label: 'Ja, +225 kr./pers.' },
            ]}
          />
        </Field>
    </motion.div>
  )
}

function PartyFields({ data, onChange, errors }) {
  return (
    <motion.div className={styles.fields} {...fadeIn}>
      <Field label="Anledning">
        <Toggle
          value={data.occasion || 'birthday'}
          onChange={(v) => onChange('occasion', v)}
          options={[
            { value: 'birthday', label: 'Fødselsdag' },
            { value: 'confirmation', label: 'Konfirmation' },
            { value: 'anniversary', label: 'Jubilæum' },
            { value: 'other', label: 'Andet' },
          ]}
        />
      </Field>

      <Field label="Ønsket dato" hint="(valgfri)">
        <input
          type="date"
          className={styles.input}
          value={data.date || ''}
          onChange={(e) => onChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <AvailabilityChecker date={data.date} onSelectDate={(d) => onChange('date', d)} />
      </Field>

      <Field label="Antal gæster" error={errors?.guests}>
        <input
          type="number"
          className={`${styles.input} ${errors?.guests ? styles.inputError : ''}`}
          value={data.guests || ''}
          onChange={(e) => onChange('guests', e.target.value)}
          placeholder="f.eks. 60"
          min="1"
          max="450"
        />
      </Field>

      <Field label="Lokale">
        <Toggle
          value={data.venue || 'barn'}
          onChange={(v) => onChange('venue', v)}
          options={[
            { value: 'barn', label: 'Den Gamle Lade' },
            { value: 'workshop', label: 'Værkstedet' },
          ]}
        />
      </Field>

      <Field label="Ekstra ret til middag?">
        <Toggle
          value={data.extra_course ? 'yes' : 'no'}
          onChange={(v) => onChange('extra_course', v === 'yes')}
          options={[
            { value: 'no', label: 'Nej tak' },
            { value: 'yes', label: 'Ja, +225 kr./pers.' },
          ]}
        />
      </Field>
    </motion.div>
  )
}

function ConferenceFields({ data, onChange, errors }) {
  return (
    <motion.div className={styles.fields} {...fadeIn}>
      <Field label="Ønsket dato" hint="(valgfri)">
        <input
          type="date"
          className={styles.input}
          value={data.date || ''}
          onChange={(e) => onChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <AvailabilityChecker date={data.date} onSelectDate={(d) => onChange('date', d)} />
      </Field>

      <Field label="Antal deltagere" error={errors?.guests}>
        <input
          type="number"
          className={`${styles.input} ${errors?.guests ? styles.inputError : ''}`}
          value={data.guests || ''}
          onChange={(e) => onChange('guests', e.target.value)}
          placeholder="f.eks. 50"
          min="1"
          max="450"
        />
      </Field>

      <Field label="Pakke">
        <Toggle
          value={data.package || 'full_day'}
          onChange={(v) => onChange('package', v)}
          options={[
            { value: 'full_day', label: 'Heldagsmøde' },
            { value: 'extended', label: 'Forlænget dag' },
            { value: 'evening', label: 'Aftenarrangement' },
          ]}
        />
      </Field>
    </motion.div>
  )
}

function HuntingFields({ data, onChange, errors }) {
  return (
    <motion.div className={styles.fields} {...fadeIn}>
      <Field label="Foretrukken periode" hint="(valgfri)">
        <input
          type="month"
          className={styles.input}
          value={data.hunt_month || ''}
          onChange={(e) => onChange('hunt_month', e.target.value)}
        />
      </Field>

      <Field label="Antal skytter (anbefalet 10–16)" error={errors?.guests}>
        <input
          type="number"
          className={`${styles.input} ${errors?.guests ? styles.inputError : ''}`}
          value={data.guests || ''}
          onChange={(e) => onChange('guests', e.target.value)}
          placeholder="f.eks. 12"
          min="1"
          max="30"
        />
      </Field>

      <Field label="Estimeret antal fugle" hint="(min. 150)">
        <input
          type="number"
          className={styles.input}
          value={data.birds || ''}
          onChange={(e) => onChange('birds', e.target.value)}
          placeholder="f.eks. 200"
          min="150"
        />
      </Field>

      <Field label="Type jagt">
        <Toggle
          value={data.hunt_type || 'pheasant'}
          onChange={(v) => onChange('hunt_type', v)}
          options={[
            { value: 'pheasant', label: 'Fasanjagt' },
            { value: 'deer', label: 'Bukkejagt' },
          ]}
        />
      </Field>

      <Field label="Buejagt?">
        <Toggle
          value={data.bow_hunting ? 'yes' : 'no'}
          onChange={(v) => onChange('bow_hunting', v === 'yes')}
          options={[
            { value: 'no', label: 'Nej' },
            { value: 'yes', label: 'Ja' },
          ]}
        />
      </Field>
    </motion.div>
  )
}

const HOUSES = [
  { value: 'none', label: 'Ingen præference' },
  { value: 'hushovmester', label: 'Hushovmesterboligen' },
  { value: 'hospitalet', label: 'Hospitalet' },
  { value: 'grevinden', label: 'Grevindens Hus' },
  { value: 'fiskerhuset', label: 'Fiskerhuset' },
  { value: 'skovloeber', label: 'Skovløberhuset' },
]

function SummerHouseFields({ data, onChange, errors }) {
  return (
    <motion.div className={styles.fields} {...fadeIn}>
      <div className={styles.dateRow}>
        <Field label="Ankomst" error={errors?.arrival}>
          <input
            type="date"
            className={`${styles.input} ${errors?.arrival ? styles.inputError : ''}`}
            value={data.arrival || ''}
            onChange={(e) => onChange('arrival', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </Field>
        <Field label="Afrejse">
          <input
            type="date"
            className={styles.input}
            value={data.departure || ''}
            onChange={(e) => onChange('departure', e.target.value)}
            min={data.arrival || new Date().toISOString().split('T')[0]}
          />
        </Field>
      </div>

      <Field label="Antal gæster" error={errors?.guests}>
        <input
          type="number"
          className={`${styles.input} ${errors?.guests ? styles.inputError : ''}`}
          value={data.guests || ''}
          onChange={(e) => onChange('guests', e.target.value)}
          placeholder="f.eks. 4"
          min="1"
          max="11"
        />
      </Field>

      <Field label="Ønsket hus" hint="(valgfri)">
        <select
          className={styles.select}
          value={data.house || 'none'}
          onChange={(e) => onChange('house', e.target.value)}
        >
          {HOUSES.map((h) => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
      </Field>
    </motion.div>
  )
}

// ── INFO PANEL DATA ─────────────────────────────────────────────────

const VENUE_INFO_PARTY = {
  barn: {
    name: 'Den Gamle Lade',
    tagline: 'Danmarks smukkeste lade — op til 450 gæster',
    includes: [
      'Velkomstdrink',
      '3-retters middag med vin',
      'Kaffe, te & dessert',
      'Soft bar (øl, vin & vand) efter middagen',
      'Hvide duge & servietter',
    ],
    pricing: [
      { label: 'Per kuvert', value: 'kr. 1.125,-' },
      { label: 'Lokaleleje', value: 'kr. 16.900,-' },
      { label: 'Ekstra ret', value: '+225 kr./kuvert' },
      { label: 'Tillæg u. 60 gæster', value: '+115 kr./pers.' },
    ],
    capacity: 'Op til 450 personer',
  },
  workshop: {
    name: 'Værkstedet',
    tagline: 'Intimt & hyggeligt — ideelt under 50 gæster',
    includes: [
      'Velkomstdrink',
      '3-retters middag med vin',
      'Kaffe, te & dessert',
      'Soft bar (øl, vin & vand)',
      'Hvide duge & servietter',
    ],
    pricing: [
      { label: 'Per kuvert', value: 'kr. 1.125,-' },
      { label: 'Lokaleleje', value: 'kr. 3.375,-' },
      { label: 'Ekstra ret', value: '+225 kr./kuvert' },
    ],
    capacity: 'Ideelt til under 50 personer',
  },
}

const CONFERENCE_INFO = {
  full_day: {
    name: 'Heldagsmøde',
    tagline: '8:30 – 16:30 · 665 kr./pers. ekskl. moms',
    includes: [
      'Hjemmelavet rundstykke, ost & syltetøj',
      'Kaffe, te & vand hele dagen',
      'Frokost med sodavand',
      'Husets hjemmelavede eftermiddagskage',
      'Frisk frugt',
    ],
    pricing: [
      { label: 'Per deltager', value: 'kr. 665,-' },
      { label: 'Tillæg u. 100 pers.', value: '+100 kr./pers.' },
    ],
    capacity: 'Op til 450 deltagere siddende',
  },
  extended: {
    name: 'Forlænget dag',
    tagline: '8:30 – 21:30 · 1.199 kr./pers. ekskl. moms',
    includes: [
      'Alt fra Heldagsmødet',
      '2-retters middag med husets vine',
      'Øl, vand & sodavand til middagen',
    ],
    pricing: [
      { label: 'Per deltager', value: 'kr. 1.199,-' },
      { label: 'Tillæg u. 100 pers.', value: '+100 kr./pers.' },
    ],
    capacity: 'Op til 450 deltagere siddende',
  },
  evening: {
    name: 'Aftenarrangement',
    tagline: '18:00 – 02:00 · 1.199 kr./pers. ekskl. moms',
    includes: [
      'Velkomstchampagne eller hyldeblomstsaft',
      '3-retters menu med vine & øl',
      'Bar med 3 cocktails & spiritus',
      'Natmad',
    ],
    pricing: [
      { label: 'Per deltager', value: 'kr. 1.199,-' },
      { label: 'Tillæg u. 100 pers.', value: '+100 kr./pers.' },
    ],
    capacity: 'Op til 450 deltagere siddende',
  },
}

const HUNTING_INFO = {
  pheasant: {
    name: 'Fasanjagt',
    tagline: 'Klapjagt i Naturpark Maribosøerne',
    includes: [
      'Morgenmad for alle jægere',
      'Varm drik ved Fiskerhuset',
      'Frokost tilpasses ønsker (pølser til 3-retters)',
      'Optimalt 10–16 skytter',
      'Minimum 150 fugle pr. jagt',
    ],
    pricing: [
      { label: 'Per fugl', value: 'kr. 420,- + moms' },
      { label: 'Minimum', value: '150 fugle' },
    ],
    capacity: 'Anbefalet 10–16 skytter',
  },
  deer: {
    name: 'Bukkejagt',
    tagline: 'Selektiv afskydning med guide',
    includes: [
      'Stand- og prüschjagt',
      'Guide kan tilbydes',
      'Buejægere velkomne',
      'Vinterjagt på råer & lam tilgængeligt',
      'Riffel eller bue',
    ],
    pricing: [
      { label: 'Pris', value: 'Aftales individuelt' },
    ],
    capacity: 'Individuel aftale',
  },
}

const HOUSE_INFO = {
  none: null,
  hushovmester: {
    name: 'Hushovmesterboligen',
    tagline: 'Stråtækt idyl direkte ved godset',
    includes: ['Renoveret 2017', 'Fuldt udstyret køkken', 'TV & WiFi', 'Historisk personale-bolig', 'Privat & fredfyldt beliggenhed'],
    capacity: 'Kontakt Lise for kapacitet & priser',
  },
  hospitalet: {
    name: 'Hospitalet',
    tagline: 'Luksus brude-suite til romantiske ophold',
    includes: ['Fungerer som brudesuite til daglig', 'Ideelt til 2 personer + 2 børn', 'Fuldt udstyret køkken', 'TV & WiFi', 'Eksklusiv & romantisk ramme'],
    capacity: 'Op til 2 (+2 børn)',
  },
  grevinden: {
    name: 'Grevindens Hus',
    tagline: 'Et af godsets smukkeste huse',
    includes: ['6 soveværelser', 'Op til 11 gæster', 'Fuldt udstyret køkken', 'TV & WiFi', 'Tidligere beboet af berømt forfatter'],
    capacity: 'Op til 11 personer',
  },
  fiskerhuset: {
    name: 'Fiskerhuset',
    tagline: 'Spektakulær søudsigt — 20m fra vandet',
    includes: ['Direkte udsigt til Maribo Søndersø', '20 meter fra vandkanten', 'Fuldt udstyret køkken', 'TV & WiFi', 'Tidligere ejerbolig'],
    capacity: 'Kontakt Lise for kapacitet & priser',
  },
  skovloeber: {
    name: 'Skovløberhuset',
    tagline: 'Stråtækt bindingsværk med have',
    includes: ['Stor lukket have', 'Overdækket terrasse', 'Hundevenligt', 'Fuldt udstyret køkken', 'TV & WiFi'],
    capacity: 'Kontakt Lise for kapacitet & priser',
  },
}

// ── INFO PANEL COMPONENTS ────────────────────────────────────────────

function InfoCard({ name, tagline, includes, pricing, capacity, animKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animKey}
        className={styles.infoCard}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className={styles.infoHeader}>
          <span className={styles.infoName}>{name}</span>
          <span className={styles.infoTagline}>{tagline}</span>
        </div>

        <ul className={styles.infoList}>
          {includes.map((item) => (
            <li key={item} className={styles.infoItem}>
              <span className={styles.infoCheck}>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {pricing && pricing.length > 0 && (
          <div className={styles.infoPricing}>
            <span className={styles.infoPricingTitle}>Priser 2026</span>
            {pricing.map((p) => (
              <div key={p.label} className={styles.infoPriceRow}>
                <span>{p.label}</span>
                <span className={styles.infoPriceValue}>{p.value}</span>
              </div>
            ))}
          </div>
        )}

        {capacity && <span className={styles.infoCapacity}>{capacity}</span>}
      </motion.div>
    </AnimatePresence>
  )
}

export function VenueInfoPanel({ venue, service }) {
  const data = service === 'party'
    ? VENUE_INFO_PARTY[venue] || VENUE_INFO_PARTY.barn
    : VENUE_INFO[venue] || VENUE_INFO.barn
  return <InfoCard {...data} animKey={`${service}-${venue}`} />
}

function ConferenceInfoPanel({ pkg }) {
  const data = CONFERENCE_INFO[pkg] || CONFERENCE_INFO.full_day
  return <InfoCard {...data} animKey={`conf-${pkg}`} />
}

function HuntingInfoPanel({ huntType }) {
  const data = HUNTING_INFO[huntType] || HUNTING_INFO.pheasant
  return <InfoCard {...data} animKey={`hunt-${huntType}`} />
}

function SummerHouseInfoPanel({ house }) {
  const data = HOUSE_INFO[house]
  if (!data) return (
    <div className={styles.infoCard}>
      <div className={styles.infoHeader}>
        <span className={styles.infoName}>Fem unikke boliger</span>
        <span className={styles.infoTagline}>Vælg et hus for at se detaljer</span>
      </div>
      <ul className={styles.infoList}>
        {['Hushovmesterboligen — stråtækt idyl', 'Hospitalet — romantisk brudesuite', 'Grevindens Hus — op til 11 pers.', 'Fiskerhuset — spektakulær søudsigt', 'Skovløberhuset — have & terrasse'].map(i => (
          <li key={i} className={styles.infoItem}><span className={styles.infoCheck}>·</span><span>{i}</span></li>
        ))}
      </ul>
      <span className={styles.infoCapacity}>Alle huse: køkken, TV & WiFi · Pris på forespørgsel</span>
    </div>
  )
  return <InfoCard {...data} animKey={`house-${house}`} />
}

export function SidePanelContent({ service, details }) {
  if (service === 'wedding')
    return <VenueInfoPanel venue={details.venue || 'barn'} service="wedding" />
  if (service === 'party')
    return <VenueInfoPanel venue={details.venue || 'barn'} service="party" />
  if (service === 'conference')
    return <ConferenceInfoPanel pkg={details.package || 'full_day'} />
  if (service === 'hunting')
    return <HuntingInfoPanel huntType={details.hunt_type || 'pheasant'} />
  if (service === 'summer_house')
    return <SummerHouseInfoPanel house={details.house || 'none'} />
  return null
}

// ─────────────────────────────────────────────────────────────────────

const SUBTITLES = {
  wedding: 'Fortæl os lidt om jeres store dag',
  party: 'Lad os høre om jeres fejring',
  conference: 'Vi finder de rette rammer til jeres møde',
  hunting: 'Fortæl os om jeres jagtønsker',
  summer_house: 'Find jeres drømmebolig på godset',
}

export default function Step2_EventDetails({ service, data, onChange, errors }) {
  const subtitle = SUBTITLES[service] || ''

  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value })
  }

  const fieldProps = { data, onChange: handleChange, errors }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{subtitle}</h2>
        <p className={styles.sub}>
          Udfyld det I ved — I er altid velkomne til at justere med os efterfølgende
        </p>
      </div>

      {service === 'wedding' && <WeddingFields {...fieldProps} />}
      {service === 'party' && <PartyFields {...fieldProps} />}
      {service === 'conference' && <ConferenceFields {...fieldProps} />}
      {service === 'hunting' && <HuntingFields {...fieldProps} />}
      {service === 'summer_house' && <SummerHouseFields {...fieldProps} />}
    </div>
  )
}
