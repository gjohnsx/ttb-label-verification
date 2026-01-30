# TTB Label Verification App

AI-powered tool that helps TTB compliance agents verify alcohol label applications faster. Instead of manually comparing label images against application data field-by-field (5-10 minutes each), agents get AI-extracted fields with confidence scores targeting under 5 seconds.

**Live Demo:** [icy-river-012b1601e.6.azurestaticapps.net](https://icy-river-012b1601e.6.azurestaticapps.net)

Sign in as any agent (mock auth), head to `/upload`, pick a CSV, and start reviewing real COLA applications with real TTB label images.

---

## Tech Stack

I chose Azure over alternatives like Vercel/Supabase because TTB already runs on Azure infrastructure. Using Azure-native services means fewer procurement and compliance hurdles if this prototype informs future development.

- **Azure Static Web Apps** (hybrid Next.js rendering) — static content on a global CDN, server-side rendering via a managed App Service backend
- **Next.js 16.1** (App Router) — server components, streaming, server actions
- **React 19** — transitions, optimistic updates
- **shadcn/ui** — styled to match USWDS/Treasury design standards
- **Prisma 7 + Azure SQL** — SQL Server adapter, 6-model schema
- **Azure Blob Storage** — label image hosting
- **Azure AI Foundry** — hosts both AI models used in the OCR pipeline:
  - Mistral OCR — raw text extraction from label images
  - OpenAI GPT-4.1-nano — structured field extraction with confidence scores
- **Bun** — package manager and runtime

---

## Approach

The requirements doc is structured around stakeholder interviews, so I started with research — COLA form structure, federal design standards (USWDS), and what each stakeholder actually needs from the tool. The research is in the `research/` folder.

The core design decisions all came from that research:

- The AI assists but never auto-rejects. Agents make the final call, and every field shows a confidence score so they can calibrate trust.
- Brand names use fuzzy matching ("STONE'S THROW" vs "Stone's Throw" = likely match), but the government warning requires an exact word-for-word match.
- Batch CSV upload supports high-volume reviewers who submit 200-300 labels at once.
- The UI is styled to match USWDS (U.S. Web Design System) and [Treasury's design standards](https://github.com/US-Department-of-the-Treasury/tdds) and targets [Section 508](https://www.section508.gov/) / WCAG 2.1 AA accessibility guidance.

### Two-Stage OCR Pipeline

The OCR pipeline has two stages, both running through Azure AI Foundry. Mistral OCR handles raw text extraction from label images, and OpenAI GPT-4.1-nano structures that text into typed fields with confidence scores. Splitting the work lets each model do what it's best at and keeps processing around 5 seconds.

I chose Mistral OCR specifically because it's open-source and [available to self-host](https://mistral.ai/news/mistral-ocr) for organizations dealing with sensitive or classified information. For this prototype it runs through Azure AI Foundry, but a production deployment could self-host the OCR model within TTB's own infrastructure to meet federal data privacy requirements.

### TDDS Component Registry

I also built a [TDDS Registry](https://tdds-registry.gregjohns.dev) — a standalone shadcn component registry with Treasury design system styling. Components are installable via `npx shadcn@latest add @tdds/button`.

---

## Assumptions (MVP)

- Standalone proof of concept (no direct COLA integration); dataset built from public COLA application PDFs in the [TTB COLA Online public search](https://ttbonline.gov/colasonline/publicSearchColasBasic.do)
- CSV format mirrors a potential COLA export structure; label images referenced from Azure Blob Storage
- Batch upload targets 200-300 labels; progress updates are polling-based
- Azure AI Foundry endpoints are reachable from the agency network (Azure-first footprint)

---

## Architecture

```
CSV Upload → Parse & Validate → Create Applications + LabelImages
                                        │
                                Azure Blob Storage ← Label Images
                                        │
                                  Mistral OCR → Raw Markdown
                                        │
                              Azure OpenAI → Structured Fields + Confidence Scores
                                        │
                              Comparison Engine → Match Statuses
                                        │
                              Agent Review → Verdict + Audit Trail
```

### Database Schema

Six models: **Application** (COLA data), **LabelImage** (blob references), **OcrResult** (raw + structured extraction), **Comparison** (field-level match results), **Review** (agent verdicts), **AuditEvent** (full action log).

### Comparison Engine

Supported fields (MVP): brand name, class/type, alcohol content, net contents, government warning, bottler name/address, country of origin.

Each field uses the appropriate matching strategy:

| Field | Strategy | Why |
|-------|----------|-----|
| Brand Name | Fuzzy (85% threshold) | Case and punctuation vary ("STONE'S THROW" vs "Stone's Throw") |
| Class/Type | Fuzzy (70% threshold) | Category phrasing varies |
| ABV | Normalized | Multiple valid formats ("45%" = "45% Alc./Vol." = "90 Proof") |
| Net Contents | Normalized | Unit variations ("750 mL" = "750ml" = "75cl") |
| Gov. Warning | Exact match | Legal requirement — must be word-for-word, "GOVERNMENT WARNING:" in all caps |
| Bottler Info | Normalized | Address abbreviation differences |
| Country of Origin | Normalized | Minor formatting differences |

---

## Setup & Run

```bash
git clone <repo-url>
cd ttb-label-verification/next-app
bun install
```

Copy `.env.example` to `.env` and configure:

```bash
# Database (Azure SQL)
DATABASE_URL=sqlserver://...

# Storage (Azure Blob)
AZURE_STORAGE_CONNECTION_STRING=...

# AI (Mistral OCR + Azure OpenAI via Azure AI Foundry)
MISTRAL_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-nano

# App
DEMO_RESET_SECRET=...
```

```bash
bun run db:generate   # Generate Prisma client
bun run db:push       # Push schema to database
bun run dev           # Start dev server at localhost:3000
```

---

## Trade-offs & Limitations

**What's mocked:**
- Authentication — persona-based JWT so we can track which agent reviewed which application. 

**What's real:**
- 24 public COLA application PDFs from the [TTB COLA Online public search](https://ttbonline.gov/colasonline/publicSearchColasBasic.do) (OCR text + extracted label images)
- 50 label images extracted from those PDFs and hosted in Azure Blob Storage
- Live OCR extraction and AI-powered field matching
- Azure SQL database with full audit trail

**Known limitations (MVP):**
- Government warning checks text only (typography like bold/size is not validated yet)
- No image pre-processing for glare/angle issues; low-quality photos may fail OCR
- Some public PDFs omit fields (e.g., alcohol content), so missing values are expected
- Beverage-type-specific rule variations are not enforced

**What I'd do with more time:**
- Replace polling-based batch progress with background job processing using [Trigger.dev](https://trigger.dev/) or [useWorkflow](https://useworkflow.dev/)
- Use [Gemini's bounding box API](https://ai.google.dev/gemini-api/docs/image-understanding#segmentation) to highlight extracted fields directly on label images
- Export review decisions as CSV for reporting

---

## Project Structure

```
ttb-label-verification/
├── next-app/              # Main application
│   ├── app/               # Next.js App Router pages & API routes
│   ├── components/        # React components (data-table, review, batch, admin)
│   ├── lib/               # Core logic (ocr, comparison, csv, auth, actions)
│   └── prisma/            # Database schema & seed
├── tdds-registry/         # shadcn component registry (Vercel)
├── research/              # COLA form docs, USWDS research, OCR experiments, stakeholder profiles
└── PROCESS.md             # Development journal with daily progress
```

---

## Development Process

See [PROCESS.md](./PROCESS.md) for a detailed development journal covering daily progress, decision rationale, and tooling choices.
