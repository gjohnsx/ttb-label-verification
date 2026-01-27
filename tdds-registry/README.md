# TDDS - Treasury Department Design System

A [shadcn/ui](https://ui.shadcn.com) component registry implementing the Treasury Department Design System (TDDS) for federal React applications.

## Features

- **35+ Components** - Full set of UI components with Treasury styling
- **USWDS Inspired** - Follows federal design standards and accessibility guidelines
- **Dark Mode** - Complete light and dark theme support
- **TypeScript** - Full type safety and IntelliSense support
- **Tailwind CSS v4** - Modern utility-first styling

## Quick Start

### 1. Configure the Registry

Add the TDDS registry to your `components.json`:

```json
{
  "registries": {
    "@tdds": "https://tdds-registry.vercel.app/r/{name}.json"
  }
}
```

### 2. Install the Style (Recommended)

Install the TDDS style to get all Treasury color tokens:

```bash
npx shadcn@latest add @tdds/tdds-style
```

### 3. Install Components

Use the shadcn CLI to add components:

```bash
npx shadcn@latest add @tdds/button
npx shadcn@latest add @tdds/alert
npx shadcn@latest add @tdds/gov-banner
```

## Available Components

### Core UI
- `button` - Primary/secondary/warning/outline variants
- `alert` - Info/warning/error/success with USWDS icons
- `badge` - Treasury-themed status badges
- `card` - Card with Treasury border styling
- `input` - USWDS-styled form input
- `tabs` - Including USWDS variant

### Layout
- `gov-banner` - Official government banner
- `mini-card` - Treasury seal watermark cards
- `breadcrumb` - USWDS navigation

### Form
- `field` - Composed form field system
- `button-group` - Grouped button layout
- `input-group` - Input with addons
- `select` - Styled dropdown
- `checkbox` - Treasury checkbox
- `radio-group` - Treasury radio buttons
- `textarea` - Multi-line input
- `combobox` - Searchable select
- `label` - Form label

### Overlay
- `dialog` - Modal dialog
- `alert-dialog` - Confirmation dialog
- `sheet` - Slide-out panel
- `popover` - Floating content
- `hover-card` - Hover-triggered card
- `tooltip` - Info tooltip
- `dropdown-menu` - Context menu
- `command` - Command palette

### Data Display
- `table` - Data table
- `pagination` - Page navigation
- `accordion` - Collapsible sections
- `progress` - Progress indicator
- `skeleton` - Loading placeholder
- `separator` - Visual divider
- `avatar` - User avatar
- `kbd` - Keyboard shortcut display

### Feedback
- `sonner` - Toast notifications

### Navigation
- `sidebar` - Application sidebar

## Color Palette

The TDDS uses the official Treasury Department color palette:

| Color | Light | Dark |
|-------|-------|------|
| Primary | `#0053A2` | `#2D8FE8` |
| Secondary | `#2E8540` | `#4CAF50` |
| Accent | `#D8BE0E` | `#FFD54F` |
| Warning | `#D0021B` | `#EF5350` |

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## License

MIT

---

Built for the Treasury IT Specialist (AI) hiring evaluation. Not an official government resource.
