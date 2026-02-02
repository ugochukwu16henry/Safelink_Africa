# SafeLink Africa — Design System

Design system for the SafeLink Africa app and admin dashboard. Built for **trust**, **clarity**, and **accessibility** across Africa.

## Color Palette

### Primary — Safety & Trust

| Name | Hex | Usage |
|------|-----|--------|
| **Safe Teal** | `#0D5C4A` | Primary buttons, key actions, headers, links |
| **Teal Light** | `#0F7A62` | Hover states, secondary emphasis |
| **Teal Soft** | `#E8F5F2` | Light backgrounds, badges, success tint |

### Secondary — Energy & Hope

| Name | Hex | Usage |
|------|-----|--------|
| **Amber** | `#E8A317` | CTAs, highlights, “safe” indicators |
| **Amber Light** | `#F5D88A` | Backgrounds, warnings (soft) |
| **Amber Dark** | `#B8820F` | Pressed states, borders |

### Emergency & Alerts

| Name | Hex | Usage |
|------|-----|--------|
| **SOS Red** | `#C73E1D` | SOS button, critical alerts, danger |
| **SOS Red Light** | `#FDE8E5` | Alert backgrounds, error messages |
| **Success Green** | `#2D7D46` | Success messages, “safe” status |
| **Warning** | `#C77B1D` | Warnings, caution |

### Neutrals

| Name | Hex | Usage |
|------|-----|--------|
| **Ink** | `#1A1D23` | Primary text |
| **Ink Soft** | `#4A4E58` | Secondary text |
| **Ink Muted** | `#7A7F8A` | Placeholders, disabled |
| **Cloud** | `#E8EAED` | Borders, dividers |
| **Sky** | `#F7F5F2` | Page background (light) |
| **Night** | `#1A1D23` | Dark mode background |
| **Snow** | `#FFFFFF` | Cards, inputs, light surfaces |

## Typography

- **Headings:** Bold, clear hierarchy (e.g. system font stack or Inter / Plus Jakarta Sans if available).
- **Body:** 16px base, 1.5 line-height for readability.
- **Labels / Buttons:** 14–16px, medium weight.
- **Accessibility:** Minimum contrast 4.5:1 for body text, 3:1 for large text.

## Spacing

- Base unit: **4px**
- Scale: 4, 8, 12, 16, 24, 32, 48, 64
- Use for padding, margins, and gaps between elements.

## Components (Principles)

- **Buttons:** Primary = Safe Teal; Emergency = SOS Red; Secondary = outline or Amber.
- **Cards:** White/Snow on Sky background, subtle shadow, 8–12px radius.
- **Inputs:** Clear border (Cloud), focus ring in Safe Teal.
- **Alerts:** Red tint for danger, Teal Soft for success, Amber Light for warning.

## Usage in Code

Design tokens are defined in `shared/design-tokens.ts` (and optionally CSS/SCSS variables) so mobile and web use the same values.
