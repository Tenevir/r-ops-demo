import { useContext } from 'react';
import { createContext } from 'react';
import type { Theme } from './tokens';

// Theme Context
export const ThemeContext = createContext<Theme | undefined>(undefined);

// Hook to use theme
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// CSS-in-JS utility function
export const css = (styles: Record<string, string | number>): string => {
  return Object.entries(styles)
    .map(([property, value]) => {
      // Convert camelCase to kebab-case
      const kebabProperty = property.replace(
        /[A-Z]/g,
        (match) => `-${match.toLowerCase()}`
      );
      return `${kebabProperty}: ${value}`;
    })
    .join('; ');
};

// Utility to create component styles with theme
export const createStyles = (
  stylesFn: (theme: Theme) => Record<string, Record<string, string | number>>
) => {
  return (theme: Theme) => {
    const styles = stylesFn(theme);
    const cssClasses: Record<string, string> = {};

    Object.entries(styles).forEach(([key, value]) => {
      cssClasses[key] = css(value);
    });

    return cssClasses;
  };
};

// Media query helper
export const mediaQuery = (breakpoint: keyof Theme['breakpoints']) => {
  return (theme: Theme) =>
    `@media (min-width: ${theme.breakpoints[breakpoint]})`;
};
