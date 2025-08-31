import {
  forwardRef,
  useState,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../theme/utils';
import { Button } from './Button';

interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, style, ...props }, ref) => {
    const theme = useTheme();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile screen size
    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkIsMobile();
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const layoutStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
      gridTemplateRows: 'auto 1fr',
      gridTemplateAreas: isMobile
        ? `
          "header"
          "main"
        `
        : `
          "sidebar header"
          "sidebar main"
        `,
      minHeight: '100vh',
      backgroundColor: theme.colors.surface,
      position: 'relative',
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      gridArea: 'header',
      backgroundColor: theme.colors.surfaceElevated,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: theme.spacing[4],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
    };

    const sidebarStyle: React.CSSProperties = {
      gridArea: isMobile ? 'unset' : 'sidebar',
      backgroundColor: theme.colors.surfaceElevated,
      borderRight: isMobile ? 'none' : `1px solid ${theme.colors.border}`,
      padding: theme.spacing[4],
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],
      // Mobile sidebar overlay styles
      ...(isMobile && {
        position: 'fixed',
        top: 0,
        left: isMobileSidebarOpen ? 0 : '-240px',
        width: '240px',
        height: '100vh',
        zIndex: 20,
        transition: `left ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
        boxShadow: isMobileSidebarOpen ? theme.elevation.lg : 'none',
      }),
    };

    const mainStyle: React.CSSProperties = {
      gridArea: 'main',
      padding: theme.spacing[6],
      overflow: 'auto',
    };

    const logoStyle: React.CSSProperties = {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing[6],
    };

    const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
      display: 'block',
      padding: theme.spacing[3],
      borderRadius: theme.borderRadius.md,
      textDecoration: 'none',
      color: isActive ? theme.colors.text : theme.colors.textSecondary,
      backgroundColor: isActive ? theme.colors.primary + '20' : 'transparent',
      border: isActive
        ? `1px solid ${theme.colors.primary}`
        : '1px solid transparent',
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    });

    // Mobile overlay to close sidebar when clicking outside
    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 15,
      display: isMobile && isMobileSidebarOpen ? 'block' : 'none',
    };

    const mobileMenuButtonStyle: React.CSSProperties = {
      display: isMobile ? 'block' : 'none',
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.lg,
      cursor: 'pointer',
      padding: theme.spacing[2],
      borderRadius: theme.borderRadius.base,
    };

    const handleNavClick = () => {
      if (isMobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    return (
      <div ref={ref} style={layoutStyle} className={className} {...props}>
        {/* Mobile overlay */}
        <div
          style={overlayStyle}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Sidebar Navigation */}
        <nav style={sidebarStyle}>
          <div style={logoStyle}>R-Ops</div>

          <NavLink
            to="/alerts"
            style={({ isActive }) => navLinkStyle(isActive)}
            onClick={handleNavClick}
          >
            🚨 Alert Management
          </NavLink>

          <NavLink
            to="/events"
            style={({ isActive }) => navLinkStyle(isActive)}
            onClick={handleNavClick}
          >
            📊 Event Management
          </NavLink>

          <NavLink
            to="/teams"
            style={({ isActive }) => navLinkStyle(isActive)}
            onClick={handleNavClick}
          >
            👥 Teams
          </NavLink>

          <NavLink
            to="/rules"
            style={({ isActive }) => navLinkStyle(isActive)}
            onClick={handleNavClick}
          >
            ⚙️ Rules Engine
          </NavLink>
        </nav>

        {/* Header */}
        <header style={headerStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[3],
            }}
          >
            <button
              style={mobileMenuButtonStyle}
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text,
              }}
            >
              Operations Dashboard
            </h1>
          </div>
          <Button variant="ghost" size="sm">
            Settings
          </Button>
        </header>

        {/* Main Content Area */}
        <main style={mainStyle}>
          <Outlet />
        </main>
      </div>
    );
  }
);

Layout.displayName = 'Layout';
