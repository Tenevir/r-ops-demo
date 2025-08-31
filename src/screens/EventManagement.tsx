import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '../components';
import { useTheme } from '../theme/utils';

export const EventManagement = () => {
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

  const eventTimelineStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  };

  const eventItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
  };

  const eventTimeStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    minWidth: '80px',
    fontFamily: 'monospace',
  };

  return (
    <div>
      <header style={pageHeaderStyle}>
        <h1 style={titleStyle}>Event Management</h1>
        <Button variant="primary">Export Events</Button>
      </header>

      <Toolbar style={{ marginBottom: theme.spacing[6] }}>
        <ToolbarGroup label="Time Range">
          <Button variant="ghost" size="sm">
            Last Hour
          </Button>
          <Button variant="ghost" size="sm">
            Last 24h
          </Button>
          <Button variant="ghost" size="sm">
            Last Week
          </Button>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup label="Type">
          <Button variant="ghost" size="sm">
            System
          </Button>
          <Button variant="ghost" size="sm">
            Application
          </Button>
          <Button variant="ghost" size="sm">
            Security
          </Button>
        </ToolbarGroup>
      </Toolbar>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={eventTimelineStyle}>
            <div style={eventItemStyle}>
              <div style={eventTimeStyle}>14:32:15</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  User Login Successful
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  User admin@company.com successfully logged in from
                  192.168.1.100
                </div>
              </div>
              <div
                style={{
                  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                  backgroundColor: '#10b981' + '20',
                  color: '#10b981',
                  borderRadius: theme.borderRadius.base,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                AUTH
              </div>
            </div>

            <div style={eventItemStyle}>
              <div style={eventTimeStyle}>14:31:42</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  Database Query Slow
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Query execution time: 2.4s (threshold: 1.0s) - SELECT * FROM
                  events
                </div>
              </div>
              <div
                style={{
                  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                  backgroundColor: theme.colors.primary + '20',
                  color: theme.colors.primary,
                  borderRadius: theme.borderRadius.base,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                PERF
              </div>
            </div>

            <div style={eventItemStyle}>
              <div style={eventTimeStyle}>14:30:18</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  Service Restart
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  API Gateway service restarted successfully after configuration
                  update
                </div>
              </div>
              <div
                style={{
                  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                  backgroundColor: '#6366f1' + '20',
                  color: '#6366f1',
                  borderRadius: theme.borderRadius.base,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                SYSTEM
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing[6],
        }}
      >
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing[4],
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                  }}
                >
                  1,247
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Today
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text,
                  }}
                >
                  98.7%
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                  }}
                >
                  Processed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Top Event Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing[3],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  API Gateway
                </span>
                <span
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                  }}
                >
                  45%
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Database
                </span>
                <span
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                  }}
                >
                  28%
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Authentication
                </span>
                <span
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text,
                  }}
                >
                  17%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
