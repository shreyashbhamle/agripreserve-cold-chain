#!/usr/bin/env python3
"""Fetch current weather/forecast JSON from Open-Meteo (internet required)."""
import argparse, json, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--latitude', type=float, required=True)
    p.add_argument('--longitude', type=float, required=True)
    p.add_argument('--forecast-days', type=int, default=3, choices=range(1,17))
    a=p.parse_args()
    params={'latitude':a.latitude,'longitude':a.longitude,'current':'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m','hourly':'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m','forecast_days':a.forecast_days,'timezone':'auto'}
    url='https://api.open-meteo.com/v1/forecast?'+urllib.parse.urlencode(params)
    req=urllib.request.Request(url,headers={'User-Agent':'AgriPreserve/1.0'})
    with urllib.request.urlopen(req,timeout=45) as r: data=json.load(r)
    data['_fetched_at_utc']=datetime.now(timezone.utc).isoformat()
    data['_source_url']='https://open-meteo.com/en/docs'
    out=ROOT/'datasets'/'live_api_samples'; out.mkdir(parents=True,exist_ok=True)
    target=out/f'open_meteo_{a.latitude}_{a.longitude}.json'
    target.write_text(json.dumps(data,indent=2),encoding='utf-8')
    print(f'Saved weather response to {target.relative_to(ROOT)}')
    print('This is weather data, not shipment GPS or reefer sensor telemetry.')
if __name__=='__main__': main()
