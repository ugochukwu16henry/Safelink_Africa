/**
 * SafeLink Africa — Design tokens
 * Use these in mobile app and web for consistent colors and spacing.
 * See docs/DESIGN.md for usage.
 */

export const colors = {
  // Primary — Safety & Trust
  safeTeal: '#0D5C4A',
  tealLight: '#0F7A62',
  tealSoft: '#E8F5F2',

  // Secondary — Energy & Hope
  amber: '#E8A317',
  amberLight: '#F5D88A',
  amberDark: '#B8820F',

  // Emergency & Alerts
  sosRed: '#C73E1D',
  sosRedLight: '#FDE8E5',
  successGreen: '#2D7D46',
  warning: '#C77B1D',

  // Neutrals
  ink: '#1A1D23',
  inkSoft: '#4A4E58',
  inkMuted: '#7A7F8A',
  cloud: '#E8EAED',
  sky: '#F7F5F2',
  night: '#1A1D23',
  snow: '#FFFFFF',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
} as const;
