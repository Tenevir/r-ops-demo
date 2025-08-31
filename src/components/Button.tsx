import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../theme/utils';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'base' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'base',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      border: 'none',
      borderRadius: theme.borderRadius.md,
      fontFamily: theme.typography.fontFamily.sans,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut}`,
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.5 : 1,
    };

    // Size styles
    const sizeStyles = {
      sm: {
        height: theme.component.button.height.sm,
        padding: theme.component.button.padding.sm,
        fontSize: theme.typography.fontSize.sm,
      },
      base: {
        height: theme.component.button.height.base,
        padding: theme.component.button.padding.base,
        fontSize: theme.typography.fontSize.base,
      },
      lg: {
        height: theme.component.button.height.lg,
        padding: theme.component.button.padding.lg,
        fontSize: theme.typography.fontSize.lg,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.black[950],
      },
      secondary: {
        backgroundColor: theme.colors.surfaceElevated,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.colors.textSecondary,
      },
      danger: {
        backgroundColor: theme.colors.error,
        color: theme.colors.text,
      },
      warning: {
        backgroundColor: '#f59e0b',
        color: '#ffffff',
      },
    };

    const buttonStyle = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={buttonStyle}
        className={className}
        {...props}
      >
        {loading ? (
          <>
            <div
              style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
