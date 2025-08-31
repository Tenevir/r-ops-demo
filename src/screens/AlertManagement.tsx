import React, { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  AlertCard,
  AlertFilter,
  BulkActionToolbar,
  ScreenReaderAnnouncement,
} from '../components';
import { useTheme } from '../theme/utils';
import { useAlerts } from '../hooks/useAlerts';

export const AlertManagement = () => {
  const theme = useTheme();
  const {
    alerts,
    isLoading,
    selectedAlerts,
    filters,
    toggleSelectAlert,
    createAlert,
  } = useAlerts();

  const [showBulkSelect, setShowBulkSelect] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(alert.status)) {
        return false;
      }

      // Severity filter
      if (
        filters.severity.length > 0 &&
        !filters.severity.includes(alert.severity)
      ) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          alert.title.toLowerCase().includes(query) ||
          alert.description.toLowerCase().includes(query) ||
          alert.source?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [alerts, filters]);

  // Calculate statistics for the stats card
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return {
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      resolvedToday: alerts.filter(
        (a) =>
          a.status === 'resolved' &&
          a.resolvedAt &&
          new Date(a.resolvedAt) >= todayStart
      ).length,
      total: alerts.length,
      active: alerts.filter((a) => a.status === 'active').length,
      acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    };
  }, [alerts]);

  const handleCreateAlert = async () => {
    try {
      await createAlert({
        title: 'New Alert',
        description: 'This is a new manually created alert.',
        severity: 'warning',
        status: 'active',
        source: 'manual',
        tags: ['manual', 'demo'],
        updatedAt: new Date().toISOString(),
        relatedEvents: [],
        metadata: {
          createdBy: 'current-user',
          category: 'manual',
        },
      });
      setAnnouncement('New alert created successfully');
    } catch (error) {
      console.error('Error creating alert:', error);
      setAnnouncement('Failed to create alert. Please try again.');
    }
  };

  const handleNavigateToRule = (ruleId: string) => {
    // In a real app, this would navigate to the rules screen
    // For now, we'll just show an announcement
    setAnnouncement(`Navigating to rule: ${ruleId}`);
    console.log('Navigate to rule:', ruleId);
  };

  const pageHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    margin: 0,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[3],
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: theme.spacing[8],
    color: theme.colors.textSecondary,
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
    color: theme.colors.textSecondary,
  };

  if (isLoading) {
    return (
      <div>
        <header style={pageHeaderStyle}>
          <h1 style={titleStyle}>Alert Management</h1>
        </header>
        <div style={loadingStyle}>
          <div>Loading alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenReaderAnnouncement message={announcement} priority="assertive" />
      <header style={pageHeaderStyle}>
        <h1 style={titleStyle}>Alert Management</h1>
        <div style={actionsStyle}>
          <Button
            variant={showBulkSelect ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setShowBulkSelect(!showBulkSelect);
              setAnnouncement(
                showBulkSelect
                  ? 'Bulk selection disabled'
                  : 'Bulk selection enabled'
              );
            }}
            aria-label="Toggle bulk selection mode"
          >
            {showBulkSelect ? 'Exit Bulk Mode' : 'Bulk Select'}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateAlert}
            aria-label="Create new alert"
          >
            Create Alert
          </Button>
        </div>
      </header>

      <AlertFilter />

      {showBulkSelect && <BulkActionToolbar />}

      {filteredAlerts.length === 0 ? (
        <div style={emptyStateStyle}>
          <div
            style={{
              fontSize: theme.typography.fontSize.xl,
              marginBottom: theme.spacing[2],
            }}
          >
            {alerts.length === 0 ? '🎉' : '🔍'}
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              marginBottom: theme.spacing[2],
            }}
          >
            {alerts.length === 0 ? 'No Alerts' : 'No Matching Alerts'}
          </div>
          <div>
            {alerts.length === 0
              ? 'All systems are running smoothly!'
              : 'Try adjusting your filters to see more alerts.'}
          </div>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedAlerts.has(alert.id)}
              onSelect={showBulkSelect ? toggleSelectAlert : undefined}
              showBulkSelect={showBulkSelect}
              onNavigateToRule={handleNavigateToRule}
            />
          ))}
        </div>
      )}

      <Card style={{ marginTop: theme.spacing[8] }}>
        <CardHeader>
          <CardTitle>Alert Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
                {stats.critical}
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
                {stats.warning}
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
                {stats.resolvedToday}
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
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text,
                }}
              >
                {stats.active}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Active
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.textSecondary,
                }}
              >
                {stats.acknowledged}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Acknowledged
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text,
                }}
              >
                {stats.total}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
