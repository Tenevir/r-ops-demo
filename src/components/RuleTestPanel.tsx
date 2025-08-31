import React, { useState, useMemo } from 'react';
import type { Rule, Event } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent, Button } from './';
import { dataStore } from '../data';

interface RuleTestPanelProps {
  rule: Rule | null;
  onTestResult: (
    passed: boolean,
    details: {
      conditionResults: Array<{
        condition: string;
        passed: boolean;
        actualValue: string | number | boolean;
        expectedValue: string | number | boolean;
      }>;
      actionsExecuted: string[];
      executionTime: number;
    }
  ) => void;
}

interface TestResult {
  passed: boolean;
  details: {
    conditionResults: Array<{
      condition: string;
      passed: boolean;
      actualValue: string | number | boolean;
      expectedValue: string | number | boolean;
    }>;
    actionsExecuted: string[];
    executionTime: number;
  };
}

export const RuleTestPanel: React.FC<RuleTestPanelProps> = ({
  rule,
  onTestResult,
}) => {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const sampleEvents = useMemo(() => {
    return dataStore.getEvents().slice(0, 5); // Get 5 sample events
  }, []);

  const executeRuleTest = async () => {
    if (!rule || !selectedEvent) return;

    setIsRunning(true);
    const startTime = Date.now();

    try {
      // Simulate rule execution
      const conditionResults = rule.conditions.map((condition) => {
        const eventValue = getEventFieldValue(selectedEvent, condition.field);
        const passed = evaluateCondition(
          eventValue,
          condition.operator,
          condition.value
        );

        return {
          condition: `${condition.field} ${condition.operator} ${condition.value}`,
          passed,
          actualValue: eventValue,
          expectedValue: condition.value,
        };
      });

      const allConditionsPassed = conditionResults.every(
        (result) => result.passed
      );
      const actionsExecuted = allConditionsPassed
        ? rule.actions.map((action) => action.type)
        : [];

      const result: TestResult = {
        passed: allConditionsPassed,
        details: {
          conditionResults,
          actionsExecuted,
          executionTime: Date.now() - startTime,
        },
      };

      setTestResult(result);
      onTestResult(result.passed, result.details);
    } catch (error) {
      console.error('Rule test error:', error);
      setTestResult({
        passed: false,
        details: {
          conditionResults: [],
          actionsExecuted: [],
          executionTime: Date.now() - startTime,
        },
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getEventFieldValue = (
    event: Event,
    field: string
  ): string | number | boolean => {
    switch (field) {
      case 'severity':
        return event.severity;
      case 'type':
        return event.type;
      case 'title':
        return event.title;
      case 'description':
        return event.description;
      case 'source':
        return event.source;
      default:
        return '';
    }
  };

  const evaluateCondition = (
    actualValue: string | number | boolean,
    operator: string,
    expectedValue: string | number | boolean
  ): boolean => {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'contains':
        return String(actualValue)
          .toLowerCase()
          .includes(String(expectedValue).toLowerCase());
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue);
      case 'less_than':
        return Number(actualValue) < Number(expectedValue);
      case 'regex':
        try {
          return new RegExp(String(expectedValue)).test(String(actualValue));
        } catch {
          return false;
        }
      case 'in':
        return (
          Array.isArray(expectedValue) && expectedValue.includes(actualValue)
        );
      default:
        return false;
    }
  };

  const eventCardStyle: React.CSSProperties = {
    padding: theme.spacing[3],
    margin: theme.spacing[2],
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.fast}`,
  };

  const selectedEventStyle: React.CSSProperties = {
    ...eventCardStyle,
    border: `2px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.surfaceElevated,
  };

  const resultStyle: React.CSSProperties = {
    padding: theme.spacing[4],
    marginTop: theme.spacing[4],
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  };

  if (!rule) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Rule Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: theme.colors.textMuted }}>
            Select a rule to test it against sample events
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Test Rule: {rule.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: theme.spacing[4] }}>
          <h4
            style={{
              margin: `0 0 ${theme.spacing[3]} 0`,
              color: theme.colors.text,
            }}
          >
            Select Sample Event
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: theme.spacing[2],
            }}
          >
            {sampleEvents.map((event) => (
              <div
                key={event.id}
                style={
                  selectedEvent?.id === event.id
                    ? selectedEventStyle
                    : eventCardStyle
                }
                onClick={() => setSelectedEvent(event)}
                onMouseEnter={(e) => {
                  if (selectedEvent?.id !== event.id) {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.surfaceHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEvent?.id !== event.id) {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.surface;
                  }
                }}
              >
                <div
                  style={{
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: theme.spacing[1],
                    color: theme.colors.text,
                  }}
                >
                  {event.title}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted,
                    marginBottom: theme.spacing[1],
                  }}
                >
                  {event.type} • {event.severity}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textMuted,
                  }}
                >
                  {event.description.substring(0, 80)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: theme.spacing[3],
            alignItems: 'center',
          }}
        >
          <Button
            variant="primary"
            onClick={executeRuleTest}
            disabled={!selectedEvent || isRunning}
          >
            {isRunning ? 'Running Test...' : 'Run Test'}
          </Button>

          {selectedEvent && (
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted,
              }}
            >
              Testing against: <strong>{selectedEvent.title}</strong>
            </div>
          )}
        </div>

        {testResult && (
          <div style={resultStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                marginBottom: theme.spacing[3],
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.fontSize.xl,
                }}
              >
                {testResult.passed ? '✅' : '❌'}
              </span>
              <h4
                style={{
                  margin: 0,
                  color: testResult.passed
                    ? theme.colors.success
                    : theme.colors.error,
                  fontSize: theme.typography.fontSize.lg,
                }}
              >
                {testResult.passed ? 'Rule Passed' : 'Rule Failed'}
              </h4>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textMuted,
                }}
              >
                ({testResult.details.executionTime}ms)
              </span>
            </div>

            <div style={{ marginBottom: theme.spacing[3] }}>
              <h5
                style={{
                  margin: `0 0 ${theme.spacing[2]} 0`,
                  color: theme.colors.text,
                }}
              >
                Condition Results:
              </h5>
              {testResult.details.conditionResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: theme.spacing[2],
                    marginBottom: theme.spacing[1],
                    backgroundColor: result.passed
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${result.passed ? theme.colors.success : theme.colors.error}`,
                    borderRadius: theme.borderRadius.sm,
                  }}
                >
                  <div
                    style={{
                      fontWeight: theme.typography.fontWeight.medium,
                      color: result.passed
                        ? theme.colors.success
                        : theme.colors.error,
                    }}
                  >
                    {result.passed ? '✓' : '✗'} {result.condition}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginTop: theme.spacing[1],
                    }}
                  >
                    Expected: {JSON.stringify(result.expectedValue)} | Actual:{' '}
                    {JSON.stringify(result.actualValue)}
                  </div>
                </div>
              ))}
            </div>

            {testResult.details.actionsExecuted.length > 0 && (
              <div>
                <h5
                  style={{
                    margin: `0 0 ${theme.spacing[2]} 0`,
                    color: theme.colors.text,
                  }}
                >
                  Actions Executed:
                </h5>
                <div
                  style={{
                    display: 'flex',
                    gap: theme.spacing[2],
                    flexWrap: 'wrap',
                  }}
                >
                  {testResult.details.actionsExecuted.map((action, index) => (
                    <span
                      key={index}
                      style={{
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                        backgroundColor: theme.colors.success,
                        color: '#ffffff',
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.sm,
                      }}
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
