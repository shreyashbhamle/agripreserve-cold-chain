# Agri Preserve datasets

This folder contains CSV files packaged with the demo project so the team can test the dashboards, APIs, and future ML pipeline locally.

## Files

- `synthetic/shipments.csv` — shipment, product, route, ETA, safe-range assumptions and illustrative shipment value.
- `synthetic/sensor_readings.csv` — 84 illustrative readings for temperature, humidity, GPS, speed, door, reefer and vibration.
- `synthetic/alerts.csv` — sample alert events with severity and status.
- `synthetic/storage_facilities.csv` — sample cold-storage capacity, load, temperature and status.
- `synthetic/market_prices_demo.csv` — illustrative daily market-price series for dashboard/chart testing.
- `synthetic/produce_quality_labels.csv` — placeholder label metadata for planning a computer-vision dataset. It does not include image files and must not be used to train a model without real labelled images.

## Important data note

The CSVs in `synthetic/` are **synthetic demonstration data created for this project**, not official market records, measurements from deployed sensors, or a validated spoilage dataset. Values and product temperature ranges are examples only. Replace them with appropriately licensed, verified data before making real-world operational claims. Keep original downloaded public datasets in a separate `raw/` folder with source URL, access date, licence and attribution.

## Suggested ML workflow

1. Keep original source files unchanged under `datasets/raw/`.
2. Inspect units, timestamps, missing values, duplicates and licence/usage restrictions.
3. Clean and document changes in a notebook or script.
4. Store prepared features under `datasets/processed/`.
5. Split data by time or shipment (avoid leakage between train/test sets).
6. Record model metrics and limitations before integrating inference into the backend.

## Candidate public-data portals to investigate

- India Open Government Data: https://data.gov.in/
- Zenodo research data repository: https://zenodo.org/
- Mendeley Data: https://data.mendeley.com/
- Kaggle datasets: https://www.kaggle.com/datasets

These are discovery portals, not a claim that any specific external dataset has been downloaded or verified for this ZIP. Check the individual dataset's licence, relevance, units and quality before using it.
