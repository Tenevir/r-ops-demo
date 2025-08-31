import React from 'react';
import type { Event } from '../types';
import { useTheme } from '../theme/utils';
import { useEvents } from '../hooks/useEvents';
import { Button, Card, CardHeader, CardTitle, CardContent, Modal, ModalHeader, ModalBody, ModalFooter } from './';

interface EventDetailsPanelProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({ 
  event, 
  isOpen, 
  onClose 
}) => {
  const theme = useTheme();
  const { promoteToAlert } = useEvents();

  if (!event) return null;

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

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

  const handlePromoteToAlert = async () => {
    try {
      const alert = await promoteToAlert(event.id);
      if (alert) {
        console.log(`Event promoted to alert: ${alert.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error promoting event:', error);
    }
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: theme.spacing[4],
  };

  const labelStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
    display: 'block',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  const codeStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: theme.typography.fontSize.xs,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxHeight: '200px',
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    color: '#ffffff',
    backgroundColor: color,
    letterSpacing: '0.025em',
    marginRight: theme.spacing[2],
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}>
            <h2 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text,
            }}>
              Event Details
            </h2>
            <div style={badgeStyle(getTypeColor(event.type))}>
              {event.type}
            </div>
            <div style={badgeStyle(getSeverityColor(event.severity))}>
              {event.severity}
            </div>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[4],
          maxHeight: '70vh',
          overflow: 'auto',
        }}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={fieldStyle}>
                <label style={labelStyle}>Event ID</label>
                <div style={{ ...valueStyle, fontFamily: 'monospace' }}>{event.id}</div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Summary</label>
                <div style={valueStyle}>{event.summary || 'No summary provided'}</div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Description</label>
                <div style={valueStyle}>{event.description}</div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Source</label>
                <div style={valueStyle}>{event.source}</div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing[4],
              }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Created At</label>
                  <div style={valueStyle}>{formatTimestamp(event.createdAt)}</div>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Updated At</label>
                  <div style={valueStyle}>{formatTimestamp(event.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{
                  display: 'flex',
                  gap: theme.spacing[1],
                  flexWrap: 'wrap',
                }}>
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                        backgroundColor: theme.colors.primary + '20',
                        color: theme.colors.primary,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: theme.spacing[3],
                }}>
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} style={fieldStyle}>
                      <label style={labelStyle}>{key}</label>
                      <div style={valueStyle}>
                        {typeof value === 'object' 
                          ? JSON.stringify(value, null, 2)
                          : String(value)
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Payload */}
          {event.payload && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <pre style={codeStyle}>
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Promotion Status */}
          {event.promoted && event.promotedAlertId && (
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#10b981' }}>✓ Promoted to Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Alert ID</label>
                  <div style={{ ...valueStyle, fontFamily: 'monospace' }}>
                    {event.promotedAlertId}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Information */}
          {event.ruleId && (
            <Card>
              <CardHeader>
                <CardTitle>Related Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Rule ID</label>
                  <div style={{ ...valueStyle, fontFamily: 'monospace' }}>
                    {event.ruleId}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <div style={{
          display: 'flex',
          gap: theme.spacing[3],
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            gap: theme.spacing[2],
          }}>
            {!event.promoted && (
              <Button
                variant="primary"
                onClick={handlePromoteToAlert}
                aria-label={`Promote ${event.summary || event.type} to alert`}
              >
                Promote to Alert
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};