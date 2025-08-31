import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { useTheme } from '../theme/utils';

export type ToolbarVariant = 'primary' | 'secondary' | 'ghost';
export type ToolbarSize = 'sm' | 'md' | 'lg';

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: ToolbarVariant;
  size?: ToolbarSize;
  orientation?: 'horizontal' | 'vertical';
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      orientation = 'horizontal',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
    };

    const sizeStyles = {
      sm: {
        padding: theme.spacing[2],
        gap: theme.spacing[1],
      },
      md: {
        padding: theme.spacing[3],
        gap: theme.spacing[2],
      },
      lg: {
        padding: theme.spacing[4],
        gap: theme.spacing[3],
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.surfaceElevated,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.elevation.sm,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        border: 'none',
      },
    };

    const toolbarStyle = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <div
        ref={ref}
        style={toolbarStyle}
        className={className}
        role="toolbar"
        {...props}
      >
        {children}
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';

// Toolbar Group component
interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  label?: string;
}

export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ children, label, className, style, ...props }, ref) => {
    const theme = useTheme();

    const groupStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[1],
      ...style,
    };

    const labelStyle = {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textMuted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginRight: theme.spacing[2],
    };

    return (
      <div
        ref={ref}
        style={groupStyle}
        className={className}
        role="group"
        aria-label={label}
        {...props}
      >
        {label && <span style={labelStyle}>{label}</span>}
        {children}
      </div>
    );
  }
);

ToolbarGroup.displayName = 'ToolbarGroup';

// Toolbar Separator component
interface ToolbarSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const ToolbarSeparator = forwardRef<
  HTMLDivElement,
  ToolbarSeparatorProps
>(({ orientation = 'vertical', className, style, ...props }, ref) => {
  const theme = useTheme();

  const separatorStyle = {
    backgroundColor: theme.colors.border,
    flexShrink: 0,
    ...(orientation === 'vertical'
      ? {
          width: '1px',
          height: theme.spacing[6],
        }
      : {
          height: '1px',
          width: theme.spacing[6],
        }),
    ...style,
  };

  return (
    <div
      ref={ref}
      style={separatorStyle}
      className={className}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
});

ToolbarSeparator.displayName = 'ToolbarSeparator';
