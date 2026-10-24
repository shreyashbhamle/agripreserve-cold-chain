# Download the external datasets

## 1) Zenodo cold-storage sensor dataset
Open a terminal at the project root and run:

```bash
python scripts/download_public_datasets.py --zenodo
```

This downloads the files currently attached to https://zenodo.org/records/15130001 into `datasets/downloaded_external/zenodo_cold_storage/`.

## 2) Mendeley refrigerated citrus transport data
Open https://data.mendeley.com/datasets/mvr7m6mcgp and click **Download All**. Extract the six CSV files into `datasets/downloaded_external/mendeley_citrus/`. Keep the original filenames and source citation.

## 3) Fruit freshness images (large)
Install Kaggle CLI and configure your own Kaggle API credentials, then run:

```bash
python -m pip install kaggle
kaggle datasets download -d raghavrpotdar/fresh-and-stale-images-of-fruits-and-vegetables --unzip -p datasets/downloaded_external/fresh_stale_images
```

Dataset is around 1.53 GB; it is not embedded in this ZIP.

## 4) Live weather

```bash
python scripts/fetch_open_meteo.py --latitude 16.85 --longitude 74.58
```

Replace coordinates with the actual facility/trip point. The script saves a JSON response in `datasets/live_api_samples/`.

## 5) Daily official mandi prices
Get an API key from data.gov.in and inspect the resource's API details at https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi. Then set the key and pass the resource ID shown on the official page:

Windows PowerShell:

```powershell
$env:DATA_GOV_IN_API_KEY="YOUR_KEY_HERE"
python scripts/fetch_agmarknet_api.py --resource-id YOUR_RESOURCE_ID --limit 1000
```

Never commit the API key to GitHub. The output JSON is saved under `datasets/downloaded_external/`.

## 6) Data that cannot be downloaded as a public feed
Live truck GPS, ESP32 sensor telemetry, reefer status, door status, actual shipments/inventory, and verified spoilage outcomes must be captured from your own devices or operating records. No public dataset can provide the real-time state of your specific truck.
