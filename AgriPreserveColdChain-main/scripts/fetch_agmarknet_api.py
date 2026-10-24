#!/usr/bin/env python3
"""Fetch daily mandi price records from data.gov.in using a user-provided API key.

Get a free key and confirm the resource ID/fields on the official resource page.
This script intentionally does not embed an API key or guess a resource ID.
"""
import argparse, json, os, urllib.parse, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='https://api.data.gov.in/resource/'
def main():
 p=argparse.ArgumentParser(); p.add_argument('--resource-id',required=True,help='Resource ID shown on data.gov.in resource/API page'); p.add_argument('--limit',type=int,default=1000); p.add_argument('--filters',default='',help='Optional URL query fragment, e.g. filters[state]=Maharashtra'); a=p.parse_args()
 key=os.environ.get('DATA_GOV_IN_API_KEY')
 if not key: raise SystemExit('Set DATA_GOV_IN_API_KEY environment variable first; do not hardcode keys in this script.')
 params={'api-key':key,'format':'json','limit':a.limit}
 url=BASE+a.resource_id+'?'+urllib.parse.urlencode(params)
 if a.filters: url+='&'+a.filters.lstrip('&?')
 req=urllib.request.Request(url,headers={'User-Agent':'AgriPreserve/1.0'})
 with urllib.request.urlopen(req,timeout=60) as r: data=json.load(r)
 out=ROOT/'datasets'/'downloaded_external'; out.mkdir(parents=True,exist_ok=True)
 target=out/'agmarknet_daily_prices.json'; target.write_text(json.dumps(data,indent=2),encoding='utf-8')
 print(f'Saved {len(data.get("records",[]))} records to {target.relative_to(ROOT)}')
 print('Official source: https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi')
if __name__=='__main__': main()
