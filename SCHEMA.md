# DRISHTI ದೃಷ್ಟಿ — Response Schema

> Every response from `/server/chat/` must conform to this schema exactly.  
> Gemini is instructed via `system-prompt.js` to output only valid JSON matching this spec.

---

## Full Schema

```typescript
interface DrishtiResponse {
  // Core response
  response_text: string;           // What DRISHTI says (spoken + displayed)
  language_detected: "en" | "hi" | "kn";  // Detected query language

  // Emotional state — drives orb color + animation
  emotion: "neutral" | "alert" | "urgent" | "informative" | "reassuring";

  // Urgency level — drives voice prosody + visual treatment
  urgency: "low" | "medium" | "high" | "critical";

  // Visualization — drives frontend widget rendering
  visualization: Visualization | null;

  // Proactive follow-up suggestions
  follow_up_suggestions: string[];  // 2-4 suggested next queries

  // Conversation
  needs_followup: boolean;          // Whether DRISHTI needs more info
  clarification_question?: string;  // If needs_followup is true
}
```

---

## Visualization Types

```typescript
type Visualization =
  | HotspotMapViz
  | BarChartViz
  | LineChartViz
  | NetworkGraphViz
  | StatCardViz
  | FirListViz
  | null;
```

### hotspot_map
```json
{
  "type": "hotspot_map",
  "title": "Crime Hotspots — Whitefield",
  "data": {
    "center": [12.9698, 77.7500],
    "zoom": 13,
    "hotspots": [
      {
        "lat": 12.9698,
        "lng": 77.7500,
        "intensity": 0.9,
        "label": "Whitefield Main Road",
        "crime_count": 47,
        "top_crime": "Theft"
      }
    ]
  }
}
```

### bar_chart
```json
{
  "type": "bar_chart",
  "title": "Crime by Type — Last 30 Days",
  "data": {
    "labels": ["Theft", "Assault", "Fraud", "Burglary"],
    "values": [142, 87, 63, 41],
    "color": "#3b82f6",
    "unit": "incidents"
  }
}
```

### line_chart
```json
{
  "type": "line_chart",
  "title": "Crime Trend — Bengaluru Urban (6 months)",
  "data": {
    "labels": ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    "datasets": [
      {
        "label": "Total Crimes",
        "values": [312, 298, 334, 356, 389, 421],
        "color": "#f59e0b"
      }
    ],
    "unit": "incidents"
  }
}
```

### network_graph
```json
{
  "type": "network_graph",
  "title": "Suspect Network — Case #KSP-2024-0892",
  "data": {
    "nodes": [
      { "id": "S001", "label": "Primary Suspect", "type": "suspect", "risk": "high" },
      { "id": "S002", "label": "Associate", "type": "associate", "risk": "medium" }
    ],
    "edges": [
      { "source": "S001", "target": "S002", "label": "known associate", "weight": 0.8 }
    ]
  }
}
```

### stat_card
```json
{
  "type": "stat_card",
  "title": "Quick Stats — Bengaluru Urban",
  "data": {
    "cards": [
      { "label": "Total FIRs (30d)", "value": "1,247", "change": "+8.3%", "trend": "up", "color": "#ef4444" },
      { "label": "Solved Cases", "value": "892", "change": "+2.1%", "trend": "up", "color": "#10b981" },
      { "label": "Active Warrants", "value": "143", "change": "-5.0%", "trend": "down", "color": "#f59e0b" },
      { "label": "Patrol Units", "value": "38", "change": "0%", "trend": "neutral", "color": "#3b82f6" }
    ]
  }
}
```

### fir_list
```json
{
  "type": "fir_list",
  "title": "Recent FIRs — Whitefield PS",
  "data": {
    "firs": [
      {
        "fir_number": "KSP-2024-1892",
        "date": "2024-07-15",
        "crime_type": "Theft",
        "location": "Whitefield Main Road",
        "status": "Under Investigation",
        "severity": "medium"
      }
    ],
    "total": 47,
    "showing": 10
  }
}
```

---

## Example Full Response

```json
{
  "response_text": "Whitefield is showing elevated theft activity over the past 7 days, with 47 incidents concentrated near the main road junction. I recommend increasing patrol frequency between 8 PM and midnight.",
  "language_detected": "en",
  "emotion": "alert",
  "urgency": "high",
  "visualization": {
    "type": "hotspot_map",
    "title": "Crime Hotspots — Whitefield",
    "data": {
      "center": [12.9698, 77.7500],
      "zoom": 13,
      "hotspots": [
        {
          "lat": 12.9698,
          "lng": 77.7500,
          "intensity": 0.9,
          "label": "Whitefield Main Road",
          "crime_count": 47,
          "top_crime": "Theft"
        }
      ]
    }
  },
  "follow_up_suggestions": [
    "Show me the trend for Whitefield over last month",
    "Which officers are patrolling Whitefield tonight?",
    "Show repeat offenders in Whitefield area",
    "Compare Whitefield with Marathahalli crime rates"
  ],
  "needs_followup": false
}
```

---

## Emotion → Orb State Mapping

| `emotion` | Orb State | Color |
|-----------|-----------|-------|
| `neutral` | `idle` | Blue |
| `informative` | `speaking` | Cyan |
| `alert` | `speaking` | Amber pulse |
| `urgent` | `speaking` | Orange fast pulse |
| `reassuring` | `speaking` | Green soft |

## Urgency → Visual Treatment

| `urgency` | Border | Animation | TTS Prosody |
|-----------|--------|-----------|-------------|
| `low` | Green subtle | None | Normal pace |
| `medium` | Amber | Slow pulse | Slightly faster |
| `high` | Orange | Fast pulse | Elevated pace |
| `critical` | Red | Shake + fast pulse | Urgent, fast |
