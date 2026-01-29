/**
 * Prompts for structured field extraction from OCR text
 *
 * Used by Azure OpenAI to parse raw OCR markdown into
 * structured TTB label fields.
 */

/**
 * Main prompt for extracting label fields from OCR text.
 * Designed to match the ExtractedFields type structure.
 */
export const LABEL_EXTRACTION_PROMPT = `You are analyzing OCR-extracted text from a beverage label for TTB (Alcohol and Tobacco Tax and Trade Bureau) compliance verification. Extract the following information from the text:

1. **Brand Name** - The product/brand name prominently displayed on the label
2. **Class/Type** - The beverage classification (e.g., "Blended Scotch Whisky", "Kentucky Straight Bourbon Whiskey", "Vodka", "London Dry Gin")
3. **Alcohol Content** - The ABV (alcohol by volume) percentage. May appear as "40% Alc./Vol.", "80 Proof", "40% ABV", etc.
4. **Net Contents** - The volume of the container (e.g., "750 mL", "1 Liter", "1.75L", "375ml")
5. **Government Warning** - The EXACT text of any government health warning. This is typically a block of text starting with "GOVERNMENT WARNING:" in all caps.
6. **Bottler/Producer Name** - The company name responsible for bottling or producing
7. **Bottler/Producer Address** - Full address including city, state, and country if visible
8. **Country of Origin** - The country where the product was produced/distilled

**IMPORTANT RULES:**
- Extract text EXACTLY as it appears on the label
- For Government Warning: capture the COMPLETE text including "GOVERNMENT WARNING:" prefix
- If a field is not visible or cannot be read, set it to null
- For confidence scores: rate 0.0-1.0 based on text clarity and certainty
  - 0.95-1.0: Crystal clear, no ambiguity
  - 0.8-0.94: Readable but slightly unclear
  - 0.6-0.79: Partially visible or hard to read
  - Below 0.6: Guessing or very uncertain

Return your response as valid JSON with this exact structure:
{
  "brandName": "...",
  "classType": "...",
  "alcoholContent": "...",
  "netContents": "...",
  "governmentWarning": "...",
  "bottlerName": "...",
  "bottlerAddress": "...",
  "countryOfOrigin": "...",
  "confidence": {
    "brandName": 0.95,
    "classType": 0.90,
    "alcoholContent": 0.98,
    "netContents": 0.95,
    "governmentWarning": 0.85,
    "bottlerName": 0.80,
    "bottlerAddress": 0.75,
    "countryOfOrigin": 0.90
  }
}

Only output the JSON object, no additional text or markdown formatting.`;

/**
 * Simplified prompt for quick extraction (used for demo/fallback)
 */
export const QUICK_EXTRACTION_PROMPT = `Extract the brand name, alcohol content, and net contents from this beverage label image.

Return as JSON:
{
  "brandName": "...",
  "alcoholContent": "...",
  "netContents": "..."
}

Only output the JSON object.`;
