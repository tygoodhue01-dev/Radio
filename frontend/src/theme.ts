// Theme constants for The Beat 515
export const Colors = {
  // Core backgrounds
  background: '#09090b',
  surface: '#18181b',
  surfaceLight: '#27272a',
  surfaceGlass: 'rgba(24,24,27,0.85)',
  
  // Brand colors
  primary: '#FF007F',
  primaryLight: '#FF3399',
  primaryDark: '#CC0066',
  secondary: '#00F0FF',
  secondaryLight: '#66F7FF',
  accent: '#FFF000',
  accentDim: '#CCB800',
  
  // Text colors
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  
  // Borders
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.15)',
  borderActive: 'rgba(255,0,127,0.5)',
  borderCyan: 'rgba(0,240,255,0.3)',
  borderGlow: 'rgba(255,0,127,0.4)',
  
  // Status colors
  error: '#ef4444',
  success: '#22c55e',
  warning: '#FFF000',
  info: '#3b82f6',
  
  // Gradient colors
  gradientPink: '#FF007F',
  gradientPurple: '#9D4CDD',
  gradientCyan: '#00F0FF',
  gradientBlue: '#3b82f6',
  
  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.4)',
  overlayDark: 'rgba(0,0,0,0.8)',
  
  // Glassmorphism
  glassLight: 'rgba(255,255,255,0.05)',
  glassDark: 'rgba(0,0,0,0.3)',
  glassAccent: 'rgba(255,0,127,0.08)',
  glassCyan: 'rgba(0,240,255,0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
  giant: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 999,
};

// Shadow presets for different elevations
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cyanGlow: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};
