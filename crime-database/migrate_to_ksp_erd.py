import os
import csv
import random

OUTPUT_DIR = os.path.join("crime-database", "ksp-erd-normalized")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── 1. Master Tables Generation ───────────────────────────────────────────────

# State
states = [{"StateID": 1, "StateName": "Karnataka", "NationalityID": 1, "Active": 1}]

# District
districts = [
    {"DistrictID": 443, "DistrictName": "Bengaluru City / Urban", "StateID": 1, "Active": 1},
    {"DistrictID": 102, "DistrictName": "Mysuru District", "StateID": 1, "Active": 1},
    {"DistrictID": 103, "DistrictName": "Mangaluru / Dakshina Kannada", "StateID": 1, "Active": 1},
    {"DistrictID": 104, "DistrictName": "Belagavi District", "StateID": 1, "Active": 1},
    {"DistrictID": 105, "DistrictName": "Hubballi-Dharwad", "StateID": 1, "Active": 1},
    {"DistrictID": 106, "DistrictName": "Kalaburagi District", "StateID": 1, "Active": 1},
]

# Court
courts = [
    {"CourtID": 1, "CourtName": "City Civil & Sessions Court, Bengaluru", "DistrictID": 443, "StateID": 1, "Active": 1},
    {"CourtID": 2, "CourtName": "Chief Metropolitan Magistrate Court, Bengaluru", "DistrictID": 443, "StateID": 1, "Active": 1},
    {"CourtID": 3, "CourtName": "Principal District & Sessions Court, Mysuru", "DistrictID": 102, "StateID": 1, "Active": 1},
    {"CourtID": 4, "CourtName": "Fast Track Special Court (POCSO), Mangaluru", "DistrictID": 103, "StateID": 1, "Active": 1},
]

# UnitType
unit_types = [
    {"UnitTypeID": 1, "UnitTypeName": "Police Station (Law & Order)", "CityDistState": "City", "Hierarchy": 1, "Active": 1},
    {"UnitTypeID": 2, "UnitTypeName": "Traffic Police Station", "CityDistState": "City", "Hierarchy": 1, "Active": 1},
    {"UnitTypeID": 3, "UnitTypeName": "Cyber, Economic & Narcotics (CEN) PS", "CityDistState": "District", "Hierarchy": 2, "Active": 1},
    {"UnitTypeID": 4, "UnitTypeName": "Central Command & Control Centre", "CityDistState": "State", "Hierarchy": 3, "Active": 1},
]

# Unit (Police Stations)
units = [
    {"UnitID": 6, "UnitName": "Silk Board & Madiwala PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 443, "Active": 1},
    {"UnitID": 12, "UnitName": "MG Road & Cubbon Park PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 443, "Active": 1},
    {"UnitID": 18, "UnitName": "Whitefield Cyber Crime PS / CEN Command", "TypeID": 3, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 443, "Active": 1},
    {"UnitID": 24, "UnitName": "Koramangala 80ft Road PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 443, "Active": 1},
    {"UnitID": 30, "UnitName": "Indiranagar 100ft Road PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 443, "Active": 1},
    {"UnitID": 36, "UnitName": "Hebbal Flyover Junction PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 443, "Active": 1},
    {"UnitID": 42, "UnitName": "Mysuru Central PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 102, "Active": 1},
    {"UnitID": 48, "UnitName": "Mangaluru North Waterfront PS", "TypeID": 1, "ParentUnit": 0, "NationalityID": 1, "StateID": 1, "DistrictID": 103, "Active": 1},
]

# Rank
ranks = [
    {"RankID": 1, "RankName": "Police Constable", "Hierarchy": 6, "Active": 1},
    {"RankID": 2, "RankName": "Head Constable", "Hierarchy": 5, "Active": 1},
    {"RankID": 3, "RankName": "Assistant Sub-Inspector (ASI)", "Hierarchy": 4, "Active": 1},
    {"RankID": 4, "RankName": "Sub-Inspector of Police (PSI)", "Hierarchy": 3, "Active": 1},
    {"RankID": 5, "RankName": "Police Inspector (PI / SHO)", "Hierarchy": 2, "Active": 1},
    {"RankID": 6, "RankName": "Deputy Superintendent of Police (DSP / ACP)", "Hierarchy": 1, "Active": 1},
]

# Designation
designations = [
    {"DesignationID": 1, "DesignationName": "Station House Officer (SHO)", "Active": 1, "SortOrder": 1},
    {"DesignationID": 2, "DesignationName": "Investigating Officer (IO)", "Active": 1, "SortOrder": 2},
    {"DesignationID": 3, "DesignationName": "Crime Intelligence Analyst", "Active": 1, "SortOrder": 3},
    {"DesignationID": 4, "DesignationName": "Surveillance Field Intercept Lead", "Active": 1, "SortOrder": 4},
]

# Employee (Police Personnel)
employees = [
    {"EmployeeID": 1001, "DistrictID": 443, "UnitID": 6, "RankID": 5, "DesignationID": 1, "KGID": "KSP-4092", "FirstName": "Vikram Sharma", "EmployeeDOB": "1982-05-14", "GenderID": 1, "BloodGroupID": 1, "PhysicallyChallenged": 0, "AppointmentDate": "2006-08-01"},
    {"EmployeeID": 1002, "DistrictID": 443, "UnitID": 18, "RankID": 5, "DesignationID": 2, "KGID": "KSP-5120", "FirstName": "Ananya Hegde", "EmployeeDOB": "1988-11-20", "GenderID": 2, "BloodGroupID": 2, "PhysicallyChallenged": 0, "AppointmentDate": "2012-07-15"},
    {"EmployeeID": 1003, "DistrictID": 443, "UnitID": 24, "RankID": 4, "DesignationID": 2, "KGID": "KSP-6304", "FirstName": "Rajesh Gowda", "EmployeeDOB": "1990-03-10", "GenderID": 1, "BloodGroupID": 3, "PhysicallyChallenged": 0, "AppointmentDate": "2015-09-10"},
    {"EmployeeID": 1004, "DistrictID": 443, "UnitID": 12, "RankID": 6, "DesignationID": 4, "KGID": "KSP-3011", "FirstName": "Siddharth Rao", "EmployeeDOB": "1978-12-05", "GenderID": 1, "BloodGroupID": 1, "PhysicallyChallenged": 0, "AppointmentDate": "2002-04-12"},
]

# CaseCategory
case_categories = [
    {"CaseCategoryID": 1, "LookupValue": "FIR"},
    {"CaseCategoryID": 3, "LookupValue": "UDR"},
    {"CaseCategoryID": 4, "LookupValue": "PAR"},
    {"CaseCategoryID": 8, "LookupValue": "Zero FIR"},
]

# GravityOffence
gravity_offences = [
    {"GravityOffenceID": 1, "LookupValue": "Heinous"},
    {"GravityOffenceID": 2, "LookupValue": "Non-Heinous"},
]

# CaseStatusMaster
case_statuses = [
    {"CaseStatusID": 1, "CaseStatusName": "Under Investigation"},
    {"CaseStatusID": 2, "CaseStatusName": "Charge Sheeted"},
    {"CaseStatusID": 3, "CaseStatusName": "Closed / Disposed"},
    {"CaseStatusID": 4, "CaseStatusName": "Undetected (C-Report)"},
]

# Act & Section
acts = [
    {"ActCode": "IPC", "ActDescription": "Indian Penal Code, 1860 / Bharatiya Nyaya Sanhita", "ShortName": "IPC", "Active": 1},
    {"ActCode": "NDPS", "ActDescription": "Narcotic Drugs and Psychotropic Substances Act, 1985", "ShortName": "NDPS", "Active": 1},
    {"ActCode": "ITACT", "ActDescription": "Information Technology Act, 2000", "ShortName": "IT Act", "Active": 1},
    {"ActCode": "ARMS", "ActDescription": "The Arms Act, 1959", "ShortName": "Arms Act", "Active": 1},
    {"ActCode": "POCSO", "ActDescription": "Protection of Children from Sexual Offences Act, 2012", "ShortName": "POCSO", "Active": 1},
]

sections = [
    {"ActCode": "IPC", "SectionCode": "379", "SectionDescription": "Punishment for Theft", "Active": 1},
    {"ActCode": "IPC", "SectionCode": "392", "SectionDescription": "Punishment for Robbery", "Active": 1},
    {"ActCode": "IPC", "SectionCode": "302", "SectionDescription": "Punishment for Murder", "Active": 1},
    {"ActCode": "IPC", "SectionCode": "307", "SectionDescription": "Attempt to Murder", "Active": 1},
    {"ActCode": "IPC", "SectionCode": "420", "SectionDescription": "Cheating and dishonestly inducing delivery of property", "Active": 1},
    {"ActCode": "ITACT", "SectionCode": "66D", "SectionDescription": "Punishment for cheating by personation by using computer resource", "Active": 1},
    {"ActCode": "NDPS", "SectionCode": "20B", "SectionDescription": "Punishment for contravention in relation to cannabis plant and cannabis", "Active": 1},
    {"ActCode": "ARMS", "SectionCode": "25", "SectionDescription": "Punishment for certain offences involving arms/ammunition", "Active": 1},
]

# CrimeHead & CrimeSubHead
crime_heads = [
    {"CrimeHeadID": 1, "CrimeGroupName": "Crimes Against Property", "Active": 1},
    {"CrimeHeadID": 2, "CrimeGroupName": "Crimes Against Body / Violent Crime", "Active": 1},
    {"CrimeHeadID": 3, "CrimeGroupName": "Cyber & Economic Crimes", "Active": 1},
    {"CrimeHeadID": 4, "CrimeGroupName": "Narcotics & Contraband", "Active": 1},
]

crime_sub_heads = [
    {"CrimeSubHeadID": 1, "CrimeHeadID": 1, "CrimeHeadName": "Vehicle Theft / Motor Vehicle Larceny", "SeqID": 1},
    {"CrimeSubHeadID": 2, "CrimeHeadID": 1, "CrimeHeadName": "Armed Robbery / Highway Heist", "SeqID": 2},
    {"CrimeSubHeadID": 3, "CrimeHeadID": 1, "CrimeHeadName": "Chain Snatching / Street Theft", "SeqID": 3},
    {"CrimeSubHeadID": 4, "CrimeHeadID": 2, "CrimeHeadName": "Assault / Attempt to Murder", "SeqID": 4},
    {"CrimeSubHeadID": 5, "CrimeHeadID": 3, "CrimeHeadName": "Financial Fraud & Digital Phishing", "SeqID": 5},
    {"CrimeSubHeadID": 6, "CrimeHeadID": 4, "CrimeHeadName": "Commercial Drug Trafficking", "SeqID": 6},
]

# Masters: Caste, Religion, Occupation
caste_masters = [
    {"caste_master_id": 1, "caste_master_name": "General Category"},
    {"caste_master_id": 2, "caste_master_name": "OBC Group A"},
    {"caste_master_id": 3, "caste_master_name": "Scheduled Caste (SC)"},
    {"caste_master_id": 4, "caste_master_name": "Scheduled Tribe (ST)"},
]

religion_masters = [
    {"ReligionID": 1, "ReligionName": "Hindu"},
    {"ReligionID": 2, "ReligionName": "Muslim"},
    {"ReligionID": 3, "ReligionName": "Christian"},
    {"ReligionID": 4, "ReligionName": "Sikh"},
    {"ReligionID": 5, "ReligionName": "Jain"},
]

occupation_masters = [
    {"OccupationID": 1, "OccupationName": "Software Engineer / IT Professional"},
    {"OccupationID": 2, "OccupationName": "Merchant / Business Owner"},
    {"OccupationID": 3, "OccupationName": "Government / Public Sector Employee"},
    {"OccupationID": 4, "OccupationName": "Student"},
    {"OccupationID": 5, "OccupationName": "Commercial Vehicle Driver"},
    {"OccupationID": 6, "OccupationName": "Private Sector Employee"},
]

# ── 2. Read Source FIRs & Build Normalized Relational Records ──────────────────
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
victims = []
accused = []
act_section_assoc = []
chargesheets = []
arrest_surrenders = []

crime_type_map = {
    "vehicle_theft": {"head": 1, "sub": 1, "act": "IPC", "sec": "379", "gravity": 2},
    "robbery": {"head": 1, "sub": 2, "act": "IPC", "sec": "392", "gravity": 1},
    "chain_snatching": {"head": 1, "sub": 3, "act": "IPC", "sec": "379", "gravity": 2},
    "assault": {"head": 2, "sub": 4, "act": "IPC", "sec": "307", "gravity": 1},
    "cyber_fraud": {"head": 3, "sub": 5, "act": "ITACT", "sec": "66D", "gravity": 2},
    "narcotics": {"head": 4, "sub": 6, "act": "NDPS", "sec": "20B", "gravity": 1},
}

for idx, row in enumerate(rows):
    case_master_id = idx + 1
    dist_name = str(row.get("district_name", "Bengaluru Urban"))
    dist_id = 443 if "Bengaluru" in dist_name else 102
    unit_id = 6 if "Silk Board" in str(row.get("police_station", "")) else (18 if "Whitefield" in str(row.get("police_station", "")) else 24)
    year = 2026
    serial = idx + 1
    category_id = 8 if "ZERO" in str(row.get("case_number", "")).upper() else 1

    # 18-digit CrimeNo: 1-digit category + 4-digit district + 4-digit unit + 4-digit year + 5-digit serial
    crime_no = f"{category_id}{dist_id:04d}{unit_id:04d}{year:04d}{serial:05d}"
    case_no = f"{year:04d}{serial:05d}"

    ctype = row.get("crime_type_code", "vehicle_theft")
    cinfo = crime_type_map.get(ctype, crime_type_map["vehicle_theft"])
    gravity_id = cinfo["gravity"]
    date_f = row.get("date_filed", "2026-07-22")
    time_f = row.get("time_filed", "12:00:00")
    status_str = row.get("status", "under_investigation")
    status_id = 2 if status_str == "chargesheeted" else (3 if status_str == "closed" else 1)

    # 1. CaseMaster
    case_master.append({
        "CaseMasterID": case_master_id,
        "CrimeNo": crime_no,
        "CaseNo": case_no,
        "CrimeRegisteredDate": date_f,
        "PolicePersonID": random.choice([1001, 1002, 1003, 1004]),
        "PoliceStationID": unit_id,
        "CaseCategoryID": category_id,
        "GravityOffenceID": gravity_id,
        "CrimeMajorHeadID": cinfo["head"],
        "CrimeMinorHeadID": cinfo["sub"],
        "CaseStatusID": status_id,
        "CourtID": 1 if dist_id == 443 else 3,
        "IncidentFromDate": f"{date_f} {time_f}",
        "IncidentToDate": f"{date_f} {time_f}",
        "InfoReceivedPSDate": f"{date_f} {time_f}",
        "latitude": row.get("location_lat", "12.9352"),
        "longitude": row.get("location_lng", "77.6245"),
        "BriefFacts": row.get("description", "FIR Offence brief facts recorded under statutory provisions.")
    })

    # 2. ComplainantDetails
    complainants.append({
        "ComplainantID": idx + 1,
        "CaseMasterID": case_master_id,
        "ComplainantName": f"Complainant {row.get('complainant_name', f'Citizen #{idx+1}')}",
        "AgeYear": random.randint(25, 62),
        "OccupationID": random.randint(1, 6),
        "ReligionID": random.randint(1, 4),
        "CasteID": random.randint(1, 4),
        "GenderID": random.choice([1, 2])
    })

    # 3. Victim
    victims.append({
        "VictimMasterID": idx + 1,
        "CaseMasterID": case_master_id,
        "VictimName": row.get("victim_name", f"Victim Party #{idx+1}"),
        "AgeYear": random.randint(19, 58),
        "GenderID": random.choice([1, 2]),
        "VictimPolice": "1" if "police" in str(row.get("description", "")).lower() else "0"
    })

    # 4. Accused (Prime A1 and Accomplice A2)
    accused_name = row.get("accused_name", "Unknown Suspect")
    accused.append({
        "AccusedMasterID": (idx * 2) + 1,
        "CaseMasterID": case_master_id,
        "AccusedName": accused_name,
        "AgeYear": random.randint(22, 48),
        "GenderID": 1,
        "PersonID": "A1"
    })
    if int(row.get("risk_score", 50) or 50) > 75:
        accused.append({
            "AccusedMasterID": (idx * 2) + 2,
            "CaseMasterID": case_master_id,
            "AccusedName": f"Accomplice of {accused_name.split()[0]}",
            "AgeYear": random.randint(20, 40),
            "GenderID": 1,
            "PersonID": "A2"
        })

    # 5. ActSectionAssociation
    act_section_assoc.append({
        "CaseMasterID": case_master_id,
        "ActID": cinfo["act"],
        "SectionID": cinfo["sec"],
        "ActOrderID": 1,
        "SectionOrderID": 1
    })

    # 6. ChargesheetDetails
    chargesheets.append({
        "CSID": idx + 1,
        "CaseMasterID": case_master_id,
        "csdate": date_f,
        "cstype": "A" if status_str == "chargesheeted" else ("B" if status_str == "closed" else "C"),
        "PolicePersonID": random.choice([1001, 1002, 1003, 1004])
    })

    # 7. ArrestSurrender
    if int(row.get("risk_score", 50) or 50) > 65:
        arrest_surrenders.append({
            "ArrestSurrenderID": len(arrest_surrenders) + 1,
            "CaseMasterID": case_master_id,
            "ArrestSurrenderTypeID": 1, # Arrest
            "ArrestSurrenderDate": date_f,
            "ArrestSurrenderStateId": 1,
            "ArrestSurrenderDistrictId": dist_id,
            "PoliceStationID": unit_id,
            "IOID": 1001,
            "CourtID": 1,
            "AccusedMasterID": (idx * 2) + 1,
            "IsAccused": 1,
            "IsComplainantAccused": 0
        })

# ── 3. CSV Writer Helper ──────────────────────────────────────────────────────
def write_csv(filename, data):
    if not data:
        return
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(data[0].keys()))
        writer.writeheader()
        writer.writerows(data)
    print(f"  - Written: {filename} ({len(data)} rows)")

print("Generating 20 Normalized KSP ERD Tables into crime-database/ksp-erd-normalized/...")

# Master lookups
write_csv("State.csv", states)
write_csv("District.csv", districts)
write_csv("Court.csv", courts)
write_csv("UnitType.csv", unit_types)
write_csv("Unit.csv", units)
write_csv("Rank.csv", ranks)
write_csv("Designation.csv", designations)
write_csv("Employee.csv", employees)
write_csv("CaseCategory.csv", case_categories)
write_csv("GravityOffence.csv", gravity_offences)
write_csv("CaseStatusMaster.csv", case_statuses)
write_csv("Act.csv", acts)
write_csv("Section.csv", sections)
write_csv("CrimeHead.csv", crime_heads)
write_csv("CrimeSubHead.csv", crime_sub_heads)
write_csv("CasteMaster.csv", caste_masters)
write_csv("ReligionMaster.csv", religion_masters)
write_csv("OccupationMaster.csv", occupation_masters)

# Core entities
write_csv("CaseMaster.csv", case_master)
write_csv("ComplainantDetails.csv", complainants)
write_csv("Victim.csv", victims)
write_csv("Accused.csv", accused)
write_csv("ActSectionAssociation.csv", act_section_assoc)
write_csv("ChargesheetDetails.csv", chargesheets)
write_csv("ArrestSurrender.csv", arrest_surrenders)

print("\nAll 20 Normalized KSP ERD CSV tables generated successfully!")
