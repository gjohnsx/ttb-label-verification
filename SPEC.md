# TTB Label Verification App — Technical Specification

## Implementation Progress

### Infrastructure
- [x] Next.js 16.1 app initialized with App Router
- [x] shadcn/ui components with TDDS/USWDS styling
- [x] Azure Static Web Apps deployment configured
- [x] Azure SQL Database provisioned (free tier, US East 2)
- [x] Prisma 7 ORM with SQL Server adapter
- [x] Database schema created and pushed
- [ ] Azure Blob Storage for label images (using local `/public/labels/` fallback)
- [x] Mistral OCR API integration (code complete, needs API key)

### Features
- [x] F1: Application Queue
- [x] F2: Label Comparison View
- [x] F3: Agent Actions
- [ ] F4: Batch Processing (UI exists, needs DB schema)
- [x] F5: Authentication (Mock)
- [x] F6: Demo Reset

### Data
- [x] Seed dataset (~30 applications)
- [x] Test label images (50+ in `/public/labels/`)

---

## Phased TODOs (Remaining Work)

### Dependencies / Blocking
- Phase 1 unblocks realistic queue + review flows; recommended prerequisite for Phases 3–5.
- Phase 2 can start with mock data, but real usage depends on Phase 1 data and Phase 6 OCR outputs.
- Phase 3 (actions + audit) depends on Phase 2 for UI placement and Phase 1 for application records.
- Phase 5 (demo reset) depends on Phase 1 data and Phase 3 review/audit tables to be meaningful.
- Phase 6 can be built in parallel, but UI integration depends on Phase 2.

### Phase 1: Core Queue + Seed Data (F1)
- [ ] Create `prisma/seed.ts` with ~30 applications (mix statuses, batches, beverage types).
- [ ] Implement queue UI in `app/(app)/queue/page.tsx` with table, status chips, and default sort (Needs attention → oldest).
- [ ] Add filters (status, batch, beverage type) and a simple search input; read filters from async `searchParams`.
- [ ] Add “Review next” action that links to the top-priority item (`/review/[id]`).
Guidance: Use server components + Prisma queries; keep auth checks in pages via `getAgent()`; keep DTOs minimal.

### Phase 2: Label Comparison View (F2)
- [ ] Build comparison layout in `app/(app)/review/[id]/page.tsx` (side-by-side table with status badges).
- [ ] Add summary header (overall verdict suggestion, field match count, critical mismatches).
- [ ] Stub label images from `public/` and wire a simple image viewer panel.
Guidance: Start with mocked comparison data in code or DB; keep statuses and confidence chips visible but secondary.

### Phase 3: Agent Actions + Audit Trail (F3)
- [ ] Add verdict buttons (Approve/Reject/Request Image) with reason modal.
- [ ] Create review/audit tables if missing; store agentId, timestamp, verdict, reason, and notes.
- [ ] Wire Server Actions to write reviews and update application status.
Guidance: Treat Server Actions like public endpoints; always call `verifySession()` before mutations.

### Phase 4: Batch Processing (F4)
- [ ] Add multi-select in queue and create batch records.
- [ ] Add batch progress UI (per-item status + overall progress bar).
- [ ] Simulate background processing updates (in-memory or scheduled job).
Guidance: Keep batching lightweight for the demo; fake processing times are fine.

### Phase 5: Demo Reset (F6)
- [ ] Add “Reset Demo Data” control (settings or admin-only action).
- [ ] Implement reset Server Action/Route Handler gated by a secret.
- [ ] Clear reviews/audit logs and reset application statuses to READY.
Guidance: Use `DEMO_RESET_SECRET` from env; log the reset action for visibility.

### Phase 6: Storage + OCR Integration
- [ ] Connect Azure Blob Storage for label images (upload + retrieval).
- [ ] Implement Mistral OCR wrapper and persist extracted fields.
- [ ] Update comparison view to use real OCR outputs and confidence scores.
Guidance: Keep the pipeline modular; separate storage, OCR, and comparison logic.

---

## Implementation Notes

> Changes from the original spec, documented as they occur.

### 2026-01-25: Prisma + SQL Server Constraints

**Enums → Strings:** SQL Server doesn't support Prisma's native enum types. Status fields (`ApplicationStatus`, `ReviewVerdict`, `ComparisonStatus`) are stored as `NVARCHAR(20)` strings. Validation happens at the application layer, not database layer. The valid values are documented in comments in `schema.prisma`.

**Environment Variables:** Using individual `DB_*` variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) instead of a single `DATABASE_URL` connection string. This is cleaner for the Prisma SQL Server adapter which takes a config object. A `DATABASE_URL` in SQL Server format is also required for Prisma CLI commands.

### 2026-01-26: Mock Authentication Complete

Added persona-based login, stateless JWT session cookies, and a DAL (`verifySession`, `getAgent`). Public and app headers are in place with command palette navigation, and protected routes now render the app header after session checks. Logout clears the session cookie via a server action.

---

## Executive Summary

An AI-powered tool that helps TTB compliance agents verify alcohol label applications faster by automating the field-by-field comparison between label images and application data. The goal is to free agents from routine matching so they can focus on judgment calls.

**Primary success metric:** Labels reviewed per hour (agent efficiency)
**Secondary metrics:** Median time to first result (<5s), mismatch catch rate

---

## Problem Statement

TTB reviews ~150,000 label applications/year with 47 agents. The current process requires manually comparing label images against application data field-by-field (5-10 min each). A previous automation pilot failed because 30-40 second response times were slower than eyeballing.

**Core insight:** Most of the work is mechanical matching. AI can handle routine comparisons, surfacing only edge cases for human review.

---

## Stakeholder Requirements

### Sarah Chen (Deputy Director)
- Needs agents freed from routine matching
- <5 second response time is non-negotiable
- Simple enough for agents with varying tech comfort ("my mother could figure it out")

### Dave Morrison (Senior Agent, 28 years)
- Skeptic and adoption gatekeeper — if Dave uses it, the team follows
- **Never auto-reject** — always show confidence scores, let humans decide
- Needs to handle nuance (e.g., "STONE'S THROW" vs "Stone's Throw")

### Jenny Park (Junior Agent)
- Uses paper checklist — mirror that mental model
- Government warning must be exact (caps, wording, bold)
- Wants field-by-field precision

### Janet (Seattle Office)
- Batch upload for 200-300 labels at once
- Process in background, review as they complete

### Marcus Williams (IT Admin)
- Azure infrastructure (migrated 2019)
- No COLA system integration for prototype
- External APIs may be blocked by firewall — keep dependencies minimal

---

## Functional Requirements

### F1: Application Queue

**F1.1** Display pending applications with status indicators:
- `PENDING` — Not yet processed
- `PROCESSING` — OCR in progress
- `READY` — Comparison complete, awaiting review
- `NEEDS_ATTENTION` — Mismatches or low confidence detected
- `REVIEWED` — Agent has submitted verdict
- `ERROR` — OCR failed

**F1.2** Sortable/filterable queue:
- Default sort: "Needs attention" first (mismatches, low confidence)
- Secondary sort: Oldest first within same status
- Filters: Status, batch, beverage type

**F1.3** "Review next" one-click action using default sort

### F2: Label Comparison View

**F2.1** Side-by-side table layout:
| Field | Application Value | Label Value | Status |
|-------|------------------|-------------|--------|
| Brand Name | STONE'S THROW | Stone's Throw | ✓ Match |
| ABV | 45% Alc./Vol. | 45% | ✓ Match |
| Government Warning | [full text] | [full text] | ✗ Mismatch |

**F2.2** Status indicators per field:
- ✓ **Match** — Values equivalent after normalization
- ~ **Likely Match** — Minor variation, needs confirmation
- ✗ **Mismatch** — Values differ
- ? **Missing** — Field not found in OCR output

**F2.3** Summary header:
- Overall verdict suggestion: "Needs review" / "Likely OK"
- Field match count: "4 of 5 fields match"
- List of critical mismatches

**F2.4** Confidence chip (secondary, not primary signal):
- High / Medium / Low
- Shown per field, not prominently

**F2.5** Multi-image support:
- Display all label images (front, back, etc.)
- Merged extraction with source tracking ("From: Back Label")
- Flag conflicts when images disagree on same field

**F2.6** Government Warning expandable row (avoid huge text blocks)

### F3: Agent Actions

**F3.1** Verdict submission:
- **Approve** — Label matches application
- **Reject** — Label has issues (select reason code)
- **Request Better Image** — Image quality insufficient

**F3.2** Override with audit trail:
- Modal with required reason code + optional note
- Reason codes: OCR error, Allowed variation, Judgment call, Incorrect rule, Other
- Auto-capture: timestamp, agent ID, original AI verdict, model version

**F3.3** Manual field correction:
- Agent can edit extracted values when OCR is wrong
- Corrections trigger re-comparison

### F4: Batch Processing

**F4.1** Multi-select from queue to create batch

**F4.2** Progress UI:
- Per-item status: Queued → Processing → Ready → Needs attention → Error
- Overall progress bar + ETA
- Pause/Cancel controls

**F4.3** Live results:
- Items become reviewable as they complete
- Agent can open completed items while batch continues
- Toast/banner when all complete

### F5: Authentication (Mock)

**F5.1** Mock login screen with preset users:
- Dave Morrison (Senior Agent)
- Jenny Park (Junior Agent)
- Janet Torres (Seattle Office)

**F5.2** No real authentication — persona selection only

**F5.3** Agent name shown in UI, captured in audit trail

### F6: Demo Reset

**F6.1** "Reset Demo Data" admin action:
- Clears reviews, verdicts, audit logs
- Preserves label data and OCR outputs
- All labels return to READY status

**F6.2** Protected endpoint (simple auth or dev-only)

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 16.1 (App Router) | Server components, streaming, modern React |
| UI Components | shadcn/ui + Radix | Accessible, composable, USWDS-inspired styling |
| Styling | Tailwind CSS + TDDS tokens | USWDS visual language without build complexity |
| Database | Azure SQL | Azure-native, supports Static Web Apps, audit-friendly |
| Image Storage | Azure Blob Storage | Scalable, Azure-aligned, keeps DB lean |
| AI Vision | Mistral OCR API | Open-weight model, self-hostable for production |
| Deployment | Azure Static Web Apps | Already configured, free tier, GitHub Actions |

### API Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  API Routes      │────▶│  Azure SQL      │
│   (Frontend)    │     │  /api/ocr        │     │  (Applications, │
└─────────────────┘     │  /api/labels     │     │   OCR Results,  │
                        │  /api/reviews    │     │   Reviews)      │
                        │  /api/admin      │     └─────────────────┘
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐     ┌─────────────────┐
                        │  Mistral OCR     │     │  Azure Blob     │
                        │  (External API)  │     │  (Label Images) │
                        └──────────────────┘     └─────────────────┘
```

### Data Model

**Source of truth:** `@next-app/prisma/schema.prisma`  
**Baseline migration:** `@next-app/prisma/migrations/0_init/migration.sql`  
**Prisma config:** `@next-app/prisma.config.ts`  
**Note:** JSON payloads are stored as `NVARCHAR(MAX)` with `ISJSON` checks; the app serializes/deserializes JSON strings.

```sql
-- Azure SQL (T-SQL) schema

-- Applications (seeded, immutable for demo)
CREATE TABLE dbo.applications (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  cola_id NVARCHAR(20) NULL,           -- Mock COLA reference
  brand_name NVARCHAR(255) NOT NULL,
  class_type NVARCHAR(255) NULL,
  alcohol_content NVARCHAR(50) NULL,
  net_contents NVARCHAR(50) NULL,
  government_warning NVARCHAR(MAX) NULL,
  bottler_name NVARCHAR(255) NULL,
  bottler_address NVARCHAR(MAX) NULL,
  country_of_origin NVARCHAR(100) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  status NVARCHAR(20) NOT NULL,        -- PENDING, PROCESSING, READY, etc.
  CONSTRAINT PK_applications PRIMARY KEY (id),
  CONSTRAINT CK_applications_status CHECK (
    status IN ('PENDING', 'PROCESSING', 'READY', 'NEEDS_ATTENTION', 'REVIEWED', 'ERROR')
  )
);

-- Label images (multiple per application)
CREATE TABLE dbo.label_images (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  application_id UNIQUEIDENTIFIER NOT NULL,
  blob_url NVARCHAR(500) NOT NULL,
  image_type NVARCHAR(20) NOT NULL,    -- FRONT, BACK, NECK, etc.
  uploaded_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_label_images PRIMARY KEY (id),
  CONSTRAINT FK_label_images_applications
    FOREIGN KEY (application_id) REFERENCES dbo.applications(id)
);

-- OCR results (one per image, persisted)
CREATE TABLE dbo.ocr_results (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  image_id UNIQUEIDENTIFIER NOT NULL,
  raw_markdown NVARCHAR(MAX) NULL,
  extracted_fields NVARCHAR(MAX) NULL,     -- JSON string
  confidence_scores NVARCHAR(MAX) NULL,    -- JSON string
  model_version NVARCHAR(50) NULL,
  processed_at DATETIME2 NULL,
  processing_time_ms INT NULL,
  CONSTRAINT PK_ocr_results PRIMARY KEY (id),
  CONSTRAINT FK_ocr_results_label_images
    FOREIGN KEY (image_id) REFERENCES dbo.label_images(id),
  CONSTRAINT CK_ocr_results_extracted_fields CHECK (
    extracted_fields IS NULL OR ISJSON(extracted_fields) = 1
  ),
  CONSTRAINT CK_ocr_results_confidence_scores CHECK (
    confidence_scores IS NULL OR ISJSON(confidence_scores) = 1
  )
);

-- Comparison results (computed, cached)
CREATE TABLE dbo.comparisons (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  application_id UNIQUEIDENTIFIER NOT NULL,
  merged_fields NVARCHAR(MAX) NULL,        -- JSON string
  field_sources NVARCHAR(MAX) NULL,        -- JSON string
  match_results NVARCHAR(MAX) NULL,        -- JSON string
  overall_status NVARCHAR(20) NULL,        -- MATCH, NEEDS_REVIEW, MISMATCH
  mismatch_count INT NULL,
  computed_at DATETIME2 NULL,
  CONSTRAINT PK_comparisons PRIMARY KEY (id),
  CONSTRAINT FK_comparisons_applications
    FOREIGN KEY (application_id) REFERENCES dbo.applications(id),
  CONSTRAINT CK_comparisons_merged_fields CHECK (
    merged_fields IS NULL OR ISJSON(merged_fields) = 1
  ),
  CONSTRAINT CK_comparisons_field_sources CHECK (
    field_sources IS NULL OR ISJSON(field_sources) = 1
  ),
  CONSTRAINT CK_comparisons_match_results CHECK (
    match_results IS NULL OR ISJSON(match_results) = 1
  )
);

-- Reviews (agent decisions)
CREATE TABLE dbo.reviews (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  application_id UNIQUEIDENTIFIER NOT NULL,
  agent_name NVARCHAR(100) NOT NULL,
  verdict NVARCHAR(20) NOT NULL,           -- APPROVED, REJECTED, OVERRIDE
  reason_code NVARCHAR(50) NULL,
  notes NVARCHAR(MAX) NULL,
  original_ai_verdict NVARCHAR(20) NULL,
  reviewed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_reviews PRIMARY KEY (id),
  CONSTRAINT FK_reviews_applications
    FOREIGN KEY (application_id) REFERENCES dbo.applications(id),
  CONSTRAINT CK_reviews_verdict CHECK (
    verdict IN ('APPROVED', 'REJECTED', 'OVERRIDE')
  )
);

-- Audit events
CREATE TABLE dbo.audit_events (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  application_id UNIQUEIDENTIFIER NOT NULL,
  agent_name NVARCHAR(100) NOT NULL,
  event_type NVARCHAR(50) NOT NULL,        -- REVIEW, OVERRIDE, CORRECTION, etc.
  event_data NVARCHAR(MAX) NULL,           -- JSON string
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_audit_events PRIMARY KEY (id),
  CONSTRAINT FK_audit_events_applications
    FOREIGN KEY (application_id) REFERENCES dbo.applications(id),
  CONSTRAINT CK_audit_events_event_data CHECK (
    event_data IS NULL OR ISJSON(event_data) = 1
  )
);
```

### OCR Integration

**Endpoint:** `POST /api/ocr`

**Request:**
```typescript
{
  imageId: string;
  imageUrl: string;  // SAS URL from Azure Blob
}
```

**Mistral OCR call with structured extraction:**
```python
from pydantic import BaseModel, Field

class AlcoholLabelExtraction(BaseModel):
    brand_name: str | None = Field(None, description="Brand name of the product")
    class_type: str | None = Field(None, description="Class/type designation")
    alcohol_content: str | None = Field(None, description="ABV or alcohol content")
    net_contents: str | None = Field(None, description="Net contents volume")
    government_warning: str | None = Field(None, description="Exact government warning text, preserving capitalization")
    bottler_name: str | None = Field(None, description="Name of bottler/producer")
    bottler_address: str | None = Field(None, description="Address of bottler/producer")
    country_of_origin: str | None = Field(None, description="Country of origin for imports")

response = client.ocr.process(
    model="mistral-ocr-latest",
    document={"type": "image_url", "image_url": sas_url},
    document_annotation_format=response_format_from_pydantic_model(AlcoholLabelExtraction),
    include_image_base64=False
)
```

**Response handling:**
- Store raw markdown + parsed fields in `ocr_results`
- Trigger comparison computation
- Update application status

### Comparison Logic

**Normalization rules by field:**

| Field | Normalization |
|-------|--------------|
| Brand Name | Lowercase, strip apostrophes/hyphens, collapse whitespace |
| Class/Type | Lowercase, trim |
| Alcohol Content | Extract numeric value, normalize "45%" = "45% Alc./Vol." = "90 Proof" |
| Net Contents | Normalize units: "750 mL" = "750ml" = "75cl" |
| Government Warning | **Exact match required** — case-sensitive, word-for-word |
| Bottler Info | Lowercase, normalize address abbreviations |
| Country of Origin | Lowercase, trim |

**Match status logic:**
```typescript
function compareField(appValue: string, ocrValue: string, fieldType: string): MatchStatus {
  if (!ocrValue) return 'MISSING';

  if (fieldType === 'government_warning') {
    return appValue === ocrValue ? 'MATCH' : 'MISMATCH';
  }

  const normalizedApp = normalize(appValue, fieldType);
  const normalizedOcr = normalize(ocrValue, fieldType);

  if (normalizedApp === normalizedOcr) return 'MATCH';

  // For brand names, check if close enough
  if (fieldType === 'brand_name' && isCloseMatch(normalizedApp, normalizedOcr)) {
    return 'LIKELY_MATCH';
  }

  return 'MISMATCH';
}
```

### Background Processing

**Architecture:**
1. Agent selects labels → creates batch record
2. API returns immediately with batch ID
3. Server-side queue processes images sequentially
4. Each completion updates DB status
5. Frontend polls or uses SSE for live updates

**Timeout handling:**
- OCR call timeout: 30 seconds
- If >5s, UI shows "Still processing..." (non-blocking)
- If timeout/error, mark as ERROR with retry option

---

## UI/UX Specifications

### Design System

- **Visual language:** USWDS-inspired via TDDS tokens
- **Components:** shadcn/ui + Radix primitives
- **Accessibility:** WCAG 2.1 AA compliance
- **Primary font:** Public Sans (USWDS standard)
- **Color palette:** USWDS Blue (#005ea2), Red (#d83933), Green (#00a91c)

### Key Screens

**1. Login (Mock)**
- Simple card with persona selector
- "Continue as Dave Morrison" etc.
- No password required

**2. Application Queue**
- Data table with sortable columns
- Status badges with color coding
- Bulk select checkboxes
- "Process Selected" and "Review Next" actions
- Batch progress indicator when active

**3. Label Review**
- Split view: Images left, comparison table right
- Image carousel for multi-image applications
- Sticky action bar at bottom
- Verdict buttons with confirmation modal for reject/override

**4. Batch Progress**
- Modal or sidebar showing batch status
- Per-item progress indicators
- "Open completed" links
- Cancel/pause controls

### Responsive Behavior

- Desktop-first design (agents use workstations)
- Responsive down to tablet for flexibility
- Not optimized for mobile (out of scope)

---

## Test Data Specification

### Seed Dataset (~30 applications)

| Category | Count | Description |
|----------|-------|-------------|
| Clean matches | 10 | All fields match perfectly |
| Normalization tests | 4 | Case, punctuation, spacing, ABV format variations |
| Clear mismatches | 4 | Brand, ABV, net contents, class/type differ |
| Government warning issues | 3 | Missing, wrong case, altered wording |
| Producer info mismatches | 2 | Address, country of origin differ |
| OCR challenges | 2 | Low quality images, handwritten elements |
| Multi-image | 3 | Front + back labels with split info |

### Image Sources

- Real labels: Source from TTB's public COLA database
- Generated labels: AI-generated for edge cases and controlled testing
- Mix ensures both accuracy validation and edge case coverage

### Bulk Seed (Optional)

For batch demo: Clone/vary 20 core records to create 200+ for Janet's use case

---

## Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Time to first result | <5 seconds (perceived) |
| OCR processing | <30 seconds actual |
| Queue load time | <2 seconds for 1000 records |
| Comparison computation | <500ms |

### Security (Prototype Level)

- No real PII in test data
- API key server-side only (never exposed to client)
- Basic CORS configuration
- No production compliance hardening

### Reliability

- Graceful degradation on OCR failure
- Retry mechanism for transient errors
- Demo reset capability

---

## Out of Scope (Prototype)

- No COLA system integration or real TTB data
- No real user accounts, SSO, or role-based permissions
- No production compliance hardening (FedRAMP, PII retention, audit certification)
- No email/Slack notifications or external workflow integration
- No advanced reporting/exports beyond basic UI views
- No mobile-first optimization
- No auto-rejection capability (always human-in-the-loop)

---

## Production Considerations (Future)

### AI Provider Path

**Prototype:** Mistral OCR via hosted API

**Production options:**
1. Self-hosted Mistral on Azure Government (open-weight model)
2. Azure OpenAI Service (FedRAMP High authorized)
3. AWS Bedrock Claude via GovCloud (FedRAMP High authorized)

Document in README: "Model is open-weight and can be self-hosted on federal infrastructure, eliminating external API calls."

### COLA Integration

- Would require TTB IT involvement and authorization
- Likely read-only API access to pending applications
- Out of scope for prototype; inform future procurement

### Compliance

- FedRAMP assessment for production deployment
- Document retention policies for audit trail
- PII handling procedures for real applicant data

---

## Success Criteria

### Demo Objectives

1. **Show speed advantage:** First result in <5 seconds (vs. failed vendor's 30-40s)
2. **Demonstrate accuracy:** Correctly flag seeded mismatches, especially government warning
3. **Prove efficiency gain:** Agent can review 3-4x more labels per hour with AI assist
4. **Satisfy stakeholders:**
   - Dave sees confidence scores, never forced to accept AI verdict
   - Jenny gets field-by-field checklist view
   - Janet can batch-process 200 labels with live results
   - Marcus sees Azure-native, minimal external dependencies

### Evaluation Metrics (for take-home submission)

- Working deployed prototype accessible via URL
- Clean, documented codebase
- Thoughtful technical choices justified in README
- Edge cases handled gracefully
- USWDS-inspired, accessible UI

---

## Appendix A: Government Warning Text

The standard federal warning (27 CFR 16.21):

```
GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.
```

**Validation rules:**
- "GOVERNMENT WARNING:" must be in ALL CAPS
- Colon required after "WARNING"
- Full text must match word-for-word
- No font size/style validation in OCR (visual inspection separate)

---

## Appendix B: API Endpoints

```
GET    /api/applications          # List applications with filters
GET    /api/applications/:id      # Single application with images, OCR, comparison
POST   /api/applications/:id/ocr  # Trigger OCR processing
POST   /api/applications/:id/review  # Submit review verdict

POST   /api/batch                 # Create batch from application IDs
GET    /api/batch/:id             # Batch status and progress
DELETE /api/batch/:id             # Cancel batch

POST   /api/admin/reset           # Reset demo data
GET    /api/admin/stats           # Processing statistics

GET    /api/images/:id/url        # Generate SAS URL for image
```

---

## Appendix C: Environment Variables

```bash
# Database (individual vars for Prisma adapter)
DB_HOST=your-server.database.windows.net
DB_PORT=1433
DB_NAME=ttb-labels
DB_USER=your-username
DB_PASSWORD=your-password

# Database (connection string for Prisma CLI)
DATABASE_URL="sqlserver://HOST:1433;database=DB;user=USER;password=PASS;encrypt=true"

# Storage
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=label-images

# AI
MISTRAL_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
DEMO_RESET_SECRET=
```
