# 🗄️ Catalyst DataStore (Database) RAG Integration Guide

> **Overview**: This guide explains how the Catalyst DataStore ZCQL tables (`FIRs`, `RepeatOffenders`, `ANPR_Alerts`, `Cameras`, `Hotspots`) are connected to DRISHTI's QuickML RAG engine so DRISHTI always answers with live, accurate database records.

---

## 1. How Catalyst DataStore Works
Zoho Catalyst provides a relational DataStore accessible via **ZCQL** (Zoho Catalyst Query Language), which is similar to standard SQL.

### Primary Database Tables in DRISHTI:
| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `FIRs` | Active crime records & cases | `case_number`, `district_name`, `crime_type_code`, `date_filed`, `status`, `description` |
| `RepeatOffenders` | Habitual offenders & syndicate heads | `accused_full_name`, `fir_count`, `crime_types`, `district_name` |
| `ANPR_Alerts` | Real-time vehicle license plate sightings | `plate_number`, `camera_name`, `timestamp`, `sighting_type`, `confidence` |
| `Cameras` | Surveillance CCTV camera network | `camera_id`, `name`, `camera_type`, `has_anpr`, `lat`, `lng` |
| `Hotspots` | High-density crime clusters | `district_name`, `crime_type_code`, `incident_count`, `location_lat`, `location_lng` |

---

## 2. Querying ZCQL Tables inside Catalyst Functions

To execute ZCQL queries inside Catalyst AdvancedIO Node.js functions:

```js
const catalyst = require('zcatalyst-sdk-node');

async function getRepeatOffenders(req) {
  // Initialize Catalyst SDK with admin scope
  const app = catalyst.initialize(req, { scope: 'admin' });
  const zcql = app.zcql();

  // Execute ZCQL Query
  const sql = "SELECT accused_full_name, fir_count, crime_types FROM RepeatOffenders ORDER BY fir_count DESC LIMIT 10";
  const result = await zcql.executeZCQLQuery(sql);

  // Unpack ZCQL table response
  return result.map(row => row.RepeatOffenders || row);
}
```

---

## 3. How RAG Connects to Live Database Records

When an officer asks DRISHTI a question (e.g., *"Who are the repeat offenders in robbery cases?"* or *"What FIRs were registered today in South Bengaluru?"*):

```
┌────────────────────────────────────────┐
│  1. User Query ("Show repeat offenders")│
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│  2. Live ZCQL / Endpoint Query         │
│     SELECT * FROM RepeatOffenders      │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│  3. Inject DB JSON into RAG Context    │
│     (FIRs, offenders, ANPR alerts)     │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│  4. Catalyst QuickML GLM-4.7-Flash     │
│     Generates accurate intelligence    │
└────────────────────────────────────────┘
```

---

## 4. Testing & Verification

1. **Test Live FIR Query**:
   Ask DRISHTI: *"What are the recent FIR cases?"*
   - DRISHTI queries live FIR database records and lists case numbers, dates, and descriptions.

2. **Test Repeat Offenders Query**:
   Ask DRISHTI: *"Show top repeat offenders"*
   - DRISHTI pulls accused records (e.g. `Ramesh Kumar (7 FIRs)`, `Suresh Naidu (5 FIRs)`).

3. **Test ANPR Alert Query**:
   Ask DRISHTI: *"Check ANPR alerts for KA-01-EA-4921"*
   - DRISHTI queries ANPR camera sightings and returns camera locations and timestamps.
