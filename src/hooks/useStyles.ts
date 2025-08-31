import { useMemo } from 'react';
import { useTheme } from '../theme/utils';
import type { Theme } from '../theme/tokens';

// Custom hook for component styles
export const useStyles = (
  stylesFactory: (theme: Theme) => Record<string, () => React.CSSProperties>
) => {
  const theme = useTheme();

  return useMemo(() => {
    const stylesObject = stylesFactory(theme);
    const resolvedStyles: Record<string, React.CSSProperties> = {};

    Object.entries(stylesObject).forEach(([key, styleFunction]) => {
      resolvedStyles[key] = styleFunction();
    });

    return resolvedStyles;
  }, [theme, stylesFactory]);
};

// Utility for responsive styles
export const responsive =
  (
    mobile: React.CSSProperties,
    tablet?: React.CSSProperties,
    desktop?: React.CSSProperties
  ) =>
  (theme: Theme): React.CSSProperties => {
    let styles = { ...mobile };

    if (tablet) {
      styles = {
        ...styles,
        [`@media (min-width: ${theme.breakpoints.md})`]: tablet,
      };
    }

    if (desktop) {
      styles = {
        ...styles,
        [`@media (min-width: ${theme.breakpoints.lg})`]: desktop,
      };
    }

    return styles;
  };

// Utility for hover states
export const hover = (styles: React.CSSProperties) => styles;

// Utility for focus states
export const focus = (theme: Theme) => ({
  outline: 'none',
  boxShadow: theme.elevation.focusYellow,
});

// Utility for active states
export const active = (styles: React.CSSProperties) => styles;

// Utility for disabled states
export const disabled = (theme: Theme) => ({
  opacity: '0.5',
  cursor: 'not-allowed',
  color: theme.colors.textMuted,
});
