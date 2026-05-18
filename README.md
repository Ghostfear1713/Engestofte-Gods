# Engestofte Gods — Forespørgselsystem

A smart inquiry system for Engestofte Gods, replacing their plain contact form with a guided multi-step wizard, an admin dashboard for staff, and an AI chatbot for customer support.

Built as a Datamatiker case project.

---

## What It Does

**For customers** — a 5-step wizard that collects service type, event details, and contact info, shows a live price estimate, and routes the inquiry directly to the right staff member.

**For staff** — a password-protected admin dashboard where all inquiries are stored, tracked by status, and replied to using a snippet-based email composer.

**For customers on the wizard** — a floating AI chatbot (Llama 3.3 via Groq) that answers questions about packages, pricing, houses, and services in Danish.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq](https://console.groq.com) account (for the AI chatbot)
- A [Mailtrap](https://mailtrap.io) sandbox account (for email testing)

---

## Running Locally

### 1. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
```

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and set:
```
GROQ_API_KEY=your-groq-api-key
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
```

Start the server:
```bash
python app.py
```

Flask runs on **http://localhost:5000**

---

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Vite runs on **http://localhost:5173**

---

## Environment Variables

All variables live in `backend/.env`. See `backend/.env.example` for the full template.

| Variable | Description | Where to get it |
|---|---|---|
| `GROQ_API_KEY` | AI chatbot API key | [console.groq.com](https://console.groq.com) — free |
| `MAIL_SERVER` | SMTP server | Mailtrap: `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | SMTP port | Mailtrap: `2525` |
| `MAIL_USERNAME` | SMTP username | From Mailtrap inbox settings |
| `MAIL_PASSWORD` | SMTP password | From Mailtrap inbox settings |
| `MAIL_SENDER_NAME` | Display name in emails | `Engestofte Gods` |
| `ADMIN_USERNAME` | Admin dashboard login | Default: `engestofte` |
| `ADMIN_PASSWORD` | Admin dashboard password | Default: `gods2026` — **change this** |
| `JWT_SECRET_KEY` | JWT signing secret | Any long random string — **change this** |

---

## Admin Dashboard

Open **http://localhost:5173/admin**

Default login:
- Username: `engestofte`
- Password: `gods2026`

**Change these before handing over to the client** — update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`.

The dashboard shows all incoming inquiries, lets staff update status (Ny → Kontaktet → Bekræftet → Annulleret), write internal notes, and compose replies using pre-written Danish snippets that auto-fill with customer data.

---

## Project Structure

```
AI case project/
├── backend/
│   ├── app.py              # Flask app — all API endpoints
│   ├── database.py         # SQLAlchemy models (Inquiry)
│   ├── pricing.py          # Price calculation logic
│   ├── email_service.py    # Email templates + staff routing
│   ├── chat_service.py     # Groq AI chatbot (system prompt + stream)
│   ├── requirements.txt
│   ├── .env                # Your credentials (never commit this)
│   └── .env.example        # Template for handover
├── frontend/
│   ├── src/
│   │   ├── components/     # Wizard, chatbot, header, progress bar
│   │   ├── admin/          # Admin dashboard pages + snippet system
│   │   └── utils/          # Client-side pricing logic
│   └── public/
│       └── mockup.html     # Standalone Engestofte homepage mockup
└── docs/
    ├── AI_CHATBOT.md       # Technical documentation for the chatbot
    └── PROCESS.md          # Design decisions and project process
```

---

## Deploying to Production

**Frontend → Vercel** (free)
1. Push the `frontend/` folder to a GitHub repo
2. Connect it to [vercel.com](https://vercel.com) — auto-deploys on push

**Backend → Railway** (free tier)
1. Push the `backend/` folder to a GitHub repo
2. Connect it to [railway.app](https://railway.app)
3. Add all `.env` variables in Railway's environment settings

**After deployment:**
- Update the API URL in `frontend/src/admin/useAdminAuth.js` from `localhost:5000` to your Railway URL
- Update CORS origins in `backend/app.py` to include your Vercel domain
- Engestofte adds a "Start forespørgsel →" button in Squarespace pointing to the Vercel URL

---

## Handing Over to Engestofte

1. Give them the Vercel URL and Railway URL
2. They replace the `.env` values with their real SMTP credentials (their own mail server)
3. They create their own Groq account at [console.groq.com](https://console.groq.com) and replace `GROQ_API_KEY`
4. They change `ADMIN_PASSWORD` and `JWT_SECRET_KEY` to something secure
5. In Squarespace, they add a button on the homepage hero and the Kontakt page linking to the wizard URL
