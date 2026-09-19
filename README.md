# Cross-Channel Journey Stitching Platform

## 🌐 Landing Page

**Live Landing Page:** [Cross-Channel Journey Stitching Platform](https://drumkit-built-and-build-2026.vercel.app/)

---

## Overview

Customer interactions are spread across websites, mobile applications, call centers, support systems, and physical locations. Each channel may use different identifiers and data formats, making it difficult to understand the complete customer journey.

This platform brings those interactions together into a unified customer view.

It helps organizations understand:

* Where customers drop off
* Where escalations occur
* Which issues remain unresolved
* Which customers repeatedly contact support
* Which experiences are associated with churn
* How customers move between channels

The platform is designed to work across domains such as **banking, telecom, insurance, and e-commerce**.

---

## Core Idea

```text
Company Data
     ↓
Data Ingestion
     ↓
Event Normalization
     ↓
Identity Resolution
     ↓
Unified Customer Timeline
     ↓
Journey & Issue Stitching
     ↓
Analytics
     ↓
Dashboard & Insights
```

The platform does not require direct database access.

Companies can provide data through APIs, webhooks, SDK events, event streams, scheduled API pulls, or files such as CSV and JSON.

---

# 1. Data Ingestion

Companies may have different channels, and they do not need to have all of them.

Supported sources include:

* Website
* Mobile application
* Call center
* Support or CRM systems
* Physical branches or stores
* Existing event streams
* Batch files

For web and mobile applications, an SDK can capture meaningful customer events. However, an SDK is optional if the company already has an event or analytics system that can send the required events.

Examples:

```text
Application Started
Document Uploaded
Payment Failed
Order Created
Support Contacted
Issue Escalated
Issue Resolved
```

The platform focuses on meaningful journey events rather than storing every click or device action.

---

# 2. Event Normalization

Different companies use different field names and formats.

For example:

```text
cust_no
customer_id
member_id
buyer_id
```

may all represent a customer reference.

The platform allows companies to map their existing fields to common semantic fields.

A normalized event can contain:

```text
Customer Reference
Timestamp
Channel
Event Type
Business Entity
Issue or Case
Status
Additional Context
```

This allows events from different systems to be processed consistently.

---

# 3. Identity Resolution

Identity resolution determines which canonical customer an event belongs to.

The platform first uses reliable identifiers and business relationships.

For example:

```text
Website User ID → Customer C101
Mobile User ID  → Customer C101
Order ID        → Customer C101
Loyalty ID      → Customer C101
```

These relationships form an identity graph.

If an event contains a direct customer reference, it can be resolved immediately.

If it does not, the system can use a related business entity:

```text
Support Call
    ↓
Order O500
    ↓
Customer C101
```

Weak signals such as device ID are not treated as proof of identity. Ambiguous records remain unresolved instead of being silently merged.

Identity links can also retain their supporting evidence and confidence.

---

# 4. Unified Customer Timeline

After identity resolution, events belonging to the same customer are placed into a chronological timeline.

Example:

```text
09:10  Web       Application Started
09:18  Web       Document Uploaded
09:25  Web       Payment Failed
09:27  Mobile    Application Opened
09:31  Mobile    Payment Retried
09:35  Call      Support Contacted
09:42  Call      Escalated
10:05  Call      Issue Resolved
```

The timeline shows what happened, when it happened, and through which channel.

A channel switch can therefore be identified when meaningful events belonging to the same customer occur across different channels.

---

# 5. Journey Stitching

A **timeline** shows what happened and when.

A **journey** shows the customer's progress through a business process.

For example:

```text
Application Started
        ↓
Documents Uploaded
        ↓
Payment Failed
        ↓
Support Contact
        ↓
Escalation
        ↓
Resolution
```

The system can identify meaningful stages, drop-offs, channel switching, escalations, and resolution paths.

A customer may also have multiple journeys at the same time, such as a purchase journey and a support issue.

---

# 6. Complaint and Issue Stitching

Complaints are treated as issues rather than only as text records.

For example:

```text
Customer C101

Day 1:
"Payment failed while purchasing the phone."

Day 2:
"Payment is still failing."

Day 3:
"Payment failed again."
```

The system can identify these as repeated contacts about the same issue by considering:

* Customer identity
* Normalized issue or problem
* Time between interactions
* Issue status
* Related case or business entity

The recurrence window can be configured according to the company's business.

AI can help identify that different statements describe the same problem, but AI does not replace customer identity resolution.

---

# 7. Required Analytics

### Drop-off

Identifies the journey stage where customers stop progressing.

```text
Started → Details → Documents → Payment → Completed
                         ↑
                    Drop-off
```

### Escalation

Tracks interactions that move from one support level or channel to another.

```text
Chat → Agent → Supervisor
```

### Unresolved Issues

Tracks issues that remain open, are reopened, or remain unresolved after escalation.

### Repeat Contacts

Identifies customers contacting the organization multiple times about the same issue.

### Churn-Associated Experiences

Compares customer journeys with a company-defined churn outcome to identify experiences associated with churn.

Churn is defined according to the company's business rules.

---

# 8. Analyst Dashboard

The dashboard provides:

* Customer 360 view
* Unified customer timeline
* Journey stages
* Drop-off points
* Escalations
* Unresolved issues
* Repeat-contact alerts
* Channel switching
* Churn-associated patterns
* Identity resolution accuracy
* Data processing latency

Analysts can select a customer or issue and inspect the underlying events and evidence instead of seeing only an aggregated number.

---

# 9. AI Layer

AI is used where unstructured information requires interpretation.

Examples include:

* Classifying complaint statements into issue categories
* Extracting intent from conversations
* Summarizing call or chat transcripts
* Finding common themes in customer feedback
* Answering analyst questions using existing journey analytics

The core identity-resolution and analytics pipeline remains explainable and auditable.

AI does not replace deterministic customer identification.

---

# 10. Domain Configuration

The same platform can support:

* Banking
* Telecom
* Insurance
* E-commerce and retail

The core system remains the same.

Domain-specific configuration can define:

* Business entities
* Journey stages
* Issue categories
* Churn definition
* Relevant event mappings

Companies can use predefined domain templates or configure their own.

---

# 11. Data Quality and Trust

The platform maintains information about how data was connected and processed.

Important metrics include:

* Identity resolution accuracy
* Resolved vs unresolved events
* Ambiguous matches
* Processing latency
* Missing identifiers
* Invalid events

The system avoids silently making uncertain identity decisions.

---

# Current Progress

The project is currently under active development.

Completed or in progress:

* Landing page
* Company dashboard
* Core backend architecture
* Database design
* Event ingestion architecture
* Event normalization
* Identity resolution logic
* Customer identity graph
* Customer timeline
* Journey stitching
* Analytics backend
* Drop-off and issue analysis

---

# Future Features

### Advanced Identity Resolution

Probabilistic matching for cases where deterministic identifiers are unavailable, with confidence thresholds and human review for ambiguous cases.

### Real-Time Alerts

Alerts for repeated complaints, unresolved escalations, unusual drop-offs, and sudden increases in specific issues.

### Advanced Journey Analytics

Automatic discovery of common customer paths and comparison of successful and unsuccessful journeys.

### AI Analyst

A conversational analyst that can answer questions such as:

```text
Why did payment-related complaints increase?

Which journey stages have the highest drop-off?

Which issues are frequently escalated?

What experiences are commonly associated with churn?
```

### Social and External Channels

Future integration with social media and other external customer interaction channels.

### Predictive Analytics

Future models can identify patterns associated with possible future churn or escalation, subject to sufficient historical data and validation.

---

## Project Goal

The goal is not simply to collect customer events.

The goal is to connect fragmented interactions into a trustworthy customer journey so organizations can understand **what happened, where customers faced problems, how they moved across channels, and which experiences require attention.**
