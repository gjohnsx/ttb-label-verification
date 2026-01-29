# TTB Label Verification (Take-Home)

Prototype for AI-assisted alcohol label review: agents pick a persona, work the queue, run OCR on label images, and compare extracted fields to application data before recording a decision.

## Run locally
1. `cp .env.example .env` and fill `DB_*` (SQL Server) plus `MISTRAL_API_KEY`.
2. `bun install`
3. `bun run db:push`
4. `bun run db:seed`
5. `bun run dev` then open `http://localhost:3000`

## Demo access (Azure SQL)
Azure SQL is IP-restricted. For a short-lived demo, open it to all IPs:
- Server -> Networking -> firewall rule `allow-all-demo` with `0.0.0.0-255.255.255.255`
- Rotate the DB password and lock the firewall after the review window.

## Demo data notes
The scraped dataset in `research/dataset/scraped/scraped-import.csv` is built from
public COLA PDF forms plus label images. Those PDFs do **not** include Alcohol
Content or Net Contents, so the CSV includes **mocked application values** for:
- `ALCOHOL_CONTENT`
- `NET_CONTENTS`

These values are derived from label OCR and then lightly perturbed for a few
rows to create intentional mismatches for the review demo.
