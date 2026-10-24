#!/usr/bin/env python3
"""Download the public Zenodo cold-storage record. Requires internet access."""
import argparse, json, os, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'datasets' / 'downloaded_external' / 'zenodo_cold_storage'
RECORD_API = 'https://zenodo.org/api/records/15130001'

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--zenodo', action='store_true', help='download all files attached to Zenodo record 15130001')
    args = p.parse_args()
    if not args.zenodo:
        p.print_help(); print('\nOther public sources and manual download steps are in datasets/public_sources/ALL_DATASETS_CATALOG.md'); return
    DEST.mkdir(parents=True, exist_ok=True)
    try:
        req = urllib.request.Request(RECORD_API, headers={'User-Agent': 'AgriPreserveDatasetFetcher/1.0'})
        with urllib.request.urlopen(req, timeout=45) as r: record = json.load(r)
        files = record.get('files', [])
        if not files: raise RuntimeError('Zenodo record returned no file list.')
        for f in files:
            key = f.get('key') or f.get('filename')
            url = f.get('links', {}).get('self')
            if not key or not url: continue
            target = DEST / Path(key).name
            print(f'Downloading {key} ...')
            req = urllib.request.Request(url, headers={'User-Agent': 'AgriPreserveDatasetFetcher/1.0'})
            with urllib.request.urlopen(req, timeout=180) as r, open(target, 'wb') as out:
                while True:
                    chunk = r.read(1024 * 1024)
                    if not chunk: break
                    out.write(chunk)
            print(f'  saved: {target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)')
        print('\nFinished. Check licenses and cite the source record: https://zenodo.org/records/15130001')
    except Exception as e:
        print(f'Could not download from Zenodo: {e}', file=sys.stderr)
        print('Check internet access and retry. The source URL is recorded in the dataset catalog.', file=sys.stderr)
        sys.exit(1)
if __name__ == '__main__': main()
