# TTB Label Verification App - Development Process

> Documenting my approach, decisions, and progress for the Treasury take-home project.

---

## Project Timeline

### Day 1 - Initial Setup
**Date:** 2026-01-23

- Reviewed project requirements and stakeholder interview notes
- Converted requirements doc to markdown for easier reference

---

### Repository Structure Setup
**Date:** 2026-01-23

- Created `ttb-label-verification/` folder as dedicated project directory
- Created PROCESS.md into project folder (separate from parent treasury folder)
- Created update-process skill to add timestamped entries to PROCESS.md for documenting project progress

---

### Day 2 - Federal Design Standards Research
**Date:** 2026-01-24

- Used ChatGPT Deep Research to investigate federal web design requirements
- Found: USWDS (U.S. Web Design System) is mandated by 21st Century IDEA Act
- Discovered Treasury has its own design system (TDDS) built on USWDS
- Key finding: TTB specifically uses USWDS-based design for their platforms
- Decision: Use shadcn/ui styled to match USWDS aesthetics for the prototype
- Created `research/` folder to store findings
- Stretch goal identified: Convert TDDS to shadcn registry if time allows after core prototype is complete

---

### Stakeholder Analysis
**Date:** 2026-01-24

- Created psychological profiles for all 4 stakeholders from interview notes (Sarah, Marcus, Dave, Jenny)
- Identified key design tensions: fuzzy matching (Dave) vs exact validation (Jenny), batch upload needs, speed requirements (<5s)
- Derived 7 design principles: Assistive not autonomous, speed as feature, progressive disclosure, explicit confidence scores, graceful degradation, zero infrastructure burden, checklist mental model
- Critical insight: Dave (28-year skeptic) is the adoption gatekeeper — if he uses it voluntarily, the team follows
- Research saved to `research/stakeholder-profiles/`

---

### COLA Form Research
**Date:** 2026-01-24

- Located the COLAs Online user manual PDF with application field details
- Extracted the PDF to markdown via Mistral OCR to improve AI context engineering
- Saved outputs for reproducible reference during the design phase

---

### OCR Workflow (Mistral)
**Date:** 2026-01-24

- Added a small OCR workspace under `research/ocr/mistral/` for reproducible extraction
- Documented local setup and run instructions for Mistral OCR
- Planned outputs: raw OCR JSON and consolidated markdown for AI context

---

### Day 3 - Next.js App Initialization & Azure Deployment
**Date:** 2026-01-25

- Initialized Next.js 16.1 app with React 19, Tailwind v4, and shadcn/ui components
- Chose Azure Static Web Apps for hosting to align with TTB's existing Azure infrastructure (per Marcus's interview: "We're on Azure now after the migration in 2019")
- Successfully deployed to: https://icy-river-012b1601e.6.azurestaticapps.net
- Custom domain setup in progress (ttb.gregjohns.dev)
- Tech stack confirmed: Next.js App Router, shadcn/ui styled for USWDS, bun package manager

---

### TDDS Design System Integration
**Date:** 2026-01-25

- Added TDDS Treasury color palette to globals.css (primary blues, secondary greens, accent yellows, warning reds)
- Created custom Button variants matching TDDS specs (primary, secondary, warning, base, paper, outlines)
- Implemented USWDS-style alerts with two variants: thin (Sonner toasts) and large (Alert component)

- Icons use black filled circles with white symbols per USWDS design standards
- Added component showcase page with alert demos and toast triggers

---

### Azure SQL Database Setup
**Date:** 2026-01-25

- Configured Prisma 7 with SQL Server adapter for Azure SQL Database
- Created database schema with 6 models: Application, LabelImage, OcrResult, Comparison, Review, AuditEvent
- Used Azure SQL free tier (100,000 vCore-seconds + 32GB/month) to keep costs at $0
- Database deployed to US East 2 region

---

### Day 4 - Core Feature Implementation
**Date:** 2026-01-26

Used Claude Code's plan mode and Tasks primitive to systematically build out SPEC.md features. The Tasks tool was particularly effective for breaking down complex features into trackable steps and maintaining context across implementation sessions.

#### Completed Features
- **Mock Authentication** - Persona-based JWT sessions, USWDS header with gov banner and command palette, DAL pattern for session verification
- **Application Queue (F1)** - DataTable with faceted filters, priority sorting (NEEDS_ATTENTION first), "Review Next" navigation
- **Label Comparison View (F2)** - Side-by-side layout with image gallery, comparison table, and tabbed OCR view
- **Agent Actions (F3)** - Verdict submission with reason codes, audit trail, "Review & Continue" workflow
- **Demo Reset (F6)** - Admin endpoint with secret validation

#### Core Libraries
- **Comparison engine** - Field normalization (ABV, net contents, brand fuzzy matching), exact match for government warning
- **Mistral OCR integration** - Pixtral vision model, multi-image merging, graceful fallback when unconfigured
- **Seed data** - 30+ test applications across all validation scenarios, 50+ label images

#### UX Polish
- Loading skeletons, disabled states during submission, proper navigation flow between reviews

---

### Day 5 - TDDS Registry (Parallel Work)
**Date:** 2026-01-27

#### Async Agent Workflow
Before bed on Day 4, kicked off a remote Claude Code session (claude.ai/code) to build out the TDDS shadcn registry as a background task. This was a stretch goal from Day 2 research — converting Treasury's design system into a reusable component registry.

Woke up to a working implementation. The remote session had created its work in a git worktree for isolation. Reviewed the output, iterated with Claude Code locally to add a few features, then merged to main.

#### TDDS Registry
- **35+ shadcn components** with Treasury/USWDS styling
- **Registry endpoint** deployable to Vercel (`/r/{name}.json`)
- **Dark mode** support, Tailwind v4, full TypeScript
- Components installable via `npx shadcn@latest add @tdds/button`

#### Why Build This Now?
The main app features (F1-F3, F6) were complete. Rather than context-switch away from polishing the prototype, I delegated the registry work to an async agent overnight. This demonstrates:
- Effective use of remote AI agents for parallel workstreams
- Understanding of git worktrees for isolated feature development
- Prioritization — core prototype first, reusable tooling second

---

### Day 6 - Real Data & Azure Blob Storage
**Date:** 2026-01-28

- Replaced synthetic sample data with 30 real applications extracted from the 2018 COLA dataset (15 wine, 10 spirits, 5 malt beverages)
- Manually downloaded 58 label images from TTB's public COLA registry and uploaded to Azure Blob Storage (`ttblabelsdev.blob.core.windows.net/demo/`)
- `GET /api/upload/sample` now serves a static CSV with real TTB IDs, brand names, and Azure blob image URLs
- Demo now uses real government data end-to-end instead of fabricated test data

---

<!-- New entries will be added above this line -->
