import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Toolbar,
  ToolbarGroup,
} from '../components';
import { useTheme } from '../theme/utils';

export const AlertManagement = () => {
  const theme = useTheme();

  const pageHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[8],
  };

  const statusIndicatorStyle = (
    severity: 'critical' | 'warning' | 'info'
  ): React.CSSProperties => ({
    width: theme.spacing[3],
    height: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor:
      severity === 'critical'
        ? '#ef4444'
        : severity === 'warning'
          ? theme.colors.primary
          : '#10b981',
    marginRight: theme.spacing[2],
  });

  return (
    <div>
      <header style={pageHeaderStyle}>
        <h1 style={titleStyle}>Alert Management</h1>
        <Button variant="primary">Create Alert</Button>
      </header>

      <Toolbar style={{ marginBottom: theme.spacing[6] }}>
        <ToolbarGroup label="Filter">
          <Button variant="ghost" size="sm">
            All Alerts
          </Button>
          <Button variant="ghost" size="sm">
            Critical
          </Button>
          <Button variant="ghost" size="sm">
            Active
          </Button>
        </ToolbarGroup>
      </Toolbar>

      <div style={gridStyle}>
        <Card variant="elevated" hover>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <div style={statusIndicatorStyle('critical')}></div>
              Database Connection Lost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              style={{
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing[3],
              }}
            >
              Primary database connection has been lost. Automatic failover
              initiated.
            </p>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing[2],
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}
            >
              <span>Severity: Critical</span>
              <span>•</span>
              <span>2 minutes ago</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <div style={statusIndicatorStyle('warning')}></div>
              High CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              style={{
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing[3],
              }}
            >
              Server CPU usage has exceeded 85% for the past 15 minutes.
            </p>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing[2],
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}
            >
              <span>Severity: Warning</span>
              <span>•</span>
              <span>15 minutes ago</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" hover>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
              <div style={statusIndicatorStyle('info')}></div>
              Deployment Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              style={{
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing[3],
              }}
            >
              Application version 2.1.4 has been successfully deployed to
              production.
            </p>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing[2],
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
              }}
            >
              <span>Severity: Info</span>
              <span>•</span>
              <span>1 hour ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: theme.spacing[4],
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: '#ef4444',
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Critical
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary,
                }}
              >
                7
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Warning
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: '#10b981',
                }}
              >
                12
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Resolved Today
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
