# Stretch Goals

Ideas to explore if time permits after MVP is complete.

---

## Label Generator / Test Data Pipeline

Create a screen where users can:
1. Fill out a form with label data (brand name, ABV, net contents, etc.)
2. Generate a realistic label image using AI (Nano Banana Pro or similar)
3. Option to generate it "correctly" or with intentional errors/mismatches
4. Run the generated label through the OCR verification pipeline
5. See how the system handles fresh, unseen data

**Use cases:**
- Demo the full pipeline without needing real COLA submissions
- Training tool for new agents to understand what errors look like
- Stress testing edge cases (weird fonts, rotated text, low contrast)

**Variations:**
- Fully AI-generated labels
- User uploads real image + fills form manually
- Hybrid: user provides partial data, AI fills gaps

---

## Portfolio / Documentation Hub

Turn the app itself into a portfolio piece, not just a demo:
- Home page menu already mocked with links to CV / GitHub
- Add nicely rendered views of PROCESS.md and SPEC.md directly in the app
- Make the "how I built this" story accessible without needing to dig through GitHub
- Could use MDX or a simple markdown renderer component

**Why:**
- Reviewers can see the product AND the thinking in one place
- Shows communication skills alongside technical skills
- More polished than "check the repo for docs"
- The app becomes self-documenting

**Pages to add:**
- `/about` or `/process` - How I built this (PROCESS.md)
- `/spec` - The specification and requirements (SPEC.md)
- Links in the home page sidebar/menu

---

## USWDS shadcn Registry

Package the USWDS-styled shadcn components as a publishable shadcn registry:

1. Create a registry manifest for all USWDS-themed components
2. Host the registry (GitHub raw files or dedicated endpoint)
3. Add install instructions to the `/demo` page showing how others can use them:
   ```bash
   npx shadcn@latest add https://your-registry-url/uswds-button
   ```

**Why:**
- Reusable across federal projects needing USWDS compliance
- Shows understanding of shadcn's extensibility model
- Open source contribution opportunity
- Makes the demo page more useful as a resource

**Components to include:**
- Button (primary/secondary/accent variants)
- USA Banner
- Other USWDS-styled primitives

---

## Data Model Improvements

Refine the database schema to better track processing state and decision outcomes:

1. **OCR Status Column**: Add a flag or status field to track if OCR has been performed on a label image.
   - Need to know if OCR is pending, processing, completed, or failed.
2. **Granular Review Status**: Update the status field to capture specific outcomes rather than a generic "reviewed" state.
   - Current: `reviewed` (ambiguous) is often used for approved or rejected.
   - Proposed: Explicit states like `approved`, `rejected`, `needs_correction`.

---

## Other Ideas / Issues
