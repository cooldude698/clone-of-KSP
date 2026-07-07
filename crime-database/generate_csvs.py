import os
import random
import re
import pandas as pd
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('en_IN')

OUTPUT_DIR = os.path.join("crime-database", "generated-csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------
# 1. DISTRICTS (20 rows)
# ---------------------------------------------------------
districts_data = [
    ("Bengaluru Urban", "Bengaluru", 9621551, 90.9, 2196, 12.9716, 77.5946),
    ("Bengaluru Rural", "Bengaluru", 990923, 27.1, 2298, 13.2257, 77.5750),
    ("Mysuru", "Southern", 3001127, 41.5, 6854, 12.2958, 76.6394),
    ("Mangaluru (Dakshina Kannada)", "Western", 2089649, 47.7, 4560, 12.9141, 74.8560),
    ("Hubballi-Dharwad", "Northern", 1847023, 56.8, 4263, 15.3647, 75.1240),
    ("Belagavi", "Northern", 4779661, 25.3, 13415, 15.8497, 74.4977),
    ("Kalaburagi", "North-Eastern", 2566326, 32.6, 10951, 17.3297, 76.8343),
    ("Ballari", "Central", 2452595, 37.5, 8447, 15.1394, 76.9214),
    ("Shivamogga", "Central", 1752753, 35.6, 8477, 13.9299, 75.5681),
    ("Tumakuru", "Bengaluru", 2678980, 22.4, 10597, 13.3392, 77.1017),
    ("Davangere", "Central", 1945497, 32.3, 5924, 14.4644, 75.9218),
    ("Hassan", "Southern", 1776421, 21.2, 6814, 13.0033, 76.1004),
    ("Vijayapura", "Northern", 2177331, 23.1, 10475, 16.8302, 75.7100),
    ("Raichur", "North-Eastern", 1928812, 25.4, 8432, 16.2076, 77.3463),
    ("Udupi", "Western", 1177361, 28.4, 3880, 13.3409, 74.7421),
    ("Kolar", "Bengaluru", 1536401, 31.2, 3969, 13.1367, 78.1291),
    ("Mandya", "Southern", 1805769, 17.1, 4961, 12.5218, 76.8951),
    ("Chikkamagaluru", "Western", 1137961, 21.0, 7201, 13.3161, 75.7720),
    ("Bidar", "North-Eastern", 1703300, 25.0, 5448, 17.9104, 77.5199),
    ("Koppal", "North-Eastern", 1389920, 16.8, 7189, 15.3518, 76.1554)
]

df_districts = pd.DataFrame(districts_data, columns=[
    "name", "division", "population", "urban_population_pct", "area_sqkm", "lat_center", "lng_center"
])
df_districts.to_csv(os.path.join(OUTPUT_DIR, "districts.csv"), index=False)
print("Generated districts.csv:", len(df_districts))

# ---------------------------------------------------------
# 2. POLICE STATIONS (120 rows)
# ---------------------------------------------------------
stations = []
for idx, row in df_districts.iterrows():
    d_name = row["name"]
    div = row["division"]
    lat_c = row["lat_center"]
    lng_c = row["lng_center"]
    
    # Generate 6 stations per district = 120 total
    station_prefixes = ["Central", "North", "South", "East", "West", "Traffic"] if "Bengaluru" in d_name or "Mysuru" in d_name else ["Town", "Rural", "Suburban", "Traffic", "Market", "Industrial"]
    for p in station_prefixes:
        s_name = f"{d_name} {p} PS"
        addr = f"{p} Road, {d_name}, Karnataka"
        s_lat = round(lat_c + random.uniform(-0.08, 0.08), 4)
        s_lng = round(lng_c + random.uniform(-0.08, 0.08), 4)
        stations.append((s_name, d_name, div, addr, s_lat, s_lng))

df_stations = pd.DataFrame(stations, columns=[
    "name", "district_name", "division", "address", "lat", "lng"
])
df_stations.to_csv(os.path.join(OUTPUT_DIR, "police_stations.csv"), index=False)
print("Generated police_stations.csv:", len(df_stations))

# ---------------------------------------------------------
# 3. CRIME TYPES (15 rows)
# ---------------------------------------------------------
crime_types_data = [
    ("vehicle_theft", "Vehicle Theft", "Property", "IPC 379", 2),
    ("chain_snatching", "Chain Snatching", "Violent", "IPC 392", 3),
    ("burglary", "Burglary", "Property", "IPC 454", 3),
    ("robbery", "Robbery", "Violent", "IPC 392", 4),
    ("assault", "Assault", "Violent", "IPC 323", 3),
    ("fraud", "Fraud", "Economic", "IPC 420", 2),
    ("cybercrime", "Cybercrime", "Economic", "IT Act 66", 2),
    ("drug_offence", "Drug Offence", "Other", "NDPS 20", 3),
    ("murder", "Murder", "Violent", "IPC 302", 5),
    ("eve_teasing", "Eve Teasing", "Violent", "IPC 354", 2),
    ("kidnapping", "Kidnapping", "Violent", "IPC 363", 5),
    ("hit_and_run", "Hit and Run", "Other", "IPC 304A", 3),
    ("property_crime", "Property Crime", "Property", "IPC 427", 1),
    ("domestic_violence", "Domestic Violence", "Violent", "IPC 498A", 3),
    ("senior_citizen_crime", "Senior Citizen Crime", "Violent", "IPC various", 3)
]

df_crime_types = pd.DataFrame(crime_types_data, columns=[
    "code", "name", "category", "ipc_section", "severity"
])
df_crime_types.to_csv(os.path.join(OUTPUT_DIR, "crime_types.csv"), index=False)
print("Generated crime_types.csv:", len(df_crime_types))

# ---------------------------------------------------------
# 4. FIRS (2500 rows)
# ---------------------------------------------------------
firs = []
start_date = datetime(2024, 1, 1)
end_date = datetime(2025, 6, 1)

status_choices = ["open", "under_investigation", "chargesheeted", "closed"]
status_weights = [0.50, 0.30, 0.15, 0.05]

crime_codes = [c[0] for c in crime_types_data]
# Give vehicle_theft, fraud, chain_snatching higher relative weights
crime_weights = [0.20, 0.12, 0.10, 0.08, 0.08, 0.12, 0.08, 0.04, 0.02, 0.04, 0.02, 0.04, 0.03, 0.02, 0.01]

district_names = df_districts["name"].tolist()
# Give Bengaluru Urban double weight
district_weights = [0.35 if "Bengaluru Urban" in d else 0.035 for d in district_names]
sum_w = sum(district_weights)
district_weights = [w / sum_w for w in district_weights]

def generate_karnataka_plate():
    r_code = f"{random.randint(1, 55):02d}"
    series = random.choice(["A", "B", "M", "N", "P", "KA", "KB"])
    num = f"{random.randint(1000, 9999)}"
    return f"KA-{r_code}-{series}-{num}"

used_plates = []

for i in range(1, 2501):
    dist = random.choices(district_names, weights=district_weights)[0]
    dist_short = dist[:3].upper()
    case_num = f"KAR/{dist_short}/2024/{i:04d}"
    
    c_code = random.choices(crime_codes, weights=crime_weights)[0]
    
    # Date generation with seasonal weighting in Q4
    days_between = (end_date - start_date).days
    random_day = random.randint(0, days_between)
    f_date = start_date + timedelta(days=random_day)
    
    # Seasonal boost for vehicle_theft & chain_snatching in Oct-Dec
    if c_code in ["vehicle_theft", "chain_snatching"] and random.random() < 0.4:
        f_date = datetime(2024, random.choice([10, 11, 12]), random.randint(1, 28))
        
    date_filed_str = f_date.strftime("%Y-%m-%d")
    hour = random.randint(0, 23)
    time_filed_str = f"{hour:02d}:{random.randint(0, 59):02d}:00"
    
    # Match police station
    st_df = df_stations[df_stations["district_name"] == dist]
    if not st_df.empty:
        st_row = st_df.sample(1).iloc[0]
        st_name = st_row["name"]
        lat = round(st_row["lat"] + random.uniform(-0.03, 0.03), 4)
        lng = round(st_row["lng"] + random.uniform(-0.03, 0.03), 4)
    else:
        st_name = f"{dist} Central PS"
        lat, lng = 12.9716, 77.5946
        
    officer = f"Insp. {fake.name()}"
    c_status = random.choices(status_choices, weights=status_weights)[0]
    
    loc_name = f"Near {fake.street_name()}, {dist}"
    desc = f"Reported incident of {c_code.replace('_', ' ')} at {loc_name}."
    
    if c_code in ["vehicle_theft", "robbery", "chain_snatching"]:
        plate = generate_karnataka_plate()
        used_plates.append((plate, case_num, c_code))
        desc += f" Suspect vehicle noticed with plate {plate}."
        
    firs.append((
        case_num, date_filed_str, time_filed_str, c_code, desc, c_status,
        dist, st_name, loc_name, lat, lng, officer, f_date.year, f_date.month, hour
    ))

df_firs = pd.DataFrame(firs, columns=[
    "case_number", "date_filed", "time_filed", "crime_type_code", "description",
    "status", "district_name", "police_station", "location_name", "location_lat",
    "location_lng", "investigation_office", "year_filed", "month_filed", "hour_of_crime"
])
df_firs.to_csv(os.path.join(OUTPUT_DIR, "firs_v3.csv"), index=False)
print("Generated firs_v3.csv:", len(df_firs))

# ---------------------------------------------------------
# 5. ACCUSED (2500 rows)
# ---------------------------------------------------------
accused = []
for i in range(2500):
    full_name = fake.name_male() if random.random() < 0.75 else fake.name_female()
    alias = fake.first_name() if random.random() < 0.3 else ""
    age = random.randint(18, 55)
    gender = "Male" if random.random() < 0.75 else "Female"
    addr = f"{fake.building_number()}, {fake.street_name()}"
    dist = random.choice(district_names)
    occ = random.choice(["Driver", "Mechanic", "Unemployed", "Laborer", "Contractor", "Delivery Boy", "Vendor"])
    
    # 15 designated repeat offenders
    if i < 15:
        priors = random.randint(3, 8)
        risk = random.randint(75, 95)
        mo = random.choice(["Night time lock breaking", "Targeting parked two-wheelers", "Fake online job offer", "Snatching on empty stretches"])
    else:
        priors = random.choices([0, 1, 2], weights=[0.75, 0.20, 0.05])[0]
        risk = random.randint(0, 50)
        mo = "Opportunistic crime"
        
    accused.append((full_name, alias, age, gender, addr, dist, occ, priors, mo, risk))

df_accused = pd.DataFrame(accused, columns=[
    "full_name", "alias", "age", "gender", "address", "district_name",
    "occupation", "prior_convictions", "modus_operandi", "risk_score"
])
df_accused.to_csv(os.path.join(OUTPUT_DIR, "accused.csv"), index=False)
print("Generated accused.csv:", len(df_accused))

# ---------------------------------------------------------
# 6. VICTIMS (2500 rows)
# ---------------------------------------------------------
victims = []
for i in range(2500):
    gender = "Female" if random.random() < 0.45 else "Male"
    full_name = fake.name_female() if gender == "Female" else fake.name_male()
    age = random.randint(16, 72)
    occ = random.choice(["Software Engineer", "Homemaker", "Student", "Shopkeeper", "Teacher", "Retired Officer", "Bank Employee"])
    dist = random.choice(district_names)
    vuln = random.randint(20, 90)
    victims.append((full_name, age, gender, occ, dist, vuln))

df_victims = pd.DataFrame(victims, columns=[
    "full_name", "age", "gender", "occupation", "district_name", "vulnerability_score"
])
df_victims.to_csv(os.path.join(OUTPUT_DIR, "victims.csv"), index=False)
print("Generated victims.csv:", len(df_victims))

# ---------------------------------------------------------
# 7. FIR_ACCUSED (2800 rows)
# ---------------------------------------------------------
fir_accused = []
all_firs = df_firs["case_number"].tolist()
all_accused_names = df_accused["full_name"].tolist()
repeat_offender_names = all_accused_names[:15]

# Link repeat offenders to 4-8 FIRs each
used_fir_set = set()
for r_name in repeat_offender_names:
    num_links = random.randint(4, 8)
    linked_firs = random.sample(all_firs, num_links)
    for f_case in linked_firs:
        fir_accused.append((f_case, r_name, "Primary Suspect"))
        used_fir_set.add(f_case)

# Fill remaining links up to 2800
remaining_links = 2800 - len(fir_accused)
for _ in range(remaining_links):
    f_case = random.choice(all_firs)
    a_name = random.choice(all_accused_names[15:])
    role = random.choice(["Primary Suspect", "Accomplice", "Co-conspirator"])
    fir_accused.append((f_case, a_name, role))

df_fir_accused = pd.DataFrame(fir_accused, columns=[
    "fir_case_number", "accused_full_name", "role"
])
df_fir_accused.to_csv(os.path.join(OUTPUT_DIR, "fir_accused_v2.csv"), index=False)
print("Generated fir_accused_v2.csv:", len(df_fir_accused))

# ---------------------------------------------------------
# 8. FIR_VICTIMS (2500 rows)
# ---------------------------------------------------------
fir_victims = []
all_victim_names = df_victims["full_name"].tolist()

for i in range(2500):
    f_case = all_firs[i]
    v_name = all_victim_names[i]
    fir_victims.append((f_case, v_name))

df_fir_victims = pd.DataFrame(fir_victims, columns=[
    "fir_case_number", "victim_full_name"
])
df_fir_victims.to_csv(os.path.join(OUTPUT_DIR, "fir_victims.csv"), index=False)
print("Generated fir_victims.csv:", len(df_fir_victims))

# ---------------------------------------------------------
# 9. ANPR_WATCHLIST (800 rows)
# ---------------------------------------------------------
watchlist = []
# Use captured plates from FIRs description
sample_plates = used_plates[:800]
while len(sample_plates) < 800:
    extra_plate = generate_karnataka_plate()
    extra_case = random.choice(all_firs)
    extra_crime = random.choice(["vehicle_theft", "robbery", "chain_snatching"])
    sample_plates.append((extra_plate, extra_case, extra_crime))

for idx, (plate, case_num, c_type) in enumerate(sample_plates[:800]):
    active = True if random.random() < 0.80 else False
    priority = "high" if idx < 30 else "medium"
    watchlist.append((plate, case_num, c_type, active, priority))

df_watchlist = pd.DataFrame(watchlist, columns=[
    "plate_number", "fir_case_number", "crime_type", "alert_active", "alert_priority"
])
df_watchlist["alert_active"] = df_watchlist["alert_active"].map({True: "true", False: "false"})
df_watchlist.to_csv(os.path.join(OUTPUT_DIR, "anpr_watchlist_v3.csv"), index=False)
print("Generated anpr_watchlist_v3.csv:", len(df_watchlist))

print("\n🎉 All 9 CSV files generated successfully in crime-database/generated-csv/")
