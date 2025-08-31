import React, { useState } from 'react';
import type { Rule } from '../types';
import { useTheme } from '../theme/utils';
import { Button } from './';
import { dataStore } from '../data';

interface RuleListProps {
  rules: Rule[];
  selectedRule: Rule | null;
  onSelectRule: (rule: Rule) => void;
  onCreateRule: () => void;
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onNavigateToAlert?: (alertId: string) => void;
}

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  selectedRule,
  onSelectRule,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onNavigateToAlert,
}) => {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState<
    'name' | 'priority' | 'triggered' | 'created'
  >('name');
  const [filterActive, setFilterActive] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const sortedAndFilteredRules = React.useMemo(() => {
    let filtered = rules;

    // Filter by active status
    if (filterActive === 'active') {
      filtered = filtered.filter((rule) => rule.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter((rule) => !rule.isActive);
    }

    // Sort rules
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          return b.priority - a.priority;
        case 'triggered':
          return b.statistics.timesTriggered - a.statistics.timesTriggered;
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [rules, sortBy, filterActive]);

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  };

  const filtersStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const ruleItemStyle: React.CSSProperties = {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.surfaceElevated,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast}`,
  };

  const selectedRuleStyle: React.CSSProperties = {
    ...ruleItemStyle,
    border: `2px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.surfaceHover,
  };

  const getStatusColor = (rule: Rule) => {
    if (!rule.isActive) return theme.colors.textMuted;
    return rule.statistics.successRate > 80
      ? theme.colors.success
      : rule.statistics.successRate > 50
        ? theme.colors.warning
        : theme.colors.error;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div style={headerStyle}>
        <div>
          <h2
            style={{
              margin: 0,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.xl,
            }}
          >
            Rules ({rules.length})
          </h2>
          <p
            style={{
              margin: `${theme.spacing[1]} 0 0 0`,
              color: theme.colors.textMuted,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            {rules.filter((r) => r.isActive).length} active •{' '}
            {rules.filter((r) => !r.isActive).length} inactive
          </p>
        </div>
        <Button variant="primary" onClick={onCreateRule}>
          + Create Rule
        </Button>
      </div>

      <div style={filtersStyle}>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing[2],
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            style={{
              padding: theme.spacing[2],
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.sm,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            <option value="name">Name</option>
            <option value="priority">Priority</option>
            <option value="triggered">Times Triggered</option>
            <option value="created">Created Date</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            gap: theme.spacing[2],
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Filter:
          </span>
          <select
            value={filterActive}
            onChange={(e) =>
              setFilterActive(e.target.value as typeof filterActive)
            }
            style={{
              padding: theme.spacing[2],
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.sm,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            <option value="all">All Rules</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {sortedAndFilteredRules.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: theme.spacing[8],
            color: theme.colors.textMuted,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSize.xl,
              marginBottom: theme.spacing[2],
            }}
          >
            📝
          </div>
          <div
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              marginBottom: theme.spacing[2],
            }}
          >
            No Rules Found
          </div>
          <div style={{ marginBottom: theme.spacing[4] }}>
            {filterActive !== 'all'
              ? 'Try changing the filter or create your first rule.'
              : 'Create your first automation rule to get started.'}
          </div>
          <Button variant="primary" onClick={onCreateRule}>
            Create First Rule
          </Button>
        </div>
      ) : (
        <div>
          {sortedAndFilteredRules.map((rule) => (
            <div
              key={rule.id}
              style={
                selectedRule?.id === rule.id ? selectedRuleStyle : ruleItemStyle
              }
              onClick={() => onSelectRule(rule)}
              onMouseEnter={(e) => {
                if (selectedRule?.id !== rule.id) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRule?.id !== rule.id) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.surfaceElevated;
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing[3],
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                      }}
                    >
                      {rule.name}
                    </h3>
                    <span
                      style={{
                        padding: `${theme.spacing[0.5]} ${theme.spacing[2]}`,
                        backgroundColor: rule.isActive
                          ? theme.colors.success
                          : theme.colors.textMuted,
                        color: '#ffffff',
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                        borderRadius: theme.borderRadius.sm,
                      }}
                    >
                      {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    {rule.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: theme.spacing[2],
                    marginLeft: theme.spacing[3],
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRule(rule.id);
                    }}
                  >
                    {rule.isActive ? '⏸️' : '▶️'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRule(rule);
                    }}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRule(rule.id);
                    }}
                    style={{ color: theme.colors.error }}
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: theme.spacing[3],
                  padding: theme.spacing[3],
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.sm,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: getStatusColor(rule),
                    }}
                  >
                    {rule.statistics.timesTriggered}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Triggered
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: getStatusColor(rule),
                    }}
                  >
                    {rule.statistics.successRate}%
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Success Rate
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: getStatusColor(rule),
                    }}
                  >
                    {rule.statistics.alertsCreated}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Alerts Created
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.info,
                    }}
                  >
                    {rule.statistics.averageExecutionTime}ms
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Avg Time
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: theme.spacing[1],
                  marginTop: theme.spacing[2],
                  flexWrap: 'wrap',
                }}
              >
                {rule.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: `${theme.spacing[0.5]} ${theme.spacing[2]}`,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.textMuted,
                      fontSize: theme.typography.fontSize.xs,
                      borderRadius: theme.borderRadius.sm,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textMuted,
                  marginTop: theme.spacing[2],
                }}
              >
                Created {formatDate(rule.createdAt)} • {rule.conditions.length}{' '}
                condition{rule.conditions.length !== 1 ? 's' : ''} •{' '}
                {rule.actions.length} action
                {rule.actions.length !== 1 ? 's' : ''} • Priority:{' '}
                {rule.priority}
              </div>

              {/* Alert Navigation Section */}
              {(() => {
                const relatedAlerts = dataStore
                  .getAlerts()
                  .filter((alert) => alert.triggeredByRule === rule.id);
                if (relatedAlerts.length > 0) {
                  return (
                    <div
                      style={{
                        marginTop: theme.spacing[3],
                        padding: theme.spacing[3],
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: theme.spacing[3],
                          marginBottom: theme.spacing[2],
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.medium,
                              color: theme.colors.text,
                              marginBottom: theme.spacing[1],
                              display: 'flex',
                              alignItems: 'center',
                              gap: theme.spacing[2],
                            }}
                          >
                            <span>🚨</span>
                            <span>
                              Generated Alerts ({relatedAlerts.length})
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.textMuted,
                            }}
                          >
                            {
                              relatedAlerts.filter((a) => a.status === 'active')
                                .length
                            }{' '}
                            active •{' '}
                            {
                              relatedAlerts.filter(
                                (a) => a.status === 'resolved'
                              ).length
                            }{' '}
                            resolved
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: theme.spacing[2],
                          marginTop: theme.spacing[2],
                        }}
                      >
                        {relatedAlerts.slice(0, 3).map((alert) => (
                          <div
                            key={alert.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: theme.spacing[2],
                              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                              backgroundColor: theme.colors.surfaceElevated,
                              borderRadius: theme.borderRadius.sm,
                              fontSize: theme.typography.fontSize.xs,
                              border: `1px solid ${theme.colors.border}`,
                            }}
                          >
                            <div
                              style={{
                                width: theme.spacing[2],
                                height: theme.spacing[2],
                                borderRadius: theme.borderRadius.full,
                                backgroundColor:
                                  alert.severity === 'critical'
                                    ? '#ef4444'
                                    : alert.severity === 'warning'
                                      ? theme.colors.primary
                                      : '#10b981',
                              }}
                            />
                            <span
                              style={{
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {alert.title}
                            </span>
                            {onNavigateToAlert && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToAlert(alert.id);
                                }}
                                style={{
                                  padding: `${theme.spacing[0.5]} ${theme.spacing[1]}`,
                                  fontSize: theme.typography.fontSize.xs,
                                  minWidth: 'auto',
                                  height: 'auto',
                                }}
                              >
                                →
                              </Button>
                            )}
                          </div>
                        ))}
                        {relatedAlerts.length > 3 && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                              color: theme.colors.textMuted,
                              fontSize: theme.typography.fontSize.xs,
                            }}
                          >
                            +{relatedAlerts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
