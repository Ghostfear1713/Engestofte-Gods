import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ── Brand colours ─────────────────────────────────────────────
GREEN      = HexColor('#3d5c2a')
GREEN_LIGHT = HexColor('#f0f4ec')
GREY_TEXT  = HexColor('#6b6b65')
DARK_TEXT  = HexColor('#1a1a18')

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

PKG_LABELS = {
    'full_day': 'Heldagsmøde (8:30–16:30)',
    'extended': 'Forlænget dag (8:30–21:30)',
    'evening':  'Aftenarrangement (18:00–02:00)',
}

STAFF_INFO = {
    'wedding':      {'name': 'Johan Borup Jensen', 'email': 'jj@engestofte.dk', 'phone': '+45 31 37 54 59'},
    'party':        {'name': 'Johan Borup Jensen', 'email': 'jj@engestofte.dk', 'phone': '+45 31 37 54 59'},
    'conference':   {'name': 'Johan Borup Jensen', 'email': 'jj@engestofte.dk', 'phone': '+45 31 37 54 59'},
    'hunting':      {'name': 'Lise Egeskov',       'email': 'le@engestofte.dk', 'phone': '+45 26 80 61 69'},
    'summer_house': {'name': 'Lise Egeskov',       'email': 'le@engestofte.dk', 'phone': '+45 26 80 61 69'},
    'other':        {'name': 'Mette Egeskov',      'email': 'me@engestofte.dk', 'phone': '+45 26 22 04 04'},
}


def _fmt_price(amount):
    if amount is None:
        return 'Aftales individuelt'
    return f"kr. {amount:,.0f},-".replace(',', '.')


def generate_pdf(inquiry) -> bytes:
    """Generate a booking confirmation PDF and return as bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=20*mm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Helper styles ─────────────────────────────────────────
    def style(name, **kw):
        s = ParagraphStyle(name, **kw)
        return s

    header_style = style('Header',
        fontName='Helvetica-Bold', fontSize=22, textColor=white,
        alignment=TA_LEFT, leading=28)

    subheader_style = style('SubHeader',
        fontName='Helvetica', fontSize=11, textColor=HexColor('#c8dabb'),
        alignment=TA_LEFT, leading=15)

    section_title_style = style('SectionTitle',
        fontName='Helvetica-Bold', fontSize=9, textColor=GREY_TEXT,
        alignment=TA_LEFT, spaceAfter=3, leading=12,
        textTransform='uppercase')

    label_style = style('Label',
        fontName='Helvetica', fontSize=9, textColor=GREY_TEXT,
        alignment=TA_LEFT, leading=13)

    value_style = style('Value',
        fontName='Helvetica-Bold', fontSize=9, textColor=DARK_TEXT,
        alignment=TA_RIGHT, leading=13)

    price_value_style = style('PriceValue',
        fontName='Helvetica-Bold', fontSize=10, textColor=GREEN,
        alignment=TA_RIGHT, leading=14)

    footer_style = style('Footer',
        fontName='Helvetica', fontSize=8, textColor=GREY_TEXT,
        alignment=TA_CENTER, leading=12)

    # ── Green header banner ────────────────────────────────────
    header_data = [[
        Paragraph('ENGESTOFTE GODS', header_style),
        Paragraph('Ordrebekræftelse', subheader_style),
    ]]
    header_table = Table(header_data, colWidths=[110*mm, 60*mm])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREEN),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (0,-1), 8),
        ('RIGHTPADDING', (-1,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6*mm))

    # ── Reference + date row ──────────────────────────────────
    today = datetime.now(timezone.utc).strftime('%d. %B %Y').replace(
        'January','januar').replace('February','februar').replace(
        'March','marts').replace('April','april').replace(
        'May','maj').replace('June','juni').replace(
        'July','juli').replace('August','august').replace(
        'September','september').replace('October','oktober').replace(
        'November','november').replace('December','december')

    ref_data = [[
        Paragraph(f'Reference: <b>{inquiry.reference}</b>', label_style),
        Paragraph(f'Dato: {today}', label_style),
    ]]
    ref_table = Table(ref_data, colWidths=[85*mm, 85*mm])
    ref_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREEN_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (0,-1), 8),
        ('RIGHTPADDING', (-1,0), (-1,-1), 8),
        ('ROUNDEDCORNERS', [4]),
    ]))
    story.append(ref_table)
    story.append(Spacer(1, 6*mm))

    # ── Customer section ──────────────────────────────────────
    contact = inquiry.contact or {}
    details = inquiry.details or {}
    staff = STAFF_INFO.get(inquiry.service, STAFF_INFO['other'])

    story.append(Paragraph('TIL', section_title_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=GREEN, spaceAfter=4))

    customer_rows = [
        [Paragraph('Navn', label_style),   Paragraph(contact.get('name', '—'), value_style)],
        [Paragraph('Email', label_style),  Paragraph(contact.get('email', '—'), value_style)],
        [Paragraph('Telefon', label_style), Paragraph(contact.get('phone', '—') or '—', value_style)],
    ]
    ct = Table(customer_rows, colWidths=[40*mm, 130*mm])
    ct.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, HexColor('#e8e8e4')),
    ]))
    story.append(ct)
    story.append(Spacer(1, 5*mm))

    # ── Arrangement section ───────────────────────────────────
    story.append(Paragraph('ARRANGEMENT', section_title_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=GREEN, spaceAfter=4))

    arr_rows = [
        [Paragraph('Ydelse', label_style),
         Paragraph(SERVICE_LABELS.get(inquiry.service, inquiry.service), value_style)],
    ]
    if details.get('date'):
        arr_rows.append([Paragraph('Ønsket dato', label_style),
                         Paragraph(details['date'], value_style)])
    if details.get('arrival'):
        arr_rows.append([Paragraph('Ankomst', label_style),
                         Paragraph(details['arrival'], value_style)])
    if details.get('departure'):
        arr_rows.append([Paragraph('Afrejse', label_style),
                         Paragraph(details['departure'], value_style)])
    if details.get('guests'):
        label = 'Skytter' if inquiry.service == 'hunting' else 'Gæster'
        arr_rows.append([Paragraph(label, label_style),
                         Paragraph(str(details['guests']), value_style)])
    if details.get('venue'):
        arr_rows.append([Paragraph('Lokale', label_style),
                         Paragraph(VENUE_LABELS.get(details['venue'], details['venue']), value_style)])
    if details.get('package'):
        arr_rows.append([Paragraph('Pakke', label_style),
                         Paragraph(PKG_LABELS.get(details['package'], details['package']), value_style)])
    if details.get('birds'):
        arr_rows.append([Paragraph('Fugle (estimeret)', label_style),
                         Paragraph(f"{details['birds']} stk.", value_style)])
    if details.get('house') and details['house'] != 'none':
        arr_rows.append([Paragraph('Hus', label_style),
                         Paragraph(details['house'], value_style)])

    at = Table(arr_rows, colWidths=[40*mm, 130*mm])
    at.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, HexColor('#e8e8e4')),
    ]))
    story.append(at)
    story.append(Spacer(1, 5*mm))

    # ── Price section ─────────────────────────────────────────
    story.append(Paragraph('PRISESTIMATE', section_title_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=GREEN, spaceAfter=4))

    if inquiry.price_on_request or not inquiry.estimated_price:
        price_text = 'Pris aftales individuelt — tilbud sendes separat.'
        story.append(Paragraph(price_text, label_style))
    else:
        price_rows = [
            [Paragraph('Estimeret total', label_style),
             Paragraph(_fmt_price(inquiry.estimated_price), price_value_style)],
            [Paragraph('Moms (25%)', label_style),
             Paragraph(_fmt_price(int(inquiry.estimated_price * 0.25)), value_style)],
            [Paragraph('Inkl. moms', label_style),
             Paragraph(_fmt_price(int(inquiry.estimated_price * 1.25)), price_value_style)],
        ]
        pt = Table(price_rows, colWidths=[40*mm, 130*mm])
        pt.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LINEBELOW', (0,0), (-1,-2), 0.3, HexColor('#e8e8e4')),
            ('BACKGROUND', (0,2), (-1,2), GREEN_LIGHT),
        ]))
        story.append(pt)

    story.append(Spacer(1, 5*mm))

    # ── Contact section ───────────────────────────────────────
    story.append(Paragraph('JERES KONTAKT HOS OS', section_title_style))
    story.append(HRFlowable(width='100%', thickness=0.5, color=GREEN, spaceAfter=4))

    contact_rows = [
        [Paragraph('Navn', label_style),     Paragraph(staff['name'], value_style)],
        [Paragraph('Email', label_style),    Paragraph(staff['email'], value_style)],
        [Paragraph('Telefon', label_style),  Paragraph(staff['phone'], value_style)],
    ]
    ct2 = Table(contact_rows, colWidths=[40*mm, 130*mm])
    ct2.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, HexColor('#e8e8e4')),
    ]))
    story.append(ct2)
    story.append(Spacer(1, 8*mm))

    # ── Footer disclaimer ─────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=0.5, color=HexColor('#d8d8d4'), spaceAfter=4))
    story.append(Paragraph(
        'Dette er en foreløbig ordrebekræftelse. Det endelige og bindende tilbud sendes separat af '
        'jeres kontaktperson. Alle priser er eksklusiv moms medmindre andet er angivet.',
        footer_style
    ))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        'Engestofte Gods · Søvej 10, 4930 Maribo · +45 26 22 04 04 · www.engestofte.com',
        footer_style
    ))

    doc.build(story)
    return buf.getvalue()
