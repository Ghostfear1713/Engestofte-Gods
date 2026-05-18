# AI Chatbot — Technical Documentation

## Overview

The chatbot is a floating conversational assistant embedded on the Engestofte Gods inquiry wizard. It allows visitors to ask questions about services, pricing, venues, and summer houses in natural Danish — and receive answers instantly — without leaving the page or calling anyone.

**Why it exists:**
From the start of this project, one of the explicit requirements was to meaningfully integrate AI — not as a gimmick, but in a way that creates real value for both the company and its customers.

After evaluating several approaches (AI-generated email drafts, natural language form pre-fill, automated summaries), the chatbot emerged as the strongest fit for three reasons:

**1. It saves the company time.**
Engestofte's staff — Johan, Lise, and Mette — currently answer the same questions repeatedly by phone and email: pricing, what's included, which venue fits a given group size. The chatbot handles those questions instantly, 24/7, without staff involvement. Every question answered by the bot is one less email Johan has to write.

**2. It gives customers confidence.**
People planning a wedding or a corporate event often hesitate before filling out a form — they want to know they're in the right place first. A quick answer to "Kan vi tage hunden med i sommerhuset?" or "Hvad er forskellen på de to lokaler?" removes that hesitation and helps them commit to the inquiry.

**3. It demonstrates practical AI integration.**
Rather than applying AI for its own sake, this implementation shows how a language model can be grounded in specific, real-world knowledge (Engestofte's exact prices, packages, and house descriptions) to behave like a knowledgeable team member — not a generic assistant.


---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser (React)                                                     │
│                                                                      │
│  ChatBot.jsx                                                         │
│  ┌─────────────────────────────────────────┐                        │
│  │  User types message                     │                        │
│  │  → fetch POST /api/chat (JSON)          │──────────────────────┐ │
│  │  ← ReadableStream (SSE tokens)          │◄─────────────────────┤ │
│  │  → render tokens live as they arrive    │                      │ │
│  └─────────────────────────────────────────┘                      │ │
└───────────────────────────────────────────────────────────────────┼─┘
                                                                    │
                               HTTP POST + SSE stream               │
                                                                    │
┌───────────────────────────────────────────────────────────────────▼─┐
│  Flask Backend (Python)                                              │
│                                                                      │
│  app.py → /api/chat                                                  │
│  ┌─────────────────────────────────────────┐                        │
│  │  Receive messages array                 │                        │
│  │  → chat_service.stream_chat()           │                        │
│  │  → Groq API (Llama 3.3 model)           │──────────────────────┐ │
│  │  ← streaming text chunks               │◄─────────────────────┤ │
│  │  → yield SSE events to browser         │                      │ │
│  └─────────────────────────────────────────┘                      │ │
└───────────────────────────────────────────────────────────────────┼─┘
                                                                    │
                          HTTPS API call (streaming)                │
                                                                    │
┌───────────────────────────────────────────────────────────────────▼─┐
│  Groq Cloud                                                          │
│  Model: llama-3.3-70b-versatile                                      │
│  → Receives: system prompt + conversation history                   │
│  ← Returns: streamed token-by-token response in Danish              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Technology Choices

### Why Groq?

Several AI providers were considered:

| Provider | Cost | Speed | Quality | Notes |
|---|---|---|---|---|
| Anthropic (Claude) | ~$0.002/msg | Fast | Excellent | Requires credit card |
| OpenAI (GPT-4o) | ~$0.003/msg | Fast | Excellent | Requires credit card |
| **Groq** | **Free tier** | **Very fast** | **Good** | **No credit card** |
| Ollama (local) | Free | Slow on CPU | Good | Requires local setup |

Groq was chosen because it offers a genuinely free tier with no credit card required — important for a student project that will be handed to a client. The client can then sign up for their own Groq account and swap the API key in the `.env` file.

### Why Llama 3.3 70B?

Groq hosts several open-source models. `llama-3.3-70b-versatile` was chosen because:
- It handles Danish fluently (multilingual training data)
- 70B parameters gives better reasoning and more nuanced answers than smaller models
- On Groq's infrastructure, even large models run fast enough for real-time chat
- It's free on Groq's generous free tier

### Why SSE (Server-Sent Events) over WebSockets?

WebSockets provide bidirectional communication, but the chatbot only needs **server → client** streaming. SSE is simpler, uses standard HTTP, and requires no additional libraries on either side:

```
WebSockets: bidirectional, persistent connection, requires socket.io library
SSE:        server → client only, works over plain HTTP, native browser support
```

SSE was the right tool for this specific job.

---

## System Prompt Design

The core of the chatbot's intelligence is not the model — it's the **system prompt**.

The system prompt is a large block of text sent with every request that tells the model:
1. What role it plays ("Du er en hjælpsom assistent for Engestofte Gods")
2. How to behave ("Vær varm, personlig — aldrig robotagtig")
3. Everything it knows (all services, all prices, all venue details, all staff contacts)

**Why a knowledge-base approach instead of RAG (Retrieval-Augmented Generation)?**

RAG is a technique where the AI searches a database for relevant chunks before answering. It's powerful for large knowledge bases (thousands of documents), but Engestofte's complete knowledge fits comfortably within a single prompt (~2,000 tokens). A simple in-prompt knowledge base is more reliable, faster, and requires no vector database.

**Structure of the system prompt (`chat_service.py`):**

```
1. Role definition — who the bot is, language (Danish), tone (warm, personal)
2. Behavioral rules — short answers, encourage form completion, never robotic
3. Knowledge base sections:
   ├── General (address, founding, contacts)
   ├── Bryllup (wedding packages, venues, pricing)
   ├── Fest & Fejring (party packages, pricing)
   ├── Konference (all three packages with exact inclusions)
   ├── Jagt (pheasant hunting, deer hunting)
   ├── Sommerhuse (all 5 houses with descriptions)
   └── Restaurant Værkstedet
4. Important notes — pricing disclaimers, what to escalate
```

---

## Backend: `chat_service.py`

**File:** `backend/chat_service.py`

```python
def _client():
    return Groq(api_key=os.getenv('GROQ_API_KEY'))

def stream_chat(messages: list):
    stream = _client().chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'system', 'content': SYSTEM_PROMPT}] + messages,
        stream=True,
        max_tokens=400,
        temperature=0.7,
    )
    for chunk in stream:
        text = chunk.choices[0].delta.content or ''
        if text:
            yield text
```

Key decisions:
- **`_client()` is a factory function**, not a module-level instance. This means the app starts successfully even without a valid API key, and only fails at call time. A module-level `Groq(...)` would crash the entire server on startup if the key is missing.
- **`max_tokens=400`** keeps answers concise and prevents runaway responses. Adjusted upward if needed.
- **`temperature=0.7`** balances creativity and factual accuracy. Lower (0.3) would be more robotic; higher (1.0) more unpredictable.
- **`stream=True`** makes Groq send tokens as they're generated instead of waiting for the full response. This is what creates the live typing effect.

---

## Backend: `/api/chat` Endpoint

**File:** `backend/app.py`

```python
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    messages = data.get('messages', [])

    def generate():
        for chunk in chat_service.stream_chat(messages):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(
        stream_with_context(generate()),
        content_type='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'},
    )
```

**SSE format explained:**

Every chunk the browser receives looks like:
```
data: {"text": "I "}
data: {"text": "br"}
data: {"text": "yllup"}
...
data: [DONE]
```

Each line starts with `data: ` (SSE protocol). The browser reads these as a stream and can act on each one individually. `[DONE]` is a sentinel value telling the browser the stream is finished.

**`stream_with_context`** is a Flask utility that keeps the application context alive during streaming — without it, Flask would close the context before all tokens are sent.

**`X-Accel-Buffering: no`** disables nginx's response buffering if the app is deployed behind nginx, ensuring tokens reach the browser immediately rather than being held in a buffer.

---

## Frontend: `ChatBot.jsx`

**File:** `frontend/src/components/ChatBot.jsx`

**Component structure:**
```
ChatBot
├── Floating action button (fixed, bottom-right)
│   └── AnimatePresence toggle between 💬 and ✕
└── Chat panel (AnimatePresence slide-up)
    ├── Header (Engestofte Gods branding + online dot)
    ├── Messages list (user bubbles right, bot bubbles left)
    ├── Suggestion buttons (shown before first message)
    └── Input row (textarea + send button)
```

**State managed:**
```js
messages       // Full conversation history [{role, content}]
input          // Current text in the textarea
streaming      // Boolean — true while tokens are arriving
open           // Boolean — chat panel visible
```

**Sending a message:**
```js
const sendMessage = async (text) => {
  // 1. Add user message to state
  // 2. Append empty assistant message (will be filled by stream)
  // 3. POST to /api/chat with full conversation history
  // 4. Read SSE stream token by token
  // 5. Append each token to the last assistant message in state
}
```

The key pattern is that the assistant message is created **empty** upfront, then filled character by character as tokens arrive. React re-renders on each token update, producing the live typing effect.

---

## The Streaming UX

When a user sends a message, three things happen simultaneously:

1. **A new empty message bubble appears** for the assistant
2. **Tokens stream in** and are appended to that bubble
3. **The page auto-scrolls** to the bottom via a `ref` on the last message

If the stream hasn't started yet (latency from Groq), a **typing indicator** (three animated dots) shows inside the empty bubble so the user knows something is happening.

```jsx
{streaming && msg.content === '' && (
  <span className={styles.typing}>
    <span /><span /><span />  // CSS animation: bounce up/down with stagger
  </span>
)}
```

---

## Security & Limits

| Concern | Approach |
|---|---|
| API key exposure | Key lives in `.env` (server-side only), never sent to browser |
| Prompt injection | System prompt establishes strict role; model instructed to stay on topic |
| Runaway responses | `max_tokens=400` hard cap per response |
| Missing key | Endpoint returns `503` with clear error if key not configured |
| CORS | Flask-CORS allows only `localhost:5173` and the production domain |

---

## How to Swap the AI Provider

The chatbot is designed so the AI provider can be changed in **4 lines** in `chat_service.py`.

**Switch to Anthropic Claude:**
```python
import anthropic
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def stream_chat(messages):
    with client.messages.stream(
        model='claude-haiku-4-5-20251001',
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text
```

**Switch to OpenAI:**
```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def stream_chat(messages):
    stream = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'system', 'content': SYSTEM_PROMPT}] + messages,
        stream=True, max_tokens=400,
    )
    for chunk in stream:
        yield chunk.choices[0].delta.content or ''
```

The `/api/chat` endpoint and all frontend code remain **completely unchanged**.

---

## Files Reference

| File | Role |
|---|---|
| `backend/chat_service.py` | Groq client, system prompt, stream generator |
| `backend/app.py` | `/api/chat` SSE endpoint |
| `backend/.env` | `GROQ_API_KEY` (never committed to git) |
| `backend/.env.example` | Template for client handover |
| `frontend/src/components/ChatBot.jsx` | Full chatbot UI component |
| `frontend/src/components/ChatBot.module.css` | Styles: FAB, panel, bubbles, typing indicator |
| `frontend/src/components/WizardPage.jsx` | Mounts `<ChatBot />` alongside the wizard |
