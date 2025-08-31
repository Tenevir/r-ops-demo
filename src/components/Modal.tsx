import {
  forwardRef,
  useEffect,
  useRef,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../theme/utils';

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClose'> {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    children,
    isOpen,
    onClose,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    size = 'md',
    className,
    style,
    ...props
  }) => {
    const theme = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Lock body scroll
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.component.modal.overlay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: theme.spacing[4],
      animation: `fadeIn ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
    };

    const sizeStyles = {
      sm: { maxWidth: '24rem' },
      md: { maxWidth: '32rem' },
      lg: { maxWidth: '48rem' },
      xl: { maxWidth: '64rem' },
      full: { maxWidth: '90vw' },
    };

    const modalStyle: React.CSSProperties = {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.component.modal.borderRadius,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.elevation['2xl'],
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: `slideUp ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
      ...sizeStyles[size],
      ...style,
    };

    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    const modalContent = (
      <div style={overlayStyle} onClick={handleOverlayClick}>
        <div
          ref={modalRef}
          style={modalStyle}
          className={className}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

// Modal Header component
interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onClose?: () => void;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, onClose, className, style, ...props }, ref) => {
    const theme = useTheme();

    const headerStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${theme.spacing[6]} ${theme.spacing[6]} 0 ${theme.spacing[6]}`,
      marginBottom: theme.spacing[4],
      ...style,
    };

    const closeButtonStyle = {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.textSecondary,
      cursor: 'pointer',
      padding: theme.spacing[1],
      borderRadius: theme.borderRadius.base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: theme.typography.fontSize.xl,
    };

    return (
      <div ref={ref} style={headerStyle} className={className} {...props}>
        {children}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

// Modal Body component
interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();

    const bodyStyle = {
      padding: `0 ${theme.spacing[6]} ${theme.spacing[4]} ${theme.spacing[6]}`,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeight.relaxed,
      ...style,
    };

    return (
      <div ref={ref} style={bodyStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

// Modal Footer component
interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();

    const footerStyle = {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: theme.spacing[3],
      padding: `0 ${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[6]}`,
      borderTop: `1px solid ${theme.colors.border}`,
      marginTop: theme.spacing[4],
      paddingTop: theme.spacing[4],
      ...style,
    };

    return (
      <div ref={ref} style={footerStyle} className={className} {...props}>
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';
