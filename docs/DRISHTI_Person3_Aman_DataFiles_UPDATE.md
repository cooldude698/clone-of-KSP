# DRISHTI — ದೃಷ್ಟಿ
## Person 3: Aman Jain — Data Setup Update (Matched to Your Real Files)
**KSP × Hack2Skill Datathon 2026**

---

> This replaces the "Organize Your Already-Downloaded Datasets" and "Inspect Real Files, Then Generate" sections of your main guide. Everything else in your original guide (Day 3 import, Day 3-4 function folders, Day 4-5/Week 2 building the six APIs, testing checklist) stays exactly the same — only the data-organizing and CSV-generation steps below change, because you have more and richer files than the guide originally assumed.

---

## WHAT YOU ACTUALLY HAVE — CONFIRMED

```
raw-data/
├── bengaluru-crime/
│   ├── 2023.pdf                                  (reference only, not parsed)
│   ├── Bengaluru Accidental And Suicide Deaths 2023.csv
│   ├── Bengaluru Crimes Against Women 2023.csv
│   ├── Bengaluru Total Cyber Crimes 2023.csv
│   ├── crime-against-children-2023.csv
│   ├── crime-in-india-2023-v2.pdf                (reference only, not parsed)
│   ├── crime-in-india-2023.pdf                   (reference only, not parsed)
│   └── total-crime-2023.csv
├── boundaries/
│   └── karnataka_districts.geojson
├── census/
│   └── karnataka_districts_census.xlsx            (note: xlsx, not csv)
├── police-stations/
│   └── bengaluru_police_stations.csv
├── traffic-signals/                               (empty — not your file, this is 
│                                                    the camera-intel person's input, 
│                                                    ignore it entirely)
├── district-wise-2022.csv
├── district-wise-2023.csv
└── district-wise-2024.csv
```

This is genuinely better than what the original guide assumed — you have three years of district-wise data (lets you show real year-over-year trends) plus five Bengaluru-specific crime-category files that let your victim-demographic logic be grounded in real numbers instead of estimated splits.

---

## STAGE 1 — Confirm Folder Placement (5 minutes)

Run this to confirm everything is exactly where the script will expect it:
```powershell
cd crime-database
dir raw-data
dir raw-data\bengaluru-crime
dir raw-data\census
dir raw-data\police-stations
dir raw-data\boundaries
```
If any file is sitting in the wrong folder, move it now:
```powershell
Move-Item [filename] raw-data\[correct-folder]\
```

The three `district-wise-20XX.csv` files should sit directly in `raw-data/` (not inside a subfolder) — that matches what you listed, so leave them there.

---

## STAGE 2 — Convert the Census File From XLSX to CSV

Your census file is `.xlsx`, but the generation script works with CSV. Convert it once:
```powershell
python3 -c "
import pandas as pd
df = pd.read_excel('raw-data/census/karnataka_districts_census.xlsx')
df.to_csv('raw-data/census/karnataka_districts_census.csv', index=False)
print('Converted. Columns:', list(df.columns))
"
```
This prints the real column names — keep that output, you'll need it in Stage 3.

---

## STAGE 3 — Inspect Every Real File Before Writing the Script

Don't skip this. Government and city-level CSVs are never consistently formatted, and your generation script needs to match reality, not a guess. Run each of these one at a time and keep the printed output:

```powershell
python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/district-wise-2024.csv')
print('=== district-wise-2024.csv ===')
print('Columns:', list(df.columns))
print(df.head(5))
"
```

Repeat this exact pattern for every file below, just swapping the filename:
```powershell
python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/district-wise-2023.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/district-wise-2022.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/bengaluru-crime/total-crime-2023.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/bengaluru-crime/Bengaluru Crimes Against Women 2023.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/bengaluru-crime/Bengaluru Total Cyber Crimes 2023.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/bengaluru-crime/crime-against-children-2023.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/bengaluru-crime/Bengaluru Accidental And Suicide Deaths 2023.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"

python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/police-stations/bengaluru_police_stations.csv')
print('Columns:', list(df.columns)); print(df.head(5))
"
```

Copy all nine outputs (district-wise ×3, bengaluru-crime ×4, census ×1 from Stage 2, police-stations ×1) into a single text file or note somewhere — you'll paste all of it into the next prompt at once.

---

## STAGE 4 — Generate the CSV-Writing Script (Updated Prompt)

This replaces the "Generate the CSV-Writing Script" prompt in your original guide. Paste this into Claude, **filling in every bracketed section with the real output you collected in Stage 3**:

```
Write a complete Python script generate-csvs.py for DRISHTI.

This script ONLY reads local files and writes local CSV files. No database 
connection of any kind.

INPUT FILES (real, already downloaded and inspected):

1. raw-data/district-wise-2024.csv (PRIMARY source for FIR generation)
   [PASTE columns + sample rows from Stage 3]

2. raw-data/district-wise-2023.csv (secondary year, for year-over-year realism)
   [PASTE columns + sample rows]

3. raw-data/district-wise-2022.csv (third year, for year-over-year realism)
   [PASTE columns + sample rows]

4. raw-data/bengaluru-crime/total-crime-2023.csv (Bengaluru-specific totals, 
   cross-check against district-wise files for Bengaluru Urban specifically)
   [PASTE columns + sample rows]

5. raw-data/bengaluru-crime/Bengaluru Crimes Against Women 2023.csv (use this 
   to ground victim gender/age demographics in real numbers instead of estimates 
   for crimes like chain_snatching, assault, domestic_violence, eve_teasing)
   [PASTE columns + sample rows]

6. raw-data/bengaluru-crime/Bengaluru Total Cyber Crimes 2023.csv (use this to 
   ground the real proportion and demographic pattern of cybercrime cases)
   [PASTE columns + sample rows]

7. raw-data/bengaluru-crime/crime-against-children-2023.csv (use this to inform 
   any under-18 victim patterns — do NOT generate any FIR where the accused is 
   under 18; only use this for real victim demographic grounding)
   [PASTE columns + sample rows]

8. raw-data/bengaluru-crime/Bengaluru Accidental And Suicide Deaths 2023.csv 
   (use only to inform hit_and_run crime_type proportions and district 
   distribution — do not create a separate crime_type for suicides, that is out 
   of scope for this platform)
   [PASTE columns + sample rows]

9. raw-data/census/karnataka_districts_census.csv (converted from xlsx)
   [PASTE columns + sample rows]

10. raw-data/police-stations/bengaluru_police_stations.csv
   [PASTE columns + sample rows]

OUTPUT FILES (write to crime-database/generated-csv/), exact target row counts —
do not exceed these (Catalyst dev environment caps at 5000 rows/table, 
25000 total/project, and Cameras (~2000 rows) is being loaded separately by 
another team member, so stay within this budget):

districts.csv → 20 rows
  columns: name, division, population, urban_population_pct, area_sqkm, 
  lat_center, lng_center
  Source from file 9 (census). If population figures are missing for any 
  district, use a reasonable fallback based on known Karnataka district sizes.

police_stations.csv → 120 rows
  columns: name, district_name, division, address, lat, lng
  Source real station names from file 10 for Bengaluru Urban. For the other 19 
  districts, generate "[Area] Police Station" style names distributed 
  proportionally (~5-6 per district).

crime_types.csv → 15 rows (fixed reference list, write these exact rows):
  vehicle_theft|Vehicle Theft|Property|IPC 379|2
  chain_snatching|Chain Snatching|Violent|IPC 392|3
  burglary|Burglary|Property|IPC 454|3
  robbery|Robbery|Violent|IPC 392|4
  assault|Assault|Violent|IPC 323|3
  fraud|Fraud|Economic|IPC 420|2
  cybercrime|Cybercrime|Economic|IT Act 66|2
  drug_offence|Drug Offence|Other|NDPS 20|3
  murder|Murder|Violent|IPC 302|5
  eve_teasing|Eve Teasing|Violent|IPC 354|2
  kidnapping|Kidnapping|Violent|IPC 363|5
  hit_and_run|Hit and Run|Other|IPC 304A|3
  property_crime|Property Crime|Property|IPC 427|1
  domestic_violence|Domestic Violence|Violent|IPC 498A|3
  senior_citizen_crime|Senior Citizen Crime|Violent|IPC various|3
  columns: code, name, category, ipc_section, severity

firs.csv → 2500 rows
  IMPORTANT — use these EXACT column names (not "year"/"month"/"status" — those 
  are Catalyst reserved keywords and will break the import):
  case_number, date_filed, time_filed, crime_type_code, description, 
  case_status, district_name, police_station, location_name, location_lat, 
  location_lng, investigation_officer, year_filed, month_filed, hour_of_crime

  PRIMARY SOURCE: Parse district-wise-2024.csv (file 1) to get REAL relative 
  proportions of crimes per district. Map whatever crime columns actually exist 
  in that file to the closest matching code from crime_types.csv.
  
  CROSS-CHECK: Use total-crime-2023.csv (file 4) specifically to refine the 
  Bengaluru Urban district's proportions, since that file is Bengaluru-specific 
  and likely more granular than the state-wide district file.
  
  YEAR DISTRIBUTION: distribute the 2500 rows across 2022-2025, weighted using 
  the relative year-over-year totals implied by comparing files 1, 2, and 3 
  (district-wise-2022/2023/2024) — if 2024 shows higher crime counts than 2022 
  in the real data, more of your 2500 rows should land in 2024/2025 than 2022.
  
  Scale everything down proportionally to exactly 2500 total rows while 
  preserving real ratios between districts, years, and crime types.
  
  Apply seasonal weighting: vehicle_theft and chain_snatching get double weight 
  in October-December when randomly assigning date_filed within each year.
  
  case_number format: KAR/[district 3-letter code]/[year]/[seq 4-digit]
  case_status values: 50% "open", 30% "under_investigation", 15% "chargesheeted", 5% "closed"
  For vehicle_theft/robbery/chain_snatching: embed a fake Karnataka plate 
  (format KA-NN-A-NNNN or KA-NN-AA-NNNN) inside the description text.
  For hit_and_run specifically: use file 8 (accidental deaths) to weight which 
  districts get more hit_and_run rows.

accused.csv → 2500 rows
  columns: full_name, alias, age, gender, address, district_name, occupation, 
  prior_convictions, modus_operandi, risk_score
  Faker('en_IN') names. 75% male, age skew 18-45, 25% prior_convictions > 0.
  Every accused must be 18 or older — never generate an accused under 18, 
  regardless of what file 7 (crime against children) suggests, since that file 
  describes victims, not accused persons.
  Pick 15 as "repeat offenders": risk_score 70-95, prior_convictions 3-8. 
  Everyone else: risk_score 0-50.

victims.csv → 2500 rows
  columns: full_name, age, gender, occupation, district_name, vulnerability_score
  Faker('en_IN') names. Ground demographics in real proportions from these 
  specific files where the linked crime_type matches:
  - crime_type = domestic_violence, assault, chain_snatching, eve_teasing → 
    use file 5 (Crimes Against Women) to weight toward real female victim 
    age/pattern distributions
  - crime_type = cybercrime → use file 6 (Cyber Crimes) to weight victim age 
    distribution (cybercrime often skews toward both elderly and young adult 
    victims — use whatever pattern file 6 actually shows)
  - any victim linked to file 7's real proportions where relevant → age under 18 
    is allowed ONLY for victims (never accused), and only where realistically 
    matching file 7's crime-against-children categories
  - all other crime types: reasonable general-population demographic spread

fir_accused.csv → 2800 rows
  columns: fir_case_number, accused_full_name, accused_role
  Link by case_number and full_name (natural keys, not row numbers — Catalyst 
  assigns its own IDs after import). Link the 15 repeat offenders to 4-8 FIRs each.

fir_victims.csv → 2500 rows
  columns: fir_case_number, victim_full_name
  Same natural-key linking pattern.

anpr_watchlist.csv → 800 rows
  IMPORTANT — use "alert_priority" not "priority" (reserved keyword):
  columns: plate_number, fir_case_number, crime_type, alert_active, alert_priority
  Extract plate numbers embedded in firs.csv descriptions (regex 
  KA-\d{2}-[A-Z]{1,2}-\d{4}). Take up to 800 unique plates. 80% alert_active=True. 
  Repeat offenders' plates get alert_priority=high, others medium.

Main function: run all sections in order, print row counts per output file, 
print warnings if any real input file was missing columns the script expected, 
and clearly state which fallback logic was used in each case.
```

---

## STAGE 5 — Run It
```powershell
python3 data-scripts/generate-csvs.py
```

You should get 9 CSV files in `crime-database/generated-csv/`. Since you're feeding it three years of district data plus five Bengaluru-specific crime files this time, the output should look noticeably more grounded than a single-file version — check a few rows manually:

```powershell
python3 -c "
import pandas as pd
df = pd.read_csv('generated-csv/firs.csv')
print(df['district_name'].value_counts().head(10))
print(df['crime_type_code'].value_counts())
print(df.groupby('year_filed').size())
"
```
Bengaluru Urban should dominate the district counts. Vehicle theft and fraud should be near the top of crime type counts. Row counts per year should roughly track what the real district-wise-2022/2023/2024 files implied (increasing or decreasing in the same direction as the real data).

---

## WHAT STAYS THE SAME

Everything from **"DAY 3 — Import Into Catalyst"** onward in your original guide is unchanged — the `catalyst ds:import` commands, the six function folders, the FIRs/Hotspots/Trends/Repeat-Offenders/Victim-Vulnerability/Under-Reporting API builds, and the testing checklist all apply exactly as written. This update only replaces how you get from your real downloaded files to the 9 clean CSVs that feed into that import step.

---

*DRISHTI — ದೃಷ್ಟಿ | Person 3 (Aman Jain) Data Setup Update | KSP × Hack2Skill 2026*
