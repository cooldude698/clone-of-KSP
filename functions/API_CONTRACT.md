# DRISHTI API Contract — AI Engine & UI/UX

This document defines the interface between the frontend (UI/UX - Person 5) and the AI Engine (Person 2 - Swapnil).

## 1. Chat Endpoint (`/api/chat` or `/server/chat`)

- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Format
```json
{
  "query": "How many vehicle thefts happened in Koramangala last month?",
  "language": "en",
  "conversation_id": "conv_abc123",
  "conversation_history": [
    { "role": "user", "content": "Previous question..." },
    { "role": "assistant", "content": "Previous answer..." }
  ]
}
```
*Note: `language` can be `"en"` for English or `"kn"` for Kannada.*

### Response Format
```json
{
  "response_text": "There were 47 vehicle thefts in Koramangala in May 2026...",
  "visualization": {
    "type": "bar_chart",
    "title": "Vehicle Thefts in Koramangala — May 2026",
    "data": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "values": [12, 8, 15, 12]
    }
  },
  "follow_up_suggestions": [
    "Which areas in Koramangala had the most thefts?",
    "Show me the accused profile for these cases",
    "How does this compare to last year?"
  ],
  "needs_data": null,
  "confidence": 0.94,
  "language_detected": "en",
  "conversation_id": "conv_abc123"
}
```

---

## 2. Visualization Types and Expected Data Shapes

### `heatmap`
*Use case*: geographical clustering of crimes or incident density.
```json
"visualization": {
  "type": "heatmap",
  "title": "Bengaluru Crime Hotspots",
  "data": {
    "points": [
      { "lat": 12.9716, "lng": 77.5946, "intensity": 8, "crime_type": "theft" }
    ]
  }
}
```

### `map_pins`
*Use case*: precise locations of incidents or cameras.
```json
"visualization": {
  "type": "map_pins",
  "title": "ANPR Cameras Near Silk Board",
  "data": {
    "locations": [
      { "lat": 12.9176, "lng": 77.6244, "label": "Camera 012", "type": "anpr", "color": "blue", "description": "Active ANPR Camera" }
    ]
  }
}
```

### `bar_chart`
*Use case*: comparing discrete categories, counts, or groupings.
```json
"visualization": {
  "type": "bar_chart",
  "title": "Crime Types Breakdown",
  "data": {
    "labels": ["Theft", "Burglary", "Assault"],
    "values": [120, 45, 18],
    "x_label": "Crime Type",
    "y_label": "Number of Incidents"
  }
}
```

### `line_chart`
*Use case*: trends and variations over time.
```json
"visualization": {
  "type": "line_chart",
  "title": "Monthly Theft Trends (2025)",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr"],
    "datasets": [
      { "label": "Thefts", "values": [34, 40, 28, 45], "color": "#ff0000" }
    ]
  }
}
```

### `network_graph`
*Use case*: relationships between suspects, victims, locations, and cases.
```json
"visualization": {
  "type": "network_graph",
  "title": "Accused Criminal Network - Case 234",
  "data": {
    "nodes": [
      { "id": "accused_01", "label": "Ramesh Kumar", "type": "accused", "size": 10, "color": "red", "risk_score": 8 }
    ],
    "edges": [
      { "source": "accused_01", "target": "accused_02", "label": "Co-conspirator", "color": "gray" }
    ]
  }
}
```

### `timeline`
*Use case*: progression of events for a single investigation.
```json
"visualization": {
  "type": "timeline",
  "title": "Timeline of Events - FIR KAR/BLR/2026/012",
  "data": {
    "events": [
      { "date": "2026-05-10", "title": "FIR Filed", "description": "Theft reported at Koramangala PS", "type": "fir", "icon": "file-text" }
    ]
  }
}
```

### `geo_trail`
*Use case*: trail tracking of a suspect vehicle across cameras.
```json
"visualization": {
  "type": "geo_trail",
  "title": "Suspect Vehicle KA-01-MJ-9999 Trail",
  "data": {
    "trail": [
      { "lat": 12.9176, "lng": 77.6244, "timestamp": "2026-05-10T14:30:00Z", "camera_name": "Silk Board Junction North", "camera_type": "anpr", "confidence": 0.98, "plate_detected": "KA-01-MJ-9999" }
    ],
    "last_known": { "lat": 12.9176, "lng": 77.6244, "district": "Bengaluru South" },
    "trail_status": "tracked"
  }
}
```

### `none`
*Use case*: normal conversational response with no visual components required.
```json
"visualization": {
  "type": "none",
  "title": "",
  "data": {}
}
```
