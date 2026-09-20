# JourneyFlow demo integration

JourneyFlow sends customer interaction events to Breeze through one endpoint:

```http
POST /events
Content-Type: application/json
X-Breeze-Source-Id: <configured source id>
```

`sourceId` may instead be included in the JSON body. A source may use no authentication, an
`X-API-Key`, or a bearer credential. Credentials are configured server-side and are never returned
to the browser.

## Payload shape

JourneyFlow may use company-specific field names. The demo mapping uses this payload:

```json
{
  "scenarioId": "repeat-contact-001",
  "userId": "U-1001",
  "eventName": "support_complaint",
  "timestamp": "2026-01-01T10:00:00Z",
  "channel": "web",
  "message": "My payment failed",
  "orderId": "ORD-1001",
  "entityType": "order",
  "topic": "payment failure"
}
```

During source setup, Gemini may suggest how source fields map to Breeze semantic fields. An analyst
reviews and persists that mapping once. `/events` reads only the persisted mapping and performs
normalization deterministically; it never invokes Gemini during ingestion.

JourneyFlow's 15 scenario labels remain scenario metadata and do not alter Breeze's event schema.
Scenario metadata may be sent outside the event stream or retained in the raw payload. JourneyFlow's
`CONFLICT` presentation state maps to Breeze `AMBIGUOUS`, with the conflicting identifiers retained
as evidence. Breeze's canonical identity states remain `RESOLVED`, `AMBIGUOUS`, and `UNRESOLVED`.
