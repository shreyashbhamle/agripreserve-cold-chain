# AgriPreserve: International Agricultural Logistics & Cold-Chain Supply Chain Platform

AgriPreserve is an interconnected, full-stack **International & Domestic Agricultural Logistics, Cold-Chain Telemetry, Customs Compliance, and AI Decision-Support Platform** across four role-based workspaces (**Admin**, **Farmer**, **Driver**, and **Retailer / Receiver**).

---

## 1. Architecture & Core Engines

### Frontend (`src/`)
- **React 18 + TypeScript + Vite 6 + Tailwind CSS v4**
- Cohesive dark command-center design (`#0E1117` background, `#11151D` sidebar, `#171B24` cards, `#303846` borders) with role-specific accents:
  - **Admin** (`#10B981` Emerald) — Global Overview, Customs & International Trade (`/admin/international-trade`), Shipments, Cold Storage, Live Tracking, Inventory, Users, Alerts, Analytics, AI Insights, Reports, Settings.
  - **Farmer** (`#22C55E` Green) — Producer Overview, Farm & Packhouse Registry + Export Harvest Batches + Buyer Quotation Approval (`/farmer/produce`), Shipments, Inventory, IoT Monitoring, Sales & Mandi, AI Insights, Reports, Profile.
  - **Driver** (`#38BDF8` Sky Blue) — Fleet Overview, Mandatory 10-Step Pickup Verification + International/Domestic Transit Milestones + Trip Expense Claims (`/driver/current-shipment`), Live Tracking, Route & Navigation, Temperature Monitor, Delivery Proof (POD), My Trips, Alerts, Profile.
  - **Retailer / Receiver** (`#A78BFA` Violet) — Receiving Overview, Incoming Shipments + Verified Produce Marketplace & Incoterms® 2020 Quotation Builder + Discrepancy Claims (`/receiver/incoming`), Commodity-Specific Arrival Quality Inspection (`/receiver/quality`), Inventory, Demand Forecast, Payments & Invoices, AI Insights, Reports, Profile.
- **Global Multimodal Map** (`src/components/maps/ShipmentMap.tsx`): Interactive OpenStreetMap & Esri Satellite map supporting both the **India → UAE Multimodal Trade Corridor** (`Nashik Packhouse → JNPT Port INNSA → Arabian Sea Reefer Lane → Jebel Ali Port AEJEA → Al Aweer Dubai`) and the **Maharashtra Domestic Cold Corridor** (`Nashik → Pune → Mumbai / Vashi`) with OSRM road geometry and explicit corridor waypoint disclosures.

### Backend (`backend/`)
- **Python 3.11+ & FastAPI** (`backend/main.py`, `backend/logistics_engine.py`, `backend/database.py`, `backend/ai_services.py`)
- **SQLite Central Database** (`backend/agripreserve.db`) with 31 normalized tables automatically migrated and seeded on startup:
  - **Customs & International Trade Engine**: Jurisdiction-specific tariff schedules (`IN->AE` India–UAE CEPA 0% preferential vs 5% GCC MFN + 5% UAE Federal VAT on CIF + Duty; `IN->EU` TARIC; `IN->GB` UK DCTS; `IN->IN` Domestic 0% Fresh Produce GST), WTO CIF valuation basis, and explicit separation of **Broker-Verified Official Records** vs **Platform Estimated Tariff Calculations**.
  - **Incoterms® 2020 Compliance Engine**: Full support for all 11 Incoterms (`EXW`, `FCA`, `CPT`, `CIP`, `DAP`, `DPU`, `DDP`, `FAS`, `FOB`, `CFR`, `CIF`) including mode-of-transport validation (blocking sea-only `FAS/FOB/CFR/CIF` on standalone Air/Road/Rail shipments), risk transfer points, and seller vs buyer cost allocation.
  - **Total Landed Cost & Financial Reconciliation Engine**: Non-double-counted landed cost (`Product Value + Packaging + Origin Logistics + International Freight + Insurance + Customs Duties + Import Taxes + Destination Charges + Other/Demurrage`), per-kg and per-carton unit landed cost, multi-currency conversion (`INR`, `AED`, `USD`, `EUR`), and separation of producer value, pass-through logistics expenditure, government taxes, and platform margin.
  - **22-Document Trade Compliance & Legal Review Workflow**: Supports all 22 international trade documents. Newly uploaded files default to `Pending Legal Review` and are never auto-approved without Admin/Licensed Broker review.
  - **Multimodal Route & Cost Optimization Engine**: Compares **Lowest Cost**, **Fastest Feasible**, and **Best Balanced** itineraries across Road, Sea CA Reefer, Air Active ULD, and Rail while enforcing hard cold-chain and shelf-life constraints.
  - **Controlled Shipment State Machine & RBAC Guardrails**:
    - Drivers cannot certify customs clearance or mark a disputed delivery as accepted.
    - Shipments cannot be closed while open claims/disputes or unpaid invoices remain unresolved.
    - Inventory reservations prevent overselling and negative stock.

---

## 2. Quick Start & Setup Instructions

### Step 1: Environment Configuration
Copy `.env.example` to `.env` if you wish to customize ports or external provider URLs (no secrets are hardcoded):
```bash
cp .env.example .env
```

### Step 2: Start the FastAPI Backend
#### Windows PowerShell
From the project root:
```powershell
Set-Location .\backend
py -3.11 -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Virtual-environment activation is not required, avoiding PowerShell execution-policy issues.

#### Linux / macOS
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Server: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### Step 3: Start the React + Vite Frontend
Open a second terminal in `AgriPreserveColdChain-main`:
```bash
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

### Step 4: Run Automated Verification Tests & Production Build
The backend verification script initializes and writes demo records to SQLite. Run it only against a disposable local database copy.

Windows PowerShell:
```powershell
.\backend\venv\Scripts\python.exe .\backend\test_platform.py
npm run build
```

Linux / macOS:
```bash
backend/venv/bin/python backend/test_platform.py
npm run build
```

---

## 3. Local Development Demo Accounts

All demo accounts use PBKDF2-HMAC-SHA256 password hashes in SQLite:

| Role | Email | Password | Default Portal Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@agripreserve.com` | `admin123` | `/admin/dashboard` & `/admin/international-trade` |
| **Farmer** | `farmer@agripreserve.com` | `farmer123` | `/farmer/dashboard` & `/farmer/produce` |
| **Driver** | `driver@agripreserve.com` | `driver123` | `/driver/dashboard` & `/driver/current-shipment` |
| **Receiver** | `receiver@agripreserve.com` | `receiver123` | `/receiver/dashboard` & `/receiver/incoming` |

---

## 4. Seeded International & Domestic Scenarios

1. **International Multimodal Consignment (`AP-INTL-2026`)**:
   - **Cargo**: 12,000 kg (2,400 cartons on 20 ISPM-15 pallets) of GI-Tagged Export Alphonso & Kesar Mangoes (`HS 0804.50.20`).
   - **Route**: Sahyadri Export Packhouse (Nashik, India) → JNPT Nhava Sheva Seaport (`INNSA`) → Maersk 40ft Controlled Atmosphere Reefer (`MAEU-CA-984120`) → Jebel Ali Port (`AEJEA`, Dubai) → Al Maya / FreshMart Cold Hub (Dubai, UAE).
   - **Incoterm & Customs**: `CIF Jebel Ali Port` · India–UAE CEPA `0%` Preferential Import Duty + `5%` UAE Federal VAT on CIF value · Complete 12-document compliance dossier & 9-item landed cost breakdown.
2. **Domestic Cold-Chain Consignments (`AP1024`–`AP1030`)**:
   - Preserves all original synthetic CSV datasets (`datasets/synthetic/*.csv`) across the Nashik–Pune–Mumbai corridor with live anomaly detection, IsolationForest risk ranking, and SOP-grounded RAG copilot support.
