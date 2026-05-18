import time
from flask_mail import Message

STAFF_ROUTING = {
    'wedding':      {'name': 'Johan Borup Jensen', 'email': 'jj@engestofte.dk'},
    'party':        {'name': 'Johan Borup Jensen', 'email': 'jj@engestofte.dk'},
    'conference':   {'name': 'Johan Borup Jensen', 'email': 'jj@engestofte.dk'},
    'hunting':      {'name': 'Lise Egeskov',       'email': 'le@engestofte.dk'},
    'summer_house': {'name': 'Lise Egeskov',       'email': 'le@engestofte.dk'},
    'other':        {'name': 'Mette Egeskov',      'email': 'me@engestofte.dk'},
}

SERVICE_LABELS = {
    'wedding':      'Bryllup',
    'party':        'Fest & Fejring',
    'conference':   'Konference',
    'hunting':      'Jagt',
    'summer_house': 'Sommerhus',
    'other':        'Anden henvendelse',
}

VENUE_LABELS = {
    'barn':     'Den Gamle Lade',
    'workshop': 'Værkstedet',
}

PACKAGE_LABELS = {
    'full_day': 'Heldagsmøde (8:30–16:30)',
    'extended': 'Forlænget dag (8:30–21:30)',
    'evening':  'Aftenarrangement (18:00–02:00)',
}


def _format_details(service, details):
    lines = []
    if details.get('date'):
        lines.append(f"Dato: {details['date']}")
    if details.get('arrival'):
        lines.append(f"Ankomst: {details['arrival']}")
    if details.get('departure'):
        lines.append(f"Afrejse: {details['departure']}")
    if details.get('guests'):
        label = 'Skytter' if service == 'hunting' else 'Gæster'
        lines.append(f"{label}: {details['guests']}")
    if details.get('birds'):
        lines.append(f"Fugle (estimeret): {details['birds']}")
    if details.get('venue'):
        lines.append(f"Lokale: {VENUE_LABELS.get(details['venue'], details['venue'])}")
    if details.get('package'):
        lines.append(f"Pakke: {PACKAGE_LABELS.get(details['package'], details['package'])}")
    if details.get('ceremony') and details['ceremony'] != 'none':
        labels = {'church': 'Godsets kirke', 'park': 'Parken ved søen', 'cathedral': 'Maribo Domkirke'}
        lines.append(f"Vielse: {labels.get(details['ceremony'], details['ceremony'])}")
    if details.get('extra_course'):
        lines.append("Ekstra ret: Ja (+225 kr./pers.)")
    if details.get('house') and details['house'] != 'none':
        lines.append(f"Ønsket hus: {details['house']}")
    if details.get('bow_hunting'):
        lines.append("Buejagt: Ja")
    return '\n'.join(lines) if lines else '(ingen yderligere detaljer)'


def send_staff_email(mail, service, details, contact, reference, price_result):
    staff = STAFF_ROUTING.get(service)
    if not staff:
        return

    service_label = SERVICE_LABELS.get(service, service)
    details_text = _format_details(service, details)

    if price_result.get('price_on_request'):
        price_line = 'Pris aftales individuelt'
    elif price_result.get('total'):
        price_line = f"fra {price_result['total']:,} kr. (ekskl. moms)".replace(',', '.')
    else:
        price_line = '—'

    body = f"""
Ny forespørgsel fra Engestofte Gods hjemmesiden

Reference: {reference}
Ydelse: {service_label}

--- ARRANGEMENTDETALJER ---
{details_text}

Estimeret pris: {price_line}

--- KONTAKTOPLYSNINGER ---
Navn: {contact.get('name', '')}
Email: {contact.get('email', '')}
Telefon: {contact.get('phone', '') or '(ikke angivet)'}

Besked fra kunden:
{contact.get('message', '') or '(ingen besked)'}

---
Besvar direkte til: {contact.get('email', '')}
""".strip()

    msg = Message(
        subject=f"[{reference}] Ny {service_label.lower()}forespørgsel — {contact.get('name', '')}",
        recipients=[staff['email']],
        body=body,
        reply_to=contact.get('email'),
    )
    mail.send(msg)
    time.sleep(1.2)


def send_customer_email(mail, service, contact, reference, staff_name):
    service_label = SERVICE_LABELS.get(service, service)
    first_name = contact.get('name', '').split()[0] if contact.get('name') else ''
    greeting = f"Kære {first_name}" if first_name else "Kære"

    body = f"""
{greeting},

Tak for din forespørgsel om {service_label.lower()} på Engestofte Gods.

Vi har modtaget din henvendelse med reference {reference} og {staff_name} vil kontakte dig personligt inden for én hverdag.

Har du spørgsmål i mellemtiden, er du altid velkommen til at svare på denne mail.

Med venlig hilsen
{staff_name}
Engestofte Gods
Søvej 10, 4930 Maribo
www.engestofte.com
""".strip()

    msg = Message(
        subject=f"Vi har modtaget din forespørgsel — {reference}",
        recipients=[contact['email']],
        body=body,
    )
    mail.send(msg)
