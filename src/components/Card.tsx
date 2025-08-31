import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { useTheme } from '../theme/utils';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof import('../theme/tokens').spacing;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = '6',
      hover = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const baseStyles: React.CSSProperties = {
      borderRadius: theme.borderRadius.lg,
      transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
      padding: theme.spacing[padding as keyof typeof theme.spacing],
      cursor: hover ? 'pointer' : 'default',
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.surfaceElevated,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.elevation.sm,
      },
      elevated: {
        backgroundColor: theme.colors.surfaceElevated,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.elevation.lg,
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: 'none',
      },
      ghost: {
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      },
    };

    const cardStyle = {
      ...baseStyles,
      ...variantStyles[variant],
      ...style,
    };

    return (
      <div ref={ref} style={cardStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();

    const headerStyle = {
      marginBottom: theme.spacing[4],
      paddingBottom: theme.spacing[3],
      borderBottom: `1px solid ${theme.colors.border}`,
      ...style,
    };

    return (
      <div ref={ref} style={headerStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title component
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();

    const titleStyle = {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      margin: '0',
      ...style,
    };

    return (
      <h3 ref={ref} style={titleStyle} className={className} {...props}>
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Content component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();

    const contentStyle = {
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.relaxed,
      ...style,
    };

    return (
      <div ref={ref} style={contentStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';
