import json
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Inquiry(db.Model):
    __tablename__ = 'inquiries'

    id            = db.Column(db.Integer, primary_key=True)
    reference     = db.Column(db.String(20), unique=True, nullable=False, index=True)
    service       = db.Column(db.String(30), nullable=False)
    details_json  = db.Column(db.Text, nullable=False, default='{}')
    contact_json  = db.Column(db.Text, nullable=False, default='{}')
    estimated_price = db.Column(db.Integer, nullable=True)  # None = price on request
    price_on_request = db.Column(db.Boolean, default=False)
    status        = db.Column(db.String(20), nullable=False, default='ny')
    staff_name    = db.Column(db.String(60), nullable=True)
    staff_email   = db.Column(db.String(100), nullable=True)
    notes         = db.Column(db.Text, nullable=True)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                              onupdate=lambda: datetime.now(timezone.utc))

    # ── Convenience helpers ──────────────────────────────────────────

    @property
    def details(self):
        return json.loads(self.details_json or '{}')

    @property
    def contact(self):
        return json.loads(self.contact_json or '{}')

    def to_dict(self):
        return {
            'id':              self.id,
            'reference':       self.reference,
            'service':         self.service,
            'details':         self.details,
            'contact':         self.contact,
            'estimated_price': self.estimated_price,
            'price_on_request': self.price_on_request,
            'status':          self.status,
            'staff_name':      self.staff_name,
            'staff_email':     self.staff_email,
            'notes':           self.notes,
            'created_at':      self.created_at.isoformat() if self.created_at else None,
            'updated_at':      self.updated_at.isoformat() if self.updated_at else None,
        }


# Status values
STATUSES = ['ny', 'kontaktet', 'bekræftet', 'annulleret']

STATUS_LABELS = {
    'ny':          'Ny',
    'kontaktet':   'Kontaktet',
    'bekræftet':   'Bekræftet',
    'annulleret':  'Annulleret',
}
