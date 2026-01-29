# TTB Label Verification App

AI-powered tool for TTB compliance agents to verify alcohol label applications faster.

## Why This Exists

TTB reviews 150,000 label applications/year with 47 agents. Current process: manually compare label images against application data field-by-field (5-10 min each). A previous automation failed because 30-40 second response times were slower than eyeballing. **Speed (<5 sec) is non-negotiable.**

This prototype proves AI vision can handle routine matching, freeing agents for judgment calls.

## Key Stakeholder Context

- **Dave** (28-year veteran): Skeptic, adoption gatekeeper. Never auto-reject; show confidence scores.
- **Jenny** (junior): Uses paper checklist. Mirror that mental model.
- **Janet**: Needs batch upload for 200-300 labels at once.

If Dave uses it voluntarily, the team follows.

## Tech Stack

- **Next.js 16.1** (App Router) - Server components, streaming
- **shadcn/ui** - Styled to match USWDS (federal design standard)
- **Prisma 7** + Azure SQL - Database (SQL Server adapter)
- **Azure Blob Storage** - Label images (`ttblabelsdev.blob.core.windows.net/demo/`)
- **OCR Pipeline** - Mistral OCR (raw text) → Azure OpenAI GPT-5-nano (structured fields + confidence scores)
- **Azure Static Web App** - Deployment

## Development Commands

```bash
cd next-app
bun run dev          # Start dev server
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
bun run db:test      # Test database connection
```

## Critical Validation Rules

1. **Government Warning**: MUST be exact text, "GOVERNMENT WARNING:" in ALL CAPS, bold. No fuzzy matching.
2. **Brand Name**: Fuzzy match OK - "STONE'S THROW" vs "Stone's Throw" should flag with confidence, not reject.
3. **ABV/Net Contents**: Normalize formats (45% = 45% Alc./Vol., 750 mL = 750ml).

## Reference Documentation

- `research/` - USWDS design standards, COLA form documentation, stakeholder profiles
