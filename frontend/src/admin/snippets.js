// Pre-written Danish snippets in Engestofte's voice.
// {placeholders} are replaced with inquiry data before insertion.

const SERVICE_LABELS = {
  wedding:      'bryllup',
  party:        'fest',
  conference:   'konference',
  hunting:      'jagt',
  summer_house: 'sommerhusophold',
  other:        'henvendelse',
}

const VENUE_LABELS = {
  barn:     'Den Gamle Lade',
  workshop: 'Værkstedet',
}

// Replace {key} tokens with values from the inquiry
export function applyTokens(text, inq) {
  const contact = inq.contact || {}
  const details = inq.details || {}
  const firstName = (contact.name || '').split(' ')[0] || 'kære gæst'
  const tokens = {
    navn:      contact.name || '',
    fornavn:   firstName,
    service:   SERVICE_LABELS[inq.service] || inq.service,
    dato:      details.date ? new Date(details.date).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'den ønskede dato',
    gaester:   details.guests || '?',
    lokale:    VENUE_LABELS[details.venue] || details.venue || '',
    reference: inq.reference || '',
    pris:      inq.estimated_price
      ? `fra ${new Intl.NumberFormat('da-DK').format(inq.estimated_price)} kr.`
      : 'aftales individuelt',
    staff:     inq.staff_name || 'vi',
  }
  return text.replace(/\{(\w+)\}/g, (_, key) => tokens[key] ?? `{${key}}`)
}

// Snippet categories and their options
export const SNIPPET_CATEGORIES = [
  {
    label: 'Hilsen',
    icon: '👋',
    snippets: [
      {
        id: 'greeting_warm',
        label: 'Varm hilsen',
        text: 'Kære {fornavn},\n\nTusind tak for din forespørgsel — det er altid en glæde at høre fra nogen der overvejer Engestofte Gods til en særlig lejlighed.',
      },
      {
        id: 'greeting_formal',
        label: 'Formel hilsen',
        text: 'Kære {navn},\n\nTak for din henvendelse vedrørende {service} på Engestofte Gods.',
      },
    ],
  },
  {
    label: 'Bekræft detaljer',
    icon: '📋',
    snippets: [
      {
        id: 'confirm_details',
        label: 'Bekræft dato & gæster',
        text: 'Vi har modtaget din forespørgsel om {service} den {dato} med {gaester} gæster i {lokale}.',
      },
      {
        id: 'confirm_no_date',
        label: 'Ingen dato endnu',
        text: 'Vi har modtaget din forespørgsel om {service} på Engestofte Gods. I har endnu ikke angivet en specifik dato — det finder vi selvfølgelig en god løsning på.',
      },
    ],
  },
  {
    label: 'Pris & pakke',
    icon: '💰',
    snippets: [
      {
        id: 'price_estimate',
        label: 'Prisestimat',
        text: 'Baseret på jeres oplysninger er prisen {pris} ekskl. moms. Dette er et vejledende estimat — vi sender jer et detaljeret og bindende tilbud når vi har talt sammen.',
      },
      {
        id: 'price_on_request',
        label: 'Pris på forespørgsel',
        text: 'Prisen aftales individuelt og tilpasses jeres specifikke ønsker. Vi fremsender et detaljeret tilbud efter vores samtale.',
      },
    ],
  },
  {
    label: 'Næste skridt',
    icon: '➡️',
    snippets: [
      {
        id: 'next_call',
        label: 'Vil ringe',
        text: 'Jeg vil ringe til jer inden for de næste par hverdage for at høre mere om jeres ønsker og svare på eventuelle spørgsmål.',
      },
      {
        id: 'next_email',
        label: 'Sender tilbud på mail',
        text: 'Jeg sender jer et detaljeret tilbud på mail inden for to hverdage, som I kan gennemgå i ro og mag.',
      },
      {
        id: 'next_visit',
        label: 'Invitér til besøg',
        text: 'I er meget velkomne til at komme ud og se lokalerne, inden I tager en beslutning. Det giver altid et meget bedre billede af rammerne.',
      },
    ],
  },
  {
    label: 'Reference',
    icon: '🔖',
    snippets: [
      {
        id: 'reference',
        label: 'Referencenummer',
        text: 'Jeres referencenummer er {reference} — brug dette i al fremtidig korrespondance.',
      },
    ],
  },
  {
    label: 'Afslutning',
    icon: '✉️',
    snippets: [
      {
        id: 'closing_warm',
        label: 'Varm afslutning',
        text: 'Vi glæder os meget til at høre mere om jeres planer og håber at Engestofte Gods bliver rammen om en uforglemmelig dag.\n\nMed venlig hilsen\n{staff}\nEngestofte Gods',
      },
      {
        id: 'closing_formal',
        label: 'Formel afslutning',
        text: 'Vi ser frem til at høre fra jer.\n\nMed venlig hilsen\n{staff}\nEngestofte Gods\nSøvej 10, 4930 Maribo',
      },
    ],
  },
]
