import React, { type ReactNode } from 'react';
import { theme, type Theme } from './tokens';
import { ThemeContext } from './utils';

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  customTheme?: Partial<Theme>;
}

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  customTheme,
}) => {
  // Merge custom theme with default theme if provided
  const mergedTheme = customTheme ? { ...theme, ...customTheme } : theme;

  return (
    <ThemeContext.Provider value={mergedTheme}>
      <div
        style={{
          backgroundColor: mergedTheme.colors.surface,
          color: mergedTheme.colors.text,
          fontFamily: mergedTheme.typography.fontFamily.sans,
          fontSize: mergedTheme.typography.fontSize.base,
          lineHeight: mergedTheme.typography.lineHeight.normal,
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
