# AgriPreserve — Complete Project + Dataset Pack

This bundle combines the full AgriPreserveColdChain application with dataset catalogues, sample data, and helper scripts.

## Included
- React + Vite frontend, role-based login, dashboards, tracking and quality-check UI.
- FastAPI backend and local demo services.
- Six project CSVs under `datasets/synthetic/` (sensor readings, shipments, alerts, produce-quality label metadata, demo market prices, storage facilities).
- Dataset source catalogue and provenance/license notes under `datasets/public_sources/`.
- Download/fetch helpers under `scripts/` for public datasets, AGMARKNET API access and Open-Meteo weather.
- Cleaned login hero artwork; redundant route labels removed and hero copy simplified.

## Important dataset note
The CSVs under `datasets/synthetic/` are **synthetic demonstration records**, not live telemetry or official market data. The produce quality CSV is label metadata only and does not include image files. Public-source scripts/instructions are included, but they do not mean all external datasets have already been downloaded. Current weather can be fetched by running its script with internet access; AGMARKNET API access may require an API key. Actual truck GPS and sensor data require connected hardware or your own operational feed. Check each source's terms before reuse.

## Run the app
### Backend (Windows PowerShell)
```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Open API docs at `http://127.0.0.1:8000/docs`.

### Frontend (new terminal)
```powershell
npm install
npm run dev
```
Use the local URL printed by Vite. Demo login credentials are documented in the login screen; they are for local demonstration only and are not production-secure.

## Dataset guide
Start with `datasets/public_sources/ALL_DATASETS_CATALOG.md` and `datasets/public_sources/README_DOWNLOAD_STEPS.md`. See `datasets/DATA_DICTIONARY.md` for field definitions.


## Dark dashboard theme update

The shared `DashboardLayout` now applies a dark analytics theme inspired by the supplied reference screenshot. The background, sidebar, top bar, cards, tables, inputs, and muted text styles are adjusted globally for all Admin, Farmer, Driver, and Receiver routes. Role-specific accent colors are retained. The theme is implemented in `src/index.css`; edit the “AgriPreserve Dark Analytics Theme” section to customize it.
