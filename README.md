# Client Portal & Admin API

Sample portfolio project by Phil Hyeonyong.

This project demonstrates a practical full-stack business application: a client portal and admin dashboard backed by a small REST API. It is built for small agencies, service teams, or solo operators who need to manage client requests, invoice status, account health, and handoff notes without jumping across spreadsheets.

## Live Demo

Static dashboard demo:

```text
https://yong3750.github.io/client-portal-admin-api/
```

## Problem

Small service businesses often track work in separate tools: client requests in email, invoices in spreadsheets, and internal tasks in chat. That creates slow follow-up, missed handoffs, and unclear ownership.

The practical questions are simple:

- Which clients need attention today?
- Which requests are blocked or close to SLA risk?
- Which invoices are still outstanding?
- Who owns each active item?
- What API data model would support a real client portal?

## Solution

The demo combines a responsive admin dashboard with a lightweight Node REST API server. The public version runs as a static dashboard with sample data, while the repository includes a local API server that exposes client, request, invoice, and summary endpoints.

This mirrors a common freelance build path: start with a working operational prototype, then extend it into authentication, database storage, email notifications, payments, or CRM integrations.

## Features

- Client account health cards
- Request queue with status, owner, due date, and completion actions
- Revenue, open request, SLA risk, and invoice metrics
- Owner workload chart
- Invoice status view
- Create-request admin form
- Generated operations handoff
- JSON report export
- REST API routes for clients, requests, invoices, and summary data
- Responsive layout for desktop and mobile review

## API Routes

The local server uses only Node built-in modules.

```text
GET /api/clients
GET /api/requests
POST /api/requests
PATCH /api/requests/:id
GET /api/invoices
GET /api/summary
```

## How To Run

Run the API-backed local demo:

```bash
node server.js
```

Then open:

```text
http://127.0.0.1:4175
```

For a static-only preview, serve the folder with any static server.

## Tech Notes

- HTML, CSS, and vanilla JavaScript frontend
- Node.js REST API server using built-in `http`, `fs`, and `url`
- JSON seed data in `data/seed.json`
- No paid APIs or external dependencies required
- Ready to extend with SQLite/Postgres, authentication, file uploads, Stripe, email, or CRM APIs

## Portfolio Note

This is a sample project, not a paid client engagement. It was built to demonstrate full-stack application structure, API design, dashboard UI development, and business-focused implementation.
