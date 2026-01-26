// Application status options for filtering
export const APPLICATION_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY", label: "Ready" },
  { value: "NEEDS_ATTENTION", label: "Needs Attention" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "ERROR", label: "Error" },
] as const;

// Class/Beverage types for filtering
// Based on TTB classifications for alcohol beverages
export const CLASS_TYPES = [
  { value: "Whiskey", label: "Whiskey" },
  { value: "Vodka", label: "Vodka" },
  { value: "Gin", label: "Gin" },
  { value: "Rum", label: "Rum" },
  { value: "Tequila", label: "Tequila" },
  { value: "Brandy", label: "Brandy" },
  { value: "Wine", label: "Wine" },
  { value: "Beer", label: "Beer" },
  { value: "Malt Beverage", label: "Malt Beverage" },
  { value: "Liqueur", label: "Liqueur" },
  { value: "Bourbon", label: "Bourbon" },
  { value: "Scotch", label: "Scotch" },
  { value: "Irish Whiskey", label: "Irish Whiskey" },
  { value: "Rye", label: "Rye" },
  { value: "Mezcal", label: "Mezcal" },
  { value: "Cognac", label: "Cognac" },
  { value: "Sparkling Wine", label: "Sparkling Wine" },
  { value: "Fortified Wine", label: "Fortified Wine" },
  { value: "Hard Seltzer", label: "Hard Seltzer" },
  { value: "Cider", label: "Cider" },
  { value: "Sake", label: "Sake" },
] as const;

// Rejection reason codes for agent review decisions
export const REJECTION_REASON_CODES = [
  { value: "OCR_ERROR", label: "OCR Error" },
  { value: "ALLOWED_VARIATION", label: "Allowed Variation" },
  { value: "JUDGMENT_CALL", label: "Judgment Call" },
  { value: "INCORRECT_RULE", label: "Incorrect Rule" },
  { value: "IMAGE_QUALITY", label: "Image Quality" },
  { value: "OTHER", label: "Other" },
] as const;

// OCR configuration
export const OCR_CONFIG = {
  /** Mistral model used for label extraction */
  model: "pixtral-large-2411",
  /** Minimum confidence score to consider a field reliable */
  minConfidenceThreshold: 0.7,
  /** Maximum processing time before timeout (ms) */
  maxProcessingTimeMs: 30000,
} as const;

// Type exports for use in components
export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number]["value"];
export type ClassTypeValue = (typeof CLASS_TYPES)[number]["value"];
export type RejectionReasonCodeValue = (typeof REJECTION_REASON_CODES)[number]["value"];
