# Mistral OCR

Simple script to OCR PDFs into markdown for context engineering.

## Usage

```bash
cp .env.example .env  # add MISTRAL_API_KEY
bun install
bun run ocr [path/to/file.pdf]
```

Outputs `.md` and `.ocr.json` to `outputs/`.

COLA form extractions moved to `research/cola-form/`.
