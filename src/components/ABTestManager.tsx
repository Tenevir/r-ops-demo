import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ABTest, Rule } from '../types';
import { useTheme } from '../theme/utils';
import { Card, CardHeader, CardTitle, CardContent, Button } from './';
import { dataStore } from '../data';

interface ABTestManagerProps {
  rules: Rule[];
  selectedRule?: Rule | null;
  onCreateTest?: (test: Partial<ABTest>) => void;
}

export const ABTestManager: React.FC<ABTestManagerProps> = ({
  rules,
  selectedRule,
  onCreateTest,
}) => {
  const theme = useTheme();

  // Available rules for A/B testing (currently unused in component)
  void rules;
  const [activeView, setActiveView] = useState<
    'overview' | 'create' | 'details'
  >('overview');
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [newTestForm, setNewTestForm] = useState({
    name: '',
    hypothesis: '',
    successMetric: 'falsePositiveRate',
    minimumSampleSize: 100,
  });

  const abTests = useMemo(() => {
    if (selectedRule) {
      return dataStore.getABTests(selectedRule.id);
    }
    return dataStore.getABTests();
  }, [selectedRule]);

  const testResults = useMemo(() => {
    if (!selectedTest) return [];

    return selectedTest.results.map((result) => {
      const variant = selectedTest.variants.find(
        (v) => v.id === result.variantId
      );
      return {
        variantName: variant?.name || 'Unknown',
        isControl: variant?.isControl || false,
        alertsGenerated: result.metrics.alertsGenerated,
        falsePositiveRate: result.metrics.falsePositiveRate,
        truePositiveRate: result.metrics.truePositiveRate,
        avgExecutionTime: result.metrics.avgExecutionTime,
        userSatisfactionScore: result.metrics.userSatisfactionScore || 0,
        statisticalSignificance: result.statisticalSignificance,
        confidenceIntervalLower: result.confidenceInterval.lower,
        confidenceIntervalUpper: result.confidenceInterval.upper,
      };
    });
  }, [selectedTest]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return theme.colors.textMuted;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'draft':
        return '📝';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  const handleCreateTest = useCallback(() => {
    if (!selectedRule) return;

    const newTest: Partial<ABTest> = {
      name: newTestForm.name,
      description: `A/B test for ${selectedRule.name}`,
      baseRuleId: selectedRule.id,
      hypothesis: newTestForm.hypothesis,
      successMetric: newTestForm.successMetric,
      minimumSampleSize: newTestForm.minimumSampleSize,
      currentSampleSize: 0,
      status: 'draft',
      createdBy: 'user-1', // In real app, get from auth context
      variants: [
        {
          id: 'variant-control',
          name: 'Control (Current)',
          ruleId: selectedRule.id,
          configuration: selectedRule,
          isControl: true,
          trafficPercentage: 50,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'variant-test',
          name: 'Test Variant',
          ruleId: selectedRule.id + '-test',
          configuration: selectedRule,
          isControl: false,
          trafficPercentage: 50,
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
      ],
      results: [],
    };

    if (onCreateTest) {
      onCreateTest(newTest);
    }

    // Reset form
    setNewTestForm({
      name: '',
      hypothesis: '',
      successMetric: 'falsePositiveRate',
      minimumSampleSize: 100,
    });
    setActiveView('overview');
  }, [selectedRule, newTestForm, onCreateTest]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          padding: theme.spacing[3],
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`,
          fontSize: theme.typography.fontSize.sm,
          boxShadow: theme.elevation.md,
        }}
      >
        <div
          style={{
            fontWeight: theme.typography.fontWeight.semibold,
            marginBottom: theme.spacing[1],
            color: theme.colors.text,
          }}
        >
          {label}
        </div>
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              color: entry.color,
              fontSize: theme.typography.fontSize.xs,
            }}
          >
            {entry.name}:{' '}
            {typeof entry.value === 'number'
              ? entry.value.toFixed(2)
              : entry.value}
            {entry.name.includes('Rate') && '%'}
            {entry.name.includes('Time') && 'ms'}
          </div>
        ))}
      </div>
    );
  };

  const renderOverview = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[6],
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
            }}
          >
            A/B Tests
            {selectedRule && ` - ${selectedRule.name}`}
          </h2>
          <p
            style={{
              margin: `${theme.spacing[2]} 0 0 0`,
              color: theme.colors.textMuted,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Compare rule variants to optimize performance and accuracy
          </p>
        </div>
        {selectedRule && (
          <Button variant="primary" onClick={() => setActiveView('create')}>
            + Create Test
          </Button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: theme.spacing[4],
        }}
      >
        {abTests.length === 0 ? (
          <Card variant="elevated" style={{ gridColumn: '1 / -1' }}>
            <CardContent>
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
                  🧪
                </div>
                <div
                  style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: theme.spacing[2],
                  }}
                >
                  No A/B Tests Found
                </div>
                <div style={{ marginBottom: theme.spacing[4] }}>
                  {selectedRule
                    ? 'Create your first A/B test to optimize this rule.'
                    : 'Select a rule to start A/B testing.'}
                </div>
                {selectedRule && (
                  <Button
                    variant="primary"
                    onClick={() => setActiveView('create')}
                  >
                    Create A/B Test
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          abTests.map((test) => (
            <Card key={test.id} variant="elevated">
              <CardHeader>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <CardTitle>{test.name}</CardTitle>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        marginTop: theme.spacing[1],
                      }}
                    >
                      <span>{getStatusIcon(test.status)}</span>
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: getStatusColor(test.status),
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                      >
                        {test.status.charAt(0).toUpperCase() +
                          test.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ marginBottom: theme.spacing[4] }}>
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textMuted,
                      marginBottom: theme.spacing[3],
                    }}
                  >
                    {test.description}
                  </p>

                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    <strong>Hypothesis:</strong> {test.hypothesis}
                  </div>

                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing[2],
                    }}
                  >
                    <strong>Success Metric:</strong> {test.successMetric}
                  </div>

                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing[3],
                    }}
                  >
                    <strong>Progress:</strong> {test.currentSampleSize} /{' '}
                    {test.minimumSampleSize} samples
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.borderRadius.sm,
                      overflow: 'hidden',
                      marginBottom: theme.spacing[3],
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min((test.currentSampleSize / test.minimumSampleSize) * 100, 100)}%`,
                        height: '100%',
                        backgroundColor:
                          test.currentSampleSize >= test.minimumSampleSize
                            ? '#10b981'
                            : theme.colors.primary,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing[2] }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedTest(test);
                      setActiveView('details');
                    }}
                  >
                    View Results
                  </Button>
                  {test.status === 'running' && (
                    <Button variant="ghost" size="sm">
                      Pause
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <Button variant="ghost" size="sm">
                      Pause
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderCreateTest = () => (
    <Card variant="elevated">
      <CardHeader>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <CardTitle>Create New A/B Test</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            ← Back
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing[2],
              }}
            >
              Test Name
            </label>
            <input
              type="text"
              value={newTestForm.name}
              onChange={(e) =>
                setNewTestForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Database Alert Threshold Optimization"
              style={{
                width: '100%',
                padding: theme.spacing[3],
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.sm,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              }}
            />
          </div>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing[2],
              }}
            >
              Hypothesis
            </label>
            <textarea
              value={newTestForm.hypothesis}
              onChange={(e) =>
                setNewTestForm((prev) => ({
                  ...prev,
                  hypothesis: e.target.value,
                }))
              }
              placeholder="What do you expect to happen with the test variant?"
              rows={3}
              style={{
                width: '100%',
                padding: theme.spacing[3],
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.sm,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: theme.spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing[2],
              }}
            >
              Success Metric
            </label>
            <select
              value={newTestForm.successMetric}
              onChange={(e) =>
                setNewTestForm((prev) => ({
                  ...prev,
                  successMetric: e.target.value,
                }))
              }
              style={{
                width: '100%',
                padding: theme.spacing[3],
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.sm,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              }}
            >
              <option value="falsePositiveRate">False Positive Rate</option>
              <option value="truePositiveRate">True Positive Rate</option>
              <option value="avgExecutionTime">Average Execution Time</option>
              <option value="userSatisfactionScore">User Satisfaction</option>
            </select>
          </div>

          <div style={{ marginBottom: theme.spacing[6] }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing[2],
              }}
            >
              Minimum Sample Size
            </label>
            <input
              type="number"
              min="50"
              max="1000"
              value={newTestForm.minimumSampleSize}
              onChange={(e) =>
                setNewTestForm((prev) => ({
                  ...prev,
                  minimumSampleSize: parseInt(e.target.value) || 100,
                }))
              }
              style={{
                width: '200px',
                padding: theme.spacing[3],
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.sm,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              }}
            />
            <p
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textMuted,
                marginTop: theme.spacing[1],
              }}
            >
              Recommended: 100+ samples for statistical significance
            </p>
          </div>

          <div style={{ display: 'flex', gap: theme.spacing[3] }}>
            <Button
              variant="primary"
              onClick={handleCreateTest}
              disabled={!newTestForm.name || !newTestForm.hypothesis}
            >
              Create A/B Test
            </Button>
            <Button variant="ghost" onClick={() => setActiveView('overview')}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTestDetails = () => {
    if (!selectedTest) return null;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[6],
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
              }}
            >
              {getStatusIcon(selectedTest.status)}
              {selectedTest.name}
            </h2>
            <p
              style={{
                margin: `${theme.spacing[2]} 0`,
                color: theme.colors.textMuted,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              {selectedTest.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            ← Back to Tests
          </Button>
        </div>

        {testResults.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing[6],
              }}
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={testResults}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.colors.border}
                      />
                      <XAxis
                        dataKey="variantName"
                        stroke={theme.colors.textMuted}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={theme.colors.textMuted}
                        fontSize={12}
                        label={{
                          value: 'Rate (%)',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="truePositiveRate"
                        fill="#10b981"
                        name="True Positive Rate"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="falsePositiveRate"
                        fill="#ef4444"
                        name="False Positive Rate"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Execution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={testResults}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.colors.border}
                      />
                      <XAxis
                        dataKey="variantName"
                        stroke={theme.colors.textMuted}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={theme.colors.textMuted}
                        fontSize={12}
                        label={{
                          value: 'Time (ms)',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="avgExecutionTime"
                        fill={theme.colors.primary}
                        name="Avg Execution Time"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: theme.spacing[4],
                  }}
                >
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        padding: theme.spacing[4],
                        backgroundColor: result.isControl
                          ? theme.colors.surface
                          : theme.colors.surfaceElevated,
                        borderRadius: theme.borderRadius.md,
                        border: result.isControl
                          ? `2px solid ${theme.colors.primary}`
                          : `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing[2],
                          marginBottom: theme.spacing[3],
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            fontSize: theme.typography.fontSize.base,
                            fontWeight: theme.typography.fontWeight.semibold,
                          }}
                        >
                          {result.variantName}
                        </h4>
                        {result.isControl && (
                          <span
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              backgroundColor: theme.colors.primary,
                              color: 'white',
                              padding: `2px ${theme.spacing[2]}`,
                              borderRadius: theme.borderRadius.sm,
                            }}
                          >
                            CONTROL
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: theme.typography.fontSize.sm }}>
                        <div style={{ marginBottom: theme.spacing[2] }}>
                          <strong>Alerts Generated:</strong>{' '}
                          {result.alertsGenerated}
                        </div>
                        <div style={{ marginBottom: theme.spacing[2] }}>
                          <strong>Statistical Significance:</strong>{' '}
                          {(result.statisticalSignificance * 100).toFixed(2)}%
                        </div>
                        <div style={{ marginBottom: theme.spacing[2] }}>
                          <strong>Confidence Interval:</strong>{' '}
                          {(result.confidenceIntervalLower * 100).toFixed(1)}% -{' '}
                          {(result.confidenceIntervalUpper * 100).toFixed(1)}%
                        </div>
                        {result.userSatisfactionScore > 0 && (
                          <div>
                            <strong>User Satisfaction:</strong>{' '}
                            {result.userSatisfactionScore.toFixed(1)}/10
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: theme.spacing[6] }}>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'create' && renderCreateTest()}
      {activeView === 'details' && renderTestDetails()}
    </div>
  );
};
