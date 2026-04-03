# Ghausia Textile Manager

A complete production management system for Ghausia Collection.

## Pages

- **Dashboard** — KPIs, financial overview, party performance, billable lots
- **Ghausia Collection** — Main lot management with payment tracking
- **Party Ledger** — View all assigned lots per party, edit completion details
- **Parties** — Manage party contacts (name, phone, address)
- **Payments** — Record and track all money in/out

## Setup & Run

### Requirements
- Node.js v16 or higher
- npm v7 or higher

### Steps

1. Extract the zip file
2. Open terminal in the extracted folder
3. Run:

```bash
npm install
npm start
```

4. The app opens at http://localhost:3000

### Build for Production

```bash
npm run build
```

## Features

- Add/edit/delete lots in Ghausia Collection
- Fabric dropdown (Lawn, Velvet, Cambric + custom)
- Colors dropdown (0–12)
- Status with date picker (Dispatched date, Received Back date)
- Party management with phone & address
- Party Ledger shows lots assigned from Ghausia — editable: allot date, complete date, status, bill amount, receipt upload
- When Party marks lot "Completed", Ghausia lot auto-updates to "Received Back"
- Payment management: record owner receipts & party payments
- Billable section highlights all "Received Back" lots
- Dashboard shows full financial summary
