import os
import csv
import random

OUTPUT_DIR = os.path.join("crime-database", "ksp-erd-normalized")
os.makedirs(OUTPUT_DIR, exist_ok=True)

fir_csv_path = "crime-database/generated-csv/firs_v3.csv"
rows = []

if os.path.exists(fir_csv_path):
    with open(fir_csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

if not rows:
    rows = [
        {
            "case_number": "FIR-2026-BL-9104", "date_filed": "2026-07-22", "time_filed": "13:45:00",
            "crime_type_code": "cyber_fraud", "district_name": "Bengaluru Urban",
            "police_station": "Whitefield Cyber Crime PS / CEN Command",
            "location_lat": 12.9860, "location_lng": 77.7380, "status": "under_investigation",
            "accused_name": "Vikram Malhotra", "risk_score": 88,
            "description": "Spear-phishing tokens deployed to compromise corporate credentials."
        }
    ]

case_master = []
complainants = []
accused = []
chargesheets = []

for idx, row in enumerate(rows):
    case_master_id = idx + 1
    dist_id = 443 if "Bengaluru" in str(row.get("district_name", "")) else 102
    unit_id = 6
    year = 2026
    serial = idx + 1

    crime_no = f"1{dist_id:04d}{unit_id:04d}{year:04d}{serial:05d}"
    case_no = f"{year:04d}{serial:05d}"

    case_master.append({
        "CaseMasterID": case_master_id,
        "CrimeNo": crime_no,
        "CaseNo": case_no,
        "CrimeRegisteredDate": row.get("date_filed", "2026-07-22"),
        "PolicePersonID": random.randint(1001, 1050),
        "PoliceStationID": unit_id,
        "CaseCategoryID": 1,
        "GravityOffenceID": 1 if int(row.get("risk_score", 50) or 50) > 80 else 2,
        "CrimeMajorHeadID": 1,
        "CrimeMinorHeadID": 3,
        "CaseStatusID": 1 if row.get("status") == "open" else 2,
        "CourtID": 1,
        "IncidentFromDate": f"{row.get('date_filed', '2026-07-22')} {row.get('time_filed', '12:00:00')}",
        "IncidentToDate": f"{row.get('date_filed', '2026-07-22')} {row.get('time_filed', '12:00:00')}",
        "InfoReceivedPSDate": f"{row.get('date_filed', '2026-07-22')} {row.get('time_filed', '12:00:00')}",
        "latitude": row.get("location_lat", "12.9716"),
        "longitude": row.get("location_lng", "77.5946"),
        "BriefFacts": row.get("description", "FIR Offence brief facts.")
    })

    complainants.append({
        "ComplainantID": idx + 1,
        "CaseMasterID": case_master_id,
        "ComplainantName": f"Citizen Informant #{idx+1}",
        "AgeYear": random.randint(25, 60),
        "OccupationID": random.randint(1, 10),
        "ReligionID": 1,
        "CasteID": 1,
        "GenderID": random.choice([1, 2])
    })

    accused.append({
        "AccusedMasterID": idx + 1,
        "CaseMasterID": case_master_id,
        "AccusedName": row.get("accused_name", "Unknown Suspect"),
        "AgeYear": random.randint(22, 45),
        "GenderID": 1,
        "PersonID": "A1"
    })

    chargesheets.append({
        "CSID": idx + 1,
        "CaseMasterID": case_master_id,
        "csdate": row.get("date_filed", "2026-07-22"),
        "cstype": "A" if row.get("status") == "chargesheeted" else "C",
        "PolicePersonID": random.randint(1001, 1050)
    })

def write_csv(filename, data, fieldnames):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

write_csv("CaseMaster.csv", case_master, list(case_master[0].keys()))
write_csv("ComplainantDetails.csv", complainants, list(complainants[0].keys()))
write_csv("Accused.csv", accused, list(accused[0].keys()))
write_csv("ChargesheetDetails.csv", chargesheets, list(chargesheets[0].keys()))

print("✅ Successfully transformed flat records into Normalized KSP ERD relational CSVs in crime-database/ksp-erd-normalized/")
