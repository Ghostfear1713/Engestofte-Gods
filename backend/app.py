import os
import json
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_mail import Mail
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from dotenv import load_dotenv

from database import db, Inquiry, STATUSES
import pricing
import email_service
import chat_service
import pdf_service

load_dotenv(override=True)

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# ── Config ────────────────────────────────────────────────────────────

app.config.update(
    # Database
    SQLALCHEMY_DATABASE_URI='sqlite:///engestofte.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,

    # JWT
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'engestofte-admin-secret-change-in-prod'),
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=8),

    # Mail
    MAIL_SERVER=os.getenv('MAIL_SERVER', 'sandbox.smtp.mailtrap.io'),
    MAIL_PORT=int(os.getenv('MAIL_PORT', 2525)),
    MAIL_USE_TLS=os.getenv('MAIL_USE_TLS', 'true').lower() == 'true',
    MAIL_USE_SSL=False,
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=(
        os.getenv('MAIL_SENDER_NAME', 'Engestofte Gods'),
        os.getenv('MAIL_USERNAME', ''),
    ),
)

db.init_app(app)
mail = Mail(app)
jwt = JWTManager(app)

# Admin credentials (env-configurable, safe defaults for dev)
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'engestofte')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'gods2026')

# ── DB init ───────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()


# ── Public endpoints ─────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400

    service   = data.get('service', '')
    details   = data.get('details', {})
    contact   = data.get('contact', {})
    reference = data.get('reference', f'ENQ-{datetime.now(timezone.utc).year}-0000')

    if not service:
        return jsonify({'error': 'Service is required'}), 400
    if not contact.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    if not contact.get('gdpr_consent'):
        return jsonify({'error': 'GDPR consent is required'}), 400

    price_result = pricing.calculate(service, details)
    staff = email_service.STAFF_ROUTING.get(service, {})

    # ── Store in DB ──────────────────────────────────────────────────
    inquiry = Inquiry(
        reference=reference,
        service=service,
        details_json=json.dumps(details),
        contact_json=json.dumps(contact),
        estimated_price=price_result.get('total'),
        price_on_request=price_result.get('price_on_request', False),
        status='ny',
        staff_name=staff.get('name'),
        staff_email=staff.get('email'),
    )
    db.session.add(inquiry)
    db.session.commit()

    # ── Send emails ──────────────────────────────────────────────────
    email_sent = True
    try:
        email_service.send_staff_email(mail, service, details, contact, reference, price_result)
        email_service.send_customer_email(mail, service, contact, reference, staff.get('name', 'Engestofte Gods'))
    except Exception as e:
        app.logger.error(f'Email error: {e}')
        email_sent = False

    return jsonify({
        'success': True,
        'reference': reference,
        'staff': staff.get('name'),
        'email_sent': email_sent,
    })


# ── Admin auth ───────────────────────────────────────────────────────

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    if data.get('username') == ADMIN_USERNAME and data.get('password') == ADMIN_PASSWORD:
        token = create_access_token(identity=ADMIN_USERNAME)
        return jsonify({'token': token, 'username': ADMIN_USERNAME})
    return jsonify({'error': 'Forkert brugernavn eller adgangskode'}), 401


# ── Admin daily brief ────────────────────────────────────────────────

@app.route('/api/admin/brief', methods=['GET'])
@jwt_required()
def admin_brief():
    """Generate an AI daily brief summarising current inquiry pipeline."""
    if not os.getenv('GROQ_API_KEY') or os.getenv('GROQ_API_KEY') == 'PASTE_YOUR_GROQ_API_KEY_HERE':
        return jsonify({'brief': 'God dag! Velkommen til administrationen.', 'ai': False})

    from sqlalchemy import func as sqlfunc
    from datetime import datetime, timezone, timedelta

    total        = Inquiry.query.count()
    ny           = Inquiry.query.filter_by(status='ny').count()
    kontaktet    = Inquiry.query.filter_by(status='kontaktet').count()
    bekraeftet   = Inquiry.query.filter_by(status='bekræftet').count()
    annulleret   = Inquiry.query.filter_by(status='annulleret').count()

    # Inquiries received in the last 24 hours
    since        = datetime.now(timezone.utc) - timedelta(hours=24)
    recent       = Inquiry.query.filter(Inquiry.created_at >= since).count()

    # Next confirmed booking date
    next_confirmed = (
        Inquiry.query
        .filter_by(status='bekræftet')
        .filter(Inquiry.details_json.like('%"date"%'))
        .order_by(Inquiry.created_at.asc())
        .first()
    )
    next_date_text = ''
    if next_confirmed:
        d = next_confirmed.details.get('date', '')
        if d:
            next_date_text = f"Næste bekræftede arrangement: {d}."

    # Service breakdown of pipeline (ny + kontaktet)
    from email_service import SERVICE_LABELS
    pipeline = Inquiry.query.filter(Inquiry.status.in_(['ny', 'kontaktet'])).all()
    service_counts = {}
    for inq in pipeline:
        label = SERVICE_LABELS.get(inq.service, inq.service)
        service_counts[label] = service_counts.get(label, 0) + 1

    pipeline_text = ', '.join(f'{count} {label.lower()}' for label, count in service_counts.items())

    # Build context for the AI
    context = (
        f"Statistik for Engestofte Gods forespørgselssystem:\n"
        f"- Totalt: {total} forespørgsler\n"
        f"- Nye (ubehandlede): {ny}\n"
        f"- Kontaktet: {kontaktet}\n"
        f"- Bekræftede: {bekraeftet}\n"
        f"- Annullerede: {annulleret}\n"
        f"- Modtaget seneste 24 timer: {recent}\n"
        f"- I pipeline: {pipeline_text or 'ingen'}\n"
        f"{next_date_text}"
    )

    try:
        from groq import Groq
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            max_tokens=120,
            temperature=0.7,
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'Du er en hjælpsom assistent for personalet på Engestofte Gods. '
                        'Skriv en kort, varm og personlig velkomst-besked på dansk (max 2-3 sætninger) '
                        'baseret på systemstatistikken. Nævn de vigtigste tal. '
                        'Vær positiv og imødekommende. Start IKKE med "God morgen" eller "God dag" — '
                        'vær mere kreativ og personlig. Brug ikke emojis.'
                    ),
                },
                {'role': 'user', 'content': context},
            ],
        )
        brief = response.choices[0].message.content.strip()
        return jsonify({'brief': brief, 'ai': True, 'stats': {
            'total': total, 'ny': ny, 'kontaktet': kontaktet,
            'bekræftet': bekraeftet, 'recent': recent,
        }})
    except Exception as e:
        app.logger.error(f'Brief AI error: {e}')
        fallback = f"Velkommen tilbage. Der er {ny} nye forespørgsler klar til behandling."
        if recent:
            fallback += f" {recent} er modtaget de seneste 24 timer."
        return jsonify({'brief': fallback, 'ai': False})


# ── Admin inquiry endpoints ───────────────────────────────────────────

@app.route('/api/admin/inquiries', methods=['GET'])
@jwt_required()
def list_inquiries():
    status_filter = request.args.get('status')
    query = Inquiry.query.order_by(Inquiry.created_at.desc())
    if status_filter and status_filter in STATUSES:
        query = query.filter_by(status=status_filter)
    inquiries = query.all()
    return jsonify([i.to_dict() for i in inquiries])


@app.route('/api/admin/inquiries/<int:inquiry_id>', methods=['GET'])
@jwt_required()
def get_inquiry(inquiry_id):
    inquiry = db.get_or_404(Inquiry, inquiry_id)
    return jsonify(inquiry.to_dict())


@app.route('/api/admin/inquiries/<int:inquiry_id>', methods=['PATCH'])
@jwt_required()
def update_inquiry(inquiry_id):
    inquiry = db.get_or_404(Inquiry, inquiry_id)
    data = request.get_json() or {}
    prev_status = inquiry.status

    if 'status' in data and data['status'] in STATUSES:
        inquiry.status = data['status']
    if 'notes' in data:
        inquiry.notes = data['notes']
    if 'details' in data and isinstance(data['details'], dict):
        # Merge updated fields into existing details
        current = inquiry.details
        current.update(data['details'])
        inquiry.details_json = json.dumps(current)
        # Recalculate price with new details
        price_result = pricing.calculate(inquiry.service, current)
        if not price_result.get('price_on_request'):
            inquiry.estimated_price = price_result.get('total')

    inquiry.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    # Auto-send PDF confirmation when status changes to bekræftet
    if data.get('status') == 'bekræftet' and prev_status != 'bekræftet':
        try:
            pdf_bytes = pdf_service.generate_pdf(inquiry)
            contact = inquiry.contact
            if contact.get('email'):
                from flask_mail import Message
                msg = Message(
                    subject=f'Booking bekræftelse — {inquiry.reference}',
                    recipients=[contact['email']],
                    body=(
                        f'Kære {contact.get("name", "")},\n\n'
                        f'Vi er glade for at bekræfte jeres forespørgsel med reference {inquiry.reference}.\n\n'
                        f'Find den foreløbige ordrebekræftelse vedhæftet denne mail.\n\n'
                        f'Med venlig hilsen\n{inquiry.staff_name or "Engestofte Gods"}\n'
                        f'Engestofte Gods · Søvej 10, 4930 Maribo'
                    ),
                )
                msg.attach(
                    f'Ordrebekraeftelse-{inquiry.reference}.pdf',
                    'application/pdf',
                    pdf_bytes,
                )
                mail.send(msg)
        except Exception as e:
            app.logger.error(f'PDF/email error on bekræftet: {e}')

    return jsonify(inquiry.to_dict())


@app.route('/api/admin/inquiries/<int:inquiry_id>/pdf', methods=['GET'])
@jwt_required()
def download_pdf(inquiry_id):
    inquiry = db.get_or_404(Inquiry, inquiry_id)
    try:
        pdf_bytes = pdf_service.generate_pdf(inquiry)
        return Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename=Ordrebekraeftelse-{inquiry.reference}.pdf',
                'Content-Length': len(pdf_bytes),
            }
        )
    except Exception as e:
        app.logger.error(f'PDF generation error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/inquiries/<int:inquiry_id>/send-reply', methods=['POST'])
@jwt_required()
def send_reply(inquiry_id):
    inquiry = db.get_or_404(Inquiry, inquiry_id)
    data = request.get_json() or {}
    body = data.get('body', '').strip()

    if not body:
        return jsonify({'error': 'Email body cannot be empty'}), 400

    contact = inquiry.contact
    customer_email = contact.get('email')
    if not customer_email:
        return jsonify({'error': 'No customer email on file'}), 400

    try:
        from flask_mail import Message
        msg = Message(
            subject=data.get('subject', f'Svar på din forespørgsel — {inquiry.reference}'),
            recipients=[customer_email],
            body=body,
        )
        mail.send(msg)

        # Auto-advance to 'kontaktet' if still 'ny'
        if inquiry.status == 'ny':
            inquiry.status = 'kontaktet'
            inquiry.updated_at = datetime.now(timezone.utc)
            db.session.commit()

        return jsonify({'success': True, 'status': inquiry.status})
    except Exception as e:
        app.logger.error(f'Reply email error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def stats():
    from sqlalchemy import func
    counts = db.session.query(
        Inquiry.status, func.count(Inquiry.id)
    ).group_by(Inquiry.status).all()
    return jsonify({s: c for s, c in counts})


# ── AI Chatbot ───────────────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    messages = data.get('messages', [])

    if not messages:
        return jsonify({'error': 'No messages provided'}), 400

    if not os.getenv('GROQ_API_KEY') or os.getenv('GROQ_API_KEY') == 'PASTE_YOUR_GROQ_API_KEY_HERE':
        return jsonify({'error': 'GROQ_API_KEY not configured'}), 503

    def generate():
        try:
            for chunk in chat_service.stream_chat(messages):
                # Server-Sent Events format
                yield f"data: {json.dumps({'text': chunk})}\n\n"
        except Exception as e:
            app.logger.error(f'Chat error: {e}')
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(
        stream_with_context(generate()),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*',
        },
    )


if __name__ == '__main__':
    app.run(debug=True, port=5000)
