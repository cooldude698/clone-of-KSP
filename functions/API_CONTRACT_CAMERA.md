# DRISHTI — Camera Intelligence & Network Commander API Contract
**Version:** 1.0.0  
**Phase:** Week 3 Deliverable (Camera Intelligence & Network Graph Endpoints)  
**Target File:** `functions/API_CONTRACT_CAMERA.md`

This document defines the exact API contract for the Camera Intelligence, Suspect Geo-Trail, ANPR Watchlist check, and Chrono-Criminal Network Graph features of the **DRISHTI (ದೃಷ್ಟಿ)** platform. All endpoints are hosted under the shared Catalyst backend functions container.

---

## General Specifications
* **Base URL:** `/server` (e.g., `http://localhost:3000/server`)
* **Content-Type:** `application/json` (for all `POST` requests and responses)
* **CORS:** Enabled (`Access-Control-Allow-Origin: *`)
* **Authentication:** Handled by standard platform sessions/headers (if applicable)

---

## Endpoints Overview

| Endpoint | Method | Description | Params / Body |
| :--- | :--- | :--- | :--- |
| [`/cameras-nearby/`](#1-get-servercameras-nearby) | `GET` | Find nearby active cameras using bounding-box & Haversine formula. | Query: `lat`, `lng`, `radius_meters`, `timestamp` |
| [`/trail/`](#2-post-servertrail) | `POST` | Reconstruct a multi-hop suspect vehicle geo-trail from a crime scene. | Body: `crime_lat`, `crime_lng`, `crime_timestamp`, `vehicle_type` |
| [`/anpr-check/`](#3-post-serveranpr-check) | `POST` | Check a plate against the ANPR watchlist and create alerts on matches. | Body: `plate_number`, `camera_id`, `camera_name`, `lat`, `lng`, `timestamp` |
| [`/network-graph-data/`](#4-get-servernetwork-graph-data) | `GET` | Fetch relationship nodes/edges for the Chrono-Criminal Network Graph. | Query: `min_connections`, `months_back` |

---

## 1. GET `/server/cameras-nearby/`

Retrieves all active cameras within a specified search radius of a set of coordinates (latitude and longitude). Results are prioritized by relevance score (closer cameras and cameras with advanced capabilities like ANPR or Facial Recognition are scored higher).

### Request Parameters (Query)
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `lat` | Float | **Yes** | — | Latitude of search center (must be within Bengaluru bounds: `12.85` to `13.05`). |
| `lng` | Float | **Yes** | — | Longitude of search center (must be within Bengaluru bounds: `77.50` to `77.70`). |
| `radius_meters` | Integer | No | `500` | Search radius in meters. |
| `timestamp` | String | No | — | ISO 8601 timestamp. If provided, calculates a `±30` minute footage window. |

### Response Schema (`200 OK`)
```json
{
  "cameras": [
    {
      "camera_id": "String | Integer",
      "external_id": "String (e.g., 'BATCS-0012', 'SC-0045')",
      "name": "String (Name of camera location)",
      "camera_type": "String ('BATCS' | 'Safe_City' | 'MCCTNS_Private' | 'MCCTNS_RWA' | 'MCCTNS_Commercial')",
      "lat": "Float",
      "lng": "Float",
      "distance_meters": "Float (Haversine distance from center)",
      "has_anpr": "Boolean",
      "has_face_recog": "Boolean",
      "junction_name": "String | null",
      "relevance_score": "Integer (0-100, calculated ranking)",
      "footage_window": {
        "start": "String (ISO 8601 Timestamp, present if request timestamp provided)",
        "end": "String (ISO 8601 Timestamp, present if request timestamp provided)"
      }
    }
  ],
  "total_found": "Integer",
  "anpr_capable_count": "Integer",
  "search_radius_meters": "Integer"
}
```

### Example Request
```http
GET /server/cameras-nearby/?lat=12.9172&lng=77.6211&radius_meters=500&timestamp=2026-06-01T14:00:00Z HTTP/1.1
Host: localhost:3000
```

### Example Response
```json
{
  "cameras": [
    {
      "camera_id": "203948302",
      "external_id": "SC-0045",
      "name": "Silk Board Junction - South Camera",
      "camera_type": "Safe_City",
      "lat": 12.9175,
      "lng": 77.6215,
      "distance_meters": 55.4,
      "has_anpr": true,
      "has_face_recog": true,
      "junction_name": "Silk Board",
      "relevance_score": 100,
      "footage_window": {
        "start": "2026-06-01T13:30:00Z",
        "end": "2026-06-01T14:30:00Z"
      }
    },
    {
      "camera_id": "203948309",
      "external_id": "BATCS-0102",
      "name": "Silk Board Signal - East Approach",
      "camera_type": "BATCS",
      "lat": 12.9170,
      "lng": 77.6208,
      "distance_meters": 43.1,
      "has_anpr": true,
      "has_face_recog": false,
      "junction_name": "Silk Board",
      "relevance_score": 95,
      "footage_window": {
        "start": "2026-06-01T13:30:00Z",
        "end": "2026-06-01T14:30:00Z"
      }
    }
  ],
  "total_found": 2,
  "anpr_capable_count": 2,
  "search_radius_meters": 500
}
```

---

## 2. POST `/server/trail/`

Traces the most probable path (up to 6 hops) taken by a suspect vehicle after a crime occurred, based on local spatial proximity and directional simulation.

### Request Body (JSON)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `crime_lat` | Float | **Yes** | Latitude of the crime scene. |
| `crime_lng` | Float | **Yes** | Longitude of the crime scene. |
| `crime_timestamp` | String | **Yes** | ISO 8601 formatted timestamp of the crime. |
| `vehicle_type` | String | **Yes** | Type of vehicle (e.g., `'sedan'`, `'two_wheeler'`, `'suv'`). |

### Response Schema (`200 OK`)
```json
{
  "trail": [
    {
      "hop": "Integer (1-indexed sequence)",
      "camera_id": "String | Integer",
      "camera_name": "String",
      "lat": "Float",
      "lng": "Float",
      "timestamp": "String (ISO 8601 Timestamp of estimated sighting)",
      "plate_detected": "String (e.g. 'KA-03-ME-2983' or null)",
      "confidence": "Integer (0-100 percentage)",
      "sighting_type": "String ('ANPR' | 'Visual')",
      "distance_from_crime_km": "Float"
    }
  ],
  "total_hops": "Integer (0 to 6)",
  "trail_status": "String ('active' | 'lost')",
  "last_known_location": {
    "lat": "Float",
    "lng": "Float",
    "district_name": "String",
    "camera_name": "String"
  },
  "total_distance_km": "Float",
  "duration_minutes": "Integer"
}
```

### Example Request
```http
POST /server/trail/ HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "crime_lat": 12.9172,
  "crime_lng": 77.6211,
  "crime_timestamp": "2026-06-01T14:00:00Z",
  "vehicle_type": "two_wheeler"
}
```

### Example Response
```json
{
  "trail": [
    {
      "hop": 1,
      "camera_id": "203948309",
      "camera_name": "Silk Board Signal - East Approach",
      "lat": 12.9170,
      "lng": 77.6208,
      "timestamp": "2026-06-01T14:02:15Z",
      "plate_detected": "KA-01-HE-4920",
      "confidence": 92,
      "sighting_type": "ANPR",
      "distance_from_crime_km": 0.04
    },
    {
      "hop": 2,
      "camera_id": "203948512",
      "camera_name": "HSR Layout 5th Main Camera",
      "lat": 12.9135,
      "lng": 77.6284,
      "timestamp": "2026-06-01T14:08:45Z",
      "plate_detected": "KA-01-HE-4920",
      "confidence": 88,
      "sighting_type": "ANPR",
      "distance_from_crime_km": 0.92
    },
    {
      "hop": 3,
      "camera_id": "203948920",
      "camera_name": "Private Camera - Outer Ring Rd Residencies",
      "lat": 12.9102,
      "lng": 77.6345,
      "timestamp": "2026-06-01T14:14:10Z",
      "plate_detected": "KA-01-HE-4920",
      "confidence": 65,
      "sighting_type": "Visual",
      "distance_from_crime_km": 1.68
    }
  ],
  "total_hops": 3,
  "trail_status": "lost",
  "last_known_location": {
    "lat": 12.9102,
    "lng": 77.6345,
    "district_name": "East Bengaluru",
    "camera_name": "Private Camera - Outer Ring Rd Residencies"
  },
  "total_distance_km": 1.68,
  "duration_minutes": 14
}
```

---

## 3. POST `/server/anpr-check/`

Compares a detected license plate number against the central `ANPR_Watchlist` table. If there is a match, it retrieves the associated `FIR` details, registers a critical system alert in the database, and returns immediate intervention instructions.

### Request Body (JSON)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `plate_number` | String | **Yes** | License plate to match. Format validation: `KA-\d{2}-[A-Z]{1,2}-\d{4}` (e.g. `KA-01-AB-1234`). |
| `camera_id` | String \| Integer | **Yes** | The database ID of the camera that detected the plate. |
| `camera_name` | String | **Yes** | Human-readable name of the detecting camera. |
| `lat` | Float | **Yes** | Latitude of detection. |
| `lng` | Float | **Yes** | Longitude of detection. |
| `timestamp` | String | **Yes** | ISO 8601 formatted timestamp of the detection. |

### Response Schema (`200 OK`)

#### Case A: Watchlist Match Found (`alert: true`)
```json
{
  "alert": true,
  "severity": "String ('critical' | 'high')",
  "fir_case_number": "String (Associated FIR Case Number)",
  "original_crime": "String (Crime code e.g. 'vehicle_theft' or 'robbery')",
  "crime_date": "String (Date of original crime file)",
  "district": "String (Original Crime District)",
  "instructions": "String (Actionable instructions for field units)"
}
```

#### Case B: No Watchlist Match (`alert: false`)
```json
{
  "alert": false,
  "plate_number": "String"
}
```

#### Case C: Invalid Plate Format / Validation Error
```json
{
  "alert": false,
  "plate_number": "String",
  "reason": "String (e.g. 'Invalid format')"
}
```

### Example Request
```http
POST /server/anpr-check/ HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "plate_number": "KA-51-MD-9023",
  "camera_id": 48201,
  "camera_name": "Electronic City Toll Gate Camera 2",
  "lat": 12.8399,
  "lng": 77.6769,
  "timestamp": "2026-07-07T11:20:00Z"
}
```

### Example Response (Match)
```json
{
  "alert": true,
  "severity": "critical",
  "fir_case_number": "FIR-2026-EC-0982",
  "original_crime": "vehicle_theft",
  "crime_date": "2026-06-15T09:30:00Z",
  "district": "South Bengaluru",
  "instructions": "Vehicle possibly stolen, do not approach alone, contact South Bengaluru PS"
}
```

### Example Response (No Match)
```json
{
  "alert": false,
  "plate_number": "KA-51-MD-9023"
}
```

---

## 4. GET `/server/network-graph-data/`

Returns nodes and edges mapping relationships between accused individuals linked via shared FIR case files. This structure is specifically optimized to feed directly into the frontend D3-based `ChronoCriminalGraph.tsx` timeline visualization.

### Request Parameters (Query)
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `min_connections` | Integer | No | `2` | Minimum number of shared/accused FIR files to include a node. |
| `months_back` | Integer | No | `36` | Time horizon filter for crime records. |

### Response Schema (`200 OK`)
```json
{
  "nodes": [
    {
      "id": "String (Unique node ID, format: 'accused_[FullName]')",
      "label": "String (Accused Person's Full Name)",
      "type": "String ('accused')",
      "total_firs": "Integer (Count of FIRs accused is involved in)",
      "risk_score": "Integer (0-100 calculated threat level)",
      "size": "Integer (Computed node pixel radius for visual graph)",
      "color": "String (Hex code e.g. '#ef4444' representing risk category)",
      "crime_types": ["String (List of crime codes)"],
      "first_crime_date": "String (Date format YYYY-MM-DD)",
      "last_crime_date": "String (Date format YYYY-MM-DD)"
    }
  ],
  "edges": [
    {
      "id": "String (Unique edge ID)",
      "source": "String (Source node ID)",
      "target": "String (Target node ID)",
      "fir_case_number": "String (Case Number connecting them)",
      "date": "String (Date of connecting case, YYYY-MM-DD)",
      "crime_type": "String (Crime type category connecting them)",
      "weight": "Integer (Number of cases shared between nodes)"
    }
  ],
  "date_range": {
    "min": "String (Earliest date in dataset, YYYY-MM-DD)",
    "max": "String (Latest date in dataset, YYYY-MM-DD)"
  }
}
```

### Example Request
```http
GET /server/network-graph-data/?min_connections=2&months_back=12 HTTP/1.1
Host: localhost:3000
```

### Example Response
```json
{
  "nodes": [
    {
      "id": "accused_Ramesh_Kumar",
      "label": "Ramesh Kumar",
      "type": "accused",
      "total_firs": 4,
      "risk_score": 85,
      "size": 20,
      "color": "#ef4444",
      "crime_types": ["vehicle_theft", "robbery"],
      "first_crime_date": "2025-08-10",
      "last_crime_date": "2026-05-14"
    },
    {
      "id": "accused_Suresh_Naidu",
      "label": "Suresh Naidu",
      "type": "accused",
      "total_firs": 3,
      "risk_score": 52,
      "size": 17,
      "color": "#f97316",
      "crime_types": ["robbery"],
      "first_crime_date": "2025-09-02",
      "last_crime_date": "2026-03-20"
    }
  ],
  "edges": [
    {
      "id": "edge_ramesh_suresh_01",
      "source": "accused_Ramesh_Kumar",
      "target": "accused_Suresh_Naidu",
      "fir_case_number": "FIR-2025-BL-4592",
      "date": "2025-09-02",
      "crime_type": "robbery",
      "weight": 1
    }
  ],
  "date_range": {
    "min": "2025-08-10",
    "max": "2026-05-14"
  }
}
```
