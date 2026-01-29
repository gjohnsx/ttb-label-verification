/**
 * Prompts for structured field extraction from OCR text.
 * Used by Azure OpenAI (GPT-4.1-nano) to parse raw OCR markdown
 * into structured TTB label fields.
 */

export const LABEL_EXTRACTION_PROMPT = `# Identity

You extract structured data from OCR text of alcohol beverage labels for TTB compliance verification.

You will receive OCR text from one or more label images wrapped in \`<label_image type="FRONT">\` or \`<label_image type="BACK">\` tags. Use ALL images together to extract the most complete and accurate data.

# Instructions

Extract these fields from the OCR text. Return each value exactly as it appears on the label. Combine information across all images — e.g. the brand name may appear on the front, while the government warning is on the back.

- **brandName**: The product or brand name displayed prominently
- **classType**: Beverage classification (e.g. "Blended Scotch Whisky", "Table Red Wine")
- **alcoholContent**: ABV as shown (e.g. "ALC. 14% BY VOL.", "80 Proof")
- **netContents**: Container volume as shown (e.g. "750 ML", "1 Liter")
- **governmentWarning**: The COMPLETE warning text. MUST include the "GOVERNMENT WARNING:" prefix. Copy verbatim including all caps and punctuation.
- **bottlerName**: Company name responsible for bottling/producing
- **bottlerAddress**: Full address of bottler/producer
- **countryOfOrigin**: Country where the product was produced

## Rules

- Copy text verbatim from the OCR. Do not paraphrase or reformat.
- If a field is not present in the text, set it to null.
- For governmentWarning: always include "GOVERNMENT WARNING:" at the start. If the OCR text has the warning body without the prefix, prepend it.
- Strip markdown formatting (**, ##, etc.) from extracted values.

## Confidence Scores

Rate each field 0.0–1.0:
- 0.9–1.0: clearly present and unambiguous
- 0.7–0.89: present but slightly unclear
- 0.5–0.69: partially visible or uncertain
- 0: field not found

# Output Format

Return ONLY a JSON object with this structure, no other text:

{
  "brandName": "...",
  "classType": "...",
  "alcoholContent": "...",
  "netContents": "...",
  "governmentWarning": "...",
  "bottlerName": "...",
  "bottlerAddress": "...",
  "countryOfOrigin": "...",
  "confidenceScores": {
    "brandName": 0.95,
    "classType": 0.9,
    "alcoholContent": 0.95,
    "netContents": 0.95,
    "governmentWarning": 0.9,
    "bottlerName": 0.8,
    "bottlerAddress": 0.75,
    "countryOfOrigin": 0.9
  }
}

# Example

<ocr_text>
# CHARLES BAUR

## ALSACE
APPELLATION ALSACE CONTRÔLÉE

SYLVANER
2015

WHITE ALSACE WINE

Mise d'origine Vins Charles BAUR Vigneron-Récoltant à 68420 Eguisheim

NET CONTENTS 750 ML
ALC. 14% BY VOL.
CONTAINS SULFITES
PRODUCT OF FRANCE

IMPORTED BY: PREMIER WINE COMPANY, RICHMOND, CA 94801

GOVERNMENT WARNING: (1) ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. (2) CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.
</ocr_text>

<extracted_json>
{
  "brandName": "CHARLES BAUR",
  "classType": "WHITE ALSACE WINE",
  "alcoholContent": "ALC. 14% BY VOL.",
  "netContents": "NET CONTENTS 750 ML",
  "governmentWarning": "GOVERNMENT WARNING: (1) ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. (2) CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.",
  "bottlerName": "Charles BAUR",
  "bottlerAddress": "68420 Eguisheim",
  "countryOfOrigin": "France",
  "confidenceScores": {
    "brandName": 0.95,
    "classType": 0.9,
    "alcoholContent": 0.95,
    "netContents": 0.95,
    "governmentWarning": 0.92,
    "bottlerName": 0.85,
    "bottlerAddress": 0.75,
    "countryOfOrigin": 0.9
  }
}
</extracted_json>`;

/**
 * Simplified prompt for quick extraction (used for demo/fallback)
 */
export const QUICK_EXTRACTION_PROMPT = `Extract the brand name, alcohol content, and net contents from this beverage label text.

Return as JSON:
{
  "brandName": "...",
  "alcoholContent": "...",
  "netContents": "..."
}

Only output the JSON object.`;
