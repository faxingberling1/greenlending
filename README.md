# AI-Powered Mortgage Lead Engagement & Texting Platform
### Built for **Green Lending** (https://greenlending.com) by **Neo Gen Technologies** (https://neogentechnologies.com)

A web platform and interactive prototype implementing the custom software proposal for Green Lending.

---

## 🌟 Executive Overview

- **Project Type:** Custom AI Software Development & Automation
- **Target Market:** United States Mortgage Industry
- **Core Loan Workflows:**
  1. **HELOC (Home Equity Lines of Credit):** Property value, existing mortgage balance, accessible equity, borrowing amount, purpose of funds, timeline.
  2. **Mortgage Refinance:** Current balance, existing rate, monthly payment, refi goals (rate/term reduction, cash-out), credit bracket, timeline.
  3. **Home Purchase:** Estimated budget, preferred location, down payment readiness, pre-approval status, purchase timeline.
- **Core Platform Investment:** **$5,700 USD** (3 Milestones: $2,280 / $1,710 / $1,710)
- **Monthly Maintenance & SLA:** **$650/month**
- **Delivery Timeline:** **4–6 Weeks**
- **Modular Add-Ons Available:** AI Voice Calling Agent (+$2,400), Lead Reactivation Engine (+$1,200), Direct LOS Integration (+$1,800), Bilingual Spanish AI (+$950), Loan Officer Mobile App (+$1,600), Omnichannel Web/WhatsApp (+$1,100)
- **Enterprise Scalability Options:** Multi-Branch Architecture ($2,800), Commercial SaaS Reseller Engine ($4,500), Dedicated High-Throughput Short Code ($1,500)

---

## 🚀 Key Modules & Interactive Features

1. **Interactive AI SMS Simulator (`/`):**
   - Live iPhone framing simulating borrower-to-AI two-way text conversations.
   - Switchable qualification workflows (HELOC, Refinance, Purchase).
   - Real-time intent classification and Lead Temperature scoring (🔥 Hot, ☀️ Warm, ❄️ Cold).
   - Dynamic qualification entity extraction (Property value, balance, equity, loan officer assignment).
   - Preset borrower responses and quick action chips.
   - **Loan Officer Human Takeover toggle:** Instantly pauses AI messaging and notifies the prospect.
   - **TCPA / 10DLC Compliance testing:** Handles `STOP`, `QUIT`, `UNSUBSCRIBE` keywords with automated opt-out suppression.

2. **Centralized Mortgage CRM & Lead Management (`/api/leads`):**
   - Complete pipeline table view with search and multi-parameter filters (Category, Temperature Score).
   - Lead Detail Drawer displaying comprehensive mortgage qualification figures, conversation transcripts, and LO notes.
   - CSV lead batch import simulation and CSV table export.
   - New inbound lead creation with automatic campaign trigger.

3. **Centralized Two-Way SMS Inbox:**
   - Real-time messaging interface for loan officers.
   - Live manual messaging alongside AI auto-replies.
   - 1-Click Loan Officer Takeover with status flags.
   - Internal LO notes tab and canned quick actions (Request 5-Min Call, Soft-Pull Pre-Approval Link, Zero Closing Cost Pitch).

4. **Automated Follow-Up Sequences & Campaigns (`/api/campaigns`):**
   - 7-Day mortgage nurture cadence visualization (Day 0 Intro -> Day 1 Value -> Day 3 Case Study -> Day 5 Low-Friction Check -> Day 7 Soft Close).
   - Campaign cards for active loan programs with quiet hour restrictions (8:00 AM - 9:00 PM local time).

5. **Reporting & Conversion Analytics (`/api/analytics`):**
   - High-level KPIs: Inbound leads, 95.6% contact rate, 43.1% reply rate, 525 hot leads, 382 human handoffs, 0.8% TCPA opt-out rate.
   - Interactive visual breakdown charts for loan categories and AI lead intent temperatures.

6. **Interactive Executive Project Proposal:**
   - Co-branded proposal document featuring Neo Gen Technologies' 3D metallic logo and Green Lending's brand identity.
   - Full 16-section proposal breakdown, milestone schedule, and deployment comparison matrix (Neo Gen Custom vs GoHighLevel vs Salesmsg).
   - Browser print-ready styling for immediate PDF export.
   - Interactive "Accept Proposal & Schedule Kickoff" modal.

---

## 🛠️ Technology Architecture

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | HTML5, Modern CSS (Glassmorphism), Vanilla JS (ES6+) | Co-branded client dashboard & interactive simulators |
| **Backend** | Node.js (Zero-dependency HTTP API service) | REST API endpoints for leads, chat simulator, campaigns & proposal data |
| **Database Blueprint** | PostgreSQL | Lead records, mortgage qualification variables, consent audit logs |
| **Coordination & Cache** | Redis | Rate limits, conversation locking, duplicate prevention |
| **Background Queues** | BullMQ | Asynchronous SMS dispatch, follow-up timers, delivery status workers |
| **AI Conversational Engine** | OpenAI API (GPT-4o) | Context-aware mortgage qualification conversations |
| **Carrier SMS Gateway** | Twilio / Telnyx | US 10DLC carrier connectivity and inbound webhook processing |

---

## 💻 How to Run the Server

No external npm packages are required; the server runs on native Node.js.

```bash
# In the project directory:
node server.js
```

Then open your browser to:
```
http://localhost:3000
```

### Available API Endpoints:
- `GET  /api/health` - Server health check
- `GET  /api/leads` - List all mortgage leads
- `POST /api/leads` - Create new inbound lead
- `GET  /api/leads/:id` - Get specific lead detail & conversation history
- `POST /api/leads/:id/takeover` - Toggle loan officer takeover
- `POST /api/leads/:id/send-sms` - Send manual SMS from loan officer
- `POST /api/leads/:id/notes` - Add internal loan officer note
- `POST /api/sms/simulate` - Simulate borrower SMS reply with AI mortgage evaluation
- `GET  /api/campaigns` - Active campaigns and drip sequences
- `GET  /api/analytics` - KPI metrics and conversion rates
- `GET  /api/proposal` - Project proposal milestones and pricing

---

**Prepared by Neo Gen Technologies**  
*Building intelligent software and automation systems that help businesses operate and grow.*

