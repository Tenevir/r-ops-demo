// Design Tokens - Jony Ive Inspired Black/Yellow Theme
// Focus on simplicity, high contrast, and purposeful design

export const colors = {
  // Primary Colors - Black & Yellow
  black: {
    50: '#f7f7f7',
    100: '#e8e8e8',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6d6d6d',
    600: '#5d5d5d',
    700: '#4f4f4f',
    800: '#454545',
    900: '#3d3d3d',
    950: '#000000', // Pure black for maximum contrast
  },

  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15', // Primary yellow
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // Semantic Colors
  primary: '#facc15', // Yellow 400
  primaryDark: '#ca8a04', // Yellow 600
  surface: '#000000', // Pure black
  surfaceElevated: '#1a1a1a',
  surfaceHover: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#e8e8e8',
  textMuted: '#b0b0b0',
  border: '#3d3d3d',
  borderFocus: '#facc15',

  // Status Colors (high contrast)
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Alert Priority Colors
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#facc15',
  low: '#22c55e',
};

export const typography = {
  // Font families - System fonts for performance and consistency
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      'avenir next',
      'avenir',
      'segoe ui',
      'helvetica neue',
      'helvetica',
      'Cantarell',
      'Ubuntu',
      'roboto',
      'noto',
      'arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'SF Mono',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ].join(', '),
  },

  // Font sizes - Harmonious scale
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

export const spacing = {
  // Spacing scale - 8px base grid for consistency
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  base: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

export const elevation = {
  // Box shadows for depth - subtle and purposeful
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Yellow glow for focus states
  focusYellow: '0 0 0 3px rgb(250 204 21 / 0.4)',

  // Alert shadows
  criticalGlow: '0 0 0 1px rgb(220 38 38 / 0.5)',
  successGlow: '0 0 0 1px rgb(34 197 94 / 0.5)',
};

export const animation = {
  // Transition durations - smooth and purposeful
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  // Easing functions
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific tokens
export const component = {
  button: {
    height: {
      sm: spacing[8], // 32px
      base: spacing[10], // 40px
      lg: spacing[12], // 48px
    },
    padding: {
      sm: `${spacing[1.5]} ${spacing[3]}`,
      base: `${spacing[2.5]} ${spacing[4]}`,
      lg: `${spacing[3]} ${spacing[6]}`,
    },
  },

  card: {
    padding: spacing[6], // 24px
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    border: `1px solid ${colors.border}`,
  },

  modal: {
    overlay: 'rgba(0, 0, 0, 0.8)',
    maxWidth: '32rem', // 512px
    borderRadius: borderRadius.xl,
  },
};

// Export the complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  animation,
  breakpoints,
  component,
} as const;

export type Theme = typeof theme;
