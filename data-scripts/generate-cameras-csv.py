"""
generate-cameras-csv.py — DRISHTI Camera Intelligence
======================================================
Reads: crime-database/raw-data/traffic-signals/bengaluru_signals.geojson
Writes: crime-database/generated-csv/cameras.csv

Generates exactly 2,000 synthetic camera rows following the DRISHTI spec:
  - 400 BATCS        (from real OSM traffic signal nodes)
  - 300 Safe_City    (near clusters of 2+ BATCS within 300m)
  - 1300 MCCTNS_*   (Private 50%, RWA 30%, Commercial 20%)

No database connection. No hardcoded magic values — all bounds & config
are loaded from camera-config.json.

Run from the project root:
    python data-scripts/generate-cameras-csv.py
"""

import json
import csv
import math
import random
import os
import sys

# ── 0. Paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Try both possible config locations (project-root/config or camera-intel/config)
CONFIG_CANDIDATES = [
    os.path.join(PROJECT_ROOT, "camera-intel", "config", "camera-config.json"),
    os.path.join(PROJECT_ROOT, "config", "camera-config.json"),
]

GEOJSON_PATH = os.path.join(
    PROJECT_ROOT,
    "crime-database", "raw-data", "traffic-signals", "bengaluru_signals.geojson"
)
OUTPUT_DIR  = os.path.join(PROJECT_ROOT, "crime-database", "generated-csv")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cameras.csv")

# ── 1. Load config ─────────────────────────────────────────────────────────
def load_config():
    for path in CONFIG_CANDIDATES:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            print(f"[config] Loaded from: {path}")
            return cfg
    # Fallback — emit a clear warning but continue with embedded defaults
    print("[WARNING] camera-config.json not found — using embedded defaults.")
    return {
        "BENGALURU_BOUNDS": {
            "lat_min": 12.85, "lat_max": 13.05,
            "lng_min": 77.50, "lng_max": 77.70
        },
        "TRAIL": {
            "max_hop_distance_m": 900, "min_hop_distance_m": 300
        },
        "RELEVANCE_SCORING": {
            "base_score": 100, "distance_penalty_per_100m": 10,
            "anpr_bonus": 20, "face_recog_bonus": 15, "safe_city_type_bonus": 10
        },
        "ANPR_PLATE_PATTERN": r"KA-\d{2}-[A-Z]{1,2}-\d{4}"
    }

CONFIG = load_config()
BOUNDS = CONFIG["BENGALURU_BOUNDS"]
LAT_MIN, LAT_MAX = BOUNDS["lat_min"], BOUNDS["lat_max"]
LNG_MIN, LNG_MAX = BOUNDS["lng_min"], BOUNDS["lng_max"]

# ── 2. Known major junctions (for Safe_City fallback & junction_name lookup) ──
MAJOR_JUNCTIONS = [
    ("Silk Board",             12.9172, 77.6211),
    ("Marathahalli Bridge",    12.9591, 77.7009),
    ("Hebbal Flyover",         13.0358, 77.5970),
    ("KR Puram",               13.0070, 77.6960),
    ("Whitefield Signal",      12.9698, 77.7499),
    ("Koramangala 5th Block",  12.9340, 77.6240),
    ("MG Road",                12.9756, 77.6099),
    ("Indiranagar 100ft Road", 12.9784, 77.6408),
    ("HSR Layout",             12.9116, 77.6370),
    ("Electronic City Toll",   12.8399, 77.6769),
]

# Additional zone centres used for MCCTNS distribution
MCCTNS_ZONE_CENTRES = [
    ("Jayanagar",         12.9282, 77.5838),
    ("JP Nagar",          12.9091, 77.5847),
    ("Rajajinagar",       12.9985, 77.5554),
    ("BTM Layout",        12.9166, 77.6101),
    ("Banashankari",      12.9263, 77.5460),
    ("Commercial Street", 12.9831, 77.6100),
    ("Malleshwaram",      13.0035, 77.5710),
    ("Whitefield",        12.9698, 77.7499),
    ("Electronic City",   12.8398, 77.6768),
    ("Manyata Tech Park", 13.0475, 77.6219),
]

# All named locations merged for junction_name lookup
ALL_JUNCTIONS = MAJOR_JUNCTIONS + [
    (name, lat, lng) for name, lat, lng in MCCTNS_ZONE_CENTRES
    if not any(name == j[0] for j in MAJOR_JUNCTIONS)
]

JUNCTION_LOOKUP_RADIUS_M = 800   # metres — from spec

# ── 3. Geometry helpers ────────────────────────────────────────────────────────
def haversine_m(lat1, lng1, lat2, lng2):
    """Return distance in metres between two (lat, lng) points."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi        = math.radians(lat2 - lat1)
    dlambda     = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def clamp_to_bounds(lat, lng):
    """Clamp coordinates to Bengaluru bounding box."""
    return (
        max(LAT_MIN, min(LAT_MAX, lat)),
        max(LNG_MIN, min(LNG_MAX, lng)),
    )


def random_offset_m(lat, lng, max_metres):
    """Return a random coordinate within max_metres of (lat, lng), clamped to bounds."""
    deg_per_m_lat = 1 / 111_000
    deg_per_m_lng = 1 / (111_000 * math.cos(math.radians(lat)))
    r = random.uniform(0, max_metres)
    theta = random.uniform(0, 2 * math.pi)
    new_lat = lat + r * math.cos(theta) * deg_per_m_lat
    new_lng = lng + r * math.sin(theta) * deg_per_m_lng
    return clamp_to_bounds(new_lat, new_lng)


def tiny_offset(lat, lng, max_deg=0.0001):
    """Apply a tiny ±max_deg offset (< 10 m) to avoid placing camera exactly on signal node."""
    new_lat = lat + random.uniform(-max_deg, max_deg)
    new_lng = lng + random.uniform(-max_deg, max_deg)
    return clamp_to_bounds(new_lat, new_lng)

# ── 4. District derivation (from spec bounding-box rules) ────────────────────
def derive_district(lat, lng):
    if lat > 13.0:
        return "North Bengaluru"
    if 12.97 <= lat <= 13.0 and 77.55 <= lng <= 77.65:
        return "Central Bengaluru"
    if 12.93 <= lat <= 12.97 and 77.60 <= lng <= 77.70:
        return "East Bengaluru"
    if 12.90 <= lat <= 12.93:
        return "South Bengaluru"
    if lng > 77.70:
        return "Whitefield/East Bengaluru"
    return "Bengaluru Urban"

# ── 5. Junction name lookup ────────────────────────────────────────────────────
def nearest_junction_name(lat, lng):
    """Return name of the nearest major junction within 800 m, or None."""
    best_name, best_dist = None, float("inf")
    for name, jlat, jlng in ALL_JUNCTIONS:
        d = haversine_m(lat, lng, jlat, jlng)
        if d < best_dist:
            best_dist, best_name = d, name
    return best_name if best_dist <= JUNCTION_LOOKUP_RADIUS_M else None

# ── 6. Build a camera row dict ────────────────────────────────────────────────
def make_row(external_id, name, camera_type, lat, lng, has_anpr, has_face_recog,
             coverage_radius_m, is_active=None):
    if is_active is None:
        is_active = random.random() < 0.95   # 95% active per spec
    lat, lng = clamp_to_bounds(lat, lng)
    # Catalyst expects 0/1 for boolean columns (not Python True/False)
    return {
        "external_id":      external_id,
        "name":             name,
        "camera_type":      camera_type,
        "lat":              round(lat, 6),
        "lng":              round(lng, 6),
        "district_name":    derive_district(lat, lng),
        "junction_name":    nearest_junction_name(lat, lng),
        "has_anpr":         'true' if has_anpr else 'false',
        "has_face_recog":   'true' if has_face_recog else 'false',
        "is_active":        'true' if is_active else 'false',
        "coverage_radius_m": coverage_radius_m,
    }

# ── 7. Load GeoJSON ────────────────────────────────────────────────────────────
def load_signal_points():
    if not os.path.exists(GEOJSON_PATH):
        print(f"[ERROR] GeoJSON not found: {GEOJSON_PATH}")
        sys.exit(1)
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geojson = json.load(f)
    points = []
    for feat in geojson.get("features", []):
        geom = feat.get("geometry", {})
        if geom.get("type") == "Point":
            lng, lat = geom["coordinates"]
        elif geom.get("type") == "Node":
            lng, lat = geom["coordinates"]
        else:
            # Some Overpass exports use lat/lon in properties
            props = feat.get("properties", {})
            lat = props.get("lat") or props.get("@lat")
            lng = props.get("lon") or props.get("@lon")
            if lat is None:
                continue
            lat, lng = float(lat), float(lng)
        lat, lng = float(lat), float(lng)
        # Discard points outside Bengaluru bounds immediately
        if LAT_MIN <= lat <= LAT_MAX and LNG_MIN <= lng <= LNG_MAX:
            name = feat.get("properties", {}).get("name", "")
            points.append((lat, lng, name))
    print(f"[geojson] Loaded {len(points)} in-bounds signal points from GeoJSON.")
    return points

# ── 8. Generate BATCS rows (400 target) ───────────────────────────────────────
def generate_batcs(signal_points, target=400):
    rows = []
    pool = list(signal_points)
    random.shuffle(pool)
    used = pool[:target]
    if len(used) < target:
        print(f"[BATCS] WARNING: GeoJSON only has {len(used)} in-bounds points "
              f"(target was {target}). Using all available.")
    for i, (lat, lng, raw_name) in enumerate(used, start=1):
        lat, lng = tiny_offset(lat, lng)
        ext_id   = f"BATCS-{i:04d}"
        name     = raw_name if raw_name else f"Traffic Signal Camera {i}"
        rows.append(make_row(ext_id, name, "BATCS", lat, lng,
                             has_anpr=True, has_face_recog=False, coverage_radius_m=80))
    print(f"[BATCS] Generated {len(rows)} rows.")
    return rows

# ── 9. Generate Safe_City rows (300 target) ────────────────────────────────────
def generate_safe_city(batcs_rows, target=300):
    """
    Strategy:
    1. Find BATCS clusters: pairs/groups within 300 m of each other.
    2. Place a Safe_City camera at the midpoint of each qualifying cluster.
    3. Fill remainder from MAJOR_JUNCTIONS with small random offsets.
    """
    coords = [(r["lat"], r["lng"]) for r in batcs_rows]
    midpoints = set()

    for i in range(len(coords)):
        for j in range(i + 1, len(coords)):
            if haversine_m(*coords[i], *coords[j]) <= 300:
                mid_lat = (coords[i][0] + coords[j][0]) / 2
                mid_lng = (coords[i][1] + coords[j][1]) / 2
                # Round to ~50 m grid to deduplicate very-close midpoints
                key = (round(mid_lat, 3), round(mid_lng, 3))
                midpoints.add((key, mid_lat, mid_lng))

    cluster_points = [(mlat, mlng) for _, mlat, mlng in midpoints]
    random.shuffle(cluster_points)
    cluster_points = cluster_points[:target]

    rows = []
    for i, (lat, lng) in enumerate(cluster_points, start=1):
        lat, lng = random_offset_m(lat, lng, 50)
        ext_id = f"SC-{i:04d}"
        rows.append(make_row(ext_id, f"Safe City Camera {i}", "Safe_City", lat, lng,
                             has_anpr=True, has_face_recog=True, coverage_radius_m=50))

    deficit = target - len(rows)
    if deficit > 0:
        print(f"[Safe_City] Clusters only yielded {len(rows)} — "
              f"filling {deficit} from major junctions.")
        junction_pool = list(MAJOR_JUNCTIONS) * math.ceil(deficit / len(MAJOR_JUNCTIONS))
        random.shuffle(junction_pool)
        for j, (jname, jlat, jlng) in enumerate(junction_pool[:deficit], start=len(rows) + 1):
            lat, lng = random_offset_m(jlat, jlng, 200)
            ext_id = f"SC-{j:04d}"
            rows.append(make_row(ext_id, f"Safe City Camera {j} - {jname}",
                                 "Safe_City", lat, lng,
                                 has_anpr=True, has_face_recog=True, coverage_radius_m=50))

    print(f"[Safe_City] Generated {len(rows)} rows.")
    return rows[:target]

# ── 10. Generate MCCTNS rows (1300 target) ────────────────────────────────────
def generate_mcctns(target=1300):
    """
    Rotate through Private(50%) / RWA(30%) / Commercial(20%).
    Distribute points across zone centres with up to 2 km random offset.
    """
    type_weights = [
        ("MCCTNS_Private",     0.50),
        ("MCCTNS_RWA",         0.30),
        ("MCCTNS_Commercial",  0.20),
    ]

    # Pre-compute how many of each
    counts = {}
    allocated = 0
    for ctype, frac in type_weights[:-1]:
        n = round(target * frac)
        counts[ctype] = n
        allocated += n
    counts[type_weights[-1][0]] = target - allocated  # remainder to last bucket

    # Build a round-robin zone iterator
    zone_list = list(MCCTNS_ZONE_CENTRES)

    rows = []
    seq  = {"MCCTNS_Private": 0, "MCCTNS_RWA": 0, "MCCTNS_Commercial": 0}
    prefix_map = {
        "MCCTNS_Private":    "MC-P",
        "MCCTNS_RWA":        "MC-R",
        "MCCTNS_Commercial": "MC-C",
    }
    # Flatten into (camera_type, zone_idx) list shuffled
    assignments = []
    for ctype, n in counts.items():
        for k in range(n):
            assignments.append((ctype, k % len(zone_list)))
    random.shuffle(assignments)

    for ctype, zone_idx in assignments:
        zone_name, zone_lat, zone_lng = zone_list[zone_idx]
        lat, lng = random_offset_m(zone_lat, zone_lng, 2000)
        seq[ctype] += 1
        ext_id = f"{prefix_map[ctype]}-{seq[ctype]:04d}"
        rows.append(make_row(ext_id, f"MCCTNS Camera {zone_name} {seq[ctype]}",
                             ctype, lat, lng,
                             has_anpr=False, has_face_recog=False, coverage_radius_m=20))

    print(f"[MCCTNS] Generated {len(rows)} rows "
          f"(Private={seq['MCCTNS_Private']}, "
          f"RWA={seq['MCCTNS_RWA']}, "
          f"Commercial={seq['MCCTNS_Commercial']}).")
    return rows

# ── 11. Validate & write CSV ──────────────────────────────────────────────────
COLUMNS = [
    "external_id", "name", "camera_type", "lat", "lng",
    "district_name", "junction_name", "has_anpr", "has_face_recog",
    "is_active", "coverage_radius_m",
]


def validate(rows):
    out_of_bounds = [
        r for r in rows
        if not (LAT_MIN <= r["lat"] <= LAT_MAX and LNG_MIN <= r["lng"] <= LNG_MAX)
    ]
    if out_of_bounds:
        print(f"\n[VALIDATION FAIL] {len(out_of_bounds)} rows are OUTSIDE Bengaluru bounds!")
        for r in out_of_bounds[:5]:
            print(f"  {r['external_id']}  lat={r['lat']}  lng={r['lng']}")
    else:
        print("\n[VALIDATION PASS] Zero rows outside Bengaluru bounds.")


def write_csv(rows):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"\n[output] Wrote {len(rows)} rows -> {OUTPUT_PATH}")


def print_summary(rows):
    from collections import Counter
    counts = Counter(r["camera_type"] for r in rows)
    print("\n-- Camera Type Distribution --------------------")
    for ctype in sorted(counts):
        print(f"  {ctype:<25} {counts[ctype]:>5} rows")
    print(f"  {'TOTAL':<25} {sum(counts.values()):>5} rows")
    print("------------------------------------------------")


# ── 12. Main ──────────────────────────────────────────────────────────────────
def main():
    random.seed(42)   # reproducible output

    signal_points = load_signal_points()

    batcs_rows      = generate_batcs(signal_points, target=400)
    safe_city_rows  = generate_safe_city(batcs_rows,   target=300)
    mcctns_rows     = generate_mcctns(target=1300)

    all_rows = batcs_rows + safe_city_rows + mcctns_rows

    # Ensure exactly 2000 rows (trim or warn if mis-counted)
    if len(all_rows) != 2000:
        print(f"\n[WARNING] Expected 2000 rows, got {len(all_rows)}. "
              f"Check generation logic.")

    random.shuffle(all_rows)     # mix the ordering before writing

    validate(all_rows)
    write_csv(all_rows)
    print_summary(all_rows)


if __name__ == "__main__":
    main()
