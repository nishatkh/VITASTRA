#!/usr/bin/env python3
"""Download NASA reference data once into a local SQLite DB so ASTRA-X runs offline.

Sources: NASA OSDR RadLab (radiation), DONKI (solar events), OSDR Environmental Data Application.
Usage: python scripts/fetch_nasa_data.py [--key DEMO_KEY]
The bundled demo ships a pre-baked copy in src/data, so this step is optional.
"""
import argparse, json, sqlite3, urllib.request

DONKI = "https://api.nasa.gov/DONKI/FLR?startDate=2026-03-01&endDate=2026-09-01&api_key={key}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default="DEMO_KEY")
    ap.add_argument("--db", default="scripts/nasa_cache.sqlite")
    a = ap.parse_args()
    db = sqlite3.connect(a.db)
    db.execute("create table if not exists donki (id text primary key, body text)")
    with urllib.request.urlopen(DONKI.format(key=a.key), timeout=30) as r:
        for ev in json.load(r):
            db.execute("insert or replace into donki values (?, ?)", (ev.get("flrID"), json.dumps(ev)))
    db.commit()
    print("Saved solar events to", a.db)
    print("RadLab and environment datasets: download from https://osdr.nasa.gov and place CSVs in scripts/data/.")

if __name__ == "__main__":
    main()
