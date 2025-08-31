import React, { useState, useMemo } from 'react';
import type { RuleAuditLog, Rule } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent, Button } from './';
import { dataStore } from '../data';

interface RuleAuditHistoryProps {
  rule: Rule | null;
  onClose?: () => void;
}

export const RuleAuditHistory: React.FC<RuleAuditHistoryProps> = ({
  rule,
  onClose,
}) => {
  const theme = useTheme();
  const [selectedAuditEntry, setSelectedAuditEntry] =
    useState<RuleAuditLog | null>(null);
  const [filterAction, setFilterAction] = useState<string>('all');

  const auditLogs = useMemo(() => {
    if (!rule) return [];

    let logs = dataStore.getRuleAuditLogs(rule.id);

    if (filterAction !== 'all') {
      logs = logs.filter((log) => log.action === filterAction);
    }

    return logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [rule, filterAction]);

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      created: '✅',
      modified: '✏️',
      deleted: '🗑️',
      triggered: '🔥',
      evaluated: '🔍',
      ab_test_started: '🧪',
      ab_test_completed: '📊',
    };
    return icons[action] || '📝';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Created',
      modified: 'Modified',
      deleted: 'Deleted',
      triggered: 'Triggered',
      evaluated: 'Evaluated',
      ab_test_started: 'A/B Test Started',
      ab_test_completed: 'A/B Test Completed',
    };
    return labels[action] || action;
  };

  const getUserName = (userId: string): string => {
    if (userId === 'system') return 'System';
    const user = dataStore.getUserById(userId);
    return user?.name || 'Unknown User';
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!rule) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing[8],
              color: theme.colors.textMuted,
            }}
          >
            Select a rule to view its audit history
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

  const filterContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
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

  const logEntryStyle: React.CSSProperties = {
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

  const logEntryHoverStyle: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
  };

  const logEntrySelectedStyle: React.CSSProperties = {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  };

  const actionBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    minWidth: '120px',
  };

  return (
    <Card variant="elevated" style={cardStyle}>
      <CardHeader>
        <div style={headerStyle}>
          <div>
            <CardTitle>Audit History - {rule.name}</CardTitle>
            <p
              style={{
                margin: 0,
                marginTop: theme.spacing[1],
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted,
              }}
            >
              Complete history of rule changes and system actions
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
        <div style={filterContainerStyle}>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{
              padding: theme.spacing[2],
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
            }}
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="modified">Modified</option>
            <option value="triggered">Triggered</option>
            <option value="evaluated">Evaluated</option>
            <option value="ab_test_started">A/B Tests</option>
          </select>
        </div>

        <div style={contentStyle}>
          <div style={listStyle}>
            <h4
              style={{
                margin: `0 0 ${theme.spacing[3]} 0`,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              Audit Log ({auditLogs.length} entries)
            </h4>

            {auditLogs.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: theme.spacing[6],
                  color: theme.colors.textMuted,
                }}
              >
                No audit entries found for the selected filter
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    ...logEntryStyle,
                    ...(selectedAuditEntry?.id === log.id
                      ? logEntrySelectedStyle
                      : {}),
                  }}
                  onClick={() => setSelectedAuditEntry(log)}
                  onMouseEnter={(e) => {
                    if (selectedAuditEntry?.id !== log.id) {
                      e.currentTarget.style.backgroundColor =
                        logEntryHoverStyle.backgroundColor!;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAuditEntry?.id !== log.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={actionBadgeStyle}>
                    <span>{getActionIcon(log.action)}</span>
                    <span>{getActionLabel(log.action)}</span>
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
                      {getUserName(log.userId)}
                    </div>
                    <div
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.textMuted,
                      }}
                    >
                      {formatTimestamp(log.timestamp)}
                    </div>
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
              Entry Details
            </h4>

            {selectedAuditEntry ? (
              <div>
                <div style={{ marginBottom: theme.spacing[4] }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      marginBottom: theme.spacing[3],
                    }}
                  >
                    <span style={{ fontSize: theme.typography.fontSize.lg }}>
                      {getActionIcon(selectedAuditEntry.action)}
                    </span>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                      }}
                    >
                      {getActionLabel(selectedAuditEntry.action)}
                    </span>
                  </div>

                  <div style={{ marginBottom: theme.spacing[3] }}>
                    <strong>User:</strong>{' '}
                    {getUserName(selectedAuditEntry.userId)}
                  </div>
                  <div style={{ marginBottom: theme.spacing[3] }}>
                    <strong>Timestamp:</strong>{' '}
                    {formatTimestamp(selectedAuditEntry.timestamp)}
                  </div>

                  {selectedAuditEntry.changes && (
                    <div style={{ marginBottom: theme.spacing[3] }}>
                      <strong>Changes:</strong>
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
                        <div style={{ marginBottom: theme.spacing[2] }}>
                          <strong>Field:</strong>{' '}
                          {selectedAuditEntry.changes.field}
                        </div>
                        <div style={{ marginBottom: theme.spacing[2] }}>
                          <strong>Old Value:</strong>{' '}
                          <span style={{ color: '#ef4444' }}>
                            {JSON.stringify(
                              selectedAuditEntry.changes.oldValue
                            )}
                          </span>
                        </div>
                        <div style={{ marginBottom: theme.spacing[2] }}>
                          <strong>New Value:</strong>{' '}
                          <span style={{ color: '#10b981' }}>
                            {JSON.stringify(
                              selectedAuditEntry.changes.newValue
                            )}
                          </span>
                        </div>
                        {selectedAuditEntry.changes.reason && (
                          <div>
                            <strong>Reason:</strong>{' '}
                            {selectedAuditEntry.changes.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAuditEntry.metadata && (
                    <div style={{ marginBottom: theme.spacing[3] }}>
                      <strong>Metadata:</strong>
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
                          {JSON.stringify(selectedAuditEntry.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedAuditEntry.impactedAlerts &&
                    selectedAuditEntry.impactedAlerts.length > 0 && (
                      <div>
                        <strong>Impacted Alerts:</strong>
                        <ul
                          style={{
                            marginTop: theme.spacing[2],
                            marginBottom: 0,
                            paddingLeft: theme.spacing[4],
                          }}
                        >
                          {selectedAuditEntry.impactedAlerts.map((alertId) => (
                            <li
                              key={alertId}
                              style={{ marginBottom: theme.spacing[1] }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Navigate to alert - this would be implemented with routing
                                  console.log('Navigate to alert:', alertId);
                                }}
                                style={{
                                  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                                  fontSize: theme.typography.fontSize.xs,
                                }}
                              >
                                {alertId} →
                              </Button>
                            </li>
                          ))}
                        </ul>
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
                Select an audit entry to view details
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
