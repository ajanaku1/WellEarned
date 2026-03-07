import { Platform } from 'react-native';

// Wellness-inspired dark palette
// Warm, nature-grounded tones — sage, sand, soft lavender
// iOS glass material hierarchy for depth
export const palette = {
  // Backgrounds — warm dark, not cold/blue-black
  bg: '#0F1210',
  bgCard: '#161B18',
  surface: '#1C2320',
  surfaceMuted: '#232B27',
  surfaceElevated: '#2A332F',

  // Text — warm off-whites, not pure white
  ink: '#F0EDE8',
  inkSoft: '#A8A196',
  inkMuted: '#6B655C',

  // Brand — soft sage green (wellness, growth, calm)
  brand: '#7BAF8E',
  brandLight: '#A8D4B4',
  brandDeep: '#5C8A6A',
  brandGlow: 'rgba(123, 175, 142, 0.25)',
  brandSurface: 'rgba(123, 175, 142, 0.08)',

  // Accents — muted, nature-toned
  mint: '#8ECFA5',
  mintLight: '#B5E4C7',
  mintGlow: 'rgba(142, 207, 165, 0.15)',
  mintSurface: 'rgba(142, 207, 165, 0.06)',

  cyan: '#7BBCC5',
  cyanGlow: 'rgba(123, 188, 197, 0.15)',

  amber: '#D4A76A',
  amberGlow: 'rgba(212, 167, 106, 0.15)',
  amberSurface: 'rgba(212, 167, 106, 0.06)',

  danger: '#CF7171',
  dangerGlow: 'rgba(207, 113, 113, 0.12)',

  pink: '#C98DB8',
  pinkGlow: 'rgba(201, 141, 184, 0.15)',

  // Lavender — secondary accent for AI features
  lavender: '#A594C9',
  lavenderGlow: 'rgba(165, 148, 201, 0.15)',
  lavenderSurface: 'rgba(165, 148, 201, 0.06)',

  // Solana — keep functional but soften
  solana: '#7BD4A3',
  solanaGlow: 'rgba(123, 212, 163, 0.2)',

  // Borders — warm, soft
  border: 'rgba(240, 237, 232, 0.06)',
  borderLight: 'rgba(240, 237, 232, 0.1)',
  borderBrand: 'rgba(123, 175, 142, 0.25)',

  // Overlays
  overlay: 'rgba(15, 18, 16, 0.75)',
  glassBg: 'rgba(28, 35, 32, 0.85)',
};

export const gradient = {
  brand: ['#7BAF8E', '#5C8A6A'] as [string, string],
  brandVertical: ['#7BAF8E', '#5C8A6A'] as [string, string],
  mint: ['#8ECFA5', '#7BBCC5'] as [string, string],
  amber: ['#D4A76A', '#C8956A'] as [string, string],
  danger: ['#CF7171', '#C98DB8'] as [string, string],
  card: ['rgba(240,237,232,0.04)', 'rgba(240,237,232,0.01)'] as [string, string],
  hero: ['#7BAF8E', '#7BBCC5', '#A594C9'] as [string, string, string],
  dark: ['#161B18', '#0F1210'] as [string, string],
  glow: ['rgba(123,175,142,0.1)', 'rgba(123,188,197,0.04)', 'transparent'] as [string, string, string],
  // Wellness-specific gradients
  calm: ['#7BAF8E', '#A594C9'] as [string, string],
  warmth: ['#D4A76A', '#C98DB8'] as [string, string],
  sunrise: ['#D4A76A', '#CF7171', '#A594C9'] as [string, string, string],
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const spacing = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
};

// iOS-native type scale (SF Pro sizes)
export const type = {
  hero: 34,
  display: 28,
  title: 22,
  subtitle: 17,
  body: 15,
  caption: 13,
  micro: 11,
};

export const font = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }) as string,
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }) as string,
  bold: Platform.select({ ios: 'System', android: 'sans-serif' }) as string,
};

// Standardized button vertical padding
export const button = {
  sm: 10,   // pill tags, compact actions
  md: 14,   // standard buttons
  lg: 18,   // hero CTAs, full-width actions
};

// Standardized info row padding
export const row = {
  compact: 6,
  standard: 10,
};

// Softer, ambient shadows — no harsh elevation
export const shadow = {
  sm: {
    shadowColor: '#0F1210',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1210',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F1210',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  }),
  softGlow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  }),
};

// iOS glass card — translucent, warm-tinted
export const card = {
  backgroundColor: 'rgba(28, 35, 32, 0.7)',
  borderRadius: radius.xl,
  borderWidth: 0.5,
  borderColor: 'rgba(240, 237, 232, 0.08)',
  padding: spacing.x5,
  ...shadow.sm,
};

// Accent card with soft glow border
export const glowCard = (color: string) => ({
  backgroundColor: 'rgba(28, 35, 32, 0.7)',
  borderRadius: radius.xl,
  borderWidth: 1,
  borderColor: color + '30',
  padding: spacing.x5,
  ...shadow.softGlow(color),
});
