# Agri Preserve — Full Stack Cold Chain Intelligence

## Included
- React + TypeScript + Vite frontend with role-based Admin, Farmer, Driver and Receiver portals.
- Premium split-screen login design using a custom Agri Preserve cold-chain hero visual.
- Role-aware dashboard styling and visual background treatment.
- Interactive Leaflet map with Street/Satellite layer switch. Online map tiles and road routing require internet.
- Quality Check live camera preview, photo capture, preview and local download. Camera requires browser permission and localhost/HTTPS.
- FastAPI backend, SQLite demo persistence, authentication endpoint, shipment/sensor/alert/storage/map APIs.
- AI/ML demonstration services, anomaly/risk logic, Agentic AI workflow, RAG knowledge base and optional LLM configuration.
- Synthetic CSV datasets and data dictionary.

## Run on Windows
### 1. Backend (Terminal 1)
```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs: http://127.0.0.1:8000/docs

### 2. Frontend (Terminal 2, project root)
```powershell
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Demo accounts
- Admin: `admin@agripreserve.com` / `admin123`
- Farmer: `farmer@agripreserve.com` / `farmer123`
- Driver: `driver@agripreserve.com` / `driver123`
- Receiver: `receiver@agripreserve.com` / `receiver123`

## Camera
Go to Receiver → Quality Check → Open Camera. Allow browser camera permission. The browser creates a local photo preview and offers a download; it does not automatically upload the image or run a trained computer-vision quality classifier.

## Maps and tracking
Open Admin or Driver → Live Tracking. Switch between Street and Satellite. Current markers are sample coordinates unless a real GPS/device feed is connected. Public map tiles and routing need internet; provider availability and terms apply.

## AI/ML, Agentic AI, LLM and RAG
The backend includes demonstration ML/anomaly and risk services, an agent workflow and retrieval from the included cold-chain SOP documents. An external LLM requires configuring the relevant environment variables in `backend/.env` based on `.env.example`. If not configured, a local fallback is used. Bundled CSV data is synthetic demonstration data, not verified operational or market data.

## Important production notes
- Change demo credentials and implement robust password hashing, token/session security and role authorization before deployment.
- AI predictions and risk scores are demonstrations and must be validated against real, product-specific data.
- The current map coordinates and sensor simulator are not live GPS or physical sensor telemetry.
- The camera feature captures and downloads a photo locally; it does not upload it to the backend by default.
- This project requires `npm install` on the target machine. `node_modules` is intentionally not bundled.
