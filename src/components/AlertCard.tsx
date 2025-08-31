import React, { useState } from 'react';
import type { Alert } from '../types';
import { useTheme } from '../theme/utils';
import { useAlerts } from '../hooks/useAlerts';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

interface AlertCardProps {
  alert: Alert;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showBulkSelect?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  isSelected = false, 
  onSelect,
  showBulkSelect = false 
}) => {
  const theme = useTheme();
  const { acknowledgeAlert, resolveAlert, escalateAlert } = useAlerts();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const getSeverityColor = (severity: Alert['severity']): string => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return theme.colors.primary;
      case 'info': return '#10b981';
      case 'low': return '#6b7280';
      default: return theme.colors.textMuted;
    }
  };

  const getStatusColor = (status: Alert['status']): string => {
    switch (status) {
      case 'active': return '#ef4444';
      case 'acknowledged': return theme.colors.primary;
      case 'resolved': return '#10b981';
      default: return theme.colors.textMuted;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleAction = async (action: 'acknowledge' | 'resolve' | 'escalate') => {
    setIsProcessing(action);
    try {
      switch (action) {
        case 'acknowledge':
          await acknowledgeAlert(alert.id);
          break;
        case 'resolve':
          await resolveAlert(alert.id);
          break;
        case 'escalate':
          await escalateAlert(alert.id);
          break;
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
    } finally {
      setIsProcessing(null);
    }
  };

  const cardStyle: React.CSSProperties = {
    cursor: showBulkSelect ? 'pointer' : 'default',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
    opacity: alert.status === 'resolved' ? 0.7 : 1,
    backgroundColor: isSelected ? theme.colors.primary + '10' : undefined,
    border: isSelected ? `2px solid ${theme.colors.primary}` : undefined,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  };

  const statusIndicatorStyle: React.CSSProperties = {
    width: theme.spacing[3],
    height: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor: getSeverityColor(alert.severity),
    flexShrink: 0,
  };

  const statusBadgeStyle: React.CSSProperties = {
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    color: '#ffffff',
    backgroundColor: getStatusColor(alert.status),
    letterSpacing: '0.025em',
  };

  const metadataStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[3],
  };

  const descriptionStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[4],
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    accentColor: theme.colors.primary,
    cursor: 'pointer',
  };

  const shouldShowActions = alert.status !== 'resolved';

  return (
    <Card 
      variant="elevated" 
      hover={showBulkSelect}
      style={cardStyle}
      onClick={showBulkSelect && onSelect ? () => onSelect(alert.id) : undefined}
      role={showBulkSelect ? 'button' : undefined}
      tabIndex={showBulkSelect ? 0 : undefined}
      onKeyDown={showBulkSelect && onSelect ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(alert.id);
        }
      } : undefined}
      aria-label={showBulkSelect ? `Select alert: ${alert.title}` : undefined}
    >
      <CardHeader>
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            {showBulkSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect?.(alert.id);
                }}
                style={checkboxStyle}
                aria-label={`Select ${alert.title}`}
              />
            )}
            <div style={statusIndicatorStyle} aria-hidden="true" />
            <CardTitle style={{ margin: 0, flex: 1 }}>
              {alert.title}
            </CardTitle>
          </div>
          <div style={statusBadgeStyle}>
            {alert.status}
          </div>
        </div>
        
        <div style={metadataStyle}>
          <span>Severity: {alert.severity}</span>
          <span aria-hidden="true">•</span>
          <span>{formatTimestamp(alert.createdAt)}</span>
          {alert.source && (
            <>
              <span aria-hidden="true">•</span>
              <span>Source: {alert.source}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p style={descriptionStyle}>
          {alert.description}
        </p>

        {alert.metadata && Object.keys(alert.metadata).length > 0 && (
          <div style={{
            marginBottom: theme.spacing[4],
            padding: theme.spacing[3],
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text,
              marginBottom: theme.spacing[2],
            }}>
              Additional Details:
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: theme.spacing[2],
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textSecondary,
            }}>
              {Object.entries(alert.metadata).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        {shouldShowActions && (
          <div style={actionsStyle}>
            {alert.status === 'active' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('acknowledge');
                }}
                loading={isProcessing === 'acknowledge'}
                disabled={!!isProcessing}
              >
                {isProcessing === 'acknowledge' ? 'Acknowledging...' : 'Acknowledge'}
              </Button>
            )}
            
            {(alert.status === 'active' || alert.status === 'acknowledged') && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('resolve');
                }}
                loading={isProcessing === 'resolve'}
                disabled={!!isProcessing}
              >
                {isProcessing === 'resolve' ? 'Resolving...' : 'Resolve'}
              </Button>
            )}
            
            {alert.severity !== 'critical' && alert.status === 'active' && (
              <Button
                variant="warning"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('escalate');
                }}
                loading={isProcessing === 'escalate'}
                disabled={!!isProcessing}
              >
                {isProcessing === 'escalate' ? 'Escalating...' : 'Escalate'}
              </Button>
            )}
          </div>
        )}

        {alert.status === 'resolved' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            color: '#10b981',
            fontWeight: theme.typography.fontWeight.medium,
          }}>
            <span>✓</span>
            <span>Resolved {alert.resolvedAt ? formatTimestamp(alert.resolvedAt) : ''}</span>
            {alert.resolvedBy && <span>by {alert.resolvedBy}</span>}
          </div>
        )}

        {alert.status === 'acknowledged' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.primary,
            fontWeight: theme.typography.fontWeight.medium,
          }}>
            <span>👀</span>
            <span>Acknowledged {alert.acknowledgedAt ? formatTimestamp(alert.acknowledgedAt) : ''}</span>
            {alert.acknowledgedBy && <span>by {alert.acknowledgedBy}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};