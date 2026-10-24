# AgriPreserve — Complete Dataset Catalog

This bundle combines the CSV datasets already included with the project, source links for real public datasets, and scripts/instructions to fetch live or external data from your own computer.

## Included CSVs (bundled)

Located in `../synthetic/`. These are **synthetic demo records**, not actual sensor readings or official market data:
- `sensor_readings.csv` — temperature, humidity, GPS, speed, door, reefer and vibration telemetry fields.
- `shipments.csv` — shipment/product/origin/destination/status/ETA and safe temperature limits.
- `alerts.csv` — demo alert events.
- `produce_quality_labels.csv` — label metadata only; **does not contain the image files**.
- `market_prices_demo.csv` — synthetic market-price examples, not official mandi prices.
- `storage_facilities.csv` — demo facility capacity/load/temperature/status.

## Public external datasets and live sources

1. **Cold storage room temperature/humidity time series (historical real experiment)**
   - Zenodo record: https://zenodo.org/records/15130001
   - Includes raw/preprocessed CSV archives, experiment action log, overview, and notebooks for nine DHT22 sensors.
   - Download automatically with `python scripts/download_public_datasets.py --zenodo` when connected to the internet.
   - Historical cold-room data, not a live truck feed and not direct spoilage labels.

2. **Refrigerated citrus transport temperature logger data (historical real experiment)**
   - Mendeley Data: https://data.mendeley.com/datasets/mvr7m6mcgp
   - Six CSV files for different initial loading temperatures/package designs.
   - Use the page's **Download All** option; the downloader script prints this source and does not pretend these files were downloaded.

3. **Fresh/stale fruit and vegetable image dataset**
   - Kaggle: https://www.kaggle.com/datasets/raghavrpotdar/fresh-and-stale-images-of-fruits-and-vegetables
   - 6 produce types, fresh/stale labels; large dataset (~1.53 GB). Not bundled because this environment has no external network and the dataset is large.
   - Download with Kaggle CLI after setting up Kaggle credentials: `kaggle datasets download -d raghavrpotdar/fresh-and-stale-images-of-fruits-and-vegetables --unzip -p datasets/downloaded_external/fresh_stale_images`
   - Do not treat this as validation of camera performance on your own receiving conditions.

4. **Official India daily mandi prices (updated daily, not second-by-second)**
   - Catalog: https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi
   - Resource page: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
   - Contains daily wholesale minimum, maximum and modal prices. API download may require a free data.gov.in API key; see `scripts/fetch_agmarknet_api.py`.

5. **India district/season-wise crop production statistics (historical/periodic, not live)**
   - https://www.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0
   - Use for agricultural context and supply/seasonality analysis, not real-time inventory.

6. **Live weather and forecast API**
   - Open-Meteo docs: https://open-meteo.com/en/docs
   - Live sample fetch: `python scripts/fetch_open_meteo.py --latitude 16.85 --longitude 74.58`
   - Output is saved as JSON in `datasets/live_api_samples/`. Replace coordinates with your actual origin/destination/facility coordinates.

7. **Map and route services (not datasets of your truck's GPS)**
   - OpenStreetMap: https://www.openstreetmap.org/
   - Tile usage policy: https://operations.osmfoundation.org/policies/tiles/
   - OSRM routing: https://project-osrm.org/
   - Map/routing services provide map geometry or route estimates. They do not give you live truck GPS; use ESP32/mobile GPS/telematics for that.

## What must come from your own devices or business records

- Live ESP32 sensor telemetry (temperature, humidity, door/reefer state, vibration) and vehicle GPS.
- Actual shipments, orders, stock/inventory, drivers, vehicles, facilities and handover events.
- Verified spoilage outcomes linked to sensor histories, and camera images captured by your receiver workflow.
- These cannot be responsibly substituted by public datasets. The current synthetic CSVs are for UI/demo/testing only.

## Important provenance rule

Keep source data in `raw/`, cleaned data in `processed/`, and small samples in `sample/`. Preserve the original source, download date, license, and transformation notes. Never label synthetic or historical experimental data as live telemetry.
