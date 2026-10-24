# AgriPreserve REST API Documentation

Base URL (Development): `http://127.0.0.1:8000`  
Interactive OpenAPI / Swagger UI: `http://127.0.0.1:8000/docs`

---

## 1. Authentication & Profile

### `POST /api/auth/login`
Authenticates a user against PBKDF2-HMAC-SHA256 password hashes in SQLite and issues a session token.
- **Request Body**:
  ```json
  {
    "email": "admin@agripreserve.com",
    "password": "admin123",
    "role": "admin",
    "remember_me": true
  }
  ```
- **Response**: `{ "token": "...", "expires_at": "...", "user": { "id": "1", "name": "Admin User", "email": "admin@agripreserve.com", "role": "admin" }, "auth_mode": "PBKDF2_SHA256_SQLITE_SESSION" }`

### `POST /api/auth/logout`
Invalidates the active bearer session token.

### `GET /api/auth/me`
Returns the authenticated user's profile for the current bearer token.

### `PUT /api/auth/profile`
Updates the user's name, phone, organization, region, and optionally rotates their PBKDF2 password hash.

---

## 2. Executive Summary & User Management

- `GET /api/health` — Service health & database status check.
- `GET /api/dashboard/summary` — Aggregated KPI metrics for Admin, Farmer, Driver, and Receiver dashboards.
- `GET /api/users` — List platform users with optional `role`, `status`, and `q` filters.
- `POST /api/users` — Create a new user account with PBKDF2 password hashing.
- `PUT /api/users/{user_id}` — Update user role, organization, status, or password.
- `DELETE /api/users/{user_id}` — Delete a non-protected user account.

---

## 3. Shipments, Sensors & Cold Storage

- `GET /api/shipments` — List shipments with composite risk scores (`?q=&status=&farmer=&driver=`).
- `POST /api/shipments` — Create a new cold-chain shipment, auto-register a sensor device, and log initial telemetry.
- `GET /api/shipments/{shipment_id}` — Retrieve full shipment details, sensor readings, alerts, incidents, delivery proofs, and lifecycle events.
- `PUT /api/shipments/{shipment_id}/status` — Transition shipment status (`Created`, `Assigned`, `Picked Up`, `In Transit`, `At Risk`, `Delayed`, `Arrived`, `Delivered`, `Completed`, `Cancelled`) and write to the lifecycle audit trail.
- `GET /api/sensors/devices` — List registered ESP32/LoRaWAN sensor nodes with battery, RSSI, and online status.
- `PUT /api/sensors/devices/{device_id}` — Update sensor sampling interval, calibration offset, or online status.
- `GET /api/sensors/readings` — List recent telemetry readings across the fleet.
- `POST /api/sensors/readings` — Hardware-ready ingestion endpoint for ESP32 sensor packets; automatically evaluates thermal/door anomalies and triggers alerts.
- `POST /api/sensors/simulate` — Inject simulated telemetry packets (`normal_drift`, `temp_spike`, `door_open`) for a shipment.
- `GET /api/storage` & `POST /api/storage` — List and create/update cold-storage facilities.

---

## 4. Alerts, Incidents, Produce, Inventory, Quality & POD

- `GET /api/alerts` & `PUT /api/alerts/{alert_id}/status` — Filter, acknowledge, and resolve cold-chain alerts.
- `GET /api/incidents`, `POST /api/incidents`, `PUT /api/incidents/{incident_id}` — Log and update field/agent incidents.
- `GET /api/produce`, `POST /api/produce`, `PUT /api/produce/{item_id}` — Farmer harvested crop catalog CRUD.
- `GET /api/inventory` & `POST /api/inventory/{item_id}/adjust` — Cold-room batch inventory and stock movement audit trail.
- `GET /api/quality-inspections` & `POST /api/quality-inspections` — Multi-factor arrival quality grading (separating sensor thermal compliance, human visual checklist, and advisory classifier). Creating an inspection requires an existing shipment; unknown shipment IDs return `404`.
- `GET /api/delivery-proofs` & `POST /api/delivery-proofs` — Driver digital Proof of Delivery (POD) persistence. Creating a proof requires an existing shipment; unknown shipment IDs return `404`.
- `POST /api/pickup-verifications` — Record pickup checks for an existing shipment. Unknown shipment IDs return `404`.
- `GET /api/claims` & `POST /api/claims` — List and create shipment claims/disputes. Creating a claim requires an existing shipment; unknown shipment IDs return `404`.
- `GET /api/orders`, `PUT /api/orders/{order_id}/status`, `GET /api/market-prices` — Buyer/supplier invoices and synthetic mandi price benchmarks.

---

## 5. AI / ML, Demand Forecasting, RAG & Controlled Agent

- `GET /api/ai/status` — Model status, `IsolationForest` precision/recall/F1 evaluation metrics on synthetic telemetry, and RAG corpus info.
- `POST /api/ai/anomaly` — Domain threshold + warming rate-of-change evaluation.
- `POST /api/ai/ml/predict` — `IsolationForest` anomaly prediction and decision score.
- `GET /api/shipments/{shipment_id}/risk` & `GET /api/ai/risk-ranking` — Shipment spoilage risk scoring and fleet ranking.
- `GET /api/ai/demand-forecast?commodity=Tomatoes&horizon_days=7` — Chronological holdout time-series forecast returning `mae_kg`, `rmse_kg`, point predictions, and 90% uncertainty bands.
- `GET /api/ai/rag/search?q=...` — Keyword/TF-IDF retrieval over `backend/knowledge_base/*.md`.
- `POST /api/ai/copilot` — SOP-grounded operational Q&A with markdown citations.
- `POST /api/ai/agent/run` & `POST /api/ai/agent/confirm-action` — 5-step incident triage agent with mandatory human confirmation before writing to SQLite.
