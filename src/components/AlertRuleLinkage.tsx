import React, { useMemo, useState } from 'react';
import type { Alert, Rule, AlertRuleLinkage as LinkageType } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent, Button } from './';
import { dataStore } from '../data';

interface AlertRuleLinkageProps {
  alert?: Alert | null;
  rule?: Rule | null;
  onNavigateToAlert?: (alertId: string) => void;
  onNavigateToRule?: (ruleId: string) => void;
  onClose?: () => void;
}

export const AlertRuleLinkage: React.FC<AlertRuleLinkageProps> = ({
  alert,
  rule,
  onNavigateToAlert,
  onNavigateToRule,
  onClose,
}) => {
  const theme = useTheme();
  const [selectedLinkage, setSelectedLinkage] = useState<LinkageType | null>(
    null
  );

  const linkages = useMemo(() => {
    if (alert) {
      return dataStore.getAlertRuleLinkages(alert.id);
    } else if (rule) {
      return dataStore.getAlertRuleLinkages(undefined, rule.id);
    }
    return [];
  }, [alert, rule]);

  const relatedRules = useMemo(() => {
    if (!alert) return [];

    const ruleIds = linkages.map((link) => link.ruleId);
    return ruleIds
      .map((ruleId) => dataStore.getRuleById(ruleId))
      .filter(Boolean) as Rule[];
  }, [alert, linkages]);

  const relatedAlerts = useMemo(() => {
    if (!rule) return [];

    const alertIds = linkages.map((link) => link.alertId);
    return alertIds
      .map((alertId) => dataStore.getAlertById(alertId))
      .filter(Boolean) as Alert[];
  }, [rule, linkages]);

  const getLinkageTypeIcon = (type: string): string => {
    const icons = {
      triggered_by: '🔥',
      modified_by: '✏️',
      tested_against: '🧪',
    };
    return icons[type as keyof typeof icons] || '🔗';
  };

  const getLinkageTypeLabel = (type: string): string => {
    const labels = {
      triggered_by: 'Triggered By',
      modified_by: 'Modified By',
      tested_against: 'Tested Against',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#10b981'; // Green
    if (confidence >= 0.7) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSeverityColor = (severity: string): string => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#10b981',
      info: '#3b82f6',
    };
    return colors[severity as keyof typeof colors] || theme.colors.textMuted;
  };

  if (!alert && !rule) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Alert-Rule Linkage</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing[8],
              color: theme.colors.textMuted,
            }}
          >
            Select an alert or rule to view linkage information
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardStyle: React.CSSProperties = {
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    gap: theme.spacing[4],
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
  };

  const detailStyle: React.CSSProperties = {
    flex: 1,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    overflowY: 'auto',
  };

  const linkageEntryStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing[2],
    cursor: 'pointer',
    transition: `background-color ${theme.animation.duration.fast}`,
  };

  const linkageEntryHoverStyle: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
  };

  const linkageEntrySelectedStyle: React.CSSProperties = {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  };

  const navigateButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `all ${theme.animation.duration.fast}`,
    textDecoration: 'none',
    color: theme.colors.text,
  };

  return (
    <Card variant="elevated" style={cardStyle}>
      <CardHeader>
        <div style={headerStyle}>
          <div>
            <CardTitle>
              {alert
                ? `Alert Linkages - ${alert.title}`
                : `Rule Linkages - ${rule!.name}`}
            </CardTitle>
            <p
              style={{
                margin: 0,
                marginTop: theme.spacing[1],
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted,
              }}
            >
              {alert
                ? `Rules associated with this alert (${linkages.length})`
                : `Alerts generated by this rule (${linkages.length})`}
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Quick Navigation Section */}
        {(alert || rule) && (
          <div
            style={{
              marginBottom: theme.spacing[4],
              padding: theme.spacing[4],
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <h4
              style={{
                margin: `0 0 ${theme.spacing[3]} 0`,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Quick Navigation
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: theme.spacing[3],
              }}
            >
              {alert &&
                relatedRules.map((linkedRule) => (
                  <div
                    key={linkedRule.id}
                    style={navigateButtonStyle}
                    onClick={() => onNavigateToRule?.(linkedRule.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.primary + '20';
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.surface;
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }}
                  >
                    <span>📋</span>
                    <div>
                      <div
                        style={{
                          fontWeight: theme.typography.fontWeight.semibold,
                        }}
                      >
                        {linkedRule.name.length > 20
                          ? linkedRule.name.substring(0, 20) + '...'
                          : linkedRule.name}
                      </div>
                      <div
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.textMuted,
                        }}
                      >
                        {linkedRule.isActive ? 'Active' : 'Inactive'} Rule
                      </div>
                    </div>
                    <span>→</span>
                  </div>
                ))}

              {rule &&
                relatedAlerts.map((linkedAlert) => (
                  <div
                    key={linkedAlert.id}
                    style={navigateButtonStyle}
                    onClick={() => onNavigateToAlert?.(linkedAlert.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.primary + '20';
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.surface;
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }}
                  >
                    <span
                      style={{ color: getSeverityColor(linkedAlert.severity) }}
                    >
                      🚨
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: theme.typography.fontWeight.semibold,
                        }}
                      >
                        {linkedAlert.title.length > 20
                          ? linkedAlert.title.substring(0, 20) + '...'
                          : linkedAlert.title}
                      </div>
                      <div
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.textMuted,
                        }}
                      >
                        {linkedAlert.severity} • {linkedAlert.status}
                      </div>
                    </div>
                    <span>→</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div style={contentStyle}>
          <div style={listStyle}>
            <h4
              style={{
                margin: `0 0 ${theme.spacing[3]} 0`,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Linkage Details ({linkages.length})
            </h4>

            {linkages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: theme.spacing[6],
                  color: theme.colors.textMuted,
                }}
              >
                No linkages found
              </div>
            ) : (
              linkages.map((linkage) => (
                <div
                  key={`${linkage.alertId}-${linkage.ruleId}-${linkage.timestamp}`}
                  style={{
                    ...linkageEntryStyle,
                    ...(selectedLinkage === linkage
                      ? linkageEntrySelectedStyle
                      : {}),
                  }}
                  onClick={() => setSelectedLinkage(linkage)}
                  onMouseEnter={(e) => {
                    if (selectedLinkage !== linkage) {
                      e.currentTarget.style.backgroundColor =
                        linkageEntryHoverStyle.backgroundColor!;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLinkage !== linkage) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      minWidth: '120px',
                    }}
                  >
                    <span style={{ fontSize: theme.typography.fontSize.lg }}>
                      {getLinkageTypeIcon(linkage.linkageType)}
                    </span>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      {getLinkageTypeLabel(linkage.linkageType)}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text,
                        marginBottom: theme.spacing[1],
                      }}
                    >
                      {alert
                        ? `Rule: ${dataStore.getRuleById(linkage.ruleId)?.name || linkage.ruleId}`
                        : `Alert: ${dataStore.getAlertById(linkage.alertId)?.title || linkage.alertId}`}
                    </div>
                    <div
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.textMuted,
                      }}
                    >
                      {formatTimestamp(linkage.timestamp)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[1],
                      fontSize: theme.typography.fontSize.xs,
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getConfidenceColor(linkage.confidence),
                      }}
                    />
                    <span
                      style={{ color: getConfidenceColor(linkage.confidence) }}
                    >
                      {Math.round(linkage.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={detailStyle}>
            <h4
              style={{
                margin: `0 0 ${theme.spacing[3]} 0`,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Linkage Details
            </h4>

            {selectedLinkage ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    marginBottom: theme.spacing[4],
                  }}
                >
                  <span style={{ fontSize: theme.typography.fontSize.lg }}>
                    {getLinkageTypeIcon(selectedLinkage.linkageType)}
                  </span>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                    }}
                  >
                    {getLinkageTypeLabel(selectedLinkage.linkageType)}
                  </span>
                </div>

                <div style={{ marginBottom: theme.spacing[4] }}>
                  <div style={{ marginBottom: theme.spacing[3] }}>
                    <strong>Confidence Score:</strong>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        marginTop: theme.spacing[1],
                      }}
                    >
                      <div
                        style={{
                          width: '100px',
                          height: '6px',
                          backgroundColor: theme.colors.surface,
                          borderRadius: theme.borderRadius.sm,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${selectedLinkage.confidence * 100}%`,
                            height: '100%',
                            backgroundColor: getConfidenceColor(
                              selectedLinkage.confidence
                            ),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.medium,
                          color: getConfidenceColor(selectedLinkage.confidence),
                        }}
                      >
                        {Math.round(selectedLinkage.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: theme.spacing[3] }}>
                    <strong>Timestamp:</strong>{' '}
                    {formatTimestamp(selectedLinkage.timestamp)}
                  </div>

                  <div style={{ marginBottom: theme.spacing[3] }}>
                    <strong>Alert ID:</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onNavigateToAlert?.(selectedLinkage.alertId)
                      }
                      style={{
                        marginLeft: theme.spacing[2],
                        fontSize: theme.typography.fontSize.sm,
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      }}
                    >
                      {selectedLinkage.alertId} →
                    </Button>
                  </div>

                  <div style={{ marginBottom: theme.spacing[3] }}>
                    <strong>Rule ID:</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigateToRule?.(selectedLinkage.ruleId)}
                      style={{
                        marginLeft: theme.spacing[2],
                        fontSize: theme.typography.fontSize.sm,
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      }}
                    >
                      {selectedLinkage.ruleId} →
                    </Button>
                  </div>

                  {selectedLinkage.context && (
                    <div>
                      <strong>Context:</strong>
                      <div
                        style={{
                          backgroundColor: theme.colors.surface,
                          padding: theme.spacing[3],
                          borderRadius: theme.borderRadius.sm,
                          marginTop: theme.spacing[2],
                          fontFamily: 'monospace',
                          fontSize: theme.typography.fontSize.sm,
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(selectedLinkage.context, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: theme.spacing[6],
                  color: theme.colors.textMuted,
                }}
              >
                Select a linkage entry to view details
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
