# Interior-Agent (Decorpot)

AI-powered interior design consultation system for Decorpot — floor plan upload, conversational AI, rule-based cost estimation (Decorpot pricing), lead scoring, PDF quotation, and email.

## Architecture

- **Frontend:** React 18 + Vite + React Router + Puter.js (free AI)
- **Backend:** Node.js + Express
- **Storage:** In-memory (no MongoDB required)
- **AI:** Puter.js (browser) for chat + floor plan analysis
- **PDF:** PDFKit (Decorpot-style quotation)
- **Email:** Nodemailer

## Quick Start

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend: `http://localhost:3000` — proxies API to backend on port 5000.

## Features

- **Floor plan upload** — AI analyzes image, extracts rooms & area
- **Decorpot pricing** — Real per-sqft rates, room-wise breakdown, 5% discount, 18% GST
- **AI chat** — Collects property type, area, city, budget, timeline, style (no API key)
- **Lead scoring** — High / Medium / Low
- **PDF quotation** — Decorpot branding, payment schedule (10%-50%-40%)
- **Admin dashboard** — View leads at `/dashboard`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/estimate` | Cost estimation (Decorpot pricing) |
| POST | `/api/lead` | Create lead + PDF + email |
| GET | `/api/leads` | All leads (admin) |
| GET | `/api/lead/:id` | Lead by ID |
| GET | `/api/health` | Health check |

## Environment Variables

```
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
COMPANY_NAME=Decorpot
COMPANY_PHONE=9108602000
COMPANY_EMAIL=parna.roy@decorpot.com
```
