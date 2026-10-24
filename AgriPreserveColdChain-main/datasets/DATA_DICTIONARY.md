# Agri Preserve data dictionary

| Dataset | Key fields | Intended use |
|---|---|---|
| shipments.csv | shipment_id, product, quantity_kg, origin, destination, status, eta, safe_temp_min_c, safe_temp_max_c | Shipment list and logistics dashboards |
| sensor_readings.csv | reading_id, shipment_id, timestamp, temperature_c, humidity_pct, latitude, longitude, speed_kmph, door_status, reefer_status, vibration_g | Telemetry charts, alert rules, anomaly-model features |
| alerts.csv | alert_id, shipment_id, timestamp, severity, type, message, status | Alert and incident UI testing |
| storage_facilities.csv | facility_id, capacity_mt, current_load_mt, temperature_c, status | Cold-storage monitoring |
| market_prices_demo.csv | date, market, product, price_inr_per_kg | Market-trend charts only (synthetic) |
| produce_quality_labels.csv | image_id, product, label, image_path, source_type | Label-schema example only; images are not included |

Timestamps include a +05:30 offset for the Indian time zone. Sensor values and safe ranges are illustrative. Validate units and product-specific limits against authoritative handling guidance before operational use.
