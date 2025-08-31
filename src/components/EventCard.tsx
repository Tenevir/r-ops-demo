import React, { useState } from 'react';
import type { Event } from '../types';
import { useTheme } from '../theme/utils';
import { useEvents } from '../hooks/useEvents';
import { Button, Card, CardHeader, CardTitle, CardContent } from './';

interface EventCardProps {
  event: Event;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onShowDetails?: (event: Event) => void;
  showBulkSelect?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isSelected = false, 
  onSelect,
  onShowDetails,
  showBulkSelect = false 
}) => {
  const theme = useTheme();
  const { promoteToAlert } = useEvents();
  const [isPromoting, setIsPromoting] = useState(false);

  const getTypeColor = (type: Event['type']): string => {
    switch (type) {
      case 'system': return '#6366f1';
      case 'application': return theme.colors.primary;
      case 'security': return '#ef4444';
      case 'performance': return '#f59e0b';
      default: return theme.colors.textMuted;
    }
  };

  const getSeverityColor = (severity: Event['severity']): string => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return theme.colors.primary;
      case 'info': return '#0284c7';
      case 'low': return '#10b981';
      default: return theme.colors.textMuted;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDetailedTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handlePromote = async () => {
    setIsPromoting(true);
    try {
      const alert = await promoteToAlert(event.id);
      if (alert) {
        console.log(`Event ${event.id} promoted to alert ${alert.id}`);
      }
    } catch (error) {
      console.error('Error promoting event:', error);
    } finally {
      setIsPromoting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    cursor: showBulkSelect ? 'pointer' : 'default',
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
    borderLeft: `4px solid ${getTypeColor(event.type)}`,
    opacity: event.promoted ? 0.6 : 1,
    backgroundColor: isSelected ? theme.colors.primary + '10' : undefined,
    border: isSelected ? `2px solid ${theme.colors.primary}` : undefined,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
    gap: theme.spacing[2],
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    color: '#ffffff',
    backgroundColor: color,
    letterSpacing: '0.025em',
  });

  const metadataStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[3],
    flexWrap: 'wrap',
  };

  const descriptionStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[3],
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    accentColor: theme.colors.primary,
    cursor: 'pointer',
  };

  const shouldShowPromote = !event.promoted;

  return (
    <Card 
      variant="elevated" 
      hover={showBulkSelect}
      style={cardStyle}
      onClick={showBulkSelect && onSelect ? () => onSelect(event.id) : undefined}
      role={showBulkSelect ? 'button' : undefined}
      tabIndex={showBulkSelect ? 0 : undefined}
      onKeyDown={showBulkSelect && onSelect ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(event.id);
        }
      } : undefined}
      aria-label={showBulkSelect ? `Select event: ${event.summary || event.type}` : undefined}
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
                  onSelect?.(event.id);
                }}
                style={checkboxStyle}
                aria-label={`Select ${event.summary || event.type}`}
              />
            )}
            <CardTitle style={{ margin: 0, flex: 1 }}>
              {event.summary || `${event.type} Event`}
            </CardTitle>
          </div>
          <div style={{
            display: 'flex',
            gap: theme.spacing[1],
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={badgeStyle(getTypeColor(event.type))}>
              {event.type}
            </div>
            <div style={badgeStyle(getSeverityColor(event.severity))}>
              {event.severity}
            </div>
          </div>
        </div>
        
        <div style={metadataStyle}>
          <span title={formatDetailedTimestamp(event.createdAt)}>
            {formatTimestamp(event.createdAt)}
          </span>
          <span aria-hidden="true">•</span>
          <span>Source: {event.source}</span>
          {event.ruleId && (
            <>
              <span aria-hidden="true">•</span>
              <span>Rule: {event.ruleId}</span>
            </>
          )}
          {event.promoted && (
            <>
              <span aria-hidden="true">•</span>
              <span style={{ color: '#10b981', fontWeight: theme.typography.fontWeight.medium }}>
                ✓ Promoted
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p style={descriptionStyle}>
          {event.description}
        </p>

        {event.tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: theme.spacing[1],
            marginBottom: theme.spacing[3],
            flexWrap: 'wrap',
          }}>
            {event.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: `${theme.spacing[0.5]} ${theme.spacing[1.5]}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.textSecondary,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.fontSize.xs,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={actionsStyle}>
          <div style={{
            display: 'flex',
            gap: theme.spacing[2],
          }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails?.(event);
              }}
              aria-label={`View details for ${event.summary || event.type}`}
            >
              View Details
            </Button>
            
            {shouldShowPromote && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromote();
                }}
                loading={isPromoting}
                disabled={isPromoting}
                aria-label={`Promote ${event.summary || event.type} to alert`}
              >
                {isPromoting ? 'Promoting...' : 'Promote to Alert'}
              </Button>
            )}
          </div>

          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textMuted,
            fontFamily: 'monospace',
          }}>
            ID: {event.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};