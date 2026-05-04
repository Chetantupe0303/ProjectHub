// Nexus / Vision & Logic Design System
// Grid, bounded, glassy with strong grid structure

export const colorPalette = {
  // Backgrounds
  background: {
    primary: '#F4F7FB',
    secondary: '#FAFCFF',
    tertiary: '#FDFEFF',
  },

  // Text
  text: {
    primary: '#000000',      // Absolute Black for max contrast
    secondary: '#0f172a',    // Deep Navy/Black
    tertiary: '#1e293b',     // Very Dark Slate
    inverse: '#ffffff',      // White text on dark
    muted: '#334155',        // Dark Slate (formerly muted grey)
  },

  // Primary - Balanced blue
  primary: {
    DEFAULT: '#4F7CFF',
    light: '#7AA2FF',
    dark: '#416DEB',
  },

  // Secondary - blue gray
  secondary: {
    DEFAULT: '#2B3A52',
    light: '#5F6B85',
    dark: '#1E293B',
  },

  // Tertiary - muted violet support
  tertiary: {
    DEFAULT: '#8E7CFF',
    light: '#A89BFF',
    dark: '#6F61E8',
  },

  // Accent
  accent: {
    DEFAULT: '#4F7CFF',
    light: '#7AA2FF',
    dark: '#416DEB',
  },

  // Semantic
  success: '#3FAE7A',
  warning: '#D9A441',
  error: '#D96B6B',
  info: '#5AA6E8',

  // Border
  border: '#D9E1EC',
  borderDark: '#273347',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  borderGradient: 'linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.06), rgba(79, 124, 255, 0.02))',

  // Surface
  surface: '#FAFCFF',
  surfaceDark: '#151E2D',

  // Light mode
  light: {
    background: '#F4F7FB',
    surface: '#FAFCFF',
    elevated: '#FDFEFF',
    text: '#172033',
    textMuted: '#5F6B85',
  },

  // Dark mode
  dark: {
    background: '#0F1724',
    surface: '#151E2D',
    elevated: '#1A2536',
    text: '#E7EEF8',
    textMuted: '#9AA8BF',
  },

  // Gradients
  gradient: {
    shell: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(244,247,251,0.95) 100%)',
    shellDark: 'linear-gradient(180deg, rgba(26,37,54,0.98) 0%, rgba(15,23,36,0.98) 100%)',
    border: 'linear-gradient(135deg, rgba(79,124,255,0.16) 0%, rgba(255,255,255,0.08) 100%)',
    glass: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px rgba(22, 32, 51, 0.04)',
    md: '0 6px 18px rgba(22, 32, 51, 0.08)',
    lg: '0 12px 24px rgba(22, 32, 51, 0.1)',
    xl: '0 18px 36px rgba(22, 32, 51, 0.12)',
    dark: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.22)',
      md: '0 8px 24px rgba(0, 0, 0, 0.28)',
      lg: '0 12px 28px rgba(0, 0, 0, 0.32)',
      xl: '0 16px 40px rgba(0, 0, 0, 0.36)',
    }
  },

  // Glass effect
  glass: {
    background: 'rgba(253, 254, 255, 0.75)',
    backgroundDark: 'rgba(21, 30, 45, 0.82)',
    border: '1px rgba(217, 225, 236, 0.9)',
    borderDark: '1px rgba(39, 51, 71, 0.9)',
    blur: 'blur(12px)',
  },
};

// Typography - Inter font family, bounded
export const typography = {
  fontFamily: {
    display: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.5rem',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    display: '56px',
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '-0.35px',
  },
};

// Border Radius - Tight system: 2px, 6px, 12px
export const borderRadius = {
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
  full: 9999,
};

// Transitions - Moderate motion: 150ms and 300ms
export const transitions = {
  fast: '150ms ease',
  normal: '150ms ease',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Role colors
export const roleColors = {
  admin: {
    primary: colorPalette.primary.DEFAULT,
    secondary: colorPalette.secondary.DEFAULT,
  },
  student: {
    primary: colorPalette.primary.DEFAULT,
    secondary: colorPalette.secondary.DEFAULT,
  },
};

// Spacing tokens based on 8px base rhythm
export const spacing = {
  base: 8,
  xs: 1,
  sm: 8,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  section: 24,
  card: 22,
  gap: 8,
};

// Icon sets
export const iconSets = {
  solar: {
    treatment: 'linear',
  },
};

export default {
  colorPalette,
  typography,
  borderRadius,
  transitions,
  roleColors,
  spacing,
  iconSets,
};
