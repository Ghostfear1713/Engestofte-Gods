# Project Process — Design Decisions & AI Collaboration

## Project Background

Engestofte Gods is a historic Danish estate from 1457 offering weddings, parties, conferences, pheasant hunting, and five holiday cottages. Their existing contact solution was a plain three-field form on their Squarespace website — a name, an email, and a message box.

The problem wasn't that the form was ugly. The problem was what happened after someone hit send. The staff (Johan, Lise, or Mette) would receive the email, manually copy the details into another system, calculate a price by hand, then write a reply from scratch. For a business receiving dozens of inquiries per week across five very different service types, this was hours of repetitive work with no structure and no record-keeping.

The goal of this project was to replace that friction with a system that:
- Guides customers through the inquiry intelligently
- Stores every inquiry automatically
- Gives staff a dashboard to manage them
- Uses AI meaningfully — not as a gimmick

---

## Key Design Decisions

### 1. Visual service cards instead of checkboxes

**What we considered:** A standard form with checkboxes or a dropdown for selecting the service type.

**What we chose:** Large visual cards — one per service — that animate when selected and reveal which staff member will handle the inquiry.

**Why:** Engestofte is a luxury brand. A checkbox feels like a tax form. A card with an icon, a name, and a warm message ("Johan tager sig personligt af jeres bryllup") matches the tone of a 1457 royal manor. It also guides the customer — someone who hasn't decided yet between Den Gamle Lade and Værkstedet needs context, not an empty input field.

---

### 2. Multi-step wizard instead of a flat form

**What we considered:** A single-page form with all fields visible at once.

**What we chose:** A 5-step wizard where each step is focused on one thing, and the fields shown depend entirely on which service was selected. A hunter never sees wedding venue options. A conference organizer never sees arrival/departure date pickers.

**Why:** Relevance reduces abandonment. A bride filling in "number of pheasants" would immediately distrust the system. Beyond that, the wizard allowed us to introduce a live price estimate mid-flow — something that only works if you already know the service, venue, and guest count from previous steps.

---

### 3. The info panel outside the white card

**What we considered:** An info panel inside the white form card, alongside the form fields in a two-column layout.

**What we chose:** The panel floats in the grey background to the right of the white card, completely outside it.

**Why:** When the panel was inside the card, both the form and the info were compressed, fighting for space. The user pointed this out — it felt stressful to the eye. Moving the panel into the surrounding grey space gives the form room to breathe and makes the contextual info feel like a gentle addition, not a cluttered box. The panel uses a semi-transparent white with a green left border so it sits naturally in the gradient background.

---

### 4. Snippet system instead of AI email drafting

**What we considered:** A button in the admin dashboard that would use AI to generate a complete email reply from scratch, based on the inquiry details.

**What we chose:** A snippet system — pre-written Danish text blocks in Engestofte's own voice, each with dynamic placeholders (`{navn}`, `{dato}`, `{pris}`) that auto-fill with the real inquiry data. Staff click the snippets they want, in the order they want, and edit the result freely before sending.

**Why this was the right call:** Pure AI generation has a fundamental problem for a luxury brand — it produces text that reads as AI to a trained eye, and Johan or Lise would constantly edit it anyway. The snippets are written in Engestofte's actual voice. They're consistent, warm, and personal. The automation benefit is still there (dynamic data fills in automatically, no copy-paste) but the human touch is preserved because the words themselves were written by a person.

This decision came directly from sparring — the idea of AI generation was raised, the user correctly identified it would undermine the human-touch philosophy of the entire project, and we landed on snippets together.

---

### 5. Standalone page instead of embedding in Squarespace

**What we considered:** Replacing the existing Kontakt page, or embedding the wizard inside Squarespace via iframe or code injection.

**What we chose:** The wizard is a completely separate standalone page, hosted independently. Engestofte simply adds one button in Squarespace that links to it.

**Why:** Squarespace doesn't support running a React + Flask application natively. Embedding via iframe has well-known problems with scroll behaviour, responsive layout, and mobile breakpoints. Developer Mode in Squarespace is available but breaks their visual editor — a risk not worth taking for a client who needs to manage their own website. The standalone approach is clean, non-destructive, and gives Engestofte full control: they update the wizard URL in one place in Squarespace and everything else follows.

---

### 6. Groq instead of paid AI providers

**What we considered:** Anthropic Claude or OpenAI GPT-4o for the chatbot.

**What we chose:** Groq with Llama 3.3 70B.

**Why:** Both Anthropic and OpenAI require a credit card to use their APIs. This is a student project being handed to a client. Adding personal payment credentials into a project handover creates an awkward situation — the student's card gets charged until the client sets up their own account. Groq's free tier requires no credit card, handles Danish fluently, and responds fast enough for real-time chat. When the client is ready to upgrade, swapping to Claude or GPT-4o is a 4-line change in `chat_service.py` — the rest of the system stays untouched.

---

## The AI Chatbot — Why This Approach

Several AI features were evaluated before building the chatbot:

- **AI email drafting** — rejected in favour of snippets (see above)
- **Natural language form pre-fill** — promising but complex; a customer typing "vi vil have et bryllup for 80 personer i august" and having the form auto-fill would be impressive but adds significant complexity for moderate gain
- **AI daily brief for staff** — easy to build and useful, but lower priority than a customer-facing feature
- **AI chatbot** — chosen as the primary AI feature

The chatbot was chosen because it addresses a real, observable problem: customers have questions before they fill in the form. Without something to answer them, they either call (takes Johan's time), email (creates more back-and-forth), or leave. The chatbot removes that friction at the exact moment it matters.

The implementation uses a knowledge-base approach — all of Engestofte's services, prices, house descriptions, and staff contacts are written directly into the system prompt. This is simpler, faster, and more reliable than a RAG (Retrieval-Augmented Generation) setup for a knowledge base this size. The model knows everything it needs to know before the first message arrives.

---

## Working with AI — How the Collaboration Shaped the Project

This project was built in close collaboration with Claude (Anthropic's AI). The collaboration was not "Claude builds the project while the student watches." It was a genuine back-and-forth where both sides pushed on each other's ideas.

**Things the AI suggested that were accepted:**
- Visual service cards over checkboxes (luxury brand argument)
- GDPR consent checkbox (the student hadn't thought of this — it's legally required in Denmark)
- A 6th "Noget andet?" card for customers who don't fit the 5 categories, routing to Mette Egeskov
- The phone number field (staff prefer calling for complex bookings)
- Reference IDs on every inquiry (ENQ-2026-XXXX) so staff and customer can reference the same inquiry
- The snippet system as an alternative to pure AI drafting

**Things the student pushed back on:**
- The info panel inside the white card felt visually compressed — the student spotted this and requested it be moved outside
- Pure AI email generation was suggested; the student correctly identified it would feel robotic and pushed for snippets
- The student chose Groq over paid providers to avoid personal payment credentials in a client handover
- The student identified that some of the 5 service panels (Konference, Jagt, Sommerhuse) were missing from the info panel feature, and pushed to expand it to all services

**Things that changed direction through sparring:**
- The initial plan was to embed the wizard in Squarespace. A conversation about how Squarespace actually works led to the standalone page approach.
- The chatbot was initially planned with WebSockets. The realisation that the chatbot only needs server→client communication led to SSE (Server-Sent Events) — simpler, fewer libraries, same result.
- The progress bar had a visual bug (the connector line extended past the last step). The student spotted it from a screenshot and it was fixed.

---

## What We Would Do Differently

**Calendar integration** — The admin dashboard stores booked dates, but there's no visual calendar and no automatic conflict detection. A customer picking a date that's already taken gets no feedback. This was on the roadmap but not built.

**Better mobile testing** — The layout was designed mobile-first, but more real-device testing would have caught edge cases earlier. The info panel in particular could use more mobile polish.

**Admin password security** — The current admin login uses a plain username and password stored in `.env`. For a real production system, this should be hashed (bcrypt) and stored in the database, with a proper "forgot password" flow.

**PDF quote generation** — Confirmed bookings should auto-generate a branded PDF with the full price breakdown. This was planned and documented but not implemented within the project timeline.

---

## Summary

The project started as a plain contact form and ended as a complete inquiry management system with a guided customer wizard, a contextual AI chatbot, a staff dashboard with snippet-based email composition, automatic price calculation, and a SQLite database replacing the previous copy-paste workflow.

The most important design principle throughout was that the system should feel human — not like software, and certainly not like AI. Every decision that touched language, tone, or flow was evaluated against that standard. The AI chatbot exists not because it's technically impressive, but because it's genuinely useful: it answers the questions people have before they commit, and it does so in a way that feels like talking to someone who actually knows Engestofte.
